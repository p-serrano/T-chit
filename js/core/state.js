// =========================================================
// T-CHIT — STATE
// =========================================================


const AppState = {

    // -----------------------------------------------------
    // DATA
    // -----------------------------------------------------

    data: null,


    // -----------------------------------------------------
    // CURRENT CONTEXT
    // -----------------------------------------------------

    currentAcademicYearId: null,

    currentClassId: null,

    currentStudentId: null,

    currentView: "dashboard",


    // -----------------------------------------------------
    // INIT
    // -----------------------------------------------------

    init() {

        this.data =
            Storage.load();


        this.restoreContext();


        console.log(
            "T-chit state initialized."
        );

    },


    // -----------------------------------------------------
    // syncFromCloud
    // -----------------------------------------------------
    async syncFromCloud() {

        if (
            typeof SupabaseSync === "undefined"
        ) {
            console.warn(
                "T-chit: SupabaseSync not available."
            );
            return false;
        }

        const remote =
            await SupabaseSync.load();

        if (!remote || !remote.data) {
            console.log(
                "T-chit: no remote data available."
            );
            return false;
        }

        this.data = remote.data;

        Storage.save(this.data);

        console.log(
            "T-chit: data synchronized from Supabase."
        );

        return true;
    },


    // -----------------------------------------------------
    // SAVE
    // -----------------------------------------------------

    save() {

        Storage.save(this.data);

        if (
            typeof SupabaseSync !== "undefined"
        ) {
            SupabaseSync.save(this.data);
        }

    },


    // -----------------------------------------------------
    // SAVE CONTEXT
    // -----------------------------------------------------

    saveContext() {

        const context = {

            currentAcademicYearId:
                this.currentAcademicYearId,

            currentClassId:
                this.currentClassId,

            currentStudentId:
                this.currentStudentId,

            currentView:
                this.currentView

        };


        localStorage.setItem(
            "tchit_context",
            JSON.stringify(context)
        );

    },


    // -----------------------------------------------------
    // RESTORE CONTEXT
    // -----------------------------------------------------

    restoreContext() {

        try {

            const raw =
                localStorage.getItem(
                    "tchit_context"
                );


            if (!raw) {
                return;
            }


            const context =
                JSON.parse(raw);


            this.currentAcademicYearId =
                context.currentAcademicYearId ||
                null;


            this.currentClassId =
                context.currentClassId ||
                null;


            this.currentStudentId =
                context.currentStudentId ||
                null;


            this.currentView =
                context.currentView ||
                "dashboard";

        }
        catch (error) {

            console.warn(
                "T-chit: failed to restore context.",
                error
            );

        }

    },


    // -----------------------------------------------------
    // CURRENT ACADEMIC YEAR
    // -----------------------------------------------------

    getCurrentAcademicYear() {

        if (
            !this.currentAcademicYearId
        ) {
            return null;
        }


        return this.data.academicYears.find(
            year =>
                year.id ===
                this.currentAcademicYearId
        ) || null;

    },


    // -----------------------------------------------------
    // CURRENT CLASS
    // -----------------------------------------------------

    getCurrentClass() {

        if (
            !this.currentClassId
        ) {
            return null;
        }


        return this.data.classes.find(
            classItem =>
                classItem.id ===
                this.currentClassId
        ) || null;

    },


    // -----------------------------------------------------
    // CURRENT STUDENT
    // -----------------------------------------------------

    getCurrentStudent() {

        if (
            !this.currentStudentId
        ) {
            return null;
        }


        return this.data.students.find(
            student =>
                student.id ===
                this.currentStudentId
        ) || null;

    }

};