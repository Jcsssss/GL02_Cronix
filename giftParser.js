// giftParser.js
// ============================================================
//  Version : MCQ / OPEN-CLOZE / KWT / SIMPLE FILL-IN
// ============================================================

import fs from "fs";

// -------------------------------------------------------------------
// Helpers
// -------------------------------------------------------------------
function cleanHtmlTag(s) {
  return s.replace(/^\[html\]/i, "").trim();
}

// Détecte si le bloc de réponses est du MCQ de type {1:MC:...}
function isMCQBlock(blockContent) {
  return /^\d+\s*:MC\s*:/i.test(blockContent);
}

// Détecte si c’est un Open Cloze {1:SA:=word}
function isOpenClozeBlock(blockContent) {
  return /^\d+\s*:SA\s*:/i.test(blockContent);
}

// Pour Key Word Transformation / Fill-in : {=good}, {=good#info}, {~bad}
function isKWTBlock(blockContent) {
  // Si commence par "=" ou "~" mais pas par X:MC: ou X:SA:
  return /^[=~]/.test(blockContent);
}

// -------------------------------------------------------------------
// Parse MCQ block
// {1:MC:~=similar to~close to ~Typical of~consist of}
// -------------------------------------------------------------------
function parseMCQ(blockContent) {
  // Supprime le "1:MC:" → ne garder que "=similar to~close to ..."
  const cleaned = blockContent.replace(/^\d+\s*:MC\s*:/i, "").trim();

  const rawItems = cleaned.split(/~/g).map(s => s.trim()).filter(Boolean);

  const choices = rawItems.map(item => {
    let correct = false;

    if (item.startsWith("=")) {
      correct = true;
      item = item.slice(1);
    }

    // enlever #info éventuel
    const main = item.split("#")[0].trim();

    return { text: main, correct };
  });

  return {
    type: "MCQ",
    choices
  };
}

// -------------------------------------------------------------------
// Parse Open Cloze type {1:SA:=word}
// -------------------------------------------------------------------
function parseOpenCloze(blockContent) {
  const cleaned = blockContent.replace(/^\d+\s*:SA\s*:/i, "").trim();

  let answers = cleaned.split(/~/g).map(a => a.trim());
  answers = answers.map(a => a.replace(/^=/, "").split("#")[0].trim());

  return {
    type: "OPEN",
    answers
  };
}

// -------------------------------------------------------------------
// Parse Key Word Transformation / Fill-in
// {=good#comment} {~bad} …
function parseKWT(blockContent) {
  const items = blockContent.split(/~/g).map(i => i.trim());

  const correct = [];
  const incorrect = [];

  for (let item of items) {
    let txt = item.replace(/^=/, "").replace(/^~/, "");
    txt = txt.split("#")[0].trim();

    if (item.startsWith("=")) correct.push(txt);
    else incorrect.push(txt);
  }

  return {
    type: "KWT",
    correct,
    incorrect
  };
}

// -------------------------------------------------------------------
// Parse une question GIFT complète
// -------------------------------------------------------------------
export function parseGiftFile(path) {
  const raw = fs.readFileSync(path, "utf8");

  const cleaned = raw
    .replace(/\r/g, "")
    .replace(/\/\/.*$/gm, "")  // supprime commentaires
    .trim();

  // Découpe par “::Titre::”
  const blocks = cleaned.split(/\n\s*::/g);

  const questions = [];

  for (let block of blocks) {
    block = block.trim();
    if (!block) continue;

    if (!block.startsWith("::")) block = "::" + block;

    const titleMatch = block.match(/^::([^:]+)::/);
    if (!titleMatch) continue;

    const title = titleMatch[1].trim();

    // Tout le contenu après le titre
    let body = block.slice(titleMatch[0].length).trim();
    body = cleanHtmlTag(body);

    // Extraire les blocs de réponses {...}
    const answerBlocks = [...body.matchAll(/\{([\s\S]*?)\}/g)].map(m => m[1].trim());
    const bodyWithoutAnswers = body.replace(/\{[\s\S]*?\}/g, "ANSWER").trim();

    // Détection consigne
    const isInstruction = answerBlocks.length === 0 && body.length > 0 && !body.includes("ANSWER");
    if (isInstruction) {
      questions.push({
        file: path,
        title,
        type: "INSTRUCTION",
        text: bodyWithoutAnswers
      });
      continue;
    }

    // ANALYSE DES BLOC RÉPONSES POUR IDENTIFIER LE TYPE DE QUESTION
    let detectedType = null;

    if (answerBlocks.every(b => isMCQBlock(b))) detectedType = "MCQ";
    else if (answerBlocks.every(b => isOpenClozeBlock(b))) detectedType = "OPEN";
    else if (answerBlocks.every(b => isKWTBlock(b))) detectedType = "KWT";
    else detectedType = "MIXED"; // rare mais possible dans certains fichiers

    // PARSING DES BLOCS SELON LE TYPE
    let parsedBlocks = [];

    for (const b of answerBlocks) {
      if (isMCQBlock(b)) parsedBlocks.push(parseMCQ(b));
      else if (isOpenClozeBlock(b)) parsedBlocks.push(parseOpenCloze(b));
      else if (isKWTBlock(b)) parsedBlocks.push(parseKWT(b));
      else {
        parsedBlocks.push({
          type: "UNKNOWN",
          raw: b
        });
      }
    }

    questions.push({
      file: path,
      title,
      type: detectedType,
      text: bodyWithoutAnswers,
      blocks: parsedBlocks,
      raw: block
    });
  }

  return questions;
}
