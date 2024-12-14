document.getElementById("reorganise").addEventListener("click", async () => {
  const status = document.getElementById("status");
  status.textContent = "Récupération des favoris...";

  try {
    console.log("Étape 1: Récupération des favoris.");

    // Récupérer les favoris du navigateur
    chrome.bookmarks.getTree(async (bookmarks) => {
      console.log("Étape 2: Analyse des favoris.");
      status.textContent = "Analyse des favoris...";

      const links = recupFavoris(bookmarks);

      const requestBody = {
        model: "llama3.2",
        prompt: "test", // Le prompt de l'utilisateur
        stream: false,
      };

      console.info("Passage du body de la requête au background.js");
      chrome.runtime.sendMessage(requestBody);

      // console.log("Étape 4: Réorganisation des favoris.");
      // Réorganisation dans Chrome
      // organizeBookmarks(grouped);
      // status.textContent = "Favoris réorganisés !";
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
