import { GlossaryModalManager } from "../src/lib/Glossaries/glossaryModalManager.js";

// Initialisations
let glossaryModalManager = new GlossaryModalManager();
let glossaryManager = glossaryModalManager.glossaryManager;

// Elements
const newGlossaryModal = document.getElementById("newGlossaryModal");
const newGlossaryBtn = document.getElementById("newGlossaryBtn");
const cancelNewGlossaryBtn = document.getElementById("cancelNewGlossaryBtn");
const submitNewGlossaryBtn = document.getElementById("submitNewGlossaryBtn");
const newGlossaryModalOverlay = document.getElementById("newGlossaryModalOverlay");

const viewGlossaryModal = document.getElementById("viewGlossaryModal");
const viewGlossaryModalOverlay = document.getElementById("viewGlossaryModalOverlay");
const closeViewGlossaryBtn = document.getElementById("closeViewGlossaryBtn");

const editGlossaryModal = document.getElementById("editGlossaryModal");
const editGlossaryModalOverlay = document.getElementById("editGlossaryModalOverlay");
const cancelEditGlossaryBtn = document.getElementById("cancelEditGlossaryBtn");
const submitEditGlossaryBtn = document.getElementById("submitEditGlossaryBtn");

const importModal = document.getElementById("importModal");
const importGlossaryBtn = document.getElementById("importGlossaryBtn");
const importCancelBtn = document.getElementById("importCancelBtn");
const importModalOverlay = document.getElementById("importModalOverlay");
const importDropZone = document.getElementById("importDropZone");
const importFileInput = document.getElementById("importFileInput");
const importConfirmBtn = document.getElementById("importConfirmBtn");
const importError = document.getElementById("importError");

const glossaryNameInput = document.getElementById("glossaryNameInput");
const glossaryDescriptionInput = document.getElementById("glossaryDescriptionInput");
const editGlossaryNameInput = document.getElementById("editGlossaryNameInput");
const editGlossaryDescriptionInput = document.getElementById("editGlossaryDescriptionInput");
const glossaryNameError = document.getElementById("glossaryNameError");
const glossaryDescriptionError = document.getElementById("glossaryDescriptionError");
const editGlossaryNameError = document.getElementById("editGlossaryNameError");
const editGlossaryDescriptionError = document.getElementById("editGlossaryDescriptionError");

// Évènements
newGlossaryBtn.addEventListener("click", () => glossaryModalManager.open("newGlossaryModal"));
cancelNewGlossaryBtn.addEventListener("click", () => glossaryModalManager.close("newGlossaryModal"));
newGlossaryModalOverlay.addEventListener("click", () => glossaryModalManager.close("newGlossaryModal"));

closeViewGlossaryBtn.addEventListener("click", () => glossaryModalManager.close("viewGlossaryModal"));
viewGlossaryModalOverlay.addEventListener("click", () => glossaryModalManager.close("viewGlossaryModal"));

cancelEditGlossaryBtn.addEventListener("click", () => glossaryModalManager.close("editGlossaryModal"));
editGlossaryModalOverlay.addEventListener("click", () => glossaryModalManager.close("editGlossaryModal"));

importGlossaryBtn.addEventListener("click", () => {
    glossaryModalManager.open("importModal");
    importError.classList.add("hidden");
    importFileInput.value = "";
    document.getElementById("dropZoneContent").classList.remove("hidden");
    document.getElementById("filePreview").classList.add("hidden");
});
importCancelBtn.addEventListener("click", () => {
    glossaryModalManager.close("importModal");
    importError.classList.add("hidden");
    importFileInput.value = "";
    document.getElementById("dropZoneContent").classList.add("hidden");
    document.getElementById("filePreview").classList.add("hidden");
});
importModalOverlay.addEventListener("click", () => {
    glossaryModalManager.close("importModal");
    importError.classList.add("hidden");
    importFileInput.value = "";
    document.getElementById("dropZoneContent").classList.add("hidden");
    document.getElementById("filePreview").classList.add("hidden");
});
importDropZone.addEventListener("click", () => importFileInput.click());

importFileInput.addEventListener("change", () => {
    const file = event.target.files[0];
    if (file) {
        document.getElementById("fileNameText").textContent = file.name;
        document.getElementById("dropZoneContent").classList.add("hidden");
        document.getElementById("filePreview").classList.remove("hidden");
    }
});

glossaryNameInput.addEventListener("input", () => {
    glossaryModalManager.clearError("glossaryNameInput", "glossaryNameError");
});

glossaryDescriptionInput.addEventListener("input", () => {
    glossaryModalManager.clearError("glossaryDescriptionInput", "glossaryDescriptionError");
});

editGlossaryNameInput.addEventListener("input", () => {
    glossaryModalManager.clearError("editGlossaryNameError", "editGlossaryNameError");
});

editGlossaryDescriptionInput.addEventListener("input", () => {
    glossaryModalManager.clearError("editGlossaryDescriptionInput", "editGlossaryDescriptionError");
});

submitNewGlossaryBtn.addEventListener("click", () => {
    const name = glossaryNameInput.value.trim();
    const description = glossaryDescriptionInput.value.trim();

    glossaryModalManager.clearError("glossaryNameInput", "glossaryNameError");
    glossaryModalManager.clearError("glossaryDescriptionInput", "glossaryDescriptionError");
    let hasError = false;

    if (!name) {
        glossaryModalManager.showError("glossaryNameInput", "glossaryNameError");
        hasError = true;
    }

    if (!description) {
        glossaryModalManager.showError("glossaryDescriptionInput", "glossaryDescriptionError");
        hasError = true;
    }

    if (hasError) return;

    const newGlossary = glossaryManager.createGlossary(name, description);
    glossaryModalManager.close("newGlossaryModal");

    glossaryManager.redirectTo(newGlossary.id);
});

submitEditGlossaryBtn.addEventListener("click", () => {
    const name = editGlossaryNameInput.value.trim();
    const description = editGlossaryDescriptionInput.value.trim();

    glossaryModalManager.clearError("editGlossaryNameInput", "editGlossaryNameError");
    glossaryModalManager.clearError("editGlossaryDescriptionInput", "editGlossaryDescriptionError");
    let hasError = false;

    if (!name) {
        glossaryModalManager.showError("editGlossaryNameInput", "editGlossaryNameError");
        hasError = true;
    }

    if (!description) {
        glossaryModalManager.showError("editGlossaryDescriptionInput", "editGlossaryDescriptionError");
        hasError = true;
    }

    if (hasError) return;

    if (glossaryManager.currentEditId !== -1) {
        glossaryManager.updateGlossary(glossaryManager.currentEditId, name, description);
        glossaryModalManager.close("editGlossaryModal");
        glossaryModalManager.render();
    }
});

importConfirmBtn.addEventListener("click", async () => {
    const file = importFileInput.files[0];
    if (!file) {
        importError.textContent = "Please select a file";
        importError.classList.remove("hidden");
        return;
    }

    const fileExtension = file.name.split(".").pop().toLowerCase();
    if (!["md", "json"].includes(fileExtension)) {
        importError.textContent = "Please select a .md or .json file";
        importError.classList.remove("hidden");
        return;
    }

    try {
        const reader = new FileReader();
        reader.onload = async (e) => {
            const fileContent = e.target.result;

            if (fileExtension === "md") {
                const { parseMarkdown } = await import(
                    "../src/lib/exportDocuments.js"
                );
                const parsedData = parseMarkdown(fileContent);

                // Create new glossary from imported data
                const newGlossary = {
                    id: glossaryManager.nextId++,
                    name: parsedData.title || "Imported Glossary",
                    description:
                        parsedData.description ||
                        "Imported from Markdown file",
                    terms: parsedData.data.map((row, index) => ({
                        id: index + 1,
                        term: row[0],
                        definition: row[1],
                        synonyms:
                            typeof row[2] === "string" ? row[2]
                                .split(",")
                                .map((s) => s.trim())
                                .filter((s) => s)
                            : Array.isArray(row[2]) ? row[2] : [],
                    })),
                };

                glossaryManager.createGlossary(newGlossary.name, newGlossary.description, newGlossary.terms);
                glossaryModalManager.render();
                glossaryModalManager.close("importModal");

            } else {
                const { parseJSON } = await import(
                    "../src/lib/exportDocuments.js"
                );
                const parsedData = parseJSON(fileContent);

                const newGlossary = {
                    id: glossaryManager.nextId++,
                    name: parsedData.title || "Imported Glossary",
                    description:
                        parsedData.description ||
                        "Imported from JSON file",
                    terms: parsedData.data.map((row, index) => ({
                        id: index + 1,
                        term: row[0],
                        definition: row[1],
                        synonyms: Array.isArray(row[2])
                            ? row[2]
                            : [],
                    })),
                };

                glossaryManager.createGlossary(newGlossary.name, newGlossary.description, newGlossary.terms);
                glossaryModalManager.render();
                glossaryModalManager.close("importModal");
            }
        };
        reader.readAsText(file);
    } catch (error) {
        console.error("Import error:", error);
        importError.textContent = "Error importing file: " + error.message;
        importError.classList.remove("hidden");
    }
});

document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
        if (!newGlossaryModal.classList.contains("hidden")) {
            glossaryModalManager.close("newGlossaryModal");
        }
        if (!viewGlossaryModal.classList.contains("hidden")) {
            glossaryModalManager.close("viewGlossaryModal");
        }
        if (!editGlossaryModal.classList.contains("hidden")) {
            glossaryModalManager.close("editGlossaryModal");
        }
        if (!importModal.classList.contains("hidden")) {
            glossaryModalManager.close("importModal");
        }
    }
});
//Execution
glossaryManager.load();
glossaryModalManager.render();