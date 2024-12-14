chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "ask-llama") {
    if (message.model === "llama3.2") {
      console.log("Envoi du prompt au modèle llama3.2");

      // Envoi de la requête POST
      envoiRequetePost(sendResponse);
      // Indiquer que la réponse sera envoyée de manière asynchrone
      return true; // Cela permet à `sendResponse` d'être appelé après l'appel asynchrone
    }
  }
});

function envoiRequetePost(sendResponse) {
  // URL de l'API
  const url = "http://localhost:11434/api/generate";
  // Le contenu du body de la requête HTTP
  fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    // Le contenu du body de la requête HTTP
    body: JSON.stringify({
      model: "llama3.2",
      prompt: "bonjour",
      stream: false,
    }),
  })
    .then((response) => {
      // Vérifiez si la réponse est valide
      if (!response.ok) {
        throw new Error(`Erreur HTTP : ${response.status}`);
      }

      return response.text(); // Traitez la réponse d'abord comme texte
    })
    .then((text) => {
      // Essayez de convertir la réponse en JSON après l'avoir obtenue sous forme de texte
      try {
        const data = JSON.parse(text);
        console.log("Réponse de l'API:", data);
        if (data.completion) {
          sendResponse({ reply: data.completion });
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
