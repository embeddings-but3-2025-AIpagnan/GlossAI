
function generateMarkdown(data, headers = ["Terme", "Définition", "Synonymes"], title = "Glossaire") {
  if (!Array.isArray(data) || data.some(row => !Array.isArray(row) || row.length !== headers.length)) {
    throw new Error(`Erreur dans les données`);
  }

  const titleLine = `# ${title}`;
  const headerRow = `| ${headers.join(" | ")} |`;
  const separatorRow = `| ${headers.map(() => "---").join(" | ")} |`;

  const dataRows = data.map(row => {
    const formattedRow = row.map(cell => {
      if (Array.isArray(cell)) {
        return cell.join(", ");
      }
      return String(cell).replace(/\n/g, " ").replace(/\s+/g, " ").trim();
    });
    return `| ${formattedRow.join(" | ")} |`;
  }).join("\n");

  const markdownTable = [titleLine, headerRow, separatorRow, dataRows].join("\n");

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
            if (!titleLine) throw new Error("Titre non trouvé");
            const title = titleLine.replace(/^#\s*/, '');
            
            // Recherche du tableau
            const tableStart = lines.findIndex(line => line.trim().startsWith('|'));
            if (tableStart === -1) throw new Error("Aucun tableau trouvé");

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

        



function generateJSON(data, headers = ["Terme", "Définition", "Synonymes"], title = "Glossaire") {
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
      throw new Error("Structure JSON invalide");
    }

    return {
      title: parsedData.title,
      headers: parsedData.headers,
      data: parsedData.data
    };
  } catch (e) {
    throw new Error("Erreur de parsing JSON: " + e.message);
  }
}

const sampleData = [
  ["API", "Interface de programmation applicative", ["Application Programming Interface"]],
  ["HTTP", "Protocole de transfert hypertexte", ["Hypertext Transfer Protocol"]]
];

// Génération Markdown avec titre personnalisé
generateMarkdown(sampleData, ["Terme", "Description", "Alias"], "Mon Glossaire Personnalisé");

// Génération JSON
generateJSON(sampleData, ["Terme", "Description", "Alias"], "Mon Glossaire JSON");

// Pour parser un markdown existant
// const markdownContent = `# Mon Glossaire...`;
// const parsed = parseMarkdown(markdownContent);

// Pour parser un JSON existant
// const jsonContent = `{"title": "Mon Glossaire"...}`;
// const parsed = parseJSON(jsonContent);