import asyncio

import ollama
from ollama import AsyncClient

MODEL = "qwen3:0.6b"


async def get_synonyms(
    glossary_name: str,
    glossary_description: str,
    word: str,
    definition: str | None,
    synonyms: list[str],
    bounding_context: str,
    context: list[str],
) -> list[str]:
    try:
        ollama.show(MODEL)
    except:
        ollama.pull(MODEL)

    word = word.strip().lower()
    synonyms = [synonym.strip().lower() for synonym in synonyms if synonym.strip()]

    prompt = f"""
In a ubiquitous language glossary named "{glossary_name}" and with the following description:
{"> " + "\n > ".join(glossary_description.split("\n")) if glossary_description else "No description"}

The glossary currently contains the following words: {", ".join(context)}

Find synonyms of the word "{word}"{f" as defined by:\n> {"\n > ".join(definition.split("\n"))}" if definition else "."}

The bouding context for this word is: '{bounding_context}'.
{f"Already known synonyms for the correct sense of the word: {", ".join(synonyms)}." if synonyms else ""}

Your response MUST be in the original word's language.
Respond ONLY with the synonyms, separated by commas. Do not include any other text in your response.
"""

    response = (
        await AsyncClient().generate(
            model=MODEL,
            prompt=prompt,
            think=False,
        )
    ).response
    response = response.replace('"', "").replace("'", "").replace(".", "")

    return list(
        {
            term.strip().lower()
            for term in response.split(",")
            if term.strip().lower() not in [word, *synonyms]
            and term.strip().lower().removesuffix("s") not in [word, *synonyms]
        },
    )


async def main() -> None:
    print(
        await get_synonyms(
            "Chess",
            "The game of chess",
            "pawn",
            "A pawn",
            [],
            "Pieces",
            ["board"],
        ),
    )


if __name__ == "__main__":
    asyncio.run(main())
