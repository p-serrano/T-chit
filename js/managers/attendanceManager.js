// =========================================================
// T-CHIT — ATTENDANCE MANAGER
// =========================================================


const AttendanceManager = {

    // -----------------------------------------------------
    // CREATE OR UPDATE ATTENDANCE
    // -----------------------------------------------------

    save({
        academicYearId,
        classId,
        date,
        records
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

        if (!Array.isArray(records)) {
            throw new Error(
                "Attendance records are required."
            );
        }


        const now =
            new Date().toISOString();


        const existing =
            this.getForClassAndDate(
                classId,
                date
            );


        if (existing) {

            existing.records =
                this.normalizeRecords(records);

            existing.updatedAt =
                now;

            AppState.save();

            return existing;
        }


        const attendance = {

            id:
                Utils.createId("attendance"),

            academicYearId,

            classId,

            date,

            records:
                this.normalizeRecords(records),

            createdAt:
                now,

            updatedAt:
                now
        };


        AppState.data.attendance.push(
            attendance
        );

        AppState.save();

        return attendance;
    },


    // -----------------------------------------------------
    // NORMALIZE RECORDS
    // -----------------------------------------------------

    normalizeRecords(records) {

        const validStatuses = [
            "present",
            "absent",
            "justified",
            "late"
        ];


        return records
            .filter(record =>
                record &&
                record.studentId
            )
            .map(record => ({

                studentId:
                    record.studentId,

                status:
                    validStatuses.includes(
                        record.status
                    )
                        ? record.status
                        : "present"
            }));
    },


    // -----------------------------------------------------
    // GET BY ID
    // -----------------------------------------------------

    getById(id) {

        return AppState.data.attendance.find(
            attendance =>
                attendance.id === id
        ) || null;
    },


    // -----------------------------------------------------
    // GET ALL
    // -----------------------------------------------------

    getAll() {

        return AppState.data.attendance;
    },


    // -----------------------------------------------------
    // GET FOR CLASS
    // -----------------------------------------------------

    getForClass(classId) {

        return AppState.data.attendance.filter(
            attendance =>
                attendance.classId === classId
        );
    },


    // -----------------------------------------------------
    // GET FOR CLASS + DATE
    // -----------------------------------------------------

    getForClassAndDate(
        classId,
        date
    ) {

        return AppState.data.attendance.find(
            attendance =>
                attendance.classId === classId &&
                attendance.date === date
        ) || null;
    },


    // -----------------------------------------------------
    // GET RECORD FOR STUDENT
    // -----------------------------------------------------

    getStudentStatus(
        classId,
        date,
        studentId
    ) {

        const attendance =
            this.getForClassAndDate(
                classId,
                date
            );

        if (!attendance) {
            return "present";
        }


        const record =
            attendance.records.find(
                record =>
                    record.studentId ===
                    studentId
            );


        return record
            ? record.status
            : "present";
    },


    // -----------------------------------------------------
    // DELETE
    // -----------------------------------------------------

    delete(id) {

        AppState.data.attendance =
            AppState.data.attendance.filter(
                attendance =>
                    attendance.id !== id
            );

        AppState.save();
    }

};