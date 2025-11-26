// giftParser.js
/*
1. Lis un fichier Gift 
2. Découpe les questions en les séparant par des doubles sauts de ligne
3. Sépare le texte de l'énoncé et le bloc de réponses
4. Retourne une liste d'objets question du style :

{ 
   raw: "... question complète...",
   text: "texte énoncé",
   answers: "contenu entre accolades"
}

*/

import fs from "fs";

export function parseGiftFile(path) {
  const content = fs.readFileSync(path, "utf8");

  // Regexp qui capture TOUTES les occurrences {...}
  const gapRegex = /\{([^}]+)\}/g;

  const questions = [];
  let match;

  while ((match = gapRegex.exec(content)) !== null) {
    const rawInside = match[1].trim(); // ex: "1:MC:~=similar to~close to"
    const parsed = parseGap(rawInside);

    questions.push({
      raw: match[0],           // "{1:MC:~=similar to~...}"
      inner: rawInside,        // "1:MC:~=similar to~close to"
      index: parsed.index,     // ex: 1
      qtype: parsed.qtype,     // ex: "MC" ou "SA"
      data: parsed.data        // tableau des réponses normalisées
    });
  }

  return questions;
}


// Parse un gap du type "1:MC:~=xxx~yyy"
function parseGap(inner) {
  const parts = inner.split(":");

  // Format attendu :
  // index:type:contenu GIFT
  const index = parts.length >= 1 ? parts[0] : null;
  const qtype = parts.length >= 2 ? parts[1].toUpperCase() : null;

  // Le reste après le 2e ":" = le contenu GIFT
  const content = parts.slice(2).join(":");

  return {
    index,
    qtype,
    data: content
  };
}
