// =========================================================
// T-CHIT — LESSON MANAGER
// =========================================================


const LessonManager = {

    // -----------------------------------------------------
    // ASSESSMENT DEFAULTS
    // -----------------------------------------------------

    normalizeAssessment(
        assessment = {}
    ) {

        return {

            isEvaluable:
                assessment.isEvaluable === true,

            title:
                String(
                    assessment.title || ""
                ).trim(),

            instruments:
                Array.isArray(
                    assessment.instruments
                )
                    ? [...assessment.instruments]
                    : [],

            competences:
                Array.isArray(
                    assessment.competences
                )
                    ? [...assessment.competences]
                    : []

        };

    },


    // -----------------------------------------------------
    // CREATE
    // -----------------------------------------------------

    create({
        academicYearId,
        classId,
        date,
        title = "",
        notes = "",
        status = "planned",
        assessment = {}
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


        if (!date) {

            throw new Error(
                "Date is required."
            );

        }


        const lesson = {

            id:
                Utils.createId("lesson"),

            academicYearId,

            classId,

            date,

            title:
                String(
                    title || ""
                ).trim(),

            notes:
                String(
                    notes || ""
                ).trim(),

            status,

            assessment:
                this.normalizeAssessment(
                    assessment
                ),

            createdAt:
                new Date().toISOString(),

            updatedAt:
                new Date().toISOString()

        };


        AppState.data.lessons.push(
            lesson
        );

        AppState.save();

        return lesson;

    },


    // -----------------------------------------------------
    // GET BY ID
    // -----------------------------------------------------

    getById(id) {

        const lesson =
            AppState.data.lessons.find(
                lesson =>
                    lesson.id === id
            );


        if (!lesson) {
            return null;
        }


        // Compatibility with older lessons

        lesson.assessment =
            this.normalizeAssessment(
                lesson.assessment
            );


        return lesson;

    },


    // -----------------------------------------------------
    // GET ALL
    // -----------------------------------------------------

    getAll() {

        return AppState.data.lessons.map(
            lesson => {

                lesson.assessment =
                    this.normalizeAssessment(
                        lesson.assessment
                    );

                return lesson;

            }
        );

    },


    // -----------------------------------------------------
    // GET BY ACADEMIC YEAR
    // -----------------------------------------------------

    getByAcademicYear(
        academicYearId
    ) {

        return AppState.data.lessons
            .filter(
                lesson =>
                    lesson.academicYearId ===
                    academicYearId
            )
            .map(
                lesson => {

                    lesson.assessment =
                        this.normalizeAssessment(
                            lesson.assessment
                        );

                    return lesson;

                }
            );

    },


    // -----------------------------------------------------
    // GET BY DATE
    // -----------------------------------------------------

    getByDate(
        academicYearId,
        date
    ) {

        return AppState.data.lessons
            .filter(
                lesson =>
                    lesson.academicYearId ===
                        academicYearId &&
                    lesson.date === date
            )
            .map(
                lesson => {

                    lesson.assessment =
                        this.normalizeAssessment(
                            lesson.assessment
                        );

                    return lesson;

                }
            );

    },


    // -----------------------------------------------------
    // GET BY CLASS
    // -----------------------------------------------------

    getByClass(
        classId
    ) {

        return AppState.data.lessons
            .filter(
                lesson =>
                    lesson.classId === classId
            )
            .map(
                lesson => {

                    lesson.assessment =
                        this.normalizeAssessment(
                            lesson.assessment
                        );

                    return lesson;

                }
            );

    },


    // -----------------------------------------------------
    // UPDATE
    // -----------------------------------------------------

    update(
        id,
        data
    ) {

        const lesson =
            this.getById(id);


        if (!lesson) {

            throw new Error(
                "Lesson not found."
            );

        }


        if (
            data.classId !== undefined
        ) {

            lesson.classId =
                data.classId;

        }


        if (
            data.date !== undefined
        ) {

            lesson.date =
                data.date;

        }


        if (
            data.title !== undefined
        ) {

            lesson.title =
                String(
                    data.title || ""
                ).trim();

        }


        if (
            data.notes !== undefined
        ) {

            lesson.notes =
                String(
                    data.notes || ""
                ).trim();

        }


        if (
            data.status !== undefined
        ) {

            lesson.status =
                data.status;

        }


        if (
            data.assessment !== undefined
        ) {

            lesson.assessment =
                this.normalizeAssessment(
                    data.assessment
                );

        }
        else {

            lesson.assessment =
                this.normalizeAssessment(
                    lesson.assessment
                );

        }


        lesson.updatedAt =
            new Date().toISOString();


        AppState.save();

        return lesson;

    },


    // -----------------------------------------------------
    // DELETE
    // -----------------------------------------------------

    delete(id) {

        const exists =
            this.getById(id);


        if (!exists) {
            return;
        }


        // ---------------------------------------------
        // DELETE LINKED ASSESSMENT ACTIVITIES
        // ---------------------------------------------

        if (
            typeof AssessmentActivityManager !==
            "undefined"
        ) {

            const activities =
                AssessmentActivityManager
                    .getByLessonId(id);


            activities.forEach(
                activity => {

                    AssessmentActivityManager
                        .delete(
                            activity.id
                        );

                }
            );

        }


        // ---------------------------------------------
        // DELETE LESSON
        // ---------------------------------------------

        AppState.data.lessons =
            AppState.data.lessons.filter(
                lesson =>
                    lesson.id !== id
            );


        AppState.save();

    }

};