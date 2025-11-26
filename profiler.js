// profiler.js
// Génère le profil statistique d'une banque GIFT
// Compatibilité multi-gap : chaque { ... } = une question
// Ignore les blocs sans réponse (instructions, énoncés globaux)

import fs from "fs";
import path from "path";
import { parseGiftFile } from "./giftParser.js";
import { classifyQuestion } from "./questionClassifier.js";

export function profileFromFiles(inputs) {

  // Compteurs par type
  const counts = {
    multiple: 0,
    vrai_faux: 0,
    appariement: 0,
    mot_manquant: 0,
    numerique: 0,
    courte: 0,
    ouverte: 0,
    inconnu: 0
  };

  let total = 0;
  const giftFiles = [];

  // Collecte des fichiers .gift
  for (const input of inputs) {
    const stat = fs.statSync(input);

    if (stat.isDirectory()) {
      const files = fs.readdirSync(input)
        .filter(f => f.endsWith(".gift"))
        .map(f => path.join(input, f));
      giftFiles.push(...files);
    } else {
      giftFiles.push(input);
    }
  }

  // Lecture + classification
  for (const file of giftFiles) {
    const questions = parseGiftFile(file);

    for (const q of questions) {

      // Ignore les “fausses questions” (pas de bloc {…})
      if (!q.data || q.data.trim() === "") continue;

      const type = classifyQuestion(q);
      counts[type] = (counts[type] || 0) + 1;
      total++;
    }
  }

  // Calcul des pourcentages
  const percentages = {};
  for (const t in counts) {
    percentages[t] = total > 0 ? +(counts[t] / total * 100).toFixed(1) : 0;
  }

  return {
    total_questions: total,
    counts,
    percentages,
    generated_at: new Date().toISOString()
  };
}