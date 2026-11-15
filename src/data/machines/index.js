import { OPPORTUNITY_KIDS } from "@/data/kids/opportunity";
import { INGENUITY_KIDS } from "@/data/kids/ingenuity";
import { SURVEYOR3_KIDS } from "@/data/kids/surveyor3";
import { VIKING_KIDS } from "@/data/kids/viking-kids";

/** Central registry — map pins, kids data, and future machine components. */
export const MACHINES = {
  opportunity: {
    id: "opportunity",
    name: "Opportunity",
    subtitle: "Mars rover · landed 2004",
    planetId: "mars",
    themeColor: "#f49d56",
    kids: OPPORTUNITY_KIDS,
    experience: "opportunity-segments",
  },
  ingenuity: {
    id: "ingenuity",
    name: "Ingenuity",
    subtitle: "Mars helicopter · first powered flight",
    planetId: "mars",
    themeColor: "#9ad8ff",
    kids: INGENUITY_KIDS,
    experience: "ingenuity-segments",
  },
  "viking-1": {
    id: "viking-1",
    name: "Viking 1",
    subtitle: "Mars lander · landed 1976",
    planetId: "mars",
    themeColor: "#6BB5FF",
    kids: VIKING_KIDS,
    experience: "viking-segments",
  },
  "surveyor-3": {
    id: "surveyor-3",
    name: "Surveyor 3",
    subtitle: "Surveyor 3 & Apollo 12 · same crater",
    planetId: "moon",
    lat: -3.02,
    lon: -23.42,
    mapX: 42,
    mapY: 53,
    themeColor: "#9ad8ff",
    kids: SURVEYOR3_KIDS,
    experience: "surveyor-game",
  },
};

export function machineById(id) {
  return MACHINES[id] ?? null;
}

export function kidsPackFor(id) {
  return MACHINES[id]?.kids ?? null;
}