function generateMarkdown(data, headers = ["Word", "Definition", "Synonyms"], title = "Glossary") {
  if (!Array.isArray(data) || data.some(row => !Array.isArray(row) || row.length !== headers.length)) {
    throw new Error(`Invalid data format`);
  }

  const titleLine = `# ${title}\n\n`;
  const headerRow = `| ${headers.join(" | ")} |`;
  const separatorRow = `| ${headers.map(() => "---").join(" | ")} |`;

  const dataRows = data.map(row => {
    const formattedRow = row.map(cell => {
      if (Array.isArray(cell)) {
        return cell.length > 0 ? cell.join(", ") : "-";
      }
      return String(cell || "-").replace(/\n/g, " ").replace(/\s+/g, " ").trim();
    });
    return `| ${formattedRow.join(" | ")} |`;
  }).join("\n");

  const markdownTable = titleLine + headerRow + "\n" + separatorRow + "\n" + dataRows;

  const blob = new Blob([markdownTable], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${title.toLowerCase().replace(/\s+/g, '_')}.md`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function parseMarkdown(markdownContent) {
  const lines = markdownContent.split('\n').filter(line => line.trim() !== '');

  // Extraction du titre
  const titleLine = lines.find(line => line.startsWith('#'));
  if (!titleLine) throw new Error("Title not found");
  const title = titleLine.replace(/^#\s*/, '');

  // Recherche du tableau
  const tableStart = lines.findIndex(line => line.trim().startsWith('|'));
  if (tableStart === -1) throw new Error("No table found");

  // Extraction des en-têtes
  const headers = lines[tableStart]
    .split('|')
    .filter(cell => cell.trim() !== '')
    .map(cell => cell.trim());

  // Extraction des données
  const data = [];
  for (let i = tableStart + 2; i < lines.length; i++) {
    if (!lines[i].trim().startsWith('|')) continue;

    const row = lines[i]
      .split('|')
      .filter(cell => cell.trim() !== '')
      .map(cell => cell.trim());

    if (row.length === headers.length) {
      data.push(row);
    }
  }

  return {
    title: title,
    headers: headers,
    data: data
  };
}

function generateJSON(data, headers = ["Word", "Definition", "Synonyms"], title = "Glossary") {
  const structuredData = {
    title: title,
    headers: headers,
    data: data
  };

  const blob = new Blob([JSON.stringify(structuredData, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${title.toLowerCase().replace(/\s+/g, '_')}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function parseJSON(jsonContent) {
  try {
    const parsedData = JSON.parse(jsonContent);

    if (!parsedData.title || !parsedData.headers || !parsedData.data) {
      throw new Error("Invalid JSON structure");
    }

    return {
      title: parsedData.title,
      headers: parsedData.headers,
      data: parsedData.data
    };
  } catch (e) {
    throw new Error("JSON parsing error: " + e.message);
  }
}

// Fonctions pour la prévisualisation (retournent le contenu sans télécharger)
function generateMarkdownString(data, headers = ["Word", "Definition", "Synonyms"], title = "Glossary") {
  if (!Array.isArray(data) || data.some(row => !Array.isArray(row) || row.length !== headers.length)) {
    throw new Error(`Invalid data format`);
  }

  const titleLine = `# ${title}\n\n`;
  const headerRow = `| ${headers.join(" | ")} |`;
  const separatorRow = `| ${headers.map(() => "---").join(" | ")} |`;

  const dataRows = data.map(row => {
    const formattedRow = row.map(cell => {
      if (Array.isArray(cell)) {
        return cell.length > 0 ? cell.join(", ") : "-";
      }
      return String(cell || "-").replace(/\n/g, " ").replace(/\s+/g, " ").trim();
    });
    return `| ${formattedRow.join(" | ")} |`;
  }).join("\n");

  return titleLine + headerRow + "\n" + separatorRow + "\n" + dataRows;
}

function generateJSONString(data, headers = ["Word", "Definition", "Synonyms"], title = "Glossary") {
  const structuredData = {
    title: title,
    headers: headers,
    data: data
  };

  return JSON.stringify(structuredData, null, 2);
}

// Exportez les fonctions pour les rendre disponibles
export { generateMarkdown, parseMarkdown, generateJSON, parseJSON, generateMarkdownString, generateJSONString };
