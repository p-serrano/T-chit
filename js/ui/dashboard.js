// =========================================================
// T-CHIT — DASHBOARD
// =========================================================


function renderDashboard() {

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


    updateAcademicYearBadge(
        academicYear
    );


    const todayClasses =
        academicYear
            ? getTodayClasses(
                academicYear.id
            )
            : [];


    const classes =
        academicYear
            ? ClassManager.getByAcademicYear(
                academicYear.id
            )
            : [];


    const students =
        StudentManager.getAll();


    container.innerHTML = `

        <div class="dashboard">

            <section class="dashboard-welcome">

                <h3>
                    Ready to teach?
                </h3>

                <p>
                    Everything you need for your
                    teaching day, in one place.
                </p>

            </section>

            <section>

                <div class="section-header">

                    <h3 class="section-title">
                        Today's classes
                    </h3>

                    <span
                        class="section-link"
                        onclick="navigateTo('planner')"
                    >
                        VIEW PLANNER →
                    </span>

                </div>


                ${
                    todayClasses.length
                        ? renderDashboardClassCards(
                            todayClasses
                        )
                        : renderDashboardEmpty()
                }

            </section>

        </div>
    `;
}


// ---------------------------------------------------------
// CLASS CARDS
// ---------------------------------------------------------

function renderDashboardClassCards(
    todayClasses
) {

    return `

        <div class="classes-list">

            ${
                todayClasses.map(
                    ({
                        timetableEntry,
                        classItem
                    }) => {

                        const students =
                            EnrollmentManager
                                .getStudentsForClass(
                                    classItem.id
                                );


                        const lesson =
                            getTodayLesson(
                                classItem.id
                            );


                        return `

                            <div class="class-card">

                                <div class="class-time">

                                    <div>
                                        ${escapeHTML(
                                            timetableEntry.startTime
                                        )}
                                    </div>

                                    <span>
                                        ${escapeHTML(
                                            timetableEntry.endTime
                                        )}
                                    </span>

                                </div>


                                <div class="class-info">

                                    <div class="class-name">
                                        ${escapeHTML(
                                            classItem.name
                                        )}
                                    </div>


                                    <div class="class-subject">

                                        ${escapeHTML(
                                            classItem.subject ||
                                            "English"
                                        )}

                                        ·

                                        ${students.length}

                                        ${
                                            students.length === 1
                                                ? "student"
                                                : "students"
                                        }

                                    </div>


                                    ${
                                        lesson
                                            ? `
                                                <div class="class-lesson">
                                                    ${escapeHTML(
                                                        lesson.title ||
                                                        "Untitled lesson"
                                                    )}
                                                </div>
                                            `
                                            : `
                                                <div class="class-lesson class-lesson-empty">
                                                    No lesson planned
                                                </div>
                                            `
                                    }

                                </div>


                                <button
                                    class="class-action"
                                    onclick="startClass(
                                        '${classItem.id}'
                                    )"
                                >
                                    START CLASS
                                </button>

                            </div>

                        `;
                    }
                ).join("")
            }

        </div>
    `;
}


// ---------------------------------------------------------
// EMPTY DASHBOARD
// ---------------------------------------------------------

function renderDashboardEmpty() {

    const academicYear =
        AppState.getCurrentAcademicYear();


    if (!academicYear) {

        return `

            <div class="empty-state">

                <div class="empty-state-icon">
                    ✎
                </div>

                <h3>
                    Your teaching desk is empty
                </h3>

                <p>
                    Create an academic year and your
                    first class to start building T-chit.
                </p>

                <button
                    class="btn-primary"
                    onclick="navigateTo('settings')"
                >
                    SET UP YOUR TEACHING
                </button>

            </div>

        `;
    }


    return `

        <div class="empty-state">

            <div class="empty-state-icon">
                ☕
            </div>

            <h3>
                No classes scheduled today
            </h3>

            <p>
                Your timetable is clear for today.
            </p>

            <button
                class="btn-secondary"
                onclick="navigateTo('planner')"
            >
                VIEW PLANNER
            </button>

        </div>

    `;
}


// ---------------------------------------------------------
// ACADEMIC YEAR BADGE
// ---------------------------------------------------------

function updateAcademicYearBadge(year) {

    const badge =
        document.getElementById(
            "academicYearBadge"
        );

    if (!badge) return;

    badge.textContent =
        year
            ? year.name
            : "No academic year";
}


// ---------------------------------------------------------
// TODAY'S CLASSES
// ---------------------------------------------------------
function getTodayClasses(
    academicYearId
) {

    const today =
        new Date();


    const jsDay =
        today.getDay();


    const dayOfWeek =
        jsDay === 0
            ? 7
            : jsDay;


    const timetableEntries =
        TimetableManager.getByDay(
            academicYearId,
            dayOfWeek
        );


    return timetableEntries
        .map(entry => {

            const classItem =
                ClassManager.getById(
                    entry.classId
                );


            if (!classItem) {
                return null;
            }


            return {
                timetableEntry: entry,
                classItem
            };

        })
        .filter(Boolean)
        .sort(
            (a, b) =>
                a.timetableEntry.startTime
                    .localeCompare(
                        b.timetableEntry.startTime
                    )
        );
}

// ---------------------------------------------------------
// TODAY'S LESSONS
// ---------------------------------------------------------
function getTodayLesson(
    classId
) {

    const academicYear =
        AppState.getCurrentAcademicYear();


    if (!academicYear) {
        return null;
    }


    const today =
        getTodayISODate();


    return LessonManager
        .getByDate(
            academicYear.id,
            today
        )
        .find(
            lesson =>
                lesson.classId === classId
        ) || null;
}