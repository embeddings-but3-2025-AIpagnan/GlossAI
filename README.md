# GlossAI

[![CI](https://img.shields.io/github/actions/workflow/status/embeddings-but3-2025-AIpagnan/GlossAI/publish.yml?branch=main&label=CI&logo=github&style=for-the-badge)](https://github.com/embeddings-but3-2025-AIpagnan/GlossAI/actions)
[![Release](https://img.shields.io/github/v/release/embeddings-but3-2025-AIpagnan/GlossAI?label=version&style=for-the-badge)](https://github.com/embeddings-but3-2025-AIpagnan/GlossAI/releases)
[![Stars](https://img.shields.io/github/stars/embeddings-but3-2025-AIpagnan/GlossAI?style=for-the-badge)](https://github.com/embeddings-but3-2025-AIpagnan/GlossAI/stargazers)
[![Doc](https://img.shields.io/badge/DOC-mkdocs-blue?style=for-the-badge)](https://embeddings-but3-2025-aipagnan.github.io/Mkdocs/)

Une solution simple et élégante pour explorer et enrichir des glossaires avec des embeddings et des outils d'IA modernes. GlossAI accélère la création, la recherche et la visualisation de termes spécialisés pour les équipes produit, documentation et recherche.

---

## Aperçu



## Installation

Trouvez la dernière version ainsi que les instructions d'utilisation [ici](https://github.com/embeddings-but3-2025-AIpagnan/GlossAI/releases/latest).

## Développement

### Prérequis
- [Python 3.9+](https://www.python.org/downloads/), ainsi que pip et venv
- [Node.js 18.17.1+](https://nodejs.org/en/download)
- [Rust](https://rust-lang.org/tools/install/)
- Tauri-cli:
  - [Prérequis](https://v2.tauri.app/start/prerequisites/)
  - Puis lancer `cargo install tauri-cli --version "^2.0.0" --locked`
- [Ollama](https://ollama.com/download)

Sur Windows (il faut nécéssairement utiliser Powershell):
- Autoriser l'exécution des scripts avec la commande `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned`

### Linux
```bash
git clone https://github.com/embeddings-but3-2025-AIpagnan/GlossAI.git
cd GlossAI
python3 -m venv .venv
source .venv/bin/activate
npm install
pip install -r backend/requirements.txt
npm run dev
```

### Windows
```bash
git clone https://github.com/embeddings-but3-2025-AIpagnan/GlossAI.git
cd GlossAI
python3 -m venv .venv
.venv/Scripts/Activate.ps1
npm install
pip install -r backend/requirements.txt
npm run dev
```
