// ----------------------------------------
// T-CHIT — academicYearManager.js
// ----------------------------------------

const AcademicYearManager = {

    // ------------------------------------
    // Create
    // ------------------------------------

    create({
        name,
        startDate = "",
        endDate = "",
        terms = []
    }) {
        name = String(name || "").trim();

        if (!name) {
            throw new Error("Academic year name cannot be empty.");
        }

        const year = {
            id: Utils.createId("year"),
            name,
            startDate,
            endDate,
            terms: Array.isArray(terms) ? terms : [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        AppState.data.academicYears.push(year);
        AppState.save();

        return year;
    },


    update(id, {
        name,
        startDate,
        endDate,
        terms
    }) {
        const year = this.getById(id);

        if (!year) {
            throw new Error("Academic year not found.");
        }

        if (name !== undefined) {
            const cleanName = String(name || "").trim();

            if (!cleanName) {
                throw new Error("Academic year name cannot be empty.");
            }

            year.name = cleanName;
        }

        if (startDate !== undefined) {
            year.startDate = startDate;
        }

        if (endDate !== undefined) {
            year.endDate = endDate;
        }

        if (terms !== undefined) {
            year.terms = Array.isArray(terms) ? terms : [];
        }

        year.updatedAt = new Date().toISOString();

        AppState.save();

        return year;
    },

    // ------------------------------------
    // Get by ID
    // ------------------------------------

    getById(id) {

        return AppState.data.academicYears.find(
            year =>
                year.id === id
        ) || null;
    },


    // ------------------------------------
    // Get term by ID
    // ------------------------------------

    getTermById(
        academicYearId,
        termId
    ) {

        const year =
            this.getById(
                academicYearId
            );


        if (!year) {
            return null;
        }


        const terms =
            Array.isArray(year.terms)
                ? year.terms
                : [];


        return terms.find(
            term =>
                term.id === termId
        ) || null;

    },


    // ------------------------------------
    // Get term by date
    // ------------------------------------

    getTermByDate(
        academicYearId,
        date
    ) {

        const year =
            this.getById(
                academicYearId
            );


        if (!year || !date) {
            return null;
        }


        const terms =
            Array.isArray(year.terms)
                ? year.terms
                : [];


        return terms.find(
            term =>
                term.startDate &&
                term.endDate &&
                date >= term.startDate &&
                date <= term.endDate
        ) || null;

    },


    // ------------------------------------
    // Get all
    // ------------------------------------

    getAll() {

        return AppState.data.academicYears;
    },


    // ------------------------------------
    // Set active
    // ------------------------------------

    setActive(id) {

        const year =
            this.getById(id);

        if (!year) {
            return null;
        }

        AppState.currentAcademicYearId =
            id;

        AppState.saveContext();

        return year;
    },


    // ------------------------------------
    // Delete
    // ------------------------------------

    delete(id) {

        AppState.data.academicYears =
            AppState.data.academicYears.filter(
                year =>
                    year.id !== id
            );

        AppState.save();
    }
};