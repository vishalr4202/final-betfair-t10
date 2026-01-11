import express from "express";
// import BetfairLogin from "./routes/login.js";
import LoginRoutes from "./routes/login.js";
import { startBetfairStream } from "./worker/workerBetfair.js";
import { MongoConnect } from "./db/mongo.js  ";

var corsOptions = {
  origin: ["http://127.0.0.2:5173","http://localhost:5173","http://localhost:5174"],
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

import cors from "cors";

const app = express();
app.use(express.json());
  app.use(cors(corsOptions))
// app.use("/api", BetfairLogin);
app.use(LoginRoutes)

const PORT = 3001;
// app.listen(PORT, () => {
//   console.log(`🚀 Server running on http://localhost:${PORT}`);
//   startBetfairWorker();
// });

MongoConnect(()=>{
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    // startBetfairWorker();
    startBetfairStream()
  });
});