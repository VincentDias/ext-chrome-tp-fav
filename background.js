// Fonction pour trier les favoris
async function trierFavoris() {
  console.log("Début du tri des favoris");

  // Récupérer tous les favoris
  chrome.bookmarks.getTree((bookmarkTreeNodes) => {
    const allBookmarks = flattenBookmarks(bookmarkTreeNodes); // Aplatir la structure des favoris
    console.log("Favoris récupérés : ", allBookmarks);

    // Envoi des favoris avant réorganisation
    chrome.runtime.sendMessage({ type: "before", data: allBookmarks });

    // Simulons un tri aléatoire ici, pour l'exemple.
    const favorisTries = allBookmarks.sort(() => Math.random() - 0.5);
    console.log("Favoris triés : ", favorisTries);

    // Envoi des favoris après réorganisation
    chrome.runtime.sendMessage({
      type: "after",
      data: favorisTries,
      reorganisationType: "Aléatoire", // Type de réorganisation
    });

    // Afficher ou mettre à jour les favoris après tri
    favorisTries.forEach((bookmark, index) => {
      chrome.bookmarks.move(bookmark.id, {
        parentId: bookmark.parentId,
        index: index,
      });
    });

    console.log("Tri terminé !");
  });
}

// Fonction pour aplatir la structure des favoris
function flattenBookmarks(bookmarkNodes) {
  let bookmarks = [];
  for (const node of bookmarkNodes) {
    if (node.children) {
      bookmarks = bookmarks.concat(flattenBookmarks(node.children)); // Appel récursif pour les enfants
    } else {
      bookmarks.push(node); // Ajouter le favori à la liste
    }
  }
  return bookmarks;
}

// Écouter le clic sur l'icône de l'extension
chrome.action.onClicked.addListener((tab) => {
  console.log("Icône de l'extension cliquée");
  trierFavoris(); // Appeler la fonction de tri des favoris
});
