import fs from "fs";
import { createCanvas } from "canvas";
import { profileFromFiles } from "./profiler.js";
import { compareProfiles } from "./comparator.js";
import path from "path";
import { parseGiftFile } from "./giftParser.js";
import {searchQuestion} from "./addQuestion.js"
import {displayQuestion} from "./displayQuestion.js"
import {AfficherQuestions} from "./conceptionTest.js"
import {addQuestion} from "./conceptionTest.js"
import {chooseQuestion} from "./conceptionTest.js"
import {valider} from "./conceptionTest.js"
import {ask} from "./conceptionTest.js"
import {Test} from "./Test.js";
import {ecrireTestFichier} from "./conceptionTest.js"




//Initialisation
    let idUser=1;
    let nameTest=await ask('Saisissez le nom du nouveau test :');
    let testCreated= new Test([],idUser,nameTest);
    //Ajouter des questions
    let continuate=true;
    while(continuate){
        
        let beginning="";//a determiner par l'utilisateur
        let content="";//a determiner par l'utilisateur
        
        let result =Number(await ask('Rechercher une question en saisissant le titre ?  :\n oui (1) \n non (2)\n'));
        if(result===1){
            

            beginning =await ask('Saisissez le titre : ');
        }
        
        result =Number( await ask('Rechercher une question en saisissant une partie du contenu ?  :\n oui (1) \n non (2)\n'));
        if(result===1){
            

            content =await ask('Saisissez le contenu : ');
        }
        
        let questions=AfficherQuestions(content,beginning);

        let index= Number(await ask("Saisissez l'indice de la question :"));// a determiner avec une interface lors d'une saisie, indice permettant d'identifier la question
        let question=chooseQuestion(questions,index);
        displayQuestion(question);


        result =Number(await ask('Ajouter cette question ? : \n oui (1) \n non (2)\n'));
        let accepter;
            if(result===1){
                accepter=true;
            }else{
                accepter=false;
            }

        if(accepter){
            addQuestion(testCreated,index,questions);
        }
        result =Number(await ask('Terminer la creation du test ? : \n oui (1) \n non (2)\n'));
        
        if(result===1){
            continuate= false;
        }else{
            continuate= true;
        }
        
            
    }
    if(valider(testCreated)===true){
        console.log("Test ajoute avec succes !");
        
         
    }

    