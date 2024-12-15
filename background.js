import { prompt } from "./prompt.js";

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "ask-llama") {
    if (message.model === "llama3.2") {
      const liens = message.prompt;

      // Transforme l'objet en une chaîne JSON
      const liensJson = JSON.stringify(liens);

      // Envoi de la requête POST
      envoiRequetePost(generePrompt(liensJson), sendResponse);

      return true;
    }
  }
});

function generePrompt(jsonString) {
  let liens = jsonString;
  // récupération du prompt de prompt.js et ajoute les liens
  return prompt + liens;
}

function envoiRequetePost(jsonString, sendResponse) {
  // connexion à l'API
  const url = "http://localhost:11434/api/generate";
  fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    // Le contenu du body de la requête HTTP
    body: JSON.stringify({
      model: "llama3.2",
      prompt: jsonString,
      stream: false,
    }),
  })
    .then((response) => {
      // Vérifie si la réponse est valide
      if (!response.ok) {
        throw new Error(`Erreur HTTP : ${response.status}`);
      }
      // Traitez la réponse d'abord comme texte
      return response.text();
    })
    .then((text) => {
      // Essaie de convertir la réponse en JSON après l'avoir obtenue sous forme de texte
      try {
        const reponseLlm = JSON.parse(text);
        if (reponseLlm.response) {
          sendResponse({ reply: reponseLlm.response });
        } else {
          sendResponse({ error: "Aucune réponse valide reçue du modèle." });
        }
      } catch (e) {
        console.error("Erreur lors de l'analyse JSON :", e);
        sendResponse({ error: "Réponse invalide du modèle." });
      }
    })
    .catch((error) => {
      console.error("Erreur API :", error);
      sendResponse({
        error: "Erreur de communication avec le serveur : " + error.message,
      });
    });
}

function recupereJson(retourLlm) {
  try {
    // Extraire la partie JSON avec une regex
    const jsonMatch = retourLlm.match(/```json([\s\S]*?)```/);
    if (jsonMatch) {
      const jsonString = jsonMatch[1].trim(); // La chaîne JSON brute
      const jsonObject = JSON.parse(jsonString); // Conversion en objet JS
      console.log("jsonObject " + jsonObject);
    } else {
      console.error("Aucun JSON détecté.");
    }
  } catch (error) {
    console.error("Erreur lors du traitement :", error);
  }
}
