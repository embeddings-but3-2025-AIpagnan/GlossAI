const { invoke } = window.__TAURI__.core;

async function generateMarkdown(glossary) {
  const markdownTable = await generateMarkdownString(glossary);

  const blob = new Blob([markdownTable], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${glossary.name.toLowerCase().replace(/\s+/g, '_')}.md`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

async function parseMarkdown(markdownContent) {
  return await invoke("import", {
    format: "markdown",
    content: markdownContent,
  });
}

async function generateJSON(glossary) {
  const data = await generateJSONString(glossary);

  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${glossary.name.toLowerCase().replace(/\s+/g, '_')}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

async function parseJSON(jsonContent) {
  return await invoke("import", {
    format: "json",
    content: jsonContent,
  });
}

// Fonctions pour la prévisualisation (retournent le contenu sans télécharger)
async function generateMarkdownString(glossary) {
  return await invoke("export", {
    format: "markdown",
    glossary,
  });
}

async function generateJSONString(glossary) {
  return await invoke("export", {
    format: "json",
    glossary,
  });
}

// Exportez les fonctions pour les rendre disponibles
export { generateJSON, generateJSONString, generateMarkdown, generateMarkdownString, parseJSON, parseMarkdown };
