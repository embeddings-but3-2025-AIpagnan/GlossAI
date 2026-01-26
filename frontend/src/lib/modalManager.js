import { GlossaryManager } from "./Glossaries/glossaryManager";
import { DeleteUtils } from "./deleteUtils.js";
import { escapeHtml } from "./utils.js";

export class ModalManager {
    glossaryManager = new GlossaryManager();
    deleteUtils = new DeleteUtils();
    open(id) {
        document.getElementById(id).classList.remove("hidden");
        document.body.style.overflow = "hidden";
    }

    close(id) {
        document.getElementById(id).classList.add("hidden");
        document.body.style.overflow = "auto";
    }

    showError(inputId, errorId) {
        document.getElementById(errorId).classList.remove("hidden");
        document.getElementById(inputId).classList.add("border-red-500");
    }

    clearError(inputId, errorId) {
        document.getElementById(errorId).classList.add("hidden");
        document.getElementById(inputId).classList.remove("border-red-500");
    }

    view(id) {
        const g = this.glossaryManager.getGlossary(id);
        if (!g) return;

        document.getElementById("viewGlossaryName").textContent = g.name;
        document.getElementById("viewGlossaryDescription").textContent = g.description;
        document.getElementById("viewGlossaryTermCount").textContent = g.terms.length;

        document.getElementById("openGlossaryBtn").onclick = () =>
            this.glossaryManager.redirectTo(id);

        this.open("viewGlossaryModal");
    }

    edit(id) {
        const g = this.glossaryManager.getGlossary(id);
        if (!g) return;
        this.glossaryManager.currentEditId = g.id;

        document.getElementById("editGlossaryNameInput").value = g.name;
        document.getElementById("editGlossaryDescriptionInput").value = g.description;

        this.open("editGlossaryModal");
    }

    render() {
        const glossaries = this.glossaryManager.getAll();
        const container = document.getElementById("glossariesContainer");
        const emptyState = document.getElementById("emptyState");

        const shorten = t => (t.length > 20 ? t.slice(0, 20) + "..." : t);

        if (glossaries.length === 0) {
            container.innerHTML = "";
            emptyState.classList.remove("hidden");
            return;
        }

        emptyState.classList.add("hidden");
        container.innerHTML = glossaries.map(
            (glossary) => `
                <div id="glossaryContainer${glossary.id}" class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer" onclick="redirectToGlossary(${glossary.id})">
                    <div class="flex justify-between items-start">
                        <div class="flex-1">
                            <h3 class="text-xl font-semibold text-gray-900 mb-2">
                                ${escapeHtml(shorten(glossary.name))}
                            </h3>
                            <p class="text-gray-600 text-sm">
                                ${escapeHtml(shorten(glossary.description))}
                            </p>
                        </div>
                        <div class="flex gap-2 ml-4" onclick="event.stopPropagation()">
                            <button
                                id="viewGlossaryBtn${glossary.id}"
                                class="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                                title="View"
                            >
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                                </svg>
                            </button>
                            <button
                                id="editGlossaryBtn${glossary.id}"
                                class="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                                title="Edit"
                            >
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                                </svg>
                            </button>
                            <button
                                id="deleteGlossaryBtn${glossary.id}"
                                class="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete"
                            >
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            `,
        ).join("");
        glossaries.forEach((glossary) => {
            document.getElementById("viewGlossaryBtn" + glossary.id).addEventListener("click", () => this.view(glossary.id));
            document.getElementById("editGlossaryBtn" + glossary.id).addEventListener("click", () => this.edit(glossary.id));
            document.getElementById("deleteGlossaryBtn" + glossary.id).addEventListener("click", () => this.deleteUtils.deleteGlossary(glossary.id, (updatedGlossaries) => {
                this.glossaryManager.glossaries = updatedGlossaries;
                this.glossaryManager.save();
                this.render();
            })
            );
            document.getElementById("glossaryContainer" + glossary.id).addEventListener("click", () => this.glossaryManager.redirectTo(glossary.id));
        });
    }
}
