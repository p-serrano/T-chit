// ----------------------------------------
// T-CHIT — enrollmentManager.js
// ----------------------------------------

const EnrollmentManager = {

    // ------------------------------------
    // Create enrollment
    // ------------------------------------

    create({
        studentId,
        classId,
        academicYearId
    }) {

        if (!studentId) {
            throw new Error(
                "Student ID is required."
            );
        }

        if (!classId) {
            throw new Error(
                "Class ID is required."
            );
        }

        if (!academicYearId) {
            throw new Error(
                "Academic year ID is required."
            );
        }

        // --------------------------------
        // Avoid duplicate enrollment
        // --------------------------------

        const existing =
            this.getForStudentInClass(
                studentId,
                classId
            );

        if (existing) {
            return existing;
        }

        const enrollment = {

            id:
                Utils.createId("enrollment"),

            studentId,

            classId,

            academicYearId,

            active: true,

            createdAt:
                new Date().toISOString()
        };

        AppState.data.enrollments.push(
            enrollment
        );

        AppState.save();

        return enrollment;
    },

    // ------------------------------------
    // Get enrollment by ID
    // ------------------------------------

    getById(id) {

        return AppState.data.enrollments.find(
            enrollment =>
                enrollment.id === id
        ) || null;
    },

    // ------------------------------------
    // Get all enrollments
    // ------------------------------------

    getAll() {

        return AppState.data.enrollments;
    },

    // ------------------------------------
    // Get student's enrollments
    // ------------------------------------

    getForStudent(studentId) {

        return AppState.data.enrollments.filter(
            enrollment =>
                enrollment.studentId === studentId
        );
    },

    // ------------------------------------
    // Get active enrollment
    // ------------------------------------

    getActiveForStudent(studentId) {

        return AppState.data.enrollments.find(
            enrollment =>
                enrollment.studentId === studentId &&
                enrollment.active
        ) || null;
    },

    // ------------------------------------
    // Get enrollment for student + class
    // ------------------------------------

    getForStudentInClass(
        studentId,
        classId
    ) {

        return AppState.data.enrollments.find(
            enrollment =>
                enrollment.studentId === studentId &&
                enrollment.classId === classId &&
                enrollment.active
        ) || null;
    },

    // ------------------------------------
    // Get class enrollments
    // ------------------------------------

    getForClass(classId) {

        return AppState.data.enrollments.filter(
            enrollment =>
                enrollment.classId === classId &&
                enrollment.active
        );
    },

    // ------------------------------------
    // Get students in class
    // ------------------------------------

    getStudentsForClass(classId) {

        const enrollments =
            this.getForClass(classId);

        return enrollments
            .map(enrollment =>
                StudentManager.getById(
                    enrollment.studentId
                )
            )
            .filter(Boolean);
    },

    // ------------------------------------
    // Remove enrollment
    // ------------------------------------

    remove(id) {

        const enrollment =
            this.getById(id);

        if (!enrollment) {
            return;
        }

        enrollment.active = false;

        AppState.save();
    },

    // ------------------------------------
    // Delete enrollment permanently
    // ------------------------------------

    delete(id) {

        AppState.data.enrollments =
            AppState.data.enrollments.filter(
                enrollment =>
                    enrollment.id !== id
            );

        AppState.save();
    }
};