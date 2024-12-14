chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log(message);
  if (message.type === "reorganise") {
    const prompt = message.input;
    console.log("test");

    // Envoi d'une requête à l'API locale du LLM
    envoiRequetePost();
  }
});

function envoiRequetePost() {
  fetch("http://localhost:11434/api/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama3.2",
      prompt: "coucou",
      stream: false,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Réponse de l'API :", data); // Déboguer la réponse
      if (data.completion) {
        sendResponse({ reply: data.completion });
      } else {
        sendResponse({ error: "Aucune réponse valide reçue du modèle." });
      }
    })
    .catch((error) => {
      console.error("Erreur API :", error); // Déboguer les erreurs
      sendResponse({
        error: "Erreur de communication avec le serveur : " + error.message,
      });
    });
}
