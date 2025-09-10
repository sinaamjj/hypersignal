import { PrismaClient } from "@prisma/client";
import { loadSignalSources } from "./sources";

const prisma = new PrismaClient();

async function fetchFromHTTP(name: string, endpoint: string, params?: Record<string, any>) {
  const url = new URL(endpoint);
  if (params) Object.entries(params).forEach(([k,v]) => url.searchParams.set(k, String(v)));
  const res = await fetch(url, { headers: { "accept": "application/json" }});
  if (!res.ok) throw new Error(`Fetch ${name} failed: ${res.status}`);
  return res.json();
}

export async function runSignalFetchRound() {
  const sources = loadSignalSources();
  for (const s of sources) {
    try {
      if (s.endpoint) {
        const data = await fetchFromHTTP(s.name, s.endpoint, s.params);
        // Expect either a single signal or an array; normalize
        const list = Array.isArray(data) ? data : [data];
        for (const item of list) {
          await prisma.signal.create({
            data: {
              source: s.name,
              symbol: item.symbol ?? item.ticker ?? "UNKNOWN",
              side: item.side ?? item.direction ?? "unknown",
              price: item.price ?? null,
              strength: item.strength ?? item.score ?? null,
              meta: item
            }
          });
        }
      } else {
        // For custom adapters, you can implement by s.type
        // e.g., if (s.type === "hyperliquid") { ... }
      }
    } catch (e:any) {
      await prisma.logEntry.create({
        data: { level: "error", message: `source ${s.name}: ${e.message}`, context: { stack: e.stack } }
      });
    }
  }
}
