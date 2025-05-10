import express from "express";
import { errorHandler } from "./interface/middlewares/errorHandler";

const app = express();
app.use(express.json());

import routes from "./interface/routes";

app.use(routes);

app.use(errorHandler);

export default app;
