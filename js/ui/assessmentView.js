// =========================================================
// T-CHIT — ASSESSMENT VIEW
// =========================================================


// ---------------------------------------------------------
// MAIN VIEW
// ---------------------------------------------------------

function renderAssessmentView() {

    const container =
        document.getElementById("appView");

    if (!container) {
        console.error(
            "T-chit: #appView not found."
        );
        return;
    }


    const academicYear =
        AppState.getCurrentAcademicYear();


    if (!academicYear) {

        container.innerHTML = `

            <div class="empty-state">

                <div class="empty-state-icon">
                    ✎
                </div>

                <h3>
                    No academic year selected
                </h3>

                <p>
                    Set up your academic year before
                    viewing attendance.
                </p>

                <button
                    class="btn-primary"
                    onclick="navigateTo('settings')"
                >
                    GO TO SETTINGS
                </button>

            </div>

        `;

        return;
    }


    const stats =
        calculateAttendanceStats(
            academicYear.id
        );


    const classStats =
        calculateAttendanceByClass(
            academicYear.id
        );


    container.innerHTML = `

        <div class="assessment-view">

            <section class="assessment-header">

                <div>

                    <h3>
                        Attendance
                    </h3>

                    <p>
                        Track attendance and punctuality
                        across your classes.
                    </p>

                </div>

            </section>


            ${renderAttendanceSummary(stats)}


            <section class="assessment-section">

                <div class="section-header">

                    <h3 class="section-title">
                        Attendance by class
                    </h3>

                </div>


                ${
                    classStats.length
                        ? renderAttendanceClassStats(
                            classStats
                        )
                        : renderAttendanceStatsEmpty()
                }

            </section>

        </div>
    `;
}


// ---------------------------------------------------------
// SUMMARY
// ---------------------------------------------------------

function renderAttendanceSummary(
    stats
) {

    return `

        <section class="assessment-summary">

            <div class="assessment-stat-card">

                <div class="assessment-stat-label">
                    LESSONS
                </div>

                <div class="assessment-stat-value">
                    ${stats.lessons}
                </div>

            </div>


            <div class="assessment-stat-card">

                <div class="assessment-stat-label">
                    PRESENT
                </div>

                <div class="assessment-stat-value">
                    ${stats.presentPercentage}%
                </div>

            </div>


            <div class="assessment-stat-card">

                <div class="assessment-stat-label">
                    ABSENT
                </div>

                <div class="assessment-stat-value">
                    ${stats.absentPercentage}%
                </div>

            </div>


            <div class="assessment-stat-card">

                <div class="assessment-stat-label">
                    LATE
                </div>

                <div class="assessment-stat-value">
                    ${stats.latePercentage}%
                </div>

            </div>

        </section>
    `;
}


// ---------------------------------------------------------
// BY CLASS
// ---------------------------------------------------------

function renderAttendanceClassStats(
    classStats
) {

    return `

        <div class="attendance-class-list">

            ${
                classStats.map(
                    classStat =>
                        renderAttendanceClassCard(
                            classStat
                        )
                ).join("")
            }

        </div>
    `;
}


function renderAttendanceClassCard(
    classStat
) {

    return `

        <button
            type="button"
            class="attendance-class-card"
            onclick="openAttendanceClass(
                '${classStat.classId}'
            )"
        >

            <div class="attendance-class-info">

                <div class="attendance-class-name">
                    ${escapeHTML(
                        classStat.className
                    )}
                </div>

                <div class="attendance-class-meta">

                    ${classStat.lessons}
                    ${
                        classStat.lessons === 1
                            ? "lesson"
                            : "lessons"
                    }

                    ·

                    ${classStat.students}
                    ${
                        classStat.students === 1
                            ? "student"
                            : "students"
                    }

                </div>

            </div>


            <div class="attendance-class-rate">

                <div class="attendance-rate-value">
                    ${classStat.presentPercentage}%
                </div>

                <div class="attendance-rate-label">
                    PRESENT
                </div>

            </div>

        </button>
    `;
}


// ---------------------------------------------------------
// EMPTY STATE
// ---------------------------------------------------------

function renderAttendanceStatsEmpty() {

    return `

        <div class="empty-state attendance-stats-empty">

            <div class="empty-state-icon">
                ✎
            </div>

            <h3>
                No attendance recorded yet
            </h3>

            <p>
                Start a class from the Dashboard
                to begin tracking attendance.
            </p>

            <button
                class="btn-primary"
                onclick="navigateTo('dashboard')"
            >
                GO TO DASHBOARD
            </button>

        </div>
    `;
}


// ---------------------------------------------------------
// CALCULATE GENERAL STATS
// ---------------------------------------------------------

function calculateAttendanceStats(
    academicYearId
) {

    const attendance =
        AttendanceManager
            .getAll()
            .filter(
                record =>
                    record.academicYearId ===
                    academicYearId
            );


    let present = 0;
    let absent = 0;
    let justified = 0;
    let late = 0;


    attendance.forEach(
        attendanceRecord => {

            attendanceRecord.records
                .forEach(record => {

                    switch (record.status) {

                        case "present":
                            present++;
                            break;

                        case "absent":
                            absent++;
                            break;

                        case "justified":
                            justified++;
                            break;

                        case "late":
                            late++;
                            break;

                    }

                });

        }
    );


    const total =
        present +
        absent +
        justified +
        late;


    return {

        lessons:
            attendance.length,

        present,
        absent,
        justified,
        late,

        presentPercentage:
            calculatePercentage(
                present,
                total
            ),

        absentPercentage:
            calculatePercentage(
                absent,
                total
            ),

        justifiedPercentage:
            calculatePercentage(
                justified,
                total
            ),

        latePercentage:
            calculatePercentage(
                late,
                total
            )
    };
}


// ---------------------------------------------------------
// CALCULATE BY CLASS
// ---------------------------------------------------------

function calculateAttendanceByClass(
    academicYearId
) {

    const classes =
        ClassManager.getByAcademicYear(
            academicYearId
        );


    return classes
        .map(classItem => {

            const attendance =
                AttendanceManager
                    .getForClass(
                        classItem.id
                    )
                    .filter(
                        record =>
                            record.academicYearId ===
                            academicYearId
                    );


            let present = 0;
            let total = 0;


            attendance.forEach(
                attendanceRecord => {

                    attendanceRecord.records
                        .forEach(record => {

                            total++;

                            if (
                                record.status ===
                                "present"
                            ) {
                                present++;
                            }

                        });

                }
            );


            return {

                classId:
                    classItem.id,

                className:
                    classItem.name,

                lessons:
                    attendance.length,

                students:
                    EnrollmentManager
                        .getStudentsForClass(
                            classItem.id
                        ).length,

                present,

                total,

                presentPercentage:
                    calculatePercentage(
                        present,
                        total
                    )

            };

        })
        .filter(
            classStat =>
                classStat.lessons > 0
        );
}


// ---------------------------------------------------------
// PERCENTAGE
// ---------------------------------------------------------

function calculatePercentage(
    value,
    total
) {

    if (!total) {
        return 0;
    }


    return Math.round(
        (value / total) * 100
    );
}


// ---------------------------------------------------------
// CLASS DETAIL
// ---------------------------------------------------------

function openAttendanceClass(classId) {

    const container =
        document.getElementById("appView");

    if (!container) {
        console.error(
            "T-chit: #appView not found."
        );
        return;
    }


    const academicYear =
        AppState.getCurrentAcademicYear();


    if (!academicYear) {
        return;
    }


    const classItem =
        ClassManager.getById(classId);


    if (!classItem) {

        showAlertModal(
            "CLASS NOT FOUND",
            "The selected class could not be found.",
            "error"
        );

        return;
    }


    const classStats =
        calculateDetailedClassAttendance(
            classId,
            academicYear.id
        );


    container.innerHTML = `

        <div class="assessment-view">

            <section class="assessment-header">

                <button
                    type="button"
                    class="assessment-back-button"
                    onclick="renderAssessmentView()"
                >
                    ← BACK TO ASSESSMENT
                </button>


                <div class="assessment-class-heading">

                    <div class="assessment-class-title">

                        <h3>
                            ${escapeHTML(classItem.name)}
                        </h3>

                        <p>
                            Attendance overview
                        </p>

                    </div>


                    <div class="assessment-class-overview">

                        <div>

                            <strong>
                                ${classStats.presentPercentage}%
                            </strong>

                            <span>
                                PRESENT
                            </span>

                        </div>


                        <div>

                            <strong>
                                ${classStats.lessons}
                            </strong>

                            <span>
                                LESSONS
                            </span>

                        </div>


                        <div>

                            <strong>
                                ${classStats.students.length}
                            </strong>

                            <span>
                                STUDENTS
                            </span>

                        </div>

                    </div>

                </div>

            </section>


            <section class="assessment-section">

                <div class="section-header">

                    <h3 class="section-title">
                        Students
                    </h3>

                    <span class="assessment-section-count">
                        ${classStats.students.length}
                    </span>

                </div>


                ${
                    classStats.students.length
                        ? renderStudentAttendanceList(
                            classStats.students
                        )
                        : renderAttendanceStatsEmpty()
                }

            </section>

        </div>

    `;
}


// ---------------------------------------------------------
// CALCULATE CLASS DETAIL
// ---------------------------------------------------------

function calculateDetailedClassAttendance(
    classId,
    academicYearId
) {

    const attendance =
        AttendanceManager
            .getForClass(classId)
            .filter(
                record =>
                    record.academicYearId ===
                    academicYearId
            );


    const students =
        EnrollmentManager
            .getStudentsForClass(
                classId
            );


    const studentStats =
        students.map(student => {

            let present = 0;
            let absent = 0;
            let justified = 0;
            let late = 0;
            let total = 0;


            attendance.forEach(
                attendanceRecord => {

                    const record =
                        attendanceRecord.records.find(
                            record =>
                                record.studentId ===
                                student.id
                        );


                    if (!record) {
                        return;
                    }


                    total++;


                    switch (record.status) {

                        case "present":
                            present++;
                            break;

                        case "absent":
                            absent++;
                            break;

                        case "justified":
                            justified++;
                            break;

                        case "late":
                            late++;
                            break;

                    }

                }
            );


            const presentPercentage =
                calculatePercentage(
                    present,
                    total
                );


            return {

                studentId:
                    student.id,

                student,

                total,

                present,
                absent,
                justified,
                late,

                presentPercentage,

                attendanceLevel:
                    getAttendanceLevel(
                        presentPercentage
                    )

            };

        });


    let present = 0;
    let total = 0;


    attendance.forEach(
        attendanceRecord => {

            attendanceRecord.records
                .forEach(record => {

                    total++;


                    if (
                        record.status ===
                        "present"
                    ) {
                        present++;
                    }

                });

        }
    );


    return {

        classId,

        lessons:
            attendance.length,

        present,

        total,

        presentPercentage:
            calculatePercentage(
                present,
                total
            ),

        students:
            studentStats

    };
}


// ---------------------------------------------------------
// ATTENDANCE LEVEL
// ---------------------------------------------------------

function getAttendanceLevel(
    percentage
) {

    if (percentage < 85) {
        return "risk";
    }


    if (percentage < 90) {
        return "attention";
    }


    return "normal";
}


// ---------------------------------------------------------
// STUDENT LIST
// ---------------------------------------------------------

function renderStudentAttendanceList(
    students
) {

    return `

        <div class="student-attendance-list">

            ${
                students
                    .map(
                        studentStat =>
                            renderStudentAttendanceCard(
                                studentStat
                            )
                    )
                    .join("")
            }

        </div>

    `;
}


// ---------------------------------------------------------
// STUDENT CARD
// ---------------------------------------------------------

function renderStudentAttendanceCard(
    studentStat
) {

    const student =
        studentStat.student;


    const studentName =
        student.name ||
        [
            student.firstName,
            student.lastName
        ]
            .filter(Boolean)
            .join(" ") ||
        "Unnamed student";


    const level =
        studentStat.attendanceLevel;


    const riskLabel =
        level === "risk"
            ? "⚠ ATTENDANCE BELOW 80%"
            : level === "attention"
                ? "KEEP AN EYE ON ATTENDANCE"
                : "";


    return `

        <button
            type="button"
            class="
                student-attendance-card
                student-attendance-${level}
            "
            onclick="openStudentAttendance(
                '${studentStat.studentId}'
            )"
        >

            <div class="student-attendance-main">

                <div class="student-attendance-name">
                    ${escapeHTML(studentName)}
                </div>


                <div class="student-attendance-meta">

                    <span>
                        ${studentStat.present}
                        PRESENT
                    </span>

                    <span>
                        ${studentStat.absent}
                        ABSENT
                    </span>

                    <span>
                        ${studentStat.justified}
                        JUSTIFIED
                    </span>

                    <span>
                        ${studentStat.late}
                        LATE
                    </span>

                </div>


                ${
                    riskLabel
                        ? `
                            <div class="
                                student-attendance-flag
                                student-attendance-flag-${level}
                            ">
                                ${riskLabel}
                            </div>
                        `
                        : ""
                }

            </div>


            <div class="student-attendance-rate">

                <div class="student-rate-value">
                    ${studentStat.presentPercentage}%
                </div>

                <div class="student-rate-label">
                    PRESENT
                </div>

            </div>


            <div
                class="student-attendance-arrow"
                aria-hidden="true"
            >
                →
            </div>

        </button>

    `;
}


function openStudentAttendance(
    studentId
) {

    const container =
        document.getElementById("appView");


    if (!container) {
        console.error(
            "T-chit: #appView not found."
        );
        return;
    }


    const academicYear =
        AppState.getCurrentAcademicYear();


    if (!academicYear) {
        return;
    }


    const student =
        StudentManager.getById(
            studentId
        );


    if (!student) {

        showAlertModal(
            "STUDENT NOT FOUND",
            "The selected student could not be found.",
            "error"
        );

        return;
    }


    const enrollment =
        EnrollmentManager
            .getActiveForStudent(
                studentId
            );


    if (!enrollment) {

        showAlertModal(
            "ENROLLMENT NOT FOUND",
            "The selected student is not currently enrolled in a class.",
            "error"
        );

        return;
    }


    const classItem =
        ClassManager.getById(
            enrollment.classId
        );


    if (!classItem) {

        showAlertModal(
            "CLASS NOT FOUND",
            "The student's class could not be found.",
            "error"
        );

        return;
    }


    const studentStats =
        calculateStudentAttendance(
            studentId,
            classItem.id,
            academicYear.id
        );


    container.innerHTML = `

        <div class="assessment-view">

            <section class="assessment-header">

                <button
                    type="button"
                    class="assessment-back-button"
                    onclick="openAttendanceClass(
                        '${classItem.id}'
                    )"
                >
                    ← BACK TO ${escapeHTML(
                        classItem.name
                    ).toUpperCase()}
                </button>


                <div class="assessment-student-heading">

                    <div class="assessment-student-title">

                        <h3>
                            ${escapeHTML(
                                getStudentDisplayName(
                                    student
                                )
                            )}
                        </h3>

                        <p>
                            ${escapeHTML(
                                classItem.name
                            )}
                            · Attendance overview
                        </p>

                    </div>


                    <div class="assessment-student-rate">

                        <strong>
                            ${studentStats.presentPercentage}%
                        </strong>

                        <span>
                            PRESENT
                        </span>

                    </div>

                </div>

            </section>


            ${renderStudentAttendanceSummary(
                studentStats
            )}


            <section class="assessment-section">

                <div class="section-header">

                    <h3 class="section-title">
                        Recent records
                    </h3>

                    <span class="assessment-section-count">
                        ${studentStats.records.length}
                    </span>

                </div>


                ${
                    studentStats.records.length
                        ? renderStudentAttendanceHistory(
                            studentStats.records
                        )
                        : `
                            <div class="empty-state">
                                <div class="empty-state-icon">
                                    ✎
                                </div>

                                <h3>
                                    No attendance records
                                </h3>

                                <p>
                                    No attendance has been
                                    recorded for this student yet.
                                </p>
                            </div>
                        `
                }

            </section>

        </div>

    `;
}


function calculateStudentAttendance(
    studentId,
    classId,
    academicYearId
) {

    const attendance =
        AttendanceManager
            .getForClass(classId)
            .filter(
                record =>
                    record.academicYearId ===
                    academicYearId
            );


    let present = 0;
    let absent = 0;
    let justified = 0;
    let late = 0;


    const records = [];


    attendance.forEach(
        attendanceRecord => {

            const record =
                attendanceRecord.records.find(
                    record =>
                        record.studentId ===
                        studentId
                );


            if (!record) {
                return;
            }


            switch (record.status) {

                case "present":
                    present++;
                    break;

                case "absent":
                    absent++;
                    break;

                case "justified":
                    justified++;
                    break;

                case "late":
                    late++;
                    break;

            }


            records.push({

                date:
                    attendanceRecord.date,

                status:
                    record.status

            });

        }
    );


    records.sort(
        (a, b) =>
            b.date.localeCompare(a.date)
    );


    const total =
        present +
        absent +
        justified +
        late;


    return {

        present,
        absent,
        justified,
        late,

        total,

        presentPercentage:
            calculatePercentage(
                present,
                total
            ),

        attendanceLevel:
            getAttendanceLevel(
                calculatePercentage(
                    present,
                    total
                )
            ),

        records

    };
}


function getStudentDisplayName(
    student
) {

    return (
        student.name ||
        [
            student.firstName,
            student.lastName
        ]
            .filter(Boolean)
            .join(" ") ||
        "Unnamed student"
    );
}


function renderStudentAttendanceSummary(
    stats
) {

    return `

        <section class="assessment-summary">

            <div class="assessment-stat-card">

                <div class="assessment-stat-label">
                    PRESENT
                </div>

                <div class="assessment-stat-value">
                    ${stats.present}
                </div>

            </div>


            <div class="assessment-stat-card">

                <div class="assessment-stat-label">
                    ABSENT
                </div>

                <div class="assessment-stat-value">
                    ${stats.absent}
                </div>

            </div>


            <div class="assessment-stat-card">

                <div class="assessment-stat-label">
                    JUSTIFIED
                </div>

                <div class="assessment-stat-value">
                    ${stats.justified}
                </div>

            </div>


            <div class="assessment-stat-card">

                <div class="assessment-stat-label">
                    LATE
                </div>

                <div class="assessment-stat-value">
                    ${stats.late}
                </div>

            </div>

        </section>

    `;
}


function renderStudentAttendanceHistory(
    records
) {

    return `

        <div class="student-attendance-history">

            ${
                records
                    .map(
                        record =>
                            renderStudentAttendanceRecord(
                                record
                            )
                    )
                    .join("")
            }

        </div>

    `;
}


function renderStudentAttendanceRecord(
    record
) {

    const statusLabel =
        getAttendanceStatusLabel(
            record.status
        );


    return `

        <div class="
            student-attendance-record
            student-attendance-record-${record.status}
        ">

            <div class="student-attendance-record-date">
                ${formatAttendanceHistoryDate(
                    record.date
                )}
            </div>


            <div class="student-attendance-record-status">
                ${statusLabel}
            </div>

        </div>

    `;
}


function getAttendanceStatusLabel(
    status
) {

    switch (status) {

        case "present":
            return "PRESENT";

        case "absent":
            return "ABSENT";

        case "justified":
            return "JUSTIFIED";

        case "late":
            return "LATE";

        default:
            return status.toUpperCase();

    }
}


function formatAttendanceHistoryDate(
    date
) {

    const parsed =
        new Date(
            `${date}T00:00:00`
        );


    if (Number.isNaN(
        parsed.getTime()
    )) {
        return date;
    }


    return parsed.toLocaleDateString(
        "en-GB",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    ).toUpperCase();
}