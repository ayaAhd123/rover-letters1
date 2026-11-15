/** Two-column layout matching the reference certificate. */
const LEFT_IDS = ["surveyor-3", "opportunity", "viking-1"];
const RIGHT_IDS = ["ingenuity"];

export function partitionMachinesForCert(machines) {
  const byId = new Map(machines.map((m) => [m.id, m]));
  const left = LEFT_IDS.map((id) => byId.get(id)).filter(Boolean);
  const right = RIGHT_IDS.map((id) => byId.get(id)).filter(Boolean);
  const used = new Set([...left, ...right].map((m) => m.id));
  for (const m of machines) {
    if (!used.has(m.id)) left.push(m);
  }
  const rows = Math.max(left.length, right.length, 1);
  return { left, right, rows };
}