document.getElementById("reorganize").addEventListener("click", async () => {
  const status = document.getElementById("status");
  status.textContent = "Récupération des favoris...";

  try {
    console.log("Étape 1: Récupération des favoris.");

    // Récupérer les favoris du navigateur
    chrome.bookmarks.getTree(async (bookmarks) => {
      console.log("Étape 2: Analyse des favoris.");
      status.textContent = "Analyse des favoris...";

      const links = extractLinks(bookmarks);

      console.log("Étape 3: Appel à l'API Ollama.");

      // Appel à l'API Ollama pour regrouper par thématique
      const grouped = await fetch("https://api.ollama.ai/organize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ links }),
      }).then((res) => res.json());

      console.log("Étape 4: Réorganisation des favoris.");

      // Réorganisation dans Chrome
      organizeBookmarks(grouped);
      status.textContent = "Favoris réorganisés !";
    });
  } catch (error) {
    console.error("Erreur:", error);
    status.textContent = "Une erreur est survenue.";
  }
});

function extractLinks(bookmarkTree) {
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

function organizeBookmarks(grouped) {
  grouped.forEach(async (group) => {
    console.log(`Création du dossier: ${group.topic}`);

    const folder = await chrome.bookmarks.create({ title: group.topic });
    group.links.forEach((link) => {
      console.log(`Ajout du lien: ${link.title} (${link.url})`);
      chrome.bookmarks.create({
        parentId: folder.id,
        title: link.title,
        url: link.url,
      });
    });
  });
}
