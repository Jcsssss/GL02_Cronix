// questionClassifier.js

/*
Ce programme analyse le bloc answers pour identifier le type parmi :
- Vrai/faux
- Matching (= et ->)
- Numérique (#12, #10)
- Multiple (Réponses par = pour bonnes et ~ pour mauvaises)
- Mot manquant (texte hors accolades + réponse courte)
- Courte (une ou plusieurs réponses avec = mais sans MCQ complet)
- Ouverte (aucune accolade)
- Inconnu (rien ne matche) 
*/


export function classifyQuestion(q) {
  // 1) Si le type est explicitement donné (MC, SA, etc.)
  if (q.qtype === "MC") return "multiple";
  if (q.qtype === "SA") return "courte";
  if (q.qtype === "NUM" || q.qtype === "NR") return "numerique";

  const a = q.data;

  if (!a) return "ouverte";

  // 2) Numérique GIFT
  if (/#-?\d+/.test(a)) return "numerique";

  // 3) Matching
  if (/=.+->.+/s.test(a)) return "appariement";

  // 4) Multiple-choice GIFT
  if (/=/.test(a) && /~/.test(a)) return "multiple";

  // 5) Courte answer simple (=xxx)
  if (/=/.test(a)) return "courte";

  return "inconnu";
}