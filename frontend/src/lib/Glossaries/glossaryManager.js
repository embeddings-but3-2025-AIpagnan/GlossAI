export class GlossaryManager {
    constructor() {
        this.currentEditId = null;
        this.glossaries = null;
        this.load();
    }

    load() {
        this.glossaries = JSON.parse(localStorage.getItem("glossaries")) || [];
        this.nextId = Math.max(...this.glossaries.map(g => g.id), 0) + 1;
    }

    save() {
        localStorage.setItem("glossaries", JSON.stringify(this.glossaries));
    }

    getAllGlossaries() {
        return this.glossaries;
    }

    getGlossary(id) {
        return this.glossaries.find(g => g.id === id);
    }

    createGlossary(name, description, terms) {
        const glossary = {
            id: this.nextId++,
            name,
            description,
            terms: []
        };
        if(terms) {
            glossary.terms = terms;
        }
        this.glossaries.push(glossary);
        this.save();
        return glossary;
    }

    updateGlossary(id, name, description) {
        const g = this.getGlossary(id);
        if (!g) return null;
        g.name = name;
        g.description = description;
        
        this.save();
        return g;
    }

    replaceAll(newList) {
        this.glossaries = newList;
        this.save();
    }

    getAllTerms(id) {
        return this.getGlossary(id).terms;
    }

    getTerm(idGlossary, idTerm) {
        return this.getAllTerms(idGlossary).find(t => t.id === idTerm);
    }

    createTerm(idGlossary, term, definition, synonyms = []) {
        const newTerm = {
            id: this.nextId++,
            term,
            definition,
            synonyms: Array.isArray(synonyms) ? synonyms : []
        };
        this.glossaries[idGlossary].push(newTerm);
        this.save();
        return newTerm;
    }

    updateTerm(idGlossary, idTerm, term, definition, synonyms = []) {
        this.glossaries[idGlossary].terms[idTerm] = {
            ...this.terms[idTerm],
            term,
            definition,
            synonyms: Array.isArray(synonyms) ? synonyms : []
        };
        
        this.save();
        return this.glossaries[idGlossary].terms[idTerm];
    }

    redirectTo(id) {
        window.location.href = `/glossary?id=${id}`;
    }
}