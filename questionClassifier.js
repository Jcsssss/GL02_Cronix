// questionClassifier.js
// Classification basée sur les blocs réponses

export function classifyQuestion(q) {
  if (!q.answers || q.answers.length === 0) {
    return "inconnu";
  }

  const a = q.answers.join("\n");

  // Matching { =A -> B ... }
  if (/->/.test(a)) {
    return "appariement";
  }

  // Vrai/Faux
  if (/\b(true|false)\b/i.test(a) || /(T|F)\b/.test(a)) {
    return "vrai_faux";
  }

  // Multiple choice (GIFT standard : ~ mauvais, = bon)
  if (/[\n\s]*[~|=]/.test(a)) {
    // s'il y a au moins une mauvaise "~"
    if (a.includes("~")) return "multiple";
    // Un seul "=" sans "~" = short answer déguisée
  }

  // Short Answer : {=mot}, {=mot1|mot2}
  if (/^=/.test(a) || a.includes("|")) {
    // Certaines short answers sont longues -> classer SA = "courte"
    return "courte";
  }

  // Mot manquant (cloze), souvent HTML
  if (q.text.includes("_____") || q.text.includes("gap") || /<i>/.test(q.text)) {
    return "mot_manquant";
  }

  // Numérique : {#10} ou {=10:5}
  if (/#[0-9]/.test(a) || /=\d+:\d+/.test(a)) {
    return "numerique";
  }

  // Longue réponse ou transformation
  if (a.length > 60) {
    return "ouverte";
  }

  // Dernier recours
  return "inconnu";
}
