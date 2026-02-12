import logging
from collections import Counter
from collections.abc import Mapping
from dataclasses import dataclass
from pathlib import Path
from re import Pattern, compile

import tree_sitter_java as tsjava
import tree_sitter_javascript as tsjavascript
import tree_sitter_php as tsphp
import tree_sitter_python as tspython
import tree_sitter_rust as tsrust
import tree_sitter_typescript as tstypescript
from tree_sitter import Language, Node, Parser

logger = logging.getLogger(__name__)


@dataclass
class LanguageConfig:
    """Definition of the configuration for a language."""

    ts_language: Language
    extensions: list[str]
    nodes: list[str]
    excludes: list[Pattern[str]]


@dataclass
class FileResults:
    """Results of analyzing a single file."""

    lang: str
    words: Mapping[str, int]


@dataclass
class DirectoryResults:
    """Results of analyzing a directory."""

    files: Mapping[Path, FileResults]
    words: Mapping[str, int]


DEFAULT_CONFIG = {
    "java": LanguageConfig(
        Language(tsjava.language()),
        ["java"],
        [
            "class_declaration",
            "method_declaration",
            "variable_declarator",
            "formal_parameter",
            "interface_declaration",
            "enum_declaration",
        ],
        [],
    ),
    "javascript": LanguageConfig(
        Language(tsjavascript.language()),
        ["js", "jsx", "mjs", "cjs"],
        [
            "class_declaration",
            "function_declaration",
            "method_definition",
            "variable_declarator",
            "formal_parameters",
            "arrow_function",
            "function_expression",
        ],
        [compile(pattern) for pattern in ["this", "super", "prototype"]],
    ),
    "typescript": LanguageConfig(
        Language(tstypescript.language_typescript()),
        ["ts", "tsx"],
        [
            "class_declaration",
            "function_declaration",
            "method_definition",
            "variable_declarator",
            "formal_parameters",
            "arrow_function",
            "function_signature",
            "interface_declaration",
            "type_alias_declaration",
            "enum_declaration",
        ],
        [compile(pattern) for pattern in ["this", "super", "prototype"]],
    ),
    "rust": LanguageConfig(
        Language(tsrust.language()),
        ["rs"],
        [
            "struct_item",
            "enum_item",
            "function_item",
            "impl_item",
            "trait_item",
            "const_item",
            "static_item",
            "type_item",
            "function_signature_item",
            "parameter",
            "field_declaration",
        ],
        [compile(pattern) for pattern in ["self", "Self", "super", "crate"]],
    ),
    "php": LanguageConfig(
        Language(tsphp.language_php()),
        ["php", "php5", "php7", "php8", "phtml"],
        [
            "class_declaration",
            "interface_declaration",
            "trait_declaration",
            "enum_declaration",
            "function_definition",
            "method_declaration",
            "variable_name",
            "property_declaration",
            "const_declaration",
        ],
        [compile(pattern) for pattern in [r"\$this", r"\$self", "__.*__"]],
    ),
    "python": LanguageConfig(
        Language(tspython.language()),
        ["py"],
        [
            "class_definition",
            "function_definition",
            "async_function_definition",
            "default_parameter",
            "typed_parameter",
        ],
        [compile(pattern) for pattern in ["self", "cls", "__.*__"]],
    ),
}


def get_language(path: Path) -> tuple[str, LanguageConfig]:
    suffix = path.suffix.lower().removeprefix(".")
    for name, language in DEFAULT_CONFIG.items():
        if suffix in language.extensions:
            return name, language

    msg = f"File type not supported: {suffix}"
    raise ValueError(msg)


def extract_name(node: Node) -> str | None:
    name_node = node.child_by_field_name("name")
    if not name_node:
        logger.warning("Node %s didn't have a `name` children", node.type)
        return None

    name: str | None = name_node.text.decode("utf8")
    if not name:
        logger.warning("Name of node %s was empty", node.type)
        return None

    return name


def traverse(node: Node, names: list[str], node_types: list[str]) -> None:
    if node.type in node_types and (name := extract_name(node)):
        names.append(name)
    elif node.type == "parameters":
        names.extend(
            filter(
                bool,
                (
                    child.text.decode("utf8")
                    for child in node.children
                    if child.type == "identifier"
                ),
            ),
        )
    elif node.type == "assignment":
        child = node.children[0]
        if child.type == "attribute" and (name := child.text.decode("utf8")):
            names.extend(name.split("."))
    elif node.type == "for_statement":
        name_node = node.child_by_field_name("type=identifier")
        if name_node and (name := name_node.text.decode("utf8")):
            names.append(name)

    for child in node.children:
        traverse(child, names, node_types)


def analyze_code(
    code: bytes,
    language_name: str,
    language: LanguageConfig,
) -> FileResults:
    parser = Parser(language.ts_language)
    tree = parser.parse(code)

    names: list[str] = []
    traverse(tree.root_node, names, language.nodes)

    names = [
        name
        for name in names
        if not any(pattern.fullmatch(name) for pattern in language.excludes)
    ]

    return FileResults(language_name, Counter(names))


def analyze_file(path: Path) -> FileResults:
    language_name, language = get_language(path)
    # might raise a FileNotFoundError, let it bubble up
    source_code = path.read_bytes()

    return analyze_code(source_code, language_name, language)


def find_files(path: Path) -> list[Path]:
    files: list[Path] = []
    for language in DEFAULT_CONFIG.values():
        for ext in language.extensions:
            files.extend(
                file
                for file in path.rglob(f"*.{ext}")
                if file.is_file()
                if not any(part.startswith(".") for part in file.parts)
            )

    return files


def analyze_directory(path: Path) -> DirectoryResults:
    files_path = find_files(path)
    files = {file: analyze_file(file) for file in files_path}

    words: Counter[str] = Counter()
    for file in files.values():
        words.update(file.words)

    return DirectoryResults(files, words)


def main() -> None:
    results = analyze_directory(
        Path("/home/zacharie/Downloads/Tennis-Refactoring-Kata-main/python"),
    )
    
    print("=" * 80)
    print("STATISTIQUES PAR FICHIER")
    print("=" * 80)
    
    for file_path, file_results in results.files.items():
        print(f"\n📄 Fichier: {file_path}")
        print(f"   Langage: {file_results.lang}")
        print(f"   Nombre total de noms: {sum(file_results.words.values())}")
        print(f"   Noms uniques: {len(file_results.words)}")
        
        if file_results.words:
            print(f"   Top 10 des noms les plus fréquents:")
            for name, count in file_results.words.most_common(10):
                print(f"      - {name}: {count}")
    
    print("\n" + "=" * 80)
    print("STATISTIQUES GLOBALES DU RÉPERTOIRE")
    print("=" * 80)
    print(f"Nombre total de fichiers analysés: {len(results.files)}")
    print(f"Nombre total de noms: {sum(results.words.values())}")
    print(f"Noms uniques dans tout le répertoire: {len(results.words)}")
    print(f"\nTop 20 des noms les plus fréquents (tous fichiers confondus):")
    for name, count in results.words.most_common(20):
        print(f"   - {name}: {count}")


if __name__ == "__main__":
    main()