import { prompt } from "./prompt.js";

chrome.runtime.onMessage.addListener((message, _, sendResponse) => {
  if (message.type === "ask-llama3.2") {
    genereEtEnvoiRequet(message.prompt, sendResponse);
    return true;
  }
});

async function genereEtEnvoiRequet(liens, sendResponse) {
  try {
    const liensJson = JSON.stringify(liens);

    const prompt = generePromptPourRecuperationCateogies(liensJson);

    const responsLlm = await envoiRequete(prompt);

    if (responsLlm.response) {
      const categories = extraitCategoriesParentes(responsLlm.response);

      sendResponse({ success: true, categories });
    } else {
      sendResponse({ success: false, error: "Pas de réponse valide du LLM." });
    }
  } catch (error) {
    sendResponse({
      success: false,
      error: "Erreur de communication avec le serveur : " + error.message,
    });
  }
}

function generePromptPourRecuperationCateogies(jsonString) {
  return `${prompt} ${jsonString}`;
}

async function envoiRequete(requete) {
  const API_URL = "http://localhost:11434/api/generate";
  const MODEL_NAME = "llama3.2";

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: MODEL_NAME,
        prompt: requete,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`Erreur réseau : ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Erreur lors de la requête POST :", error);
    return { error: error.message };
  }
}

function extraitCategoriesParentes(text) {
  // Utilise une expression régulière pour trouver les mots entre deux **
  const regex = /\*\*(.*?)\*\*/g;
  // Supprime toutes les occurrences de "Catégorie x :" où x est un nombre
  const regexCategorie = text.replace(/Catégorie \d+:/g, "");
  const titles = [];
  let match;

  // // Tant qu'il trouve des correspondances, il les ajoute au tableau titles
  // while ((match = regex.exec(text)) !== null) {
  //   titles.push(match[1]); // Capture uniquement le contenu entre **
  // }

  // Tant qu'il trouve des correspondances, il les ajoute au tableau titles
  while ((match = regex.exec(text)) && regex.exec(regexCategorie) !== null) {
    titles.push(match[1]); // Capture uniquement le contenu entre **
  }

  return titles;
}
