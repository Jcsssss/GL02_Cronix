// comparator.js
import fs from "fs";

export function compareProfiles(targetPath, baselinePath) {
  const target = JSON.parse(fs.readFileSync(targetPath, "utf8"));
  const baseline = JSON.parse(fs.readFileSync(baselinePath, "utf8"));

  const types = new Set([
    ...Object.keys(target.percentages),
    ...Object.keys(baseline.percentages)
  ]);

  const result = {};

  let sumAbsDiff = 0;

  for (const t of types) {
    const a = target.percentages[t] || 0;
    const b = baseline.percentages[t] || 0;
    const diff = +(a - b).toFixed(1);

    sumAbsDiff += Math.abs(diff);

    result[t] = {
      target: a,
      baseline: b,
      diff
    };
  }

  const score_ecart = +(sumAbsDiff / 2).toFixed(1);

  return {
    target: targetPath,
    baseline: baselinePath,
    per_type: result,
    score_ecart
  };
}