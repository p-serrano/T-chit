// =========================================================
// T-CHIT — CALENDAR MANAGER
// =========================================================


// ---------------------------------------------------------
// CALENDAR MANAGER
// ---------------------------------------------------------

const CalendarManager = {

    // -----------------------------------------------------
    // CREATE
    // -----------------------------------------------------

    create({
        academicYearId,
        date,
        type,
        title = "",
        description = "",
        allDay = true
    }) {

        if (!academicYearId) {
            throw new Error(
                "Academic year is required."
            );
        }

        if (!date) {
            throw new Error(
                "Calendar event date is required."
            );
        }

        if (!type) {
            throw new Error(
                "Calendar event type is required."
            );
        }


        const now =
            new Date().toISOString();


        const event = {

            id:
                Utils.createId("event"),

            academicYearId,

            date,

            type,

            title:
                String(title || "").trim(),

            description:
                String(description || "").trim(),

            allDay:

                allDay !== false,

            createdAt:
                now,

            updatedAt:
                now
        };


        AppState.data.calendarEvents.push(
            event
        );


        AppState.save();


        return event;
    },


    // -----------------------------------------------------
    // UPDATE
    // -----------------------------------------------------

    update(
        id,
        {
            academicYearId,
            date,
            type,
            title,
            description,
            allDay
        }
    ) {

        const event =
            this.getById(id);


        if (!event) {
            throw new Error(
                "Calendar event not found."
            );
        }


        if (academicYearId !== undefined) {
            event.academicYearId =
                academicYearId;
        }


        if (date !== undefined) {
            event.date =
                date;
        }


        if (type !== undefined) {
            event.type =
                type;
        }


        if (title !== undefined) {
            event.title =
                String(title || "").trim();
        }


        if (description !== undefined) {
            event.description =
                String(description || "").trim();
        }


        if (allDay !== undefined) {
            event.allDay =
                allDay !== false;
        }


        event.updatedAt =
            new Date().toISOString();


        AppState.save();


        return event;
    },


    // -----------------------------------------------------
    // GET BY ID
    // -----------------------------------------------------

    getById(id) {

        return (
            AppState.data.calendarEvents
                .find(event => event.id === id)
            || null
        );
    },


    // -----------------------------------------------------
    // GET ALL
    // -----------------------------------------------------

    getAll() {

        return (
            AppState.data.calendarEvents
            || []
        );
    },


    // -----------------------------------------------------
    // GET BY ACADEMIC YEAR
    // -----------------------------------------------------

    getByAcademicYearId(
        academicYearId
    ) {

        return (
            this.getAll()
                .filter(event =>
                    event.academicYearId ===
                    academicYearId
                )
        );
    },


    // -----------------------------------------------------
    // GET BY DATE
    // -----------------------------------------------------

    getByDate(
        academicYearId,
        date
    ) {

        return (
            this.getByAcademicYearId(
                academicYearId
            )
            .filter(event =>
                event.date === date
            )
        );
    },


    // -----------------------------------------------------
    // GET BY DATE RANGE
    // -----------------------------------------------------

    getByDateRange(
        academicYearId,
        startDate,
        endDate
    ) {

        return (
            this.getByAcademicYearId(
                academicYearId
            )
            .filter(event =>
                event.date >= startDate &&
                event.date <= endDate
            )
        );
    },


    // -----------------------------------------------------
    // GET BY TYPE
    // -----------------------------------------------------

    getByType(
        academicYearId,
        type
    ) {

        return (
            this.getByAcademicYearId(
                academicYearId
            )
            .filter(event =>
                event.type === type
            )
        );
    },


    // -----------------------------------------------------
    // DELETE
    // -----------------------------------------------------

    delete(id) {

        AppState.data.calendarEvents =
            this.getAll()
                .filter(event =>
                    event.id !== id
                );


        AppState.save();
    }

};