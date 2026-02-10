import json
from datetime import datetime

from pydantic import BaseModel


class Term(BaseModel):
    term: str
    definition: str
    bounding_context: str
    synonyms: list[str]


class Glossary(BaseModel):
    name: str
    description: str
    terms: list[Term]


def export(format: str, glossary: Glossary) -> str:
    match format:
        case "markdown":
            return export_markdown(glossary)
        case "json":
            return json.dumps(glossary.model_dump(mode="json"))
        case _:
            msg = f"Unsupported file export type: {format}"
            raise ValueError(msg)


HEADERS = ["Word", "Definition", "Bounding context", "Synonyms"]


def export_markdown(glossary: Glossary) -> str:
    lines = [
        f"| {term.term} | {term.definition} | {term.bounding_context} | {', '.join(term.synonyms)} |"
        for term in glossary.terms
    ]
    return f"""
# {glossary.name}

**Description**: {glossary.description}

**Export Date**: {datetime.now().strftime("%c")}

**Number of Terms**: {len(glossary.terms)}

| {" | ".join(HEADERS)} |
| {" | ".join("---" for _ in HEADERS)} |
{"\n".join(lines)}
    """.strip()
