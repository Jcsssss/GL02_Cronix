// conceptionTest.js
import { Test } from "./Test.js";
import { searchQuestion } from "./searchQuestion.js";
import { displayQuestion } from "./displayQuestion.js";
import readline from "readline";
import fs from "fs";
import path from "path";

// Import de la configuration centralisée
import { DATA_DIR, REVIEW_DIR } from "../config/config.js";

export function AfficherQuestions(content, beginning) {
  // Utiliser DATA_DIR au lieu d'un chemin relatif codé "en dur"
  let input = DATA_DIR;
  let questions = searchQuestion(content, beginning, input);
  
  // Affichage des titres et des indices des questions
  let indexForquestions = 0;
  
  if (questions.length === 0) {
    console.log("Aucune question trouvée.");
    return questions;
  }
  
  console.log("\n📋 Questions trouvées :\n");
  
  for (let i = 0; i < questions.length; i++) {
    for (let j = 0; j < questions[i].length; j++) {
      console.log(`  (${indexForquestions}) : ${questions[i][j].title}`);
      indexForquestions++;
    }
  }
  
  console.log("");
  return questions;
}

export function addQuestion(testCreated, index, questions) {
  let question = chooseQuestion(questions, index);
  
  if (question === false) {
    console.log("❌ Question non trouvée à cet index.");
    return false;
  }
  
  // On ajoute la question au test    
  testCreated.addQuestion(question);
  return true;
}

export function chooseQuestion(questions, index) {
  let q = [];
  
  for (let i = 0; i < questions.length; i++) {
    for (let j = 0; j < questions[i].length; j++) {
      q.push(questions[i][j]);
    }
  }
  
  if (index < q.length && index >= 0) {
    return q[index];
  } else {
    return false;
  }
}

export function valider(testCreated, numberMaxQuestions = 20) {
  // On vérifie que le nombre de questions ne dépasse pas le maximum autorisé
  if (verifierNombreQuestions(testCreated, numberMaxQuestions) === false) {
    console.log("❌ Le nombre de questions doit être inférieur ou égal à 20");
    return false;
  }
  
  // On vérifie qu'il n'y a pas 2 fois la même question
  if (verifierDifferenceQuestions(testCreated) === false) {
    console.log("❌ Les questions doivent être toutes différentes");
    return false;
  }
  
  // On vérifie qu'il y a au moins une question
  if (testCreated.questions.length === 0) {
    console.log("❌ Le test doit contenir au moins une question");
    return false;
  }
  
  // Écrire le test dans un fichier et renvoyer true
  ecrireTestFichier(testCreated);
  return true;
}

export function verifierNombreQuestions(testCreated, numberMaxQuestions) {
  if (testCreated.questions.length > numberMaxQuestions) {
    return false;
  }
  return true;
}

export function verifierDifferenceQuestions(testCreated) {
  for (let i = 0; i < testCreated.questions.length; i++) {
    let questionATester = testCreated.questions[i];
    for (let indexQuestions = 0; indexQuestions < testCreated.questions.length; indexQuestions++) {
      if (i !== indexQuestions) {
        if (questionATester.title === testCreated.questions[indexQuestions].title) {
          return false;
        }
      }
    }
  }
  return true;
}

export function ecrireTestFichier(testCreated) {
  let fileContent = '\n';
  
  // Pour chaque question, écrire ce qu'il y a dans question.raw
  for (let i = 0; i < testCreated.questions.length; i++) {
    fileContent += testCreated.questions[i].raw;
    fileContent += '\n';
  }
  
  // Utiliser REVIEW_DIR au lieu d'un chemin relatif
  const fileName = path.join(REVIEW_DIR, `${testCreated.name}.gift`);
  
  if (fileContent.length > 1) {
    fs.writeFileSync(fileName, fileContent, "utf-8");
    console.log(`✅ Test enregistré dans ${fileName}`);
  }
}

export function ask(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
  });
  return new Promise(resolve => rl.question(question, answer => {
    rl.close();
    resolve(answer.trim());
  }));
}
