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
Find synonyms of the word "{word}" defined by:
> {"\n > ".join(definition.split("\n"))}

{f"The following words are synonyms of the word: {", ".join(synonyms)}" if synonyms else ""}
Your response MUST only include the synonyms separated by commas.
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
