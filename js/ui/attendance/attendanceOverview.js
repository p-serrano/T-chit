// ---------------------------------------------------------
// OVERVIEW TAB
// ---------------------------------------------------------

function renderAttendanceOverviewTab(
    academicYear
) {

    const stats =
        calculateAttendanceStats(
            academicYear.id
        );


    return `

        <section class="attendance-overview-section">

            <div class="attendance-heading">

                <div>

                    <div class="attendance-section-label">
                        OVERVIEW
                    </div>

                    <h3>
                        Attendance summary
                    </h3>

                    <p>
                        Overall attendance for the
                        current academic year.
                    </p>

                </div>

            </div>


            ${renderAttendanceSummary(stats)}

        </section>

    `;
}


// ---------------------------------------------------------
// BY CLASS TAB
// ---------------------------------------------------------

function renderAttendanceClassesTab(
    academicYear
) {

    const classStats =
        calculateAttendanceByClass(
            academicYear.id
        );


    return `

        <section class="attendance-classes-section">

            <div class="attendance-heading">

                <div>

                    <div class="attendance-section-label">
                        CLASSES
                    </div>

                    <h3>
                        Attendance by class
                    </h3>

                    <p>
                        View attendance records
                        for each class.
                    </p>

                </div>

            </div>


            ${
                classStats.length
                    ? renderAttendanceClassStats(
                        classStats
                    )
                    : renderAttendanceStatsEmpty()
            }

        </section>

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
        ClassManager
            .getByAcademicYear(
                academicYearId
            )
            .filter(
                classItem =>
                    !classItem.type ||
                    classItem.type ===
                    ClassManager.TYPES.CLASS
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