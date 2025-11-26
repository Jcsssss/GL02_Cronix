// cli.js
// =======================================================
// CLI pour profilage/comparaison avec options avancées :
//  --ansi : colorisation
//  --csv <file> : export CSV
//  --png <file> : export PNG (diagramme)
// =======================================================

import fs from "fs";
import { createCanvas } from "canvas";
import { profileFromFiles } from "./profiler.js";
import { compareProfiles } from "./comparator.js";

// -------------------------------------------------------
// ANSI COLORS
// -------------------------------------------------------
const COLORS = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m"
};

function colorize(text, color) {
  return COLORS[color] + text + COLORS.reset;
}

// -------------------------------------------------------
// ASCII HISTOGRAM (avec ou sans couleurs)
// -------------------------------------------------------
function printAsciiHistogram(percentages, useColor = false) {
  console.log("\nHistogramme des types de questions (ordre décroissant) :\n");

  const sorted = Object.entries(percentages).sort((a, b) => b[1] - a[1]);
  const maxTypeLength = Math.max(...sorted.map(([type]) => type.length));

  const colorList = ["cyan", "green", "yellow", "magenta", "blue", "red"];  
  let colorIndex = 0;

  for (const [type, pct] of sorted) {
    const bar = "█".repeat(Math.round(pct));
    const padded = type.padEnd(maxTypeLength, " ");

    let coloredBar = bar;
    if (useColor) {
      const color = colorList[colorIndex % colorList.length];
      coloredBar = colorize(bar, color);
      colorIndex++;
    }

    console.log(`${padded} | ${coloredBar} ${pct}%`);
  }
  console.log("");
}

// -------------------------------------------------------
// CSV EXPORT
// -------------------------------------------------------
function exportCsv(profile, filePath) {
  const lines = ["type,count,percentage"];

  for (const t in profile.counts) {
    lines.push(`${t},${profile.counts[t]},${profile.percentages[t]}`);
  }

  fs.writeFileSync(filePath, lines.join("\n"));
  console.log(`CSV exporté → ${filePath}`);
}

// -------------------------------------------------------
// PNG EXPORT (bar chart)
// -------------------------------------------------------
function exportPng(profile, filePath) {
  const width = 900;
  const height = 500;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  // Fond blanc
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, width, height);

  // Titre
  ctx.fillStyle = "black";
  ctx.font = "28px Arial";
  ctx.fillText("Profil des types de questions", 20, 40);

  const sorted = Object.entries(profile.percentages).sort((a, b) => b[1] - a[1]);

  const barWidth = 60;
  const gap = 40;
  const startX = 80;
  const baseY = height - 80;
  const maxHeight = 300;

  sorted.forEach(([type, pct], i) => {
    const barHeight = (pct / 100) * maxHeight;

    // couleur pastel
    const r = (50 + i * 30) % 255;
    const g = (120 + i * 50) % 255;
    const b = (200 + i * 40) % 255;
    ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;

    const x = startX + i * (barWidth + gap);
    const y = baseY - barHeight;

    ctx.fillRect(x, y, barWidth, barHeight);

    // Label %
    ctx.fillStyle = "black";
    ctx.font = "18px Arial";
    ctx.fillText(pct + "%", x + 5, y - 10);

    // Label type
    ctx.save();
    ctx.translate(x + 20, baseY + 20);
    ctx.rotate(-Math.PI / 3);
    ctx.fillText(type, 0, 0);
    ctx.restore();
  });

  fs.writeFileSync(filePath, canvas.toBuffer("image/png"));
  console.log(`PNG exporté → ${filePath}`);
}

// -------------------------------------------------------
// CLI
// -------------------------------------------------------
const [, , command, ...args] = process.argv;

if (command === "profile") {

  const paths = args.filter(a => !a.startsWith("--"));
  const flags = args.filter(a => a.startsWith("--"));

  if (paths.length === 0) {
    console.error("Usage: node cli.js profile <file|dir> [--ansi] [--csv file.csv] [--png file.png]");
    process.exit(1);
  }

  const profile = profileFromFiles(paths);

  const useAnsi = flags.includes("--ansi");

  printAsciiHistogram(profile.percentages, useAnsi);

  fs.writeFileSync("profil.json", JSON.stringify(profile, null, 2));
  console.log("Profil généré : profil.json");

  // FLAGS
  const csvFlag = flags.find(f => f.startsWith("--csv"));
  const pngFlag = flags.find(f => f.startsWith("--png"));

  if (csvFlag) {
    const file = csvFlag.split("=")[1] || "profil.csv";
    exportCsv(profile, file);
  }

  if (pngFlag) {
    const file = pngFlag.split("=")[1] || "profil.png";
    exportPng(profile, file);
  }

}
else if (command === "compare") {

  if (args.length < 2) {
    console.error("Usage: node cli.js compare <target.json> <baseline.json>");
    process.exit(1);
  }

  const [target, baseline] = args;
  const comparison = compareProfiles(target, baseline);

  fs.writeFileSync("comparison.json", JSON.stringify(comparison, null, 2));
  console.log("Comparaison générée : comparison.json");

}
else {
  console.log("Commandes disponibles :");
  console.log("  node cli.js profile <paths> [--ansi] [--csv file] [--png file]");
  console.log("  node cli.js compare <target.json> <baseline.json>");
}