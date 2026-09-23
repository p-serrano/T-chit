// =========================================================
// T-CHIT — ASSESSMENT ACTIVITY MANAGER
// =========================================================


const AssessmentActivityManager = {

    // -----------------------------------------------------
    // NORMALIZE SPECIFIC COMPETENCES
    // -----------------------------------------------------

    normalizeSpecificCompetences(
        specificCompetences = []
    ) {

        if (!Array.isArray(specificCompetences)) {
            return [];
        }

        const normalized = specificCompetences
            .map(item => {

                const specificCompetenceId =
                    String(
                        item.specificCompetenceId || ""
                    ).trim();

                if (!specificCompetenceId) {
                    return null;
                }

                return {
                    specificCompetenceId,

                    weight: this.normalizeWeight(
                        item.weight
                    )
                };

            })
            .filter(Boolean);


        // Prevent the same CE from being added twice.
        const unique = [];

        normalized.forEach(item => {

            const alreadyExists =
                unique.some(
                    existing =>
                        existing.specificCompetenceId ===
                        item.specificCompetenceId
                );

            if (!alreadyExists) {
                unique.push(item);
            }

        });

        return unique;
    },


    // -----------------------------------------------------
    // NORMALIZE BASIC KNOWLEDGE
    // -----------------------------------------------------

    normalizeBasicKnowledgeIds(
        basicKnowledgeIds = []
    ) {

        if (!Array.isArray(basicKnowledgeIds)) {
            return [];
        }

        return [
            ...new Set(
                basicKnowledgeIds
                    .map(
                        id =>
                            String(
                                id || ""
                            ).trim()
                    )
                    .filter(Boolean)
            )
        ];

    },


    // -----------------------------------------------------
    // NORMALIZE WEIGHT
    // -----------------------------------------------------

    normalizeWeight(
        weight = 0
    ) {

        const value =
            Number(weight);

        if (!Number.isFinite(value)) {
            return 0;
        }

        return Math.min(
            100,
            Math.max(
                0,
                value
            )
        );

    },


    // -----------------------------------------------------
    // NORMALIZE EVALUATIONS
    // -----------------------------------------------------

    normalizeEvaluations(
        evaluations = []
    ) {

        if (!Array.isArray(evaluations)) {
            return [];
        }

        const validEvaluators = [
            "teacher",
            "self",
            "peer"
        ];

        const normalized = evaluations
            .map(item => {

                const evaluator =
                    String(
                        item.evaluator || ""
                    ).trim();

                const instrumentId =
                    String(
                        item.instrumentId || ""
                    ).trim();

                if (
                    !validEvaluators.includes(evaluator) ||
                    !instrumentId
                ) {
                    return null;
                }

                return {
                    evaluator,
                    instrumentId
                };

            })
            .filter(Boolean);


        // Only one instrument per evaluator.
        const unique = [];

        normalized.forEach(item => {

            const alreadyExists =
                unique.some(
                    existing =>
                        existing.evaluator ===
                        item.evaluator
                );

            if (!alreadyExists) {
                unique.push(item);
            }

        });

        return unique;
    },


    // -----------------------------------------------------
    // CREATE
    // -----------------------------------------------------

    create({
        lessonId,
        title,
        evaluations = [],
        specificCompetences = [],
        basicKnowledgeIds = []
    }) {

        if (!lessonId) {

            throw new Error(
                "Lesson is required."
            );

        }


        const lesson =
            AppState.data.lessons.find(
                item =>
                    item.id === lessonId
            );


        if (!lesson) {

            throw new Error(
                "Lesson not found."
            );

        }


        title =
            String(
                title || ""
            ).trim();


        if (!title) {

            throw new Error(
                "Assessment activity title cannot be empty."
            );

        }


        const normalizedCompetences =
            this.normalizeSpecificCompetences(
                specificCompetences
            );


        if (!normalizedCompetences.length) {

            throw new Error(
                "At least one specific competence is required."
            );

        }

        const normalizedEvaluations =
            this.normalizeEvaluations(
                evaluations
            );


        const normalizedKnowledge =
            this.normalizeBasicKnowledgeIds(
                basicKnowledgeIds
            );


        const now =
            new Date().toISOString();


        const activity = {

            id:
                Utils.createId(
                    "assessment"
                ),

            lessonId,

            title,

            evaluations:
                normalizedEvaluations,

            specificCompetences:
                normalizedCompetences,

            basicKnowledgeIds:
                normalizedKnowledge,

            createdAt:
                now,

            updatedAt:
                now

        };


        AppState.data.assessmentActivities.push(
            activity
        );


        AppState.save();


        return activity;

    },


    // -----------------------------------------------------
    // GET BY ID
    // -----------------------------------------------------

    getById(id) {

        return AppState
            .data
            .assessmentActivities
            .find(
                activity =>
                    activity.id === id
            ) || null;

    },


    // -----------------------------------------------------
    // GET BY LESSON
    // -----------------------------------------------------

    getByLessonId(
        lessonId
    ) {

        return AppState
            .data
            .assessmentActivities
            .filter(
                activity =>
                    activity.lessonId ===
                    lessonId
            );

    },


    // -----------------------------------------------------
    // GET BY CLASS
    // -----------------------------------------------------

    getByClassId(
        classId
    ) {

        const lessonIds =
            AppState
                .data
                .lessons
                .filter(
                    lesson =>
                        lesson.classId ===
                        classId
                )
                .map(
                    lesson =>
                        lesson.id
                );


        return AppState
            .data
            .assessmentActivities
            .filter(
                activity =>
                    lessonIds.includes(
                        activity.lessonId
                    )
            );

    },


    // -----------------------------------------------------
    // GET BY ACADEMIC YEAR
    // -----------------------------------------------------

    getByAcademicYearId(
        academicYearId
    ) {

        const lessonIds =
            AppState
                .data
                .lessons
                .filter(
                    lesson =>
                        lesson.academicYearId ===
                        academicYearId
                )
                .map(
                    lesson =>
                        lesson.id
                );


        return AppState
            .data
            .assessmentActivities
            .filter(
                activity =>
                    lessonIds.includes(
                        activity.lessonId
                    )
            );

    },


    // -----------------------------------------------------
    // GET ALL
    // -----------------------------------------------------

    getAll() {

        return AppState
            .data
            .assessmentActivities;

    },


    // -----------------------------------------------------
    // UPDATE
    // -----------------------------------------------------

    update(
        id,
        {
            lessonId,
            title,
            evaluations,
            specificCompetences,
            basicKnowledgeIds
        }
    ) {

        const activity =
            this.getById(id);


        if (!activity) {

            throw new Error(
                "Assessment activity not found."
            );

        }


        // ---------------------------------------------
        // LESSON
        // ---------------------------------------------

        if (
            lessonId !== undefined
        ) {

            const lesson =
                AppState
                    .data
                    .lessons
                    .find(
                        item =>
                            item.id ===
                            lessonId
                    );


            if (!lesson) {

                throw new Error(
                    "Lesson not found."
                );

            }


            activity.lessonId =
                lessonId;

        }


        // ---------------------------------------------
        // TITLE
        // ---------------------------------------------

        if (
            title !== undefined
        ) {

            const cleanTitle =
                String(
                    title || ""
                ).trim();


            if (!cleanTitle) {

                throw new Error(
                    "Assessment activity title cannot be empty."
                );

            }


            activity.title =
                cleanTitle;

        }

        
        // ---------------------------------------------
        // EVALUATIONS
        // ---------------------------------------------

        if (
            evaluations !== undefined
        ) {

            activity.evaluations =
                this.normalizeEvaluations(
                    evaluations
                );

        }


        // ---------------------------------------------
        // SPECIFIC COMPETENCES
        // ---------------------------------------------

        if (
            specificCompetences !== undefined
        ) {

            const normalizedCompetences =
                this.normalizeSpecificCompetences(
                    specificCompetences
                );


            if (!normalizedCompetences.length) {

                throw new Error(
                    "At least one specific competence is required."
                );

            }


            activity.specificCompetences =
                normalizedCompetences;

        }


        // ---------------------------------------------
        // BASIC KNOWLEDGE
        // ---------------------------------------------

        if (
            basicKnowledgeIds !== undefined
        ) {

            activity.basicKnowledgeIds =
                this.normalizeBasicKnowledgeIds(
                    basicKnowledgeIds
                );

        }


        activity.updatedAt =
            new Date().toISOString();


        AppState.save();


        return activity;

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


        // Delete the activity.

        AppState.data.assessmentActivities =
            AppState
                .data
                .assessmentActivities
                .filter(
                    activity =>
                        activity.id !== id
                );


        // Delete all grades/results
        // belonging to this activity.

        AppState.data.assessmentResults =
            AppState
                .data
                .assessmentResults
                .filter(
                    result =>
                        result.assessmentActivityId !==
                        id
                );


        AppState.save();

    }

};