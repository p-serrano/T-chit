const AssessmentActivityManager = {

    // ----------------------------------------
    // Normalize activity data
    // ----------------------------------------

    normalizeCriteria(criteria = []) {

        if (!Array.isArray(criteria)) {
            return [];
        }

        return criteria
            .map(item => ({
                criterionId:
                    String(item.criterionId || "").trim(),

                weight:
                    Number.isFinite(Number(item.weight))
                        ? Number(item.weight)
                        : 0
            }))
            .filter(
                item => item.criterionId
            );
    },


    normalizeBasicKnowledgeIds(
        basicKnowledgeIds = []
    ) {

        if (!Array.isArray(basicKnowledgeIds)) {
            return [];
        }

        return [
            ...new Set(
                basicKnowledgeIds
                    .map(id =>
                        String(id || "").trim()
                    )
                    .filter(Boolean)
            )
        ];
    },


    // ----------------------------------------
    // Create
    // ----------------------------------------

    create({
        lessonId,
        title,
        instrumentId = null,
        criteria = [],
        basicKnowledgeIds = []
    }) {

        if (!lessonId) {
            throw new Error(
                "Lesson is required."
            );
        }

        const lesson =
            AppState.data.lessons.find(
                item => item.id === lessonId
            );

        if (!lesson) {
            throw new Error(
                "Lesson not found."
            );
        }


        title =
            String(title || "").trim();

        if (!title) {
            throw new Error(
                "Assessment activity title cannot be empty."
            );
        }


        const normalizedCriteria =
            this.normalizeCriteria(criteria);

        if (!normalizedCriteria.length) {
            throw new Error(
                "At least one assessment criterion is required."
            );
        }


        const normalizedKnowledge =
            this.normalizeBasicKnowledgeIds(
                basicKnowledgeIds
            );


        const now =
            new Date().toISOString();


        const activity = {

            id: Utils.createId(
                "assessment"
            ),

            lessonId,

            title,

            instrumentId:
                instrumentId || null,

            criteria:
                normalizedCriteria,

            basicKnowledgeIds:
                normalizedKnowledge,

            createdAt: now,
            updatedAt: now
        };


        AppState.data.assessmentActivities
            .push(activity);

        AppState.save();

        return activity;
    },


    // ----------------------------------------
    // Get by ID
    // ----------------------------------------

    getById(id) {

        return AppState.data.assessmentActivities
            .find(
                activity =>
                    activity.id === id
            ) || null;
    },


    // ----------------------------------------
    // Get by lesson
    // ----------------------------------------

    getByLessonId(lessonId) {

        return AppState.data.assessmentActivities
            .filter(
                activity =>
                    activity.lessonId === lessonId
            );
    },


    // ----------------------------------------
    // Update
    // ----------------------------------------

    update(id, {
        lessonId,
        title,
        instrumentId,
        criteria,
        basicKnowledgeIds
    }) {

        const activity =
            this.getById(id);

        if (!activity) {
            throw new Error(
                "Assessment activity not found."
            );
        }


        if (lessonId !== undefined) {

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

            activity.lessonId =
                lessonId;
        }


        if (title !== undefined) {

            const cleanTitle =
                String(title || "").trim();

            if (!cleanTitle) {
                throw new Error(
                    "Assessment activity title cannot be empty."
                );
            }

            activity.title =
                cleanTitle;
        }


        if (instrumentId !== undefined) {

            activity.instrumentId =
                instrumentId || null;
        }


        if (criteria !== undefined) {

            const normalizedCriteria =
                this.normalizeCriteria(
                    criteria
                );

            if (!normalizedCriteria.length) {
                throw new Error(
                    "At least one assessment criterion is required."
                );
            }

            activity.criteria =
                normalizedCriteria;
        }


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


    // ----------------------------------------
    // Delete
    // ----------------------------------------

    delete(id) {

        const exists =
            this.getById(id);

        if (!exists) {
            return;
        }


        AppState.data.assessmentActivities =
            AppState.data.assessmentActivities
                .filter(
                    activity =>
                        activity.id !== id
                );


        // Remove associated results too.
        AppState.data.assessmentResults =
            AppState.data.assessmentResults
                .filter(
                    result =>
                        result.assessmentActivityId !== id
                );


        AppState.save();
    }

};