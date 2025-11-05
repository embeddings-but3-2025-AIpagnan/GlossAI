function generateMarkdown(data, headers = ["Terme", "Définition", "Synonymes"]) {

//protection contre les données mal formées
  if (!Array.isArray(data) || data.some(row => !Array.isArray(row) || row.length !== headers.length)) {
    throw new Error(`Erreur dans les données`);
  }

  //entête
  const title = "# Glossaire"
  const headerRow = `| ${headers.join(" | ")} |`;
  const separatorRow = `| ${headers.map(() => "---").join(" | ")} |`;
  
  //création des lignes du tableau
  const dataRows = data.map(row => {
    const formattedRow = row.map(cell => {

      if (Array.isArray(cell)) {
        return cell.join(", ");
      }
   

      return String(cell).replace(/\n/g, " ").replace(/\s+/g, " ").trim();              
    });
    return `| ${formattedRow.join(" | ")} |`;
  }).join("\n");


  //assemblage des différents éléments
  const markdownTable = [title, headerRow, separatorRow, dataRows ].join("\n");


  //création du fichicheir
  const blob = new Blob([markdownTable], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  //téléchargement
  link.href = url;
  link.download = "glossaire.md";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}





