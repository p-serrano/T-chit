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
    // Find malformed imported names
    // ------------------------------------
    //
    // Detects the old importer format:
    //
    // firstName: "SAOULI"
    // lastName:  "ADLI, SILYA"
    //
    // which should be:
    //
    // firstName: "SILYA"
    // lastName:  "SAOULI ADLI"
    //
    // ------------------------------------

    findMalformedNames() {

        return AppState.data.students.filter(
            student =>
                String(
                    student.lastName || ""
                ).includes(",")
        );
    },


    // ------------------------------------
    // Repair malformed imported names
    // ------------------------------------

    repairMalformedNames() {

        const students =
            this.findMalformedNames();

        const repaired = [];

        students.forEach(student => {

            const firstName =
                String(
                    student.firstName || ""
                ).trim();

            const lastName =
                String(
                    student.lastName || ""
                ).trim();

            const parts =
                lastName.split(",");

            if (
                parts.length < 2 ||
                !firstName
            ) {
                return;
            }

            const remainingSurname =
                parts[0].trim();

            const importedFirstName =
                parts
                    .slice(1)
                    .join(",")
                    .trim();

            if (
                !remainingSurname ||
                !importedFirstName
            ) {
                return;
            }

            // Old incorrect structure:
            //
            // firstName = SAOULI
            // lastName  = ADLI, SILYA
            //
            // New correct structure:
            //
            // firstName = SILYA
            // lastName  = SAOULI ADLI

            student.firstName =
                importedFirstName;

            student.lastName =
                `${firstName} ${remainingSurname}`
                    .trim();

            repaired.push({
                id: student.id,
                oldFirstName: firstName,
                oldLastName: lastName,
                newFirstName:
                    student.firstName,
                newLastName:
                    student.lastName
            });
        });

        if (repaired.length) {
            AppState.save();
        }

        return repaired;
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
    },

    // ------------------------------------
    // Delete student completely
    // ------------------------------------

    deleteCompletely(id) {

        const student =
            this.getById(id);

        if (!student) {
            return false;
        }

        // --------------------------------
        // Remove all enrollments
        // --------------------------------

        AppState.data.enrollments =
            AppState.data.enrollments.filter(
                enrollment =>
                    enrollment.studentId !== id
            );


        // --------------------------------
        // Remove attendance records
        // --------------------------------

        AppState.data.attendance =
            AppState.data.attendance
                .map(attendance => {

                    attendance.records =
                        attendance.records.filter(
                            record =>
                                record.studentId !== id
                        );

                    return attendance;
                })
                .filter(attendance =>
                    attendance.records.length > 0
                );


        // --------------------------------
        // Remove assessment results
        // --------------------------------

        AppState.data.assessmentResults =
            AppState.data.assessmentResults
                .filter(
                    result =>
                        result.studentId !== id
                );


        // --------------------------------
        // Remove student
        // --------------------------------

        AppState.data.students =
            AppState.data.students.filter(
                student =>
                    student.id !== id
            );


        // --------------------------------
        // Clear current student
        // --------------------------------

        if (
            AppState.currentStudentId === id
        ) {

            AppState.currentStudentId =
                null;

            AppState.saveContext();
        }


        AppState.save();

        return true;
    },

    repairReversedNames() {

        const students =
            AppState.data.students;

        const repaired = [];

        students.forEach(student => {

            const firstName =
                String(
                    student.firstName || ""
                ).trim();

            const lastName =
                String(
                    student.lastName || ""
                ).trim();

            if (
                !firstName.endsWith(",") ||
                !lastName
            ) {
                return;
            }

            const correctedLastName =
                firstName
                    .replace(/,+$/, "")
                    .trim();

            if (!correctedLastName) {
                return;
            }

            student.firstName =
                lastName;

            student.lastName =
                correctedLastName;

            repaired.push({
                id: student.id,
                oldFirstName: firstName,
                oldLastName: lastName,
                newFirstName:
                    student.firstName,
                newLastName:
                    student.lastName
            });
        });

        if (repaired.length) {
            AppState.save();
        }

        return repaired;
    }
};