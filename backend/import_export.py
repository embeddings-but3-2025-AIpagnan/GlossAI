from datetime import datetime

from pydantic import BaseModel


class Term(BaseModel):
    term: str
    definition: str
    bounding_context: str | None
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
            return glossary.model_dump_json()
        case _:
            msg = f"Unsupported file export type: {format}"
            raise ValueError(msg)


HEADERS = ["Word", "Definition", "Bounding context", "Synonyms"]


def export_markdown(glossary: Glossary) -> str:
    lines = [
        f"| {term.term} | {term.definition} | {term.bounding_context or ''} | {', '.join(term.synonyms)} |"
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


def import_(format: str, content: str) -> Glossary:
    match format:
        case "markdown":
            return import_markdown(content)
        case "json":
            return Glossary.model_validate_json(content)
        case _:
            msg = f"Unsupported file type: {format}"
            raise ValueError(msg)


def import_markdown(content: str) -> Glossary:
    lines = [line.strip() for line in content.splitlines() if line.strip()]

    title = (
        next(line for line in lines if line.startswith("#")).removeprefix("#").strip()
    )
    description = (
        next(line for line in lines if line.startswith("**Description**:"))
        .removeprefix("**Description**:")
        .strip()
    )

    table_lines = [line for line in lines if line.startswith("|")][2:]

    terms = []
    for line in table_lines:
        term, definition, bounding_context, synonyms = [
            cell.strip() for cell in line.strip("|").split("|")
        ]
        terms.append(
            Term(
                term=term,
                definition=definition,
                bounding_context=bounding_context,
                synonyms=[synonym.strip() for synonym in synonyms.split(",")],
            ),
        )

    return Glossary(name=title, description=description, terms=terms)
