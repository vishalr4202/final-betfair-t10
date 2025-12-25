import express from "express";
import { integratedBetfairLogin,integratedBetfairLogin2 } from "../controller/betfairLogin.js";
const router = express.Router();

router.get("/betfairLogin",integratedBetfairLogin );
router.get("/betfairLogin2",integratedBetfairLogin2 );

export default router;
