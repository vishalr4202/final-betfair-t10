import express from "express";
import BetfairLogin from "./routes/login.js";
import LoginRoutes from "./routes/login.js";
import { startBetfairStream } from "./worker/workerBetfair.js";
import { MongoConnect } from "./db/mongo.js  ";


const app = express();
app.use(express.json());
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