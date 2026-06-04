import { defineConfig } from "@trigger.dev/sdk";

export default defineConfig({
  project: process.env.TRIGGER_PROJECT_ID ?? "proj_tubesynth",
  runtime: "node",
  logLevel: "info",
  maxDuration: 900, // 15 min ceiling for very long (12h) videos
  retries: {
    enabledInDev: false,
    default: {
      maxAttempts: 3,
      factor: 2,
      minTimeoutInMs: 1000,
      maxTimeoutInMs: 30000,
      randomize: true,
    },
  },
  dirs: ["./src/trigger"],
});
