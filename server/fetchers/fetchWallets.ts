mport { PrismaClient } from "@prisma/client";
import { loadWallets } from "./sources";

const prisma = new PrismaClient();

export async function runWalletFetchRound() {
  const wallets = loadWallets();
  for (const w of wallets) {
    try {
      // Example expects each wallet object to already contain balance, etc.
      await prisma.wallet.create({
        data: {
          name: w.name ?? "wallet",
          balance: typeof w.balance === "number" ? w.balance : null,
          currency: w.currency ?? null,
          meta: w
        }
      });
    } catch (e: any) {
      await prisma.logEntry.create({
        data: { level: "error", message: `wallet ${w.name ?? "unknown"}: ${e.message}`, context: { w } }
      });
    }
  }
}
// test
