import pino from "pino";

export const logger = pino({
  level: process.env.LOG_LEVEL ?? "info",
  formatters: {
    level: (label, severity) => ({ log: { level: label, severity } }),
  },
});

export const applicationLogger = logger.child({ service: { name: "crud-api" } });
export const environmentLogger = logger.child({ service: { name: "crud-api" }, event: { outcome: "failure" } });
