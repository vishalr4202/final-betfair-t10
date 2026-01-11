import fs from "fs";
import path from "path";
import configRaw from "./configRaw.json" assert { type: "json" };
import allTeams from "./allTeams.json" assert { type: "json" };

// ---------- helpers ----------
function normalize(name) {
  return name.toLowerCase().trim();
}

function buildTeamMap(teams) {
  return Object.fromEntries(
    teams.map(t => [normalize(t.runnerName), t.selectionId])
  );
}

function buildSelections(eventName, teamMap) {
  const [a, b] = eventName.split(" v ").map(s => s.trim());

  if (!a || !b) {
    throw new Error(`Invalid eventName format: ${eventName}`);
  }

  const idA = teamMap[normalize(a)];
  const idB = teamMap[normalize(b)];

  if (!idA || !idB) {
    throw new Error(
      `Missing team in allTeams.json: ${!idA ? a : b}`
    );
  }

  return [
    { selectionName: a, selectionId: idA },
    { selectionName: b, selectionId: idB }
  ];
}

// ---------- BUILD (no read of old config.json) ----------
const teamMap = buildTeamMap(allTeams);

const finalConfig = configRaw.map(event => ({
  eventName: event.eventName,
  eventId: event.eventId,
  marketId: event.marketId,
  selection: buildSelections(event.eventName, teamMap)
}));

// ---------- OVERWRITE ----------
const outputPath = path.resolve("./config.json");
fs.writeFileSync(outputPath, JSON.stringify(finalConfig, null, 2));

console.log(`config.json rebuilt (${finalConfig.length} events)`);
