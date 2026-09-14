const AssessmentResultManager = {

    // ----------------------------------------
    // Create
    // ----------------------------------------

    create({
        assessmentActivityId,
        studentId,
        criterionId,
        value
    }) {

        if (!assessmentActivityId) {
            throw new Error(
                "Assessment activity is required."
            );
        }

        if (!studentId) {
            throw new Error(
                "Student is required."
            );
        }

        if (!criterionId) {
            throw new Error(
                "Assessment criterion is required."
            );
        }


        const activity =
            AppState.data.assessmentActivities.find(
                item =>
                    item.id === assessmentActivityId
            );

        if (!activity) {
            throw new Error(
                "Assessment activity not found."
            );
        }


        const student =
            AppState.data.students.find(
                item =>
                    item.id === studentId
            );

        if (!student) {
            throw new Error(
                "Student not found."
            );
        }


        const criterionBelongsToActivity =
            activity.criteria.some(
                criterion =>
                    criterion.criterionId === criterionId
            );

        if (!criterionBelongsToActivity) {
            throw new Error(
                "Criterion is not linked to this assessment activity."
            );
        }


        const normalizedValue =
            Number(value);

        if (
            !Number.isFinite(normalizedValue) ||
            normalizedValue < 0 ||
            normalizedValue > 10
        ) {
            throw new Error(
                "Assessment value must be between 0 and 10."
            );
        }


        // There should only be one result
        // per student / activity / criterion.

        const existing =
            this.getByStudentActivityCriterion(
                studentId,
                assessmentActivityId,
                criterionId
            );


        if (existing) {

            existing.value =
                normalizedValue;

            existing.updatedAt =
                new Date().toISOString();

            AppState.save();

            return existing;
        }


        const now =
            new Date().toISOString();


        const result = {

            id: Utils.createId(
                "assessmentResult"
            ),

            assessmentActivityId,

            studentId,

            criterionId,

            value:
                normalizedValue,

            createdAt: now,
            updatedAt: now
        };


        AppState.data.assessmentResults
            .push(result);

        AppState.save();

        return result;
    },


    // ----------------------------------------
    // Get by ID
    // ----------------------------------------

    getById(id) {

        return AppState.data.assessmentResults
            .find(
                result =>
                    result.id === id
            ) || null;
    },


    // ----------------------------------------
    // Get by activity
    // ----------------------------------------

    getByActivityId(
        assessmentActivityId
    ) {

        return AppState.data.assessmentResults
            .filter(
                result =>
                    result.assessmentActivityId ===
                    assessmentActivityId
            );
    },


    // ----------------------------------------
    // Get by student
    // ----------------------------------------

    getByStudentId(studentId) {

        return AppState.data.assessmentResults
            .filter(
                result =>
                    result.studentId === studentId
            );
    },


    // ----------------------------------------
    // Get by student + activity
    // ----------------------------------------

    getByStudentActivity(
        studentId,
        assessmentActivityId
    ) {

        return AppState.data.assessmentResults
            .filter(
                result =>
                    result.studentId === studentId &&
                    result.assessmentActivityId ===
                        assessmentActivityId
            );
    },


    // ----------------------------------------
    // Get exact result
    // ----------------------------------------

    getByStudentActivityCriterion(
        studentId,
        assessmentActivityId,
        criterionId
    ) {

        return AppState.data.assessmentResults
            .find(
                result =>
                    result.studentId === studentId &&
                    result.assessmentActivityId ===
                        assessmentActivityId &&
                    result.criterionId === criterionId
            ) || null;
    },


    // ----------------------------------------
    // Update
    // ----------------------------------------

    update(id, value) {

        const result =
            this.getById(id);

        if (!result) {
            throw new Error(
                "Assessment result not found."
            );
        }


        const normalizedValue =
            Number(value);

        if (
            !Number.isFinite(normalizedValue) ||
            normalizedValue < 0 ||
            normalizedValue > 10
        ) {
            throw new Error(
                "Assessment value must be between 0 and 10."
            );
        }


        result.value =
            normalizedValue;

        result.updatedAt =
            new Date().toISOString();

        AppState.save();

        return result;
    },


    // ----------------------------------------
    // Delete
    // ----------------------------------------

    delete(id) {

        const result =
            this.getById(id);

        if (!result) {
            return;
        }


        AppState.data.assessmentResults =
            AppState.data.assessmentResults
                .filter(
                    item =>
                        item.id !== id
                );


        AppState.save();
    },


    // ----------------------------------------
    // Delete all results for an activity
    // ----------------------------------------

    deleteByActivityId(
        assessmentActivityId
    ) {

        AppState.data.assessmentResults =
            AppState.data.assessmentResults
                .filter(
                    result =>
                        result.assessmentActivityId !==
                        assessmentActivityId
                );


        AppState.save();
    },


    // ----------------------------------------
    // Delete all results for a student
    // ----------------------------------------

    deleteByStudentId(studentId) {

        AppState.data.assessmentResults =
            AppState.data.assessmentResults
                .filter(
                    result =>
                        result.studentId !== studentId
                );


        AppState.save();
    }

};