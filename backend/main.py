import os
import subprocess
from pathlib import Path

from ai import get_synonyms
from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

app = FastAPI(title="GlossAI")


def build_astro() -> None:
    """Build Astro à chaque lancement."""
    print("🚀 Building Astro...")

    if os.name == "nt":
        frontend_path = Path("frontend")

        if not frontend_path.exists():
            print("❌ Dossier frontend introuvable")
            print(f"   Chemin recherché: {frontend_path.absolute()}")

        try:
            print("🔨 Construction de l'application Astro...")
            # Builder l'application Astro
            build_result = subprocess.run(
                ["npm", "run", "build"],
                check=False,
                cwd=frontend_path,
                capture_output=True,
                text=True,
                shell=True,  # Important pour Windows
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
            os.chdir("frontend")
            subprocess.run(["npm", "run", "build"], check=True)
            os.chdir(original_dir)
            print("✅ Build Astro réussi!")
        except subprocess.CalledProcessError as e:
            print(f"❌ Erreur lors du build Astro: {e}")
            os.chdir(original_dir)
        except FileNotFoundError:
            print("❌ Dossier frontend introuvable")
            os.chdir(original_dir)


# Build automatique au démarrage
build_astro()


# Modèles Pydantic pour la validation des données
class SynonymRequest(BaseModel):
    term: str
    definition: str | None
    synonyms: list[str]


class SynonymResponse(BaseModel):
    synonyms: list[str]


# Monter les dossiers statiques seulement si le build a réussi
astro_frontend_path = Path("frontend")
dist_path = astro_frontend_path / "dist"

if dist_path.exists():
    # Monter les assets
    assets_path = dist_path / "static"
    if assets_path.exists():
        app.mount("/static", StaticFiles(directory=str(assets_path)), name="static")
        print("✅ Assets static montés")

    # Monter _astro
    astro_build_path = dist_path / "_astro"
    if astro_build_path.exists():
        app.mount("/_astro", StaticFiles(directory=str(astro_build_path)), name="astro")
        print("✅ Fichiers _astro montés")
else:
    print("⚠️  Dossier dist introuvable - le frontend ne sera pas disponible")


@app.get("/")
async def read_index():
    index_path = Path("frontend/dist/index.html")
    if index_path.exists():
        return FileResponse(str(index_path))
    raise HTTPException(
        status_code=500,
        detail="Frontend non disponible. Le build Astro a probablement échoué.",
    )


@app.post("/api/suggest", response_model=SynonymResponse)
async def suggest_synonyms(request: SynonymRequest):
    try:
        # Appeler la fonction get_synonyms avec le terme et le contexte
        synonyms = await get_synonyms(
            word=request.term,
            definition=request.definition,
            synonyms=request.synonyms,
        )

        return SynonymResponse(synonyms=synonyms)

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erreur lors de la génération des suggestions: {e!s}",
        )


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="127.0.0.1", port=32791)
