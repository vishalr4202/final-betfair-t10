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

export async function integratedBetfairOrder2({ eventName, selectionName, stake, type, oddsPrice }) {
  const sessionToken = await getSessionTokenFromFile();
  const placeOrderUrl = "https://api.betfair.com/exchange/betting/rest/v1.0/placeOrders/";

  const filePath = path.join(process.cwd(), "config.json");
  const fileContents = await fs.readFile(filePath, "utf-8");
  const config = JSON.parse(fileContents);
  console.log(config, eventName, "config");

  let selectedMatch = config.filter(ele => ele.eventName === eventName);
  let marketId = selectedMatch[0]?.marketId;
  let selectionId = selectedMatch[0]?.selection.filter(ele => ele.selectionName === selectionName)[0]?.selectionId;
  console.log(marketId, selectionId, "selectedMatch");

  const side = type === "B" ? "LAY" : "BACK";
  const size = Math.ceil(stake / 1000); // convert to decimal

  // 🧠 Dynamic buffer calculation based on price ranges
  const calculateBuffer = (price) => {
    if (price <= 2.00) return 0.01;
    if (price <= 3.00) return 0.02;
    if (price <= 4.00) return 0.05;
    if (price <= 6.00) return 0.1;
    if (price <= 10.00) return 0.2;
    if (price <= 20.00) return 0.5;
    if (price <= 30.00) return 1.0;
    if (price <= 50.00) return 2.0;
    if (price <= 100.00) return 5.0;
    return 10.0; // for odds > 100
  };

  // ✅ Round to nearest valid Betfair tick
  const roundToValidTick = (price) => {
    const tickSizes = [
      [1.01, 2.00, 0.01],
      [2.00, 3.00, 0.02],
      [3.00, 4.00, 0.05],
      [4.00, 6.00, 0.1],
      [6.00, 10.00, 0.2],
      [10.00, 20.00, 0.5],
      [20.00, 30.00, 1.0],
      [30.00, 50.00, 2.0],
      [50.00, 100.00, 5.0],
      [100.00, 1000.00, 10.0]
    ];

    for (const [min, max, increment] of tickSizes) {
      if (price >= min && price < max) {
        const ticks = Math.round((price - min) / increment);
        return parseFloat((min + ticks * increment).toFixed(2));
      }
    }

    // If outside known range, clamp to min
    return 1.01;
  };


  const roundToSecondValidTick = (price, type) => {
  const tickSizes = [
    [1.01, 2.00, 0.01],
    [2.00, 3.00, 0.02],
    [3.00, 4.00, 0.05],
    [4.00, 6.00, 0.1],
    [6.00, 10.00, 0.2],
    [10.00, 20.00, 0.5],
    [20.00, 30.00, 1.0],
    [30.00, 50.00, 2.0],
    [50.00, 100.00, 5.0],
    [100.00, 1000.00, 10.0]
  ];

  for (const [min, max, increment] of tickSizes) {
    if (price >= min && price < max) {
      let ticks = Math.round((price - min) / increment);
      
      // move to the second nearest tick in buffer direction
      // if (type === 'B') ticks += 1;  // move up for back bets
      // else ticks -= 1;               // move down for lay bets
      if (type === 'B') ticks += 1;  // move up for back bets
      else ticks -= 1;               // move down for lay bets

      const newPrice = min + ticks * increment;
      return parseFloat(newPrice.toFixed(2));
    }
  }

  return 1.01;
};

  // 🔄 Adjust price using buffer (based on bet type)
  const buffer = calculateBuffer(oddsPrice);
  const adjustedPrice = type === 'B' ? oddsPrice + buffer : oddsPrice - buffer;
  // const validPrice = roundToValidTick(adjustedPrice);
  const validPrice = roundToSecondValidTick(adjustedPrice, type);

  console.log("Original DB odds:", oddsPrice);
  console.log("Adjusted (with buffer):", adjustedPrice);
  console.log("Rounded to valid tick:", validPrice);

  const orderBody = {
    marketId,
    instructions: [
      {
        selectionId,
        side: side,
        orderType: "LIMIT",
        limitOrder: {
          size: size,
          price: validPrice,
          // persistenceType: "LAPSE",
          persistenceType: "PERSIST",

        },
      },
    ],
    customerRef: `t10-${Date.now()}`,
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
    console.log(JSON.parse(orderText));
    return JSON.parse(orderText);
  } catch (error) {
    console.error("Error with order placement:", error);
    return null;
  }
}
