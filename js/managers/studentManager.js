// ----------------------------------------
// T-CHIT — studentManager.js
// ----------------------------------------

const StudentManager = {

    // ------------------------------------
    // Create student
    // ------------------------------------

    create({
        firstName,
        lastName = ""
    }) {

        firstName =
            String(firstName || "").trim();

        lastName =
            String(lastName || "").trim();

        if (!firstName) {

            throw new Error(
                "First name cannot be empty."
            );
        }

        const student = {

            id: Utils.createId("student"),

            firstName,

            lastName,

            createdAt:
                new Date().toISOString()
        };

        AppState.data.students.push(student);

        AppState.save();

        return student;
    },

    // ------------------------------------
    // Get student
    // ------------------------------------

    getById(id) {

        return AppState.data.students.find(
            student =>
                student.id === id
        ) || null;
    },

    // ------------------------------------
    // Get all students
    // ------------------------------------

    getAll() {

        return AppState.data.students;
    },

    // ------------------------------------
    // Delete student
    // ------------------------------------

    delete(id) {

        AppState.data.students =
            AppState.data.students.filter(
                student =>
                    student.id !== id
            );

        AppState.save();
    }
};