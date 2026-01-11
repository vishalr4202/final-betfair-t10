import fs from "fs/promises";
import path from "path";
import fetch from "node-fetch";
// import { connect } from "../db/mongo.js";

const appKey = "mTqzso0cthLMa6js";

async function getSessionTokenFromFile() {
  const filePath = path.join(process.cwd(), "BetfairAuth2.json");
  const fileContents = await fs.readFile(filePath, "utf-8");
  const { sessionToken } = JSON.parse(fileContents);
  if (!sessionToken) throw new Error("No session token found in BetfairAuth.json");
  return sessionToken;
}

  const filePath = path.join(process.cwd(), "select.json");
  const fileContents = await fs.readFile(filePath, "utf-8");
  const select = JSON.parse(fileContents);
  
export const BookOdds = async (req, res) => {
  const sessionToken = await getSessionTokenFromFile();
  const placeOrderUrl = "https://api.betfair.com/exchange/betting/rest/v1.0/listMarketBook/";

  const filePath = path.join(process.cwd(), "config.json");
  const fileContents = await fs.readFile(filePath, "utf-8");
  const config = JSON.parse(fileContents);
  // console.log(config, "config");

   const orderBody = {
      marketIds:[config[select?.value]?.marketId],
       "priceProjection": {
       "priceData": ["EX_ALL_OFFERS"]
      }
    //   instructions: [
    //     {
    //       selectionId,
    //       side: side,
    //       orderType: "LIMIT",
    //       limitOrder: {
    //         size: size,
    //         price: validPrice,
    //         // persistenceType: "LAPSE",
    //         persistenceType: "PERSIST",
  
    //       },
    //     },
    //   ],
    //   customerRef: `t10-${Date.now()}`,
    };
  
    try {
      const orderResponse = await fetch(placeOrderUrl, {
        method: "POST",
        headers: {
          "X-Application": appKey,
          "X-Authentication": sessionToken,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(orderBody),
      });
  
      const orderText = await orderResponse.text();
      if (!orderResponse.ok) throw new Error(orderText);
    //   console.log(JSON.parse(orderText));
    //   return JSON.parse(orderText);
    res.send(JSON.parse(orderText));
    } catch (error) {
      console.error("Error with order placement:", error);
      res.send("Error fetching P&L",error);
      return null;
    }
}