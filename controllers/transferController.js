import { Connection, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import { AnchorProvider, Program } from "@coral-xyz/anchor";
import { Keypair } from "@solana/web3.js";
import bs58 from "bs58";
import cron from "node-cron";
import config from "../utilities/config.js";
import logger from "../utilities/logger.js";

// ── State ─────────────────────────────────────
let cronTask = null;
let isRunning = false;
let cycleStart;
let globalConfig;

const metrics = {
  cyclesRun: 0,
  lastCycleAt: null,
  lastCycleDurationMs: null,

  recordCycle(stats) {
    this.cyclesRun++;
    this.lastCycleAt = new Date(stats.lastCycleAt).toISOString();
    this.lastCycleDurationMs = stats.lastCycleDurationMs;
  },
};

// ── Core Logic (extracted so cron & HTTP share it) ─────────────────────
async function runTransferCycle() {
  if (isRunning) {
    console.log("[Keeper] Cycle already running — skipping tick");
    return;
  }

  isRunning = true;
  cycleStart = Date.now();
  console.log(`[Keeper] Cycle started at ${new Date().toISOString()}`);

  try {
    const connection = new Connection(process.env.SOLANA_RPC_URL, "confirmed");
    const caller = Keypair.fromSecretKey(
      bs58.decode(process.env.CALLER_PRIVATE_KEY),
    );
    const wallet = new anchor.Wallet(caller);
    const provider = new AnchorProvider(connection, wallet, {
      commitment: "confirmed",
    });
    anchor.setProvider(provider);

    const idl = await Program.fetchIdl(process.env.PROGRAM_ID, provider);
    if (!idl) throw new Error("IDL not found on-chain for this program");

    const program = new Program(idl, provider);

    const [configPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("config")],
      program.programId,
    );

    const balanceLamports = await connection.getBalance(caller.publicKey);
    const balanceSol = balanceLamports / LAMPORTS_PER_SOL;
    console.log("[Keeper] Wallet Balance:", balanceSol);

    if (Number(balanceSol) < config.BALANCE_THRESHOLD) {
      logger.warn(`[ALERT] Keeper wallet balance low: ${balanceSol} SOL`);
      console.log("[Keeper] Insufficient balance");
      return;
    }

    // ── GlobalConfig ──────────────────────────────────────────────────
    try {
      globalConfig = await program.account.globalConfig.fetch(configPda);
      console.log("[Keeper] Global Config:", {
        tokenMint: globalConfig.tokenMint.toBase58(),
        escrowVault: globalConfig.escrowVault.toBase58(),
        vestingPeriodsTotal: globalConfig.vestingPeriodsTotal,
        periodSeconds: globalConfig.periodSeconds.toString(),
        totalCommitted: globalConfig.totalCommitted.toString(),
        totalDistributed: globalConfig.totalDistributed.toString(),
        paused: globalConfig.paused,
      });
    } catch (err) {
      console.error("[Keeper] Failed to fetch GlobalConfig:", err.message);
      return;
    }

    if (globalConfig.paused) {
      console.warn("[Keeper] Contract is paused — skipping cycle");
      return;
    }

    // ── Investors ─────────────────────────────────────────────────────
    let allInvestors;
    try {
      allInvestors = await program.account.investorVesting.all([
        {
          memcmp: {
            offset: 8,
            bytes: configPda.toBase58(),
          },
        },
      ]);
      console.log(`[Keeper] Total investors: ${allInvestors.length}`);
    } catch (err) {
      console.error("[Keeper] Failed to fetch investors:", err.message);
      return;
    }

    if (!allInvestors?.length) {
      console.log("[Keeper] No investors found");
      return;
    }

    let tokensDistributed = 0;
    let tokensAllocated = 0;

    for (const { publicKey, account } of allInvestors) {
      const label = Buffer.from(
        account.label.slice(0, account.labelLen),
      ).toString("utf8");
      console.log("[Keeper] Investor:", {
        pda: publicKey.toBase58(),
        label,
        beneficiary: account.beneficiary.toBase58(),
        totalAllocation: account.totalAllocation.toString(),
        vestStartTime: new Date(
          account.vestStartTime.toNumber() * 1000,
        ).toISOString(),
        claimedAmount: account.claimedAmount.toString(),
        periodsClaimed: account.periodsClaimed,
      });

      tokensDistributed += Number(account.claimedAmount);
      tokensAllocated += Number(account.totalAllocation);

      globalConfig = {
        ...globalConfig,
        tokensDistributed: tokensDistributed.toString(),
        tokensAllocated: tokensAllocated.toString(),
      }


      // TODO: call distribute instruction per investor here
    }
  } catch (err) {
    console.error("[Keeper] Unhandled cycle error:", err.message);
  } finally {
    isRunning = false;
    console.log(`[Keeper] Cycle finished at ${new Date().toISOString()}`);
    metrics.recordCycle({
      lastCycleAt: cycleStart,
      lastCycleDurationMs: Date.now() - cycleStart,
    });
  }
}

// ── Graceful Shutdown ─────────────────────────────────────────────────
function setupGracefulShutdown() {
  const shutdown = async (signal) => {
    console.log(`\n[Keeper] ${signal} received — shutting down...`);

    if (cronTask) {
      cronTask.stop();
      console.log("[Keeper] Cron stopped");
    }

    // Wait for active cycle to finish before exiting
    if (isRunning) {
      console.log("[Keeper] Waiting for active cycle to complete...");
      await new Promise((resolve) => {
        const interval = setInterval(() => {
          if (!isRunning) {
            clearInterval(interval);
            resolve();
          }
        }, 200);
      });
    }

    console.log("[Keeper] Shutdown complete");
    process.exit(0);
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));

  process.on("uncaughtException", (err) => {
    console.error("[Keeper] Uncaught exception:", err.message);
    if (cronTask) cronTask.stop();
    process.exit(1);
  });

  process.on("unhandledRejection", (reason) => {
    console.error("[Keeper] Unhandled rejection:", reason?.message || reason);
  });
}

// ── Start Cron (runs once on module load) ─────────────────────────────
function startCron() {
  setupGracefulShutdown();

  cronTask = cron.schedule(config.CRON_INTERVAL, async () => {
    await runTransferCycle();
  });

  console.log("[Keeper] Cron started — running every second");
}

startCron();

// ── Controller ────────────────────────────────────────────────────────
const transferController = {
  // Manual HTTP trigger
  async transferFunds(req, res) {
    if (isRunning) {
      return res.json({ success: false, message: "Cycle already in progress" });
    }

    runTransferCycle().catch((err) =>
      console.error("[Keeper] Manual trigger error:", err.message),
    );

    return res.json({ success: true, message: "Cycle triggered manually" });
  },

  async health(req, res) {
    return res.json({
      success: true,
      isRunning,
      metrics,
    });
  },

  async globalData(req, res) {
    return res.json({ success: true, data: globalConfig });
  }

};

export default transferController;
