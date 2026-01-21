import os
import signal
from pathlib import Path

import uvicorn
from ai import get_synonyms
from fastapi import FastAPI, HTTPException
from parser import analyze_directory, analyze_file
from pydantic import BaseModel

app = FastAPI(title="GlossAI")


class SynonymRequest(BaseModel):
    glossary_name: str
    glossary_description: str
    term: str
    definition: str | None
    synonyms: list[str]
    context: list[str]


class SynonymResponse(BaseModel):
    synonyms: list[str]


@app.post("/api/suggest", response_model=SynonymResponse)
async def suggest_synonyms(request: SynonymRequest) -> SynonymResponse:
    try:
        # Appeler la fonction get_synonyms avec le terme et le contexte
        synonyms = await get_synonyms(
            glossary_name=request.glossary_name,
            glossary_description=request.glossary_description,
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


class FileAnalyzeResponse(BaseModel):
    lang: str
    names: dict[str, int]


class DirectoryAnalyzeResponse(BaseModel):
    files: dict[str, FileAnalyzeResponse]
    names: dict[str, int]


@app.get("/api/analyze/file")
async def analyze_file_route(path: str) -> FileAnalyzeResponse:
    result = analyze_file(Path(path))
    return FileAnalyzeResponse(lang=result.lang, names=result.words)


@app.get("/api/analyze/folder")
async def analyze_folder_route(path: str) -> DirectoryAnalyzeResponse:
    result = analyze_directory(Path(path))
    return DirectoryAnalyzeResponse(
        files={
            str(name): FileAnalyzeResponse(lang=result.lang, names=result.words)
            for name, result in result.files.items()
        },
        names=result.words,
    )


@app.post("/shutdown")
async def shutdown() -> None:
    os.kill(os.getpid(), signal.SIGTERM)


if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="127.0.0.1", port=port)
