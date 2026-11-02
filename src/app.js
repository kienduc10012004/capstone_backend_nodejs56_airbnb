import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import { uploadDirectory } from "./common/constants/app.constant.js";
import rootRouter from "./routers/root.router.js";
import { swaggerDocument } from "./common/swagger/init.swagger.js";
import { errorHandler } from "./common/middlewares/error.middleware.js";

export const app = express();
app.disable("x-powered-by");
app.use(cors());
if (process.env.VERCEL) app.set("trust proxy", 1);
app.get("/", (req, res) => res.redirect("/swagger/"));
app.get(/^\/swagger$/, (req, res) => res.redirect("/swagger/"));
app.use(
  express.json({
    limit: "1mb",
    type: ["application/json", "application/*+json", "text/json"],
  }),
);
app.use(
  "/uploads",
  express.static(uploadDirectory, {
    dotfiles: "deny",
    setHeaders(res) {
      res.setHeader("X-Content-Type-Options", "nosniff");
    },
  }),
);
app.get("/swagger.json", (req, res) => res.json(swaggerDocument));
app.use("/swagger", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use("/api", rootRouter);
app.use((req, res) =>
  res
    .status(404)
    .json({ statusCode: 404, message: "API không tồn tại.", content: null }),
);
app.use(errorHandler);

export default app;
