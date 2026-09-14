// =========================================================
// T-CHIT — TIMETABLE MANAGER
// =========================================================


const TimetableManager = {

    // -----------------------------------------------------
    // CREATE
    // -----------------------------------------------------

    create({
        academicYearId,
        classId,
        dayOfWeek,
        startTime,
        endTime,
        room = ""
    }) {

        if (!academicYearId) {
            throw new Error(
                "Academic year is required."
            );
        }

        if (!classId) {
            throw new Error(
                "Class is required."
            );
        }

        if (
            dayOfWeek === undefined ||
            dayOfWeek === null
        ) {
            throw new Error(
                "Day is required."
            );
        }

        if (!startTime || !endTime) {
            throw new Error(
                "Start and end times are required."
            );
        }

        if (startTime >= endTime) {
            throw new Error(
                "End time must be after start time."
            );
        }


        const entry = {

            id:
                Utils.createId("timetable"),

            academicYearId,

            classId,

            dayOfWeek,

            startTime,

            endTime,

            room:
                String(room || "").trim(),

            createdAt:
                new Date().toISOString()

        };


        AppState.data.timetable.push(
            entry
        );

        AppState.save();

        return entry;
    },


    // -----------------------------------------------------
    // GET BY ID
    // -----------------------------------------------------

    getById(id) {

        return AppState.data.timetable.find(
            entry =>
                entry.id === id
        ) || null;
    },


    // -----------------------------------------------------
    // GET ALL
    // -----------------------------------------------------

    getAll() {

        return AppState.data.timetable;
    },


    // -----------------------------------------------------
    // GET FOR ACADEMIC YEAR
    // -----------------------------------------------------

    getByAcademicYear(
        academicYearId
    ) {

        return AppState.data.timetable.filter(
            entry =>
                entry.academicYearId ===
                academicYearId
        );
    },


    // -----------------------------------------------------
    // GET FOR DAY
    // -----------------------------------------------------

    getByDay(
        academicYearId,
        dayOfWeek
    ) {

        return this.getByAcademicYear(
            academicYearId
        ).filter(
            entry =>
                entry.dayOfWeek ===
                dayOfWeek
        );
    },


    // -----------------------------------------------------
    // UPDATE
    // -----------------------------------------------------

    update(
        id,
        {
            classId,
            dayOfWeek,
            startTime,
            endTime,
            room = ""
        }
    ) {

        const entry =
            this.getById(id);

        if (!entry) {
            throw new Error(
                "Timetable entry not found."
            );
        }

        if (!classId) {
            throw new Error(
                "Class is required."
            );
        }

        if (
            dayOfWeek === undefined ||
            dayOfWeek === null
        ) {
            throw new Error(
                "Day is required."
            );
        }

        if (!startTime || !endTime) {
            throw new Error(
                "Start and end times are required."
            );
        }

        if (startTime >= endTime) {
            throw new Error(
                "End time must be after start time."
            );
        }


        entry.classId =
            classId;

        entry.dayOfWeek =
            dayOfWeek;

        entry.startTime =
            startTime;

        entry.endTime =
            endTime;

        entry.room =
            String(room || "").trim();


        AppState.save();

        return entry;
    },


    // -----------------------------------------------------
    // DELETE
    // -----------------------------------------------------

    delete(id) {

        AppState.data.timetable =
            AppState.data.timetable.filter(
                entry =>
                    entry.id !== id
            );

        AppState.save();
    }

};