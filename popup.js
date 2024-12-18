document.getElementById("reorganise").addEventListener("click", async () => {
  const statutCategorieParente = document.getElementById("statut-categorie");
  const statutValide = document.getElementById("statut-valide");
  const btnValide = document.getElementById("valide");
  const styleClassBtnValide = `valide {display: #block;}`;
  statutCategorieParente.textContent = "Récupération des favoris...";

  try {
    chrome.bookmarks.getTree((bookmarks) => {
      const liens = recupFavoris(bookmarks);
      statutCategorieParente.textContent = "Transmission des favoris...";

      chrome.runtime.sendMessage(
        { type: "ask-llama3.2", prompt: liens },
        (response) => {
          if (response && response.success) {
            // Vérifie si categories est bien défini dans la réponse
            if (response.categories) {
              statutCategorieParente.textContent = `Suggestion du LLM : ${response.categories.join(
                ", "
              )}`;

              // Ajouter une classe qui rend le bouton visible
              btnValide.classList.add("valide");
            } else {
              statutCategorieParente.textContent = "Aucune catégorie reçue.";
            }
          } else {
            statutCategorieParente.textContent = `Erreur : ${
              response ? response.error : "Réponse non valide"
            }`;
          }
        }
      );
    });
  } catch (error) {
    console.error("Erreur:", error);
    statutCategorieParente.textContent = "Une erreur est survenue.";
  }
});

function recupFavoris(bookmarkTree) {
  const links = [];
  function traverseTree(node) {
    if (node.url) {
      links.push({ title: node.title, url: node.url });
    }
    if (node.children) {
      node.children.forEach(traverseTree);
    }
  }
  traverseTree(bookmarkTree[0]);
  return links;
}
