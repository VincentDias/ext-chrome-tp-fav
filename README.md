# ext-chrome-tp-fav

Télécharger Ollama

Lancer Llama3.2

```bash
ollama run llama3.2
```

Autoriser le CORS du front à l'API

```bash
launchctl setenv OLLAMA_ORIGINS "*"
```

Quitter Ollama puis le relancer pour la prise en compte des modifs.

Aller dans les Settings de Chrome, passer en mode développeur puis cliquer sur "Charger l'extension non empactée".

Sélectionner le projet.

Ajout un ping sur l'extension afin de pouvoir la déclencher.
