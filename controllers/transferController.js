import { Connection, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import { AnchorProvider, Program } from "@coral-xyz/anchor";
import { Keypair } from "@solana/web3.js";
import bs58 from "bs58";
import cron from "node-cron";
import config from "../utilities/config.js";
import logger from "../utilities/logger.js";
import BN from "bn.js";

// ── State ─────────────────────────────────────
let cronTask = null;
let isRunning = false;
let cycleStart;
let globalConfig;
let allInvestors;
let canDistribute = false;

//// Required in add Investor
let idl;
let connection;
let program;
let configPda;

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

// ── Shared Init (avoids duplication between cycle & addInvestor) ──────
async function ensureInitialized() {
  if (program && connection && configPda) return;

  connection = new Connection(process.env.SOLANA_RPC_URL, "confirmed");
  const caller = Keypair.fromSecretKey(
    bs58.decode(process.env.CALLER_PRIVATE_KEY),
  );
  const wallet = new anchor.Wallet(caller);
  const provider = new AnchorProvider(connection, wallet, {
    commitment: "confirmed",
  });
  anchor.setProvider(provider);

  idl = await Program.fetchIdl(process.env.PROGRAM_ID, provider);
  if (!idl) throw new Error("IDL not found on-chain for this program");

  program = new Program(idl, provider);

  const [configPdaScoped] = PublicKey.findProgramAddressSync(
    [Buffer.from("config")],
    program.programId,
  );
  configPda = configPdaScoped;
}

// ── Core Logic ────────────────────────────────────────────────────────
async function runTransferCycle() {
  if (isRunning) {
    console.log("[Keeper] Cycle already running — skipping tick");
    return;
  }

  isRunning = true;
  cycleStart = Date.now();
  canDistribute = false;
  console.log(`[Keeper] Cycle started at ${new Date().toISOString()}`);

  try {
    await ensureInitialized();

    const caller = Keypair.fromSecretKey(
      bs58.decode(process.env.CALLER_PRIVATE_KEY),
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
      // console.log("[Keeper] Global Config:", {
      //   tokenMint: globalConfig.tokenMint.toBase58(),
      //   escrowVault: globalConfig.escrowVault.toBase58(),
      //   vestingPeriodsTotal: globalConfig.vestingPeriodsTotal,
      //   periodSeconds: globalConfig.periodSeconds.toString(),
      //   totalCommitted: globalConfig.totalCommitted.toString(),
      //   totalDistributed: globalConfig.totalDistributed.toString(),
      //   paused: globalConfig.paused,
      // });
    } catch (err) {
      console.error("[Keeper] Failed to fetch GlobalConfig:", err.message);
      return;
    }

    if (globalConfig.paused) {
      console.warn("[Keeper] Contract is paused — skipping cycle");
      return;
    }

    // ── Investors ─────────────────────────────────────────────────────
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
      // console.log("[Keeper] Investor:", {
      //   data: account,
      //   pda: publicKey.toBase58(),
      //   label,
      //   beneficiary: account.beneficiary.toBase58(),
      //   totalAllocation: account.totalAllocation.toString(),
      //   vestStartTime: new Date(
      //     account.vestStartTime.toNumber() * 1000,
      //   ).toISOString(),
      //   claimedAmount: account.claimedAmount.toString(),
      //   periodsClaimed: account.periodsClaimed,
      // });

      tokensDistributed += Number(account.claimedAmount);
      tokensAllocated += Number(account.totalAllocation);

      const nowSeconds = Math.floor(Date.now() / 1000);
      const vestStart = account.vestStartTime.toNumber();

      // If vesting hasn't started yet, skip
      if (nowSeconds < vestStart) {
        console.log(`[Keeper] ${label} — vesting not started yet, skipping`);
        continue;
      }
      

      const elapsedSeconds = nowSeconds - vestStart;
      
      const totalVestingsPassed = Math.min(
        Math.floor(elapsedSeconds/parseInt(globalConfig.periodSeconds)),
        globalConfig.vestingPeriodsTotal
      );

      console.log("Total Vestings Passed : ",totalVestingsPassed);

      console.log("Perriods Claimed = ",account.periodsClaimed);
      
      
      const claimableVestings = totalVestingsPassed - account.periodsClaimed;
      
      if(claimableVestings > 0){
        canDistribute = true;
      }
      

      
      

      globalConfig = {
        ...globalConfig,
        tokensDistributed: tokensDistributed.toString(),
        tokensAllocated: tokensAllocated.toString(),
      };

      if(canDistribute){
        
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

// ── Start Cron ────────────────────────────────────────────────────────
function startCron() {
  setupGracefulShutdown();

  setTimeout(() => {
    runTransferCycle();
  }, 1000);

  cronTask = cron.schedule(config.CRON_INTERVAL, async () => {
    await runTransferCycle();
  });

  console.log("[Keeper] Cron started — running every second");
}

startCron();

// ── Controller ────────────────────────────────────────────────────────
const transferController = {
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
    return res.json({ success: true, isRunning, metrics });
  },

  async globalData(req, res) {
    return res.json({ success: true, data: globalConfig });
  },

  async funderPublicKey(req, res) {
    const caller = Keypair.fromSecretKey(
      bs58.decode(process.env.CALLER_PRIVATE_KEY),
    );
    return res.json({ success: true, data: caller.publicKey });
  },

  async getAllInvestors(req, res) {
    return res.json({ success: true, data: allInvestors });
  },

  async addInvestor(req, res) {
    try {
      const { startSeconds, name, beneficiary, totalAllocation, adminPublicKey } = req.body;

      const investorExists = allInvestors.find((investor) => investor.account.beneficiary.toBase58() === beneficiary);
      if (investorExists) {
        return res.status(400).json({ success: false, message: "Investor already exists" });
      }

      // Validate label length early before any async work
      const labelBytes = Buffer.from(name, "utf-8");
      if (labelBytes.length > 32) {
        return res.status(400).json({
          success: false,
          message: `Label too long: ${labelBytes.length} bytes (max 32)`,
        });
      }

      await ensureInitialized();

      // Fetch fresh config to get the latest nextInvestorId
      const cfg = await program.account.globalConfig.fetch(configPda);

      // Derive investor PDA — seeds: [INVESTOR_SEED, config, investor_id_le]
      const investorIdBuf = Buffer.alloc(8);
      investorIdBuf.writeBigUInt64LE(BigInt(cfg.nextInvestorId.toString()));

      const [investorVestingPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("investor"), configPda.toBuffer(), investorIdBuf],
        program.programId,
      );

      const [eventAuthorityPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("__event_authority")],
        program.programId,
      );

      const adminPubkey = new PublicKey(adminPublicKey);
      const vestStartTime = new BN(
        Math.floor(Date.now() / 1000) + startSeconds,
      );

      // Build unsigned transaction — UI wallet will sign as admin_authority
      const tx = await program.methods
        .addInvestor(
          name,
          new PublicKey(beneficiary),
          new BN(totalAllocation),
          vestStartTime,
        )
        .accounts({
          adminAuthority: adminPubkey,
          config: configPda,
          escrowVault: cfg.escrowVault,
          investorVesting: investorVestingPda,
          systemProgram: anchor.web3.SystemProgram.programId,
          eventAuthority: eventAuthorityPda,
          program: program.programId,
        })
        .transaction();

      const { blockhash } = await connection.getLatestBlockhash("confirmed");
      tx.recentBlockhash = blockhash;
      tx.feePayer = adminPubkey;

      // Serialize without requiring signatures — UI will sign and send
      const serialized = tx.serialize({ requireAllSignatures: false }).toString("base64");

      return res.json({
        success: true,
        transaction: serialized,
        investorId: cfg.nextInvestorId.toString(),
        investorVestingPda: investorVestingPda.toBase58(),
      });
    } catch (err) {
      console.error("[addInvestor] Error:", err.message);
      return res.status(500).json({ success: false, message: err.message });
    }
  },
};

export default transferController;