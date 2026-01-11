import express from "express";
import { integratedBetfairLogin,integratedBetfairLogin2 } from "../controller/betfairLogin.js";
import { GetPl } from "../controller/getPl.js";
import { BookOdds } from "../controller/bookOdds.js";
const router = express.Router();

router.get("/betfairLogin",integratedBetfairLogin );
router.get("/betfairLogin2",integratedBetfairLogin2 );
router.get("/getPl",GetPl);
router.get("/bookOdds",BookOdds);   

export default router;
