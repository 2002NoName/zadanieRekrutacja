import { app } from "./app.js";
import { applicationLogger, environmentLogger } from "./lib/logger.js";

const port = Number(process.env.PORT ?? 4000);

process.on("uncaughtException", (error) => {
	environmentLogger.fatal({ error }, "Uncaught environment exception");
	process.exit(1);
});

process.on("unhandledRejection", (reason) => {
	environmentLogger.error({ reason }, "Unhandled environment rejection");
	process.exit(1);
});

app.listen(port, () => applicationLogger.info({ port }, "API started"));
