// =========================================================
// T-CHIT — ACTIVITY NOTE MANAGER
// =========================================================


const ActivityNoteManager = {

    // -----------------------------------------------------
    // CREATE
    // -----------------------------------------------------

    create({
        academicYearId,
        timetableEntryId,
        classId,
        date,
        note = ""
    }) {

        if (!academicYearId) {
            throw new Error(
                "ActivityNoteManager.create: academicYearId is required."
            );
        }

        if (!timetableEntryId) {
            throw new Error(
                "ActivityNoteManager.create: timetableEntryId is required."
            );
        }

        if (!classId) {
            throw new Error(
                "ActivityNoteManager.create: classId is required."
            );
        }

        if (!date) {
            throw new Error(
                "ActivityNoteManager.create: date is required."
            );
        }


        const existing =
            this.getByTimetableEntryAndDate(
                timetableEntryId,
                date
            );


        // If a note already exists for this occurrence,
        // update it instead of creating a duplicate.

        if (existing) {

            existing.note =
                String(note || "").trim();

            existing.updatedAt =
                new Date().toISOString();

            AppState.save();

            return existing;
        }


        const now =
            new Date().toISOString();


        const newNote = {

            id:
                Utils.createId("activityNote"),

            academicYearId,

            timetableEntryId,

            classId,

            date,

            note:
                String(note || "").trim(),

            createdAt: now,

            updatedAt: now
        };


        AppState.data.activityNotes.push(
            newNote
        );


        AppState.save();


        return newNote;
    },


    // -----------------------------------------------------
    // GET BY ID
    // -----------------------------------------------------

    getById(id) {

        return AppState.data.activityNotes.find(
            item => item.id === id
        ) || null;
    },


    // -----------------------------------------------------
    // GET ALL
    // -----------------------------------------------------

    getAll() {

        return AppState.data.activityNotes;
    },


    // -----------------------------------------------------
    // GET BY ACADEMIC YEAR
    // -----------------------------------------------------

    getByAcademicYear(academicYearId) {

        return AppState.data.activityNotes.filter(
            item =>
                item.academicYearId === academicYearId
        );
    },


    // -----------------------------------------------------
    // GET BY TIMETABLE ENTRY + DATE
    // -----------------------------------------------------

    getByTimetableEntryAndDate(
        timetableEntryId,
        date
    ) {

        return AppState.data.activityNotes.find(
            item =>
                item.timetableEntryId === timetableEntryId &&
                item.date === date
        ) || null;
    },


    // -----------------------------------------------------
    // GET BY DATE
    // -----------------------------------------------------

    getByDate(
        academicYearId,
        date
    ) {

        return AppState.data.activityNotes.filter(
            item =>
                item.academicYearId === academicYearId &&
                item.date === date
        );
    },


    // -----------------------------------------------------
    // UPDATE
    // -----------------------------------------------------

    update(
        id,
        {
            note = ""
        }
    ) {

        const item =
            this.getById(id);


        if (!item) {
            throw new Error(
                "ActivityNoteManager.update: note not found."
            );
        }


        item.note =
            String(note || "").trim();

        item.updatedAt =
            new Date().toISOString();


        AppState.save();


        return item;
    },


    // -----------------------------------------------------
    // DELETE
    // -----------------------------------------------------

    delete(id) {

        const exists =
            this.getById(id);


        if (!exists) {
            return false;
        }


        AppState.data.activityNotes =
            AppState.data.activityNotes.filter(
                item => item.id !== id
            );


        AppState.save();


        return true;
    }

};