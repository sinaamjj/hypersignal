import fs from "node:fs";
import path from "node:path";

export type SignalSource = {
  name: string;
  endpoint?: string; // HTTP endpoint if applicable
  type?: string;     // custom type for your adapters
  params?: Record<string, any>;
};

export function loadJSON<T>(file: string): T {
  const p = path.resolve(process.cwd(), file);
  return JSON.parse(fs.readFileSync(p, "utf-8")) as T;
}

export function loadSignalSources(): SignalSource[] {
  // repo stores configs in root as signals.json (present in your repo)
  try { return loadJSON<SignalSource[]>("signals.json"); }
  catch { return []; }
}

export function loadWallets(): any[] {
  try { return loadJSON<any[]>("wallets.json"); }
  catch { return []; }
}

export function loadLogSources(): any[] {
  try { return loadJSON<any[]>("logs.json"); }
  catch { return []; }
}
