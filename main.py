from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os
import subprocess
from pathlib import Path

app = FastAPI(title="GlossAI")

def build_astro():
    """Build Astro à chaque lancement"""
    print("🚀 Building Astro...")
    
    if (os.name == "nt"):
        # Utiliser Path pour une meilleure gestion des chemins
        astro_frontend_path = Path("astro-frontend")
        dist_path = astro_frontend_path / "dist"
        
        # Vérifier si le dossier astro-frontend existe
        if not astro_frontend_path.exists():
            print("❌ Dossier astro-frontend introuvable")
            print(f"   Chemin recherché: {astro_frontend_path.absolute()}")
            return False
        
        try:
            print("🔨 Construction de l'application Astro...")
            # Builder l'application Astro
            build_result = subprocess.run(
                ["npm", "run", "build"], 
                cwd=astro_frontend_path,
                capture_output=True,
                text=True,
                shell=True  # Important pour Windows
            )
            
            if build_result.returncode == 0:
                print("✅ Build Astro réussi!")
            else:
                print(f"❌ Erreur lors du build Astro: {build_result.stderr}")        
        except Exception as e:
            print(f"❌ Erreur inattendue: {e}")
    else:
        try:
            # Aller dans le dossier Astro et builder
            original_dir = os.getcwd()
            os.chdir("astro-frontend")
            subprocess.run(["npm", "run", "build"], check=True)
            os.chdir(original_dir)
            print("✅ Build Astro réussi!")
        except subprocess.CalledProcessError as e:
            print(f"❌ Erreur lors du build Astro: {e}")
            os.chdir(original_dir)
        except FileNotFoundError:
            print("❌ Dossier astro-frontend introuvable")
            os.chdir(original_dir)

# Build automatique au démarrage
build_astro()

# Monter les dossiers statiques seulement si le build a réussi
astro_frontend_path = Path("astro-frontend")
dist_path = astro_frontend_path / "dist"

if dist_path.exists():
    # Monter les assets
    assets_path = dist_path / "assets"
    if assets_path.exists():
        app.mount("/assets", StaticFiles(directory=str(assets_path)), name="assets")
        print("✅ Assets montés")
    
    # Monter _astro
    astro_build_path = dist_path / "_astro"
    if astro_build_path.exists():
        app.mount("/_astro", StaticFiles(directory=str(astro_build_path)), name="astro")
        print("✅ Fichiers _astro montés")
else:
    print("⚠️  Dossier dist introuvable - le frontend ne sera pas disponible")

# Monter le dossier static si il existe
static_path = Path("static")
if static_path.exists():
    app.mount("/static", StaticFiles(directory="static"), name="static")
    print("✅ Static files montés")

# Route principale - sert le fichier Astro
@app.get("/")
async def read_index():
    index_path = Path("astro-frontend/dist/index.html")
    if index_path.exists():
        return FileResponse(str(index_path))
    else:
        raise HTTPException(status_code=500, detail="Frontend non disponible. Le build Astro a probablement échoué.")

# Route de santé pour vérifier que l'API fonctionne
@app.get("/api/health")
async def health_check():
    return {"status": "ok", "frontend_available": Path("astro-frontend/dist/index.html").exists()}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)