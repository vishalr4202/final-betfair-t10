// import { connect } from "../db/mongo.js";
import { integratedBetfairOrder, } from "../controller/integratedBetfair.js";
import { integratedBetfairOrder2 } from "../controller/integratedBetfair2.js";
import {getDb} from "../db/mongo.js";

// export async function pollBetfair() {
//   console.log("trying");
//   try {
//     // const db = await connect();
//     const db = getDb();
//     const betsCol = db.collection("t10bets");
//     const unplacedBets = await betsCol.find({ betfairPlaced: { $ne: true } }).toArray();

//     if (!unplacedBets.length) {
//       console.log("No unplaced bets found for Betfair.");
//     }

//     await Promise.all(
//       unplacedBets.map(async (bet) => {
//         try {
//           const result = await integratedBetfairOrder(bet);
//           await betsCol.updateOne(
//             // { betId: bet.betId },
//             { _id: bet._id },
//             { $set: { betfairPlaced: true, success: result?.status === "SUCCESS" } }
//           );
//         } catch (err) {
//           console.error(`❌ Betfair API failed for ${bet.betId}:`, err.message);
//           await betsCol.updateOne(
//             // { betId: bet.betId },
//                { _id: bet._id },
//             { $set: { betfairPlaced: true, success: false } }
//           );
//         }
//       })
//     );
//   } catch (err) {
//     console.error("Worker error (Betfair):", err);
//   }

//   setTimeout(pollBetfair, 5000);
// }

// export function startBetfairWorker() {
//   pollBetfair();
// }






// export async function startBetfairStream() {
//   const db = getDb();
//   const betsCol = db.collection("t10bets");

//   // Ensure fast lookups if you query manually
//   await betsCol.createIndex({ betfairPlaced: 1 });

//   console.log("👀 Watching for new unplaced bets...");

//   const changeStream = betsCol.watch(
//   [
//     {
//       $match: {
//         $and: [
//           { "fullDocument.betfairPlaced": { $ne: true } },
//           { operationType: { $in: ["insert", "update", "replace"] } },
//         ],
//       },
//     },
//   ],
//   { fullDocument: "updateLookup" } // ensures fullDocument is populated on updates
// );

//   // Heartbeat log to confirm it’s still active
//   const heartbeat = setInterval(() => {
//     console.log("⏳ Still watching for unplaced bets...");
//   }, 60000); // every 60s

//   // Handle new bets
//   changeStream.on("change", async (change) => {
//     const bet = change.fullDocument;
//     if (!bet) return;

//     console.log("⚡ New bet detected:", bet._id);

//     try {
//       const result = await integratedBetfairOrder(bet);
//       await betsCol.updateOne(
//         { _id: bet._id },
//         { $set: { betfairPlaced: true, success: result?.status === "SUCCESS" } }
//       );
//       console.log(`✅ Bet ${bet._id} processed successfully`);
//     } catch (err) {
//       console.error(`❌ Betfair API failed for ${bet._id}:`, err.message);
//       await betsCol.updateOne(
//         { _id: bet._id },
//         { $set: { betfairPlaced: true, success: false } }
//       );
//     }
//   });

//   // Log resume tokens to confirm the stream is live
//   changeStream.on("resumeTokenChanged", () => {
//     console.log("🔁 Change stream active (resume token updated).");
//   });

//   // Handle MongoDB disconnects or network issues
//   changeStream.on("close", () => {
//     console.warn("⚠️ Change stream closed — reconnecting in 5s...");
//     clearInterval(heartbeat);
//     setTimeout(startBetfairStream, 5000);
//   });

//   changeStream.on("error", (err) => {
//     console.error("💥 Change stream error:", err);
//     clearInterval(heartbeat);
//     try {
//       changeStream.close();
//     } catch {}
//     setTimeout(startBetfairStream, 5000);
//   });

//   // Graceful shutdown on Ctrl+C or process stop
//   process.on("SIGINT", async () => {
//     console.log("🛑 Gracefully shutting down change stream...");
//     clearInterval(heartbeat);
//     await changeStream.close();
//     process.exit(0);
//   });
// }




















// updated code with closed event listeners before trying again
// For single user start
// let listenersAttached = false;
// let changeStreamRef = null;
// let heartbeatRef = null;

// // -----------------------
// // Graceful shutdown handler
// // -----------------------
// process.on("SIGINT", async () => {
//   console.log("🛑 Gracefully shutting down change stream...");

//   try {
//     if (heartbeatRef) clearInterval(heartbeatRef);
//     if (changeStreamRef) await changeStreamRef.close();
//   } catch {}

//   process.exit(0);
// });

// // -----------------------
// // Start Change Stream
// // -----------------------
// export async function startBetfairStream() {
//   const db = getDb();
//   const betsCol = db.collection("t10bets");

//   console.log("👀 Starting Mongo change stream...");

//   // Close any old stream if it exists (this is important for avoiding stray listeners)
//   if (changeStreamRef) {
//     try { await changeStreamRef.close(); } catch {}
//   }

//   const changeStream = betsCol.watch(
//     [
//       {
//         $match: {
//           $and: [
//             { "fullDocument.betfairPlaced": { $ne: true } },
//             { operationType: { $in: ["insert", "update", "replace"] } }
//           ]
//         }
//       }
//     ],
//     { fullDocument: "updateLookup" }
//   );

//   changeStreamRef = changeStream;

//   // Restart heartbeat cleanly
//   if (heartbeatRef) clearInterval(heartbeatRef);
//   heartbeatRef = setInterval(() => {
//     console.log("⏳ Still watching for unplaced bets...");
//   }, 60000);

//   // Attach listeners once per stream lifecycle
//   if (!listenersAttached) {
//     listenersAttached = true;

//     // CHANGE EVENT
//     changeStream.on("change", async (change) => {
//       const bet = change.fullDocument;
//       if (!bet) return;

//       console.log("⚡ New bet detected:", bet._id);

//       try {
//         const result = await integratedBetfairOrder(bet);
      
//         await betsCol.updateOne(
//           { _id: bet._id },
//           { $set: { betfairPlaced: true, success: result?.status === "SUCCESS" } }
//         );

//         console.log(`✅ Bet ${bet._id} processed.`);
//       } catch (err) {
//         console.error(`❌ API failed for ${bet._id}:`, err);

//         await betsCol.updateOne(
//           { _id: bet._id },
//           { $set: { betfairPlaced: true, success: false } }
//         );
//       }
//     });

//     // TOKEN UPDATE
//     changeStream.on("resumeTokenChanged", () => {
//       console.log("🔁 Change stream healthy (resume token updated).");
//     });

//     // CLOSE EVENT
//     changeStream.on("close", () => {
//       console.warn("⚠️ Change stream closed — reconnecting in 5s...");
//       listenersAttached = false; // allow re-attaching
//       clearInterval(heartbeatRef);
//       setTimeout(startBetfairStream, 5000);
//     });

//     // ERROR EVENT
//     changeStream.on("error", (err) => {
//       console.error("💥 Change stream error:", err);
//       listenersAttached = false; // allow re-attaching
//       clearInterval(heartbeatRef);
//       try { changeStream.close(); } catch {}
//       setTimeout(startBetfairStream, 5000);
//     });
//   }
// }


// For single user end


















// for 2 accounts orders

// let listenersAttached = false;
// let changeStreamRef = null;
// let heartbeatRef = null;

// // -----------------------
// // Graceful shutdown handler
// // -----------------------
// process.on("SIGINT", async () => {
//   try {
//     if (heartbeatRef) clearInterval(heartbeatRef);
//     if (changeStreamRef) await changeStreamRef.close();
//   } catch {}
//   process.exit(0);
// });

// // -----------------------
// // Start Change Stream
// // -----------------------
// export async function startBetfairStream() {
//   const db = getDb();
//   const betsCol = db.collection("t10bets");

//   if (changeStreamRef) {
//     try { await changeStreamRef.close(); } catch {}
//   }

//   const changeStream = betsCol.watch(
//     [
//       {
//         $match: {
//           $and: [
//             { "fullDocument.betfairPlaced": { $ne: true } },
//             { operationType: { $in: ["insert", "update", "replace"] } }
//           ]
//         }
//       }
//     ],
//     { fullDocument: "updateLookup" }
//   );

//   changeStreamRef = changeStream;

//   if (heartbeatRef) clearInterval(heartbeatRef);
//   heartbeatRef = setInterval(() => {
//     console.log("⏳ Watching for unplaced bets...");
//   }, 60000);

//   if (!listenersAttached) {
//     listenersAttached = true;

//     changeStream.on("change", async (change) => {
//       const bet = change.fullDocument;
//       if (!bet) return;

//       console.log("⚡ Processing bet:", bet._id);

//       try {
//         const [res1, res2] = await Promise.all([
//           integratedBetfairOrder(bet),
//           integratedBetfairOrder2(bet),
//         ]);

//         const user1Success = isOrderSuccess(res1);
//         const user2Success = isOrderSuccess(res2);

//         let success = false;
//         let partial = false;
//         let failedAccounts = [];

//         if (user1Success && user2Success) {
//           success = true;
//         } else if (user1Success || user2Success) {
//           partial = true;
//           if (!user1Success) failedAccounts.push("primary");
//           if (!user2Success) failedAccounts.push("secondary");
//         } else {
//           failedAccounts = ["primary", "secondary"];
//         }

//         if (!success) {
//           console.error("❌ Bet execution issue", {
//             user1: user1Success,
//             user2: user2Success,
//           });
//         }

//         await betsCol.updateOne(
//           { _id: bet._id },
//           {
//             $set: {
//               betfairPlaced: true,
//               success,
//               partial,
//               failedAccounts
//             }
//           }
//         );

//         if (success) {
//           console.log(`✅ Bet ${bet._id} succeeded for ALL users`);
//         } else if (partial) {
//           console.log(`⚠️ Bet ${bet._id} PARTIAL success. Failed: ${failedAccounts.join(", ")}`);
//         } else {
//           console.log(`❌ Bet ${bet._id} failed for ALL users`);
//         }

//       } catch (err) {
//         console.error("💥 System-level failure:", err);

//         await betsCol.updateOne(
//           { _id: bet._id },
//           {
//             $set: {
//               betfairPlaced: true,
//               success: false,
//               partial: false,
//               failedAccounts: ["system"]
//             }
//           }
//         );
//       }
//     });

//     changeStream.on("close", () => {
//       listenersAttached = false;
//       clearInterval(heartbeatRef);
//       setTimeout(startBetfairStream, 5000);
//     });

//     changeStream.on("error", () => {
//       listenersAttached = false;
//       clearInterval(heartbeatRef);
//       try { changeStream.close(); } catch {}
//       setTimeout(startBetfairStream, 5000);
//     });
//   }
// }

// // -----------------------
// // Betfair success checker
// // -----------------------
// function isOrderSuccess(resp) {
//   return (
//     resp &&
//     resp.status === "SUCCESS" &&
//     Array.isArray(resp.instructionReports) &&
//     resp.instructionReports[0]?.status === "SUCCESS"
//   );
// }





// for 2 accounts orders end



















// duplicate event protection + document lock +event debounce
// let listenersAttached = false;
// let changeStreamRef = null;
// let heartbeatRef = null;

// // Prevent duplicate order placements
// const processing = new Set();      // actively processing bets
// const recentDebounce = new Map();  // event debounce
// const DEBOUNCE_MS = 1500;

// // -----------------------
// // Graceful shutdown
// // -----------------------
// process.on("SIGINT", async () => {
//   console.log("🛑 Gracefully shutting down change stream...");
//   try {
//     if (heartbeatRef) clearInterval(heartbeatRef);
//     if (changeStreamRef) await changeStreamRef.close();
//   } catch {}
//   process.exit(0);
// });

// export async function startBetfairStream() {
//   const db = getDb();
//   const betsCol = db.collection("t10bets");

//   console.log("👀 Starting Mongo change stream...");

//   // Close previous stream before starting a new one (important)
//   if (changeStreamRef) {
//     try { await changeStreamRef.close(); } catch {}
//   }

//   const changeStream = betsCol.watch(
//     [
//       {
//         $match: {
//           $and: [
//             { "fullDocument.betfairPlaced": { $ne: true } },
//             { operationType: { $in: ["insert"] } }
//           ]
//         }
//       }
//     ],
//     { fullDocument: "updateLookup" }
//   );

//   changeStreamRef = changeStream;

//   // Restart heartbeat
//   if (heartbeatRef) clearInterval(heartbeatRef);
//   heartbeatRef = setInterval(() => {
//     console.log("⏳ Still watching for unplaced bets...");
//   }, 60000);

//   // Attach listeners (only once per start)
//   if (!listenersAttached) {
//     listenersAttached = true;

//     changeStream.on("change", async (change) => {
//       const bet = change.fullDocument;
//       if (!bet) return;

//       const id = bet._id.toString();

//       // 1️⃣ Debounce repeated change events
//       const now = Date.now();
//       if (recentDebounce.has(id) && now - recentDebounce.get(id) < DEBOUNCE_MS) {
//         console.log("⏭️ Debounced Mongo duplicate event:", id);
//         return;
//       }
//       recentDebounce.set(id, now);

//       // 2️⃣ Prevent concurrent handlers for the same document
//       if (processing.has(id)) {
//         console.log("⏭️ Already processing bet:", id);
//         return;
//       }
//       processing.add(id);

//       try {
//         // 3️⃣ Always re-check DB before processing
//         const fresh = await betsCol.findOne({ _id: bet._id });
//         if (!fresh || fresh.betfairPlaced === true) {
//           console.log("⏭️ Skip — already placed:", id);
//           return;
//         }

//         console.log("⚡ Processing new Betfair order:", id);

//         const result = await integratedBetfairOrder(bet);

//         await betsCol.updateOne(
//           { _id: bet._id },
//           { $set: { betfairPlaced: true, success: result?.status === "SUCCESS" } }
//         );

//         console.log(`✅ Bet ${id} processed.`);
//       } catch (err) {
//         console.error(`❌ Error processing bet ${id}:`, err.message);

//         await betsCol.updateOne(
//           { _id: bet._id },
//           { $set: { betfairPlaced: true, success: false } }
//         );
//       } finally {
//         processing.delete(id);
//       }
//     });

//     changeStream.on("resumeTokenChanged", () => {
//       console.log("🔁 Change stream healthy (token updated).");
//     });

//     changeStream.on("close", () => {
//       console.warn("⚠️ Change stream closed → Reconnecting in 5s...");
//       listenersAttached = false;
//       clearInterval(heartbeatRef);
//       setTimeout(startBetfairStream, 5000);
//     });

//     changeStream.on("error", (err) => {
//       console.error("💥 Change stream error:", err);
//       listenersAttached = false;
//       clearInterval(heartbeatRef);
//       try { changeStream.close(); } catch {}
//       setTimeout(startBetfairStream, 5000);
//     });
//   }
// }












// Final single User

// let listenersAttached = false;
// let changeStreamRef = null;
// let heartbeatRef = null;

// // Prevent duplicate execution within the process
// const processing = new Set();

// // -----------------------
// // Graceful shutdown
// // -----------------------
// process.on("SIGINT", async () => {
//   console.log("🛑 Gracefully shutting down change stream...");
//   try {
//     if (heartbeatRef) clearInterval(heartbeatRef);
//     if (changeStreamRef) await changeStreamRef.close();
//   } catch {}
//   process.exit(0);
// });

// // -----------------------
// // Start Change Stream
// // -----------------------
// export async function startBetfairStream() {
//   const db = getDb();
//   const betsCol = db.collection("t10bets");

//   console.log("👀 Starting Mongo change stream...");

//   // Close old stream if any
//   if (changeStreamRef) {
//     try { await changeStreamRef.close(); } catch {}
//   }

//   // 🔒 INSERT ONLY — no self-trigger loop possible
//   const changeStream = betsCol.watch(
//     [
//       {
//         $match: {
//           operationType: "insert"
//         }
//       }
//     ],
//     { fullDocument: "updateLookup" }
//   );

//   changeStreamRef = changeStream;

//   // Heartbeat
//   if (heartbeatRef) clearInterval(heartbeatRef);
//   heartbeatRef = setInterval(() => {
//     console.log("⏳ Watching for new bets...");
//   }, 60000);

//   if (!listenersAttached) {
//     listenersAttached = true;

//     // -----------------------
//     // CHANGE EVENT
//     // -----------------------
//     changeStream.on("change", async (change) => {
//       const bet = change.fullDocument;
//       if (!bet) return;

//       const id = bet._id.toString();

//       // 🔒 In-process dedupe
//       if (processing.has(id)) return;
//       processing.add(id);

//       try {
//         console.log("⚡ Processing Betfair order:", id);

//         const result = await integratedBetfairOrder(bet);

//         await betsCol.updateOne(
//           { _id: bet._id },
//           {
//             $set: {
//               betfairPlaced: true,
//               success: result?.status === "SUCCESS"
//             }
//           }
//         );

//         console.log(`✅ Bet ${id} processed`);
//       } catch (err) {
//         console.error(`❌ Error processing bet ${id}:`, err?.message);

//         await betsCol.updateOne(
//           { _id: bet._id },
//           {
//             $set: {
//               betfairPlaced: true,
//               success: false
//             }
//           }
//         );
//       } finally {
//         // 🔑 Always release lock
//         processing.delete(id);
//       }
//     });

//     // -----------------------
//     // STREAM HEALTH EVENTS
//     // -----------------------
//     changeStream.on("resumeTokenChanged", () => {
//       console.log("🔁 Change stream healthy (token updated)");
//     });

//     changeStream.on("close", () => {
//       console.warn("⚠️ Change stream closed → reconnecting...");
//       listenersAttached = false;
//       clearInterval(heartbeatRef);
//       setTimeout(startBetfairStream, 5000);
//     });

//     changeStream.on("error", (err) => {
//       console.error("💥 Change stream error:", err?.message);
//       listenersAttached = false;
//       clearInterval(heartbeatRef);
//       try { changeStream.close(); } catch {}
//       setTimeout(startBetfairStream, 5000);
//     });
//   }
// }



// For single user end











// Final Multi User


let listenersAttached = false;
let changeStreamRef = null;
let heartbeatRef = null;

// In-process execution lock
const processing = new Set();

// -----------------------
// Graceful shutdown
// -----------------------
process.on("SIGINT", async () => {
  console.log("🛑 Gracefully shutting down change stream...");
  try {
    if (heartbeatRef) clearInterval(heartbeatRef);
    if (changeStreamRef) await changeStreamRef.close();
  } catch {}
  process.exit(0);
});

// -----------------------
// Start Change Stream
// -----------------------
export async function startBetfairStream() {
  const db = getDb();
  const betsCol = db.collection("t10bets");

  console.log("👀 Starting Mongo change stream (multi-user)…");

  // Close old stream if exists
  if (changeStreamRef) {
    try { await changeStreamRef.close(); } catch {}
  }

  // 🔒 INSERT ONLY — no self-trigger possible
  const changeStream = betsCol.watch(
    [{ $match: { operationType: "insert" } }],
    { fullDocument: "updateLookup" }
  );

  changeStreamRef = changeStream;

  // Heartbeat
  if (heartbeatRef) clearInterval(heartbeatRef);
  heartbeatRef = setInterval(() => {
    console.log("⏳ Watching for new bets...");
  }, 60000);

  if (!listenersAttached) {
    listenersAttached = true;

    // -----------------------
    // CHANGE EVENT
    // -----------------------
    changeStream.on("change", async (change) => {
      const bet = change.fullDocument;
      if (!bet) return;

      const id = bet._id.toString();

      // 🔒 In-process dedupe
      if (processing.has(id)) return;
      processing.add(id);

      try {
        console.log("⚡ Processing MULTI-USER bet:", id);

        // 👉 Add or remove users here (scales cleanly)
        const executions = [
          { name: "primary", fn: integratedBetfairOrder },
          { name: "secondary", fn: integratedBetfairOrder2 },
        ];

        const results = await Promise.all(
          executions.map(e => e.fn(bet))
        );

        let successCount = 0;
        let failedAccounts = [];

        results.forEach((res, idx) => {
          const ok = isOrderSuccess(res);
          if (ok) successCount++;
          else failedAccounts.push(executions[idx].name);
        });

        const success = successCount === executions.length;
        const partial = successCount > 0 && !success;

        await betsCol.updateOne(
          { _id: bet._id },
          {
            $set: {
              betfairPlaced: true,
              success,
              partial,
              failedAccounts
            }
          }
        );

        if (success) {
          console.log(`✅ Bet ${id} succeeded for ALL accounts`);
        } else if (partial) {
          console.log(`⚠️ Bet ${id} PARTIAL success. Failed: ${failedAccounts.join(", ")}`);
        } else {
          console.log(`❌ Bet ${id} FAILED for ALL accounts`);
        }

      } catch (err) {
        console.error("💥 SYSTEM FAILURE:", err?.message);

        await betsCol.updateOne(
          { _id: bet._id },
          {
            $set: {
              betfairPlaced: true,
              success: false,
              partial: false,
              failedAccounts: ["system"]
            }
          }
        );
      } finally {
        // 🔑 Always release lock
        processing.delete(id);
      }
    });

    // -----------------------
    // STREAM HEALTH
    // -----------------------
    changeStream.on("resumeTokenChanged", () => {
      console.log("🔁 Change stream healthy (token updated)");
    });

    changeStream.on("close", () => {
      console.warn("⚠️ Change stream closed → reconnecting...");
      listenersAttached = false;
      clearInterval(heartbeatRef);
      setTimeout(startBetfairStream, 5000);
    });

    changeStream.on("error", (err) => {
      console.error("💥 Change stream error:", err?.message);
      listenersAttached = false;
      clearInterval(heartbeatRef);
      try { changeStream.close(); } catch {}
      setTimeout(startBetfairStream, 5000);
    });
  }
}

// -----------------------
// Betfair success checker
// -----------------------
function isOrderSuccess(resp) {
  return (
    resp &&
    resp.status === "SUCCESS" &&
    Array.isArray(resp.instructionReports) &&
    resp.instructionReports[0]?.status === "SUCCESS"
  );
}
// Final Multi User end

