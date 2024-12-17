import { prompt } from "./prompt.js";

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "ask-llama") {
    if (message.model === "llama3.2") {
      const liens = message.prompt;

      // Transforme l'objet en une chaîne JSON
      const liensJson = JSON.stringify(liens);

      // Envoi de la requête POST
      envoiRequete(generePrompt(liensJson), sendResponse);

      return true;
    }
  }
});

function generePrompt(jsonString) {
  let liens = jsonString;
  // récupération du prompt et ajout les liens pour remonter les catégories parentes
  return prompt + liens;
}

function envoiRequete(requete, sendResponse) {
  // connexion à l'API
  fetch("http://localhost:11434/api/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    // Le contenu du body de la requête HTTP
    body: JSON.stringify({
      model: "llama3.2",
      prompt: requete,
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
          console.log(extractCategorie(reponseLlm.response));

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

function extractCategorie(text) {
  const categories = {};

  // Diviser le texte en lignes pour un traitement ligne par ligne
  const lines = text.split("\n");
  let currentCategory = null;

  lines.forEach((line) => {
    line = line.trim();
    // Détecter une nouvelle catégorie (ex: "1. **Nom de la catégorie** :")
    const categoryMatch = line.match(/^\d+\.\s\*\*(.*?)\*\*\s*:/);

    if (categoryMatch) {
      // Extraction du nom de la catégorie
      currentCategory = categoryMatch[1];
      // Extraire le nom de la catégorie
      categories[currentCategory] = [];
    } else if (currentCategory && line.startsWith("*")) {
      // Si on est dans une catégorie et que la ligne commence par "*", c'est un lien
      const link = line.replace(/^\*\s*/, ""); // Enlever la puce "* "
      // Ajouter le lien dans la catégorie
      categories[currentCategory].push(link);
    }
  });
  return categories;
}
