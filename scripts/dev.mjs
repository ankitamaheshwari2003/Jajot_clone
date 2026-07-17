import { spawn } from "node:child_process";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const nextCli = require.resolve("next/dist/bin/next");
const env = { ...process.env };

// IDE shells can leak these variables into child processes. Next treats any
// DEBUG value as test mode, while ELECTRON_RUN_AS_NODE can affect native module
// resolution. Neither should be present in the regular development server.
delete env.DEBUG;
delete env.ELECTRON_RUN_AS_NODE;

const child = spawn(process.execPath, [nextCli, "dev", ...process.argv.slice(2)], {
  env,
  stdio: "inherit",
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exitCode = code ?? 1;
});
