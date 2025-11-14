import os

import uvicorn
from ai import get_synonyms
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI(title="GlossAI")


# Modèles Pydantic pour la validation des données
class SynonymRequest(BaseModel):
    term: str
    definition: str | None
    synonyms: list[str]
    context: list[str]


class SynonymResponse(BaseModel):
    synonyms: list[str]


@app.post("/api/suggest", response_model=SynonymResponse)
async def suggest_synonyms(request: SynonymRequest):
    try:
        # Appeler la fonction get_synonyms avec le terme et le contexte
        synonyms = await get_synonyms(
            word=request.term,
            definition=request.definition,
            synonyms=request.synonyms,
            context=request.context,
        )

        return SynonymResponse(synonyms=synonyms)

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erreur lors de la génération des suggestions: {e!s}",
        )


if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="127.0.0.1", port=port)
