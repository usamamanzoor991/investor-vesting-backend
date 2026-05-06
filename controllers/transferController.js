import { Connection, PublicKey } from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import { AnchorProvider, Program } from "@coral-xyz/anchor";
import { Keypair } from "@solana/web3.js";
import bs58 from "bs58";

const transferController = {
  async transferFunds(req, res) {
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

    // Fetch GlobalConfig
    const globalConfigPda = configPda;

    const acc = await provider.connection.getAccountInfo(configPda);

    const globalConfig =
      await program.account.globalConfig.fetch(globalConfigPda);

    console.log("Global Config:", {
      tokenMint: globalConfig.tokenMint.toBase58(),
      escrowVault: globalConfig.escrowVault.toBase58(),
      vestingPeriodsTotal: globalConfig.vestingPeriodsTotal,
      periodSeconds: globalConfig.periodSeconds.toString(),
      totalCommitted: globalConfig.totalCommitted.toString(),
      totalDistributed: globalConfig.totalDistributed.toString(),
      paused: globalConfig.paused,
    });

    // Fetch all InvestorVesting accounts filtered by this GlobalConfig
    const allInvestors = await program.account.investorVesting.all([
      {
        memcmp: {
          offset: 8, // skip Anchor discriminator
          bytes: globalConfigPda.toBase58(),
        },
      },
    ]);

    console.log(`\nTotal Investors: ${allInvestors.length}`);

    for (const { publicKey, account } of allInvestors) {
      const label = Buffer.from(
        account.label.slice(0, account.labelLen),
      ).toString("utf8");
      console.log("\nInvestor:", {
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
    }
    res.json({ success: true, data: allInvestors });
  },
};

export default transferController;
