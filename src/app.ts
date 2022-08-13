/* eslint-disable @typescript-eslint/no-namespace */
/* eslint-disable @typescript-eslint/no-empty-interface */
import express, { Request, Response } from "express";
import cors from "cors";
import router from "./routes/index";
import config from "./config";

import reqLogger from "./utils/reqLogger";
import { CustomRequest } from "./utils/interface";

const app = express();
const port = config.PORT || 5000;

app.use(cors());
app.use(express.json());

declare global {
  namespace Express {
    interface Request extends CustomRequest { }
  }
}

app.use(reqLogger); // request logger
app.use("/api/v1", router);

app.get("/", (req: Request, res: Response) => {
  res.send("Welcome to Quail app");
});

// Global 404 error handler
app.use((req: Request, res: Response) => res.status(404).send({
  status: "error",
  error: "Not found",
  message: "This is not the route you're looking for. Kindly check the url and try again.",
}));

(async () => {
  process.on("warning", (e) => config.logger.warn(e.stack));
  app.listen(config.PORT || 4000, async () => {
    console.log(
      `${config.APP_NAME} API listening on ${port || 4000}`
    );
  });
})();

process.on("unhandledRejection", (error: any) => {
  console.log("FATAL UNEXPECTED UNHANDLED REJECTION!", error.message);
  console.error("\n\n", error, "\n\n");
});

export default app;
