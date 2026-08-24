import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { getHealth } from "./modules/health/get.js";
import { createProduct } from "./modules/products/create.js";
import { getProduct } from "./modules/products/get.js";
import { listProducts } from "./modules/products/list.js";
import { removeProduct } from "./modules/products/remove.js";
import { updateProduct } from "./modules/products/update.js";
import { errorHandler } from "./middlewares/error-handler.js";
import { notFound } from "./middlewares/not-found.js";
import { requestLogger } from "./middlewares/request-logger.js";

export const app = express();

app.use(helmet());
app.set("trust proxy", process.env.TRUST_PROXY === "true");
const corsOrigins = process.env.CORS_ORIGIN?.split(",")
	.map((origin) => origin.trim())
	.filter(Boolean) ?? ["http://localhost:3000"];
app.use(cors({ origin: corsOrigins }));
app.use(express.json({ limit: "32kb" }));
app.use(
	rateLimit({
		windowMs: 60_000,
		limit: 120,
		standardHeaders: "draft-8",
		legacyHeaders: false,
	}),
);
app.use(requestLogger);

app.get("/health", getHealth);
app.get("/api/products", listProducts);
app.get("/api/products/:id", getProduct);
app.post("/api/products", createProduct);
app.put("/api/products/:id", updateProduct);
app.delete("/api/products/:id", removeProduct);

app.use(notFound);
app.use(errorHandler);
