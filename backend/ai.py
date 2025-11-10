import asyncio

from ollama import AsyncClient


async def get_synonyms(
    word: str,
    definition: str,
    synonyms: list[str],
) -> list[str]:
    word = word.strip().lower()
    synonyms = [synonym.strip().lower() for synonym in synonyms if synonym.strip()]

    prompt = f"""
Find synonyms of the word "{word}"{f" as defined by:\n> {"\n > ".join(definition.split("\n"))}" if definition else "."}

{f"Already known synonyms for the correct sense of the word: {", ".join(synonyms)}" if synonyms else ""}

Your response must be in the original word's language.
Respond ONLY with the synonyms, separated by commas. Do not include any other text in your response.
"""

    response = (
        await AsyncClient().generate(
            model="qwen3:0.6b",
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
        },
    )


async def main() -> None:
    print(
        await get_synonyms(
            "gameboard",
            "Grid composed of squares for placing letter tokens",
            ["grid", "board"],
        ),
    )


if __name__ == "__main__":
    asyncio.run(main())
