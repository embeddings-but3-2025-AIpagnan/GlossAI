# GlossAI
Une application en Python **FastAPI** permettant d'implémenter les fonctionnalités intelligentes du LLM.

---

##  Pour lancer l'application

###  Prérequis
- Python 3.9+ installé  
- pip (normalement installé avec Python)
- FastAPI et Uvicorn installés
- astro installé (npm install astro)
- venv installé

---

###  Installation
```bash
git clone https://github.com/mon-compte/mon-projet.git
cd mon-projet
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

---

### Lancement 
```bash
uvicorn main:app --host 0.0.0.0 --port 8000
```

L'application sera accessible à l'adresse : 
http://<adresse_du_serveur>:8000
