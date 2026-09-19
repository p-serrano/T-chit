// =========================================================
// T-CHIT — ASSESSMENT RESULT MANAGER
// =========================================================


const AssessmentResultManager = {

    // ----------------------------------------
    // CREATE / UPDATE
    // ----------------------------------------

    create({
        assessmentActivityId,
        studentId,
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


        // ----------------------------------------
        // CHECK ACTIVITY
        // ----------------------------------------

        const activity =
            AppState
                .data
                .assessmentActivities
                .find(
                    item =>
                        item.id ===
                        assessmentActivityId
                );


        if (!activity) {

            throw new Error(
                "Assessment activity not found."
            );

        }


        // ----------------------------------------
        // CHECK STUDENT
        // ----------------------------------------

        const student =
            AppState
                .data
                .students
                .find(
                    item =>
                        item.id ===
                        studentId
                );


        if (!student) {

            throw new Error(
                "Student not found."
            );

        }


        // ----------------------------------------
        // NORMALIZE VALUE
        // ----------------------------------------

        const normalizedValue =
            Number(value);


        if (
            !Number.isFinite(
                normalizedValue
            ) ||
            normalizedValue < 0 ||
            normalizedValue > 10
        ) {

            throw new Error(
                "Assessment value must be between 0 and 10."
            );

        }


        // ----------------------------------------
        // ONE RESULT PER STUDENT / ACTIVITY
        // ----------------------------------------

        const existing =
            this.getByStudentActivity(
                studentId,
                assessmentActivityId
            );


        if (existing.length) {

            const result =
                existing[0];


            result.value =
                normalizedValue;


            result.updatedAt =
                new Date().toISOString();


            AppState.save();


            return result;

        }


        // ----------------------------------------
        // CREATE RESULT
        // ----------------------------------------

        const now =
            new Date().toISOString();


        const result = {

            id:
                Utils.createId(
                    "assessmentResult"
                ),

            assessmentActivityId,

            studentId,

            value:
                normalizedValue,

            createdAt:
                now,

            updatedAt:
                now

        };


        AppState
            .data
            .assessmentResults
            .push(result);


        AppState.save();


        return result;

    },


    // ----------------------------------------
    // GET BY ID
    // ----------------------------------------

    getById(id) {

        return AppState
            .data
            .assessmentResults
            .find(
                result =>
                    result.id === id
            ) || null;

    },


    // ----------------------------------------
    // GET BY ACTIVITY
    // ----------------------------------------

    getByActivityId(
        assessmentActivityId
    ) {

        return AppState
            .data
            .assessmentResults
            .filter(
                result =>
                    result.assessmentActivityId ===
                    assessmentActivityId
            );

    },


    // ----------------------------------------
    // GET BY STUDENT
    // ----------------------------------------

    getByStudentId(
        studentId
    ) {

        return AppState
            .data
            .assessmentResults
            .filter(
                result =>
                    result.studentId ===
                    studentId
            );

    },


    // ----------------------------------------
    // GET BY STUDENT + ACTIVITY
    // ----------------------------------------

    getByStudentActivity(
        studentId,
        assessmentActivityId
    ) {

        return AppState
            .data
            .assessmentResults
            .filter(
                result =>
                    result.studentId ===
                    studentId &&
                    result.assessmentActivityId ===
                    assessmentActivityId
            );

    },


    // ----------------------------------------
    // GET EXACT RESULT
    // ----------------------------------------

    getByStudentActivityResult(
        studentId,
        assessmentActivityId
    ) {

        return AppState
            .data
            .assessmentResults
            .find(
                result =>
                    result.studentId ===
                    studentId &&
                    result.assessmentActivityId ===
                    assessmentActivityId
            ) || null;

    },


    // ----------------------------------------
    // UPDATE
    // ----------------------------------------

    update(
        id,
        value
    ) {

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
            !Number.isFinite(
                normalizedValue
            ) ||
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
    // DELETE
    // ----------------------------------------

    delete(id) {

        const result =
            this.getById(id);


        if (!result) {
            return;
        }


        AppState.data.assessmentResults =
            AppState
                .data
                .assessmentResults
                .filter(
                    item =>
                        item.id !== id
                );


        AppState.save();

    },


    // ----------------------------------------
    // DELETE ALL RESULTS FOR ACTIVITY
    // ----------------------------------------

    deleteByActivityId(
        assessmentActivityId
    ) {

        AppState.data.assessmentResults =
            AppState
                .data
                .assessmentResults
                .filter(
                    result =>
                        result.assessmentActivityId !==
                        assessmentActivityId
                );


        AppState.save();

    },


    // ----------------------------------------
    // DELETE ALL RESULTS FOR STUDENT
    // ----------------------------------------

    deleteByStudentId(
        studentId
    ) {

        AppState.data.assessmentResults =
            AppState
                .data
                .assessmentResults
                .filter(
                    result =>
                        result.studentId !==
                        studentId
                );


        AppState.save();

    }

};