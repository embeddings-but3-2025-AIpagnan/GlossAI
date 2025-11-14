# GlossAI
Une application en Python **FastAPI** permettant d'implémenter les fonctionnalités intelligentes du LLM.

---

##  Pour lancer l'application

###  Prérequis
- Python 3.9+ installé  
- pip installé
- venv installé
- Node.js 18.17.1+ installé
- Avoir ses polices d'execution qui autorisent l'execution des scripts
---

### Installation

#### Linux
```bash
git clone https://github.com/embeddings-but3-2025-AIpagnan/GlossAI.git
cd GlossAI
python3 -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt
npm install
```
#### Windows
```bash
git clone https://github.com/embeddings-but3-2025-AIpagnan/GlossAI.git
cd GlossAI
python3 -m venv .venv
.venv/Scripts/Activate.ps1
pip install -r backend/requirements.txt
npm install
```
---

### Lancement 

#### Développement
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```
#### Production
```bash
uvicorn main:app --host 0.0.0.0 --port 8000
```
---

L'application sera accessible à l'adresse : 
http://<adresse_du_serveur>:8000