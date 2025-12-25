import fs from "fs/promises";
import path from "path";
import fetch from "node-fetch";
// import { connect } from "../db/mongo.js";

const appKey = "DsGV2EVu8pDQHvVs";

async function getSessionTokenFromFile() {
  const filePath = path.join(process.cwd(), "BetfairAuth.json");
  const fileContents = await fs.readFile(filePath, "utf-8");
  const { sessionToken } = JSON.parse(fileContents);
  if (!sessionToken) throw new Error("No session token found in BetfairAuth.json");
  return sessionToken;
}

// export async function integratedBetfairOrder({ eventName, selectionName, stake, type, oddsPrice }) {
//   const sessionToken = await getSessionTokenFromFile();
//   const placeOrderUrl = "https://api.betfair.com/exchange/betting/rest/v1.0/placeOrders/";


//   const filePath = path.join(process.cwd(), "config.json");
//   const fileContents = await fs.readFile(filePath, "utf-8");
//   const config = JSON.parse(fileContents);
//   console.log(config, eventName, "config")

//   let selectedMatch = config.filter(ele => ele.eventName === eventName)
//   let marketId = selectedMatch[0]?.marketId;
//   let selectionId = selectedMatch[0]?.selection.filter(ele => ele.selectionName === selectionName)[0]?.selectionId;
//   console.log(marketId, selectionId, "selectedMatch")
//   const side = type === "B" ? "LAY" : "BACK";
//   const size = Math.ceil(stake / 10000); // convert to decimal

// console.log(side == 'B' ? oddsPrice + 0.02 : oddsPrice -0.02, "price")
//   const currentOdds = await getCurrentOdds(marketId, selectionId);
//   if (!currentOdds) {
//       console.error("Failed to fetch current odds.");
//       return;
//     }

//   console.log("Current available odds:", currentOdds);
//   const orderBody = {
//     marketId,
//     instructions: [
//       {
//         selectionId,
//         side: side,
//         orderType: "LIMIT",
//         limitOrder: {
//           // size: stake,
//           size: size,
//           // price: type === 'B' ? oddsPrice + 0.02 : oddsPrice -0.02,
//           price: type === 'B' ? currentOdds + 0.02 : currentOdds - 0.02,
//           persistenceType: "LAPSE",
//         },
//       },
//     ],
//     // instructions: [
//     //   {
//     //     selectionId: selectionId, // runner ID (home/draw/away)
//     //     side: side,             // BACK or LAY
//     //     orderType: "MARKET_ON_CLOSE",
//     //     marketOnCloseOrder: {
//     //         liability: 1         // total stake for LAY, ignored for BACK
//     //     }
//     //   }
//     // ],
//     customerRef: `t10-${Date.now()}`,
//   };

//   // const orderResponse = await fetch(placeOrderUrl, {
//   //   method: "POST",
//   //   headers: {
//   //     "X-Application": appKey,
//   //     "X-Authentication": sessionToken,
//   //     "Content-Type": "application/json",
//   //     Accept: "application/json",
//   //   },
//   //   body: JSON.stringify(orderBody),
//   // });

//   // const orderText = await orderResponse.text();
//   // if (!orderResponse.ok) throw new Error(orderText);
//   // console.log(JSON.parse(orderText))
//   // return JSON.parse(orderText);
// }

// with market price
// export async function integratedBetfairOrder({ eventName, selectionName, stake, type, oddsPrice }) {
//   const sessionToken = await getSessionTokenFromFile(); // Get the session token from file
//   const placeOrderUrl = "https://api.betfair.com/exchange/betting/rest/v1.0/placeOrders/";

//   const filePath = path.join(process.cwd(), "config.json");
//   const fileContents = await fs.readFile(filePath, "utf-8");
//   const config = JSON.parse(fileContents);
//   console.log(config, eventName, "config");

//   // Find the selected match from config
//   let selectedMatch = config.filter(ele => ele.eventName === eventName);
//   let marketId = selectedMatch[0]?.marketId;
//   let selectionId = selectedMatch[0]?.selection.filter(ele => ele.selectionName === selectionName)[0]?.selectionId;

//   console.log(marketId, selectionId, "selectedMatch");

//   // Define the side (BACK or LAY) and size (adjust stake)
//   const side = type === "B" ? "LAY" : "BACK";
//   const size = Math.ceil(stake / 10000); // Convert to decimal

//   console.log(`Order type: ${side}, Size: ${size}, Stake: ${stake}`);

//   // Get the current odds for the selection (back or lay)
//   const currentOdds = await getCurrentOdds(marketId, selectionId, side); // Pass the side to decide back or lay price
//   if (!currentOdds) {
//     console.error("Failed to fetch current odds.");
//     return;
//   }

//   console.log("Current available odds:", currentOdds);

//   // Set the order price based on the side (Back or Lay)
//   const orderPrice = currentOdds // Adjust price accordingly
//   console.log(`Placing order at price: ${orderPrice}`);

//   // Construct the order body
//   const orderBody = {
//     marketId,
//     instructions: [
//       {
//         selectionId,
//         side: side,
//         orderType: "LIMIT",
//         limitOrder: {
//           size: size,
//           price: orderPrice,
//           persistenceType: "LAPSE", // Order will be cancelled if not matched
//         },
//       },
//     ],
//     customerRef: `t10-${Date.now()}`, // Unique reference for your order
//   };

//   // Uncomment the following code to place the order (ensure it's correct)
//   // try {
//   //   const orderResponse = await fetch(placeOrderUrl, {
//   //     method: "POST",
//   //     headers: {
//   //       "X-Application": appKey, // Your application key
//   //       "X-Authentication": sessionToken, // Your session token
//   //       "Content-Type": "application/json",
//   //       Accept: "application/json",
//   //     },
//   //     body: JSON.stringify(orderBody),
//   //   });

//   //   const orderText = await orderResponse.text();

//   //   if (!orderResponse.ok) {
//   //     throw new Error(orderText);
//   //   }

//   //   console.log("Order placed successfully:", JSON.parse(orderText));
//   //   return JSON.parse(orderText);
//   // } catch (error) {
//   //   console.error("Error placing order:", error);
//   //   return null;
//   // }
// }

// partial ladder
// export async function integratedBetfairOrder({ eventName, selectionName, stake, type, oddsPrice }) {
//   const sessionToken = await getSessionTokenFromFile();
//   const placeOrderUrl = "https://api.betfair.com/exchange/betting/rest/v1.0/placeOrders/";

//   const filePath = path.join(process.cwd(), "config.json");
//   const fileContents = await fs.readFile(filePath, "utf-8");
//   const config = JSON.parse(fileContents);
//   console.log(config, eventName, "config");

//   let selectedMatch = config.filter(ele => ele.eventName === eventName);
//   let marketId = selectedMatch[0]?.marketId;
//   let selectionId = selectedMatch[0]?.selection.filter(ele => ele.selectionName === selectionName)[0]?.selectionId;
//   console.log(marketId, selectionId, "selectedMatch");

//   const side = type === "B" ? "LAY" : "BACK";
//   const size = Math.ceil(stake / 10000); // convert to decimal

//   // Function to calculate dynamic price buffer based on oddsPrice
//   const calculateBuffer = (price) => {
//     // Step distance logic to calculate dynamic buffer
//     if (price <= 2) {
//       return 0.01; // Small buffer for odds near the DB price
//     } else if (price <= 3) {
//       return 0.02; // Slightly larger buffer for odds further away
//     } else if(price<=4){
//       return 0.05; // Larger buffer for distant odds
//     }
//     else{
//       return 0.1
//     }
//   };

//   // Calculate adjusted price with dynamic buffer based on side (BACK or LAY)
//   const buffer = calculateBuffer(oddsPrice);
//   console.log(buffer, "buffer")
//   const adjustedPrice = type === 'B' ? oddsPrice + buffer : oddsPrice - buffer;

//   console.log("Adjusted Price:", adjustedPrice); // Debug the adjusted price

//   const orderBody = {
//     marketId,
//     instructions: [
//       {
//         selectionId,
//         side: side,
//         orderType: "LIMIT",
//         limitOrder: {
//           size: size,
//           price: parseFloat(adjustedPrice.toFixed(2)), // Use the adjusted price
//           persistenceType: "LAPSE", // Order will be cancelled if not matched
//         },
//       },
//     ],
//     customerRef: `t10-${Date.now()}`, // Unique reference for your order
//   };

//   try {
//     const orderResponse = await fetch(placeOrderUrl, {
//       method: "POST",
//       headers: {
//         "X-Application": appKey, // Your app key
//         "X-Authentication": sessionToken, // Your session token
//         "Content-Type": "application/json",
//          "Accept": "application/json",
//       },
//       body: JSON.stringify(orderBody),
//     });

//     const orderText = await orderResponse.text();
//     if (!orderResponse.ok) throw new Error(orderText);
//     console.log(JSON.parse(orderText));
//     return JSON.parse(orderText);
//   } catch (error) {
//     console.error("Error with order placement:", error);
//     return null;
//   }
// }



// complete ladder with tick adjustment
export async function integratedBetfairOrder({ eventName, selectionName, stake, type, oddsPrice }) {
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



// export async function saveOrUpdateBets(bets) {
//   const db = await connect();
//   const betsCol = db.collection("t10bets");
//   for (const bet of bets) {
//     await betsCol.updateOne({ betId: bet.betId }, { $set: bet }, { upsert: true });
//   }
// }


async function getCurrentOdds(marketId, selectionId, side) {
  console.log(marketId, selectionId, side, "getCurrentOdds")
  const url = 'https://api.betfair.com/exchange/betting/rest/v1.0/listMarketBook/';
  const requestBody = {
    marketIds: [marketId], // Array of market IDs
    priceProjection: {
      priceData: ["EX_BEST_OFFERS"], // Request best available odds
    },
  };
    const sessionToken = await getSessionTokenFromFile();

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        "X-Application": appKey,
      "X-Authentication": sessionToken,
      "Content-Type": "application/json",
      Accept: "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();
    console.log(data, "getCurrentOdds response")
    if (data && data.length > 0) {
      const marketBook = data[0]; // There will be only one market in the response
      console.log(data, "marketBook")
      // Get the selection's odds from the market book
      const runner = marketBook.runners.find(r => r.selectionId === selectionId);
      if (runner && runner.ex) {
        console.log(runner.ex.availableToBack,runner.ex.availableToBack,"run")
        // If placing a BACK bet, return the best available back price
        if (side === 'BACK' && runner.ex.availableToBack.length > 0) {
          return runner.ex.availableToBack[0].price;
        }

        // If placing a LAY bet, return the best available lay price
        if (side === 'LAY' && runner.ex.availableToLay.length > 0) {
          return runner.ex.availableToLay[0].price;
        }
      }
    }

    console.error('No odds found for this selection');
    return null;
  } catch (error) {
    console.error('Error fetching current odds:', error);
    return null;
  }
}
