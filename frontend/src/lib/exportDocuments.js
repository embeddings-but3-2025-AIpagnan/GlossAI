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

function parseMarkdown(markdownContent) {
  const lines = markdownContent.split('\n').filter(line => line.trim() !== '');

  // Extraction du titre
  const titleLine = lines.find(line => line.startsWith('#'));
  if (!titleLine) throw new Error("Title not found");
  const title = titleLine.replace(/^#\s*/, '');

  // Extraction de la description
  let description = "";
  const descriptionLine = lines.find(line => line.startsWith('**Description:**'));
  if (descriptionLine) {
    description = descriptionLine.replace('**Description:**', '').trim();
  }

  // Recherche du tableau
  const tableStart = lines.findIndex(line => line.trim().startsWith('|'));
  if (tableStart === -1) throw new Error("No table found");

  // Extraction des en-têtes
  const headers = lines[tableStart]
    .split('|')
    .filter(cell => cell.trim() !== '')
    .map(cell => cell.trim());

  // Si le fichier a l'ancien format (3 colonnes), ajouter "Bounding Context"
  if (headers.length === 3 && headers[2] === "Synonyms") {
    headers.splice(2, 0, "Bounding Context");
  }

  // Extraction des données
  const data = [];
  for (let i = tableStart + 2; i < lines.length; i++) {
    if (!lines[i].trim().startsWith('|')) continue;

    const row = lines[i]
      .split('|')
      .filter(cell => cell.trim() !== '')
      .map(cell => cell.trim());

    // Si le fichier a l'ancien format (3 colonnes), ajouter une chaîne vide pour Bounding Context
    if (row.length === 3 && headers.length === 4) {
      row.splice(2, 0, ""); // Ajoute une chaîne vide pour Bounding Context
    }

    if (row.length === headers.length) {
      // Convertir les synonymes en tableau si c'est une chaîne
      if (row[3] && typeof row[3] === 'string') {
        row[3] = row[3].split(',').map(s => s.trim()).filter(s => s);
      }
      data.push(row);
    }
  }

  return {
    title: title,
    description: description,
    headers: headers,
    data: data
  };
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

function parseJSON(jsonContent) {
  try {
    const parsedData = JSON.parse(jsonContent);

    // Support des anciens et nouveaux formats
    if (parsedData.glossary) {
      // Nouveau format avec métadonnées
      let headers = parsedData.headers || ["Word", "Definition", "Synonyms"];
      
      // Si c'est l'ancien format (3 colonnes), ajouter "Bounding Context"
      if (headers.length === 3 && headers[2] === "Synonyms") {
        headers.splice(2, 0, "Bounding Context");
      }
      
      // Si les données sont dans un format structuré avec termes
      if (parsedData.terms && Array.isArray(parsedData.terms)) {
        const data = parsedData.terms.map(term => [
          term.word || term.term || "",
          term.definition || "",
          term.boundingContext || "",
          term.synonyms || []
        ]);
        
        return {
          title: parsedData.glossary.name || parsedData.title || "Imported Glossary",
          description: parsedData.glossary.description || "",
          headers: headers,
          data: data
        };
      } 
      // Si les données sont dans le format tableau simple
      else if (parsedData.data && Array.isArray(parsedData.data)) {
        // Si les données ont l'ancien format (3 colonnes), ajouter une chaîne vide pour Bounding Context
        const data = parsedData.data.map(row => {
          if (row.length === 3 && headers.length === 4) {
            return [row[0], row[1], "", row[2]];
          }
          return row;
        });
        
        return {
          title: parsedData.glossary.name || parsedData.title || "Imported Glossary",
          description: parsedData.glossary.description || "",
          headers: headers,
          data: data
        };
      } else {
        throw new Error("Invalid JSON structure");
      }
    } else if (parsedData.title && parsedData.data) {
      // Ancien format sans glossary
      let headers = parsedData.headers || ["Word", "Definition", "Synonyms"];
      
      // Si c'est l'ancien format (3 colonnes), ajouter "Bounding Context"
      if (headers.length === 3 && headers[2] === "Synonyms") {
        headers.splice(2, 0, "Bounding Context");
      }
      
      // Si les données ont l'ancien format (3 colonnes), ajouter une chaîne vide pour Bounding Context
      const data = parsedData.data.map(row => {
        if (row.length === 3 && headers.length === 4) {
          return [row[0], row[1], "", row[2]];
        }
        return row;
      });
      
      return {
        title: parsedData.title,
        description: "",
        headers: headers,
        data: data
      };
    } else {
      throw new Error("Invalid JSON structure");
    }
  } catch (e) {
    throw new Error("JSON parsing error: " + e.message);
  }
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
