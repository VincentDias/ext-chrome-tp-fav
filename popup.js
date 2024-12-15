document.getElementById("reorganise").addEventListener("click", async () => {
  const status = document.getElementById("status");
  status.textContent = "Récupération des favoris...";

  try {
    // Récupérer les favoris du navigateur
    chrome.bookmarks.getTree(async (bookmarks) => {
      status.textContent = "Analyse des favoris...";

      const liens = recupFavoris(bookmarks);

      // Transmission des liens à l'API de Llama
      chrome.runtime.sendMessage(
        { type: "ask-llama", model: "llama3.2", prompt: liens },
        (response) => {
          if (response.error) {
            status.textContent = `Erreur : ${response.error}`;
          } else {
            status.textContent = `Réponse du LLM : ${response.reply}`;

            status.textContent = traiteRetour(status.textContent);
            // Réorganisation dans Chrome
            // organizeBookmarks(grouped);
          }
        }
      );
    });
  } catch (error) {
    console.error("Erreur:", error);
    status.textContent = "Une erreur est survenue.";
  }
});

// Méthode de récupération de l'ensemble des favoris
function recupFavoris(bookmarkTree) {
  const links = [];
  function traverseTree(node) {
    if (node.url) {
      links.push({ title: node.title, url: node.url });
    } else if (node.children) {
      node.children.forEach(traverseTree);
    }
  }
  traverseTree(bookmarkTree[0]);
  return links;
}

function traiteRetour(reponseLlm) {
  try {
    // Extraire la partie JSON
    const jsonMatch = reponseLlm.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const jsonString = jsonMatch[0];
      const jsonObject = JSON.parse(jsonString);
      console.log(jsonObject);
    } else {
      console.error("Aucun JSON trouvé dans la réponse.");
    }
  } catch (error) {
    console.error("Erreur lors de l'extraction ou du parsing JSON :", error);
  }
}
