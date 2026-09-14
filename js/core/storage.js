// ----------------------------------------
// T-CHIT — storage.js
// ----------------------------------------

const Storage = {

    STORAGE_KEY: "tchit_data",

    // ------------------------------------
    // Default database
    // ------------------------------------

    getDefaultData() {

        return {
            version: 5,

            academicYears: [],
            calendarEvents: [],

            classes: [],
            curricula: [],

            students: [],
            enrollments: [],

            timetable: [],
            lessons: [],

            assessmentActivities: [],
            assessmentResults: [],
            assessmentInstruments: [],

            attendance: []
        };
    },


    // ------------------------------------
    // Load
    // ------------------------------------

    load() {

        try {

            const raw =
                localStorage.getItem(this.STORAGE_KEY);

            if (!raw) {

                const data =
                    this.getDefaultData();

                this.save(data);

                return data;
            }

            const data =
                JSON.parse(raw);

            return this.migrate(data);

        } catch (error) {

            console.error(
                "T-chit Storage: failed to load data",
                error
            );

            return this.getDefaultData();
        }
    },


    // ------------------------------------
    // Save
    // ------------------------------------

    save(data) {

        try {

            localStorage.setItem(
                this.STORAGE_KEY,
                JSON.stringify(data)
            );

        } catch (error) {

            console.error(
                "T-chit Storage: failed to save data",
                error
            );
        }
    },


    // ------------------------------------
    // Migration system
    // ------------------------------------

    migrate(data) {

        // --------------------------------
        // Base version
        // --------------------------------

        if (!data.version) {
            data.version = 1;
        }


        // --------------------------------
        // Existing collections
        // --------------------------------

        if (!Array.isArray(data.academicYears)) {
            data.academicYears = [];
        }

        if (!Array.isArray(data.classes)) {
            data.classes = [];
        }

        if (!Array.isArray(data.students)) {
            data.students = [];
        }

        if (!Array.isArray(data.enrollments)) {
            data.enrollments = [];
        }

        if (!Array.isArray(data.timetable)) {
            data.timetable = [];
        }

        if (!Array.isArray(data.lessons)) {
            data.lessons = [];
        }

        if (!Array.isArray(data.attendance)) {
            data.attendance = [];
        }


        // --------------------------------
        // v5 — Academic / Assessment base
        // --------------------------------

        if (!Array.isArray(data.calendarEvents)) {
            data.calendarEvents = [];
        }

        if (!Array.isArray(data.curricula)) {
            data.curricula = [];
        }

        if (!Array.isArray(data.assessmentActivities)) {
            data.assessmentActivities = [];
        }

        if (!Array.isArray(data.assessmentResults)) {
            data.assessmentResults = [];
        }

        if (!Array.isArray(data.assessmentInstruments)) {
            data.assessmentInstruments = [];
        }


        // --------------------------------
        // Class compatibility
        // --------------------------------

        data.classes.forEach(classItem => {

            if (
                classItem.curriculumId === undefined
            ) {
                classItem.curriculumId = null;
            }

        });


        // --------------------------------
        // Academic year compatibility
        // --------------------------------

        data.academicYears.forEach(year => {

            if (
                year.startDate === undefined
            ) {
                year.startDate = "";
            }

            if (
                year.endDate === undefined
            ) {
                year.endDate = "";
            }

            if (
                !Array.isArray(year.terms)
            ) {
                year.terms = [];
            }

            if (
                year.updatedAt === undefined
            ) {
                year.updatedAt =
                    year.createdAt ||
                    new Date().toISOString();
            }

        });


        // --------------------------------
        // Final version
        // --------------------------------

        data.version = 5;

        return data;
    },


    // ------------------------------------
    // Reset
    // ------------------------------------

    reset() {

        localStorage.removeItem(
            this.STORAGE_KEY
        );

        console.log(
            "T-chit data reset."
        );
    }
};