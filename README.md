# GlossAI
Une application en Python **FastAPI** permettant d'implémenter les fonctionnalités intelligentes du LLM.

---

##  Pour lancer l'application

###  Prérequis
- Python 3.9+ installé  
- pip installé
- venv installé
- Node.js 18.17.1+ installé
---

### Installation

#### Linux
```bash
git clone https://github.com/mon-compte/mon-projet.git
cd mon-projet
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
npm install astro
```
#### Windows
```bash
git clone https://github.com/mon-compte/mon-projet.git
cd mon-projet
python3 -m venv .venv
.venv/Scripts/Activate.ps1
pip install -r requirements.txt
npm install astro
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
