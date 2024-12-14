document.getElementById("reorganise").addEventListener("click", async () => {
  const status = document.getElementById("status");
  status.textContent = "Récupération des favoris...";

  try {
    // Récupérer les favoris du navigateur
    chrome.bookmarks.getTree(async (bookmarks) => {
      status.textContent = "Analyse des favoris...";

      const links = recupFavoris(bookmarks);

      console.info("Passage du body de la requête au background.js");
      chrome.runtime.sendMessage(
        { type: "ask-llama", model: "llama3.2" },
        (response) => {
          if (response.error) {
            status.textContent = `Erreur : ${response.error}`;
          } else {
            status.textContent = `Réponse du LLM : ${response.reply}`;
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
  console.log("Favoris extraits:", links);
  return links;
}
