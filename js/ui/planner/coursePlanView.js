// =========================================================
// COURSE PLAN
// =========================================================


// ---------------------------------------------------------
// COURSE PLAN SECTION
// ---------------------------------------------------------

function renderCoursePlanSection(
    academicYearId
) {

    const weekEnd =
        addDays(
            coursePlanWeekStart,
            4
        );


    const classes =
        ClassManager.getByAcademicYear(
            academicYearId
        );


    return `

        <section class="course-plan-section">

            <!-- =====================================
                 COURSE PLAN TOOLBAR
                 ===================================== -->

            <div class="course-plan-toolbar">

                <div class="course-plan-navigation">

                    <button
                        class="btn-secondary"
                        onclick="changeCoursePlanWeek(
                            -1
                        )">

                        ←

                    </button>


                    <div class="course-plan-week">

                        <strong>
                            ${formatWeekRange(
                                coursePlanWeekStart,
                                weekEnd
                            )}
                        </strong>

                        <span>
                            COURSE PLAN
                        </span>

                    </div>


                    <button
                        class="btn-secondary"
                        onclick="changeCoursePlanWeek(
                            1
                        )">

                        →

                    </button>

                </div>


                <div class="course-plan-actions">

                    <button
                        class="btn-secondary"
                        onclick="goToCoursePlanToday()">

                        TODAY

                    </button>


                    <button
                        id="coursePlanCopyButton"
                        class="btn-secondary"
                        onclick="toggleCoursePlanCopyMode()">

                        COPY PLAN

                    </button>


                    <select
                        id="coursePlanClassFilter"
                        onchange="renderCoursePlan()">

                        <option value="all">
                            ALL CLASSES
                        </option>

                        ${classes.map(
                            classItem => `

                                <option
                                    value="${classItem.id}">

                                    ${escapeHTML(
                                        classItem.name
                                    )}

                                </option>

                            `
                        ).join("")}

                    </select>

                </div>

            </div>


            <!-- =====================================
                 WEEK
                 ===================================== -->

            <div class="course-plan-week-grid">

                ${PLANNER_DAYS.map(
                    day =>
                        renderCoursePlanDay(
                            academicYearId,
                            day
                        )
                ).join("")}

            </div>

        </section>

    `;

}


// ---------------------------------------------------------
// RENDER COURSE PLAN DAY
// ---------------------------------------------------------

function renderCoursePlanDay(
    academicYearId,
    day
) {

    const date =
        addDays(
            coursePlanWeekStart,
            day.id - 1
        );


    const dateString =
        formatISODate(
            date
        );


    const timetableEntries =
        TimetableManager
            .getByAcademicYear(
                academicYearId
            )
            .filter(
                entry =>
                    entry.dayOfWeek ===
                    day.id
            )
            .sort(
                (a, b) =>
                    a.startTime.localeCompare(
                        b.startTime
                    )
            );


    const filter =
        document.getElementById(
            "coursePlanClassFilter"
        )?.value || "all";


    const visibleEntries =
        timetableEntries.filter(
            entry =>
                filter === "all" ||
                entry.classId === filter
        );


    return `

        <div
            class="course-plan-day">

            <div class="course-plan-day-header">

                <div>

                    <span>
                        ${day.short}
                    </span>

                    <strong>
                        ${formatDayNumber(
                            date
                        )}
                    </strong>

                </div>

                <small>
                    ${formatDayName(
                        date
                    )}
                </small>

            </div>


            <div class="course-plan-day-body">

                ${
                    visibleEntries.length
                        ? visibleEntries
                            .map(
                                entry =>
                                    renderCoursePlanLesson(
                                        academicYearId,
                                        entry,
                                        dateString
                                    )
                            )
                            .join("")
                        : `
                            <div
                                class="course-plan-empty">

                                No classes

                            </div>
                          `
                }

            </div>

        </div>

    `;

}


// ---------------------------------------------------------
// RENDER COURSE PLAN LESSON
// ---------------------------------------------------------

function renderCoursePlanLesson(
    academicYearId,
    timetableEntry,
    date
) {

    const classItem =
        ClassManager.getById(
            timetableEntry.classId
        );


    if (!classItem) {
        return "";
    }


    const lessons =
        LessonManager.getByDate(
            academicYearId,
            date
        );


    const lesson =
        lessons.find(
            item =>
                item.classId ===
                timetableEntry.classId
        );


    // -----------------------------------------------------
    // EMPTY SLOT
    // -----------------------------------------------------

    if (!lesson) {

        return `

            <button
                class="course-plan-slot"
                onclick="openAddLessonModal(
                    '${timetableEntry.classId}',
                    '${date}'
                )">

                <span
                    class="course-plan-time">

                    ${timetableEntry.startTime}
                    –
                    ${timetableEntry.endTime}

                </span>


                <strong>
                    ${escapeHTML(
                        classItem.name
                    )}
                </strong>


                <span
                    class="course-plan-add">

                    + PLAN LESSON

                </span>

            </button>

        `;
    }


    // -----------------------------------------------------
    // PLANNED LESSON
    // -----------------------------------------------------

    const isEvaluable =
        lesson.assessment?.isEvaluable === true;


    return `

        <button
            type="button"
            class="
                course-plan-slot
                course-plan-slot-planned
            "
            data-lesson-id="${lesson.id}"
            onclick="openEditLessonModal(
                '${lesson.id}'
            )">

            <span
                class="course-plan-time">

                ${timetableEntry.startTime}
                –
                ${timetableEntry.endTime}

            </span>


            <strong>
                ${escapeHTML(
                    classItem.name
                )}
            </strong>


            <span
                class="course-plan-lesson-title">

                ${escapeHTML(
                    lesson.title ||
                    "Untitled lesson"
                )}

            </span>


            ${
                isEvaluable
                    ? `
                        <span
                            class="course-plan-assessment-badge">

                            EVALUABLE

                        </span>
                      `
                    : ""
            }


            <span
                class="
                    course-plan-status
                    course-plan-status-${lesson.status}
                ">

                ${lesson.status}

            </span>

        </button>

    `;

}


// ---------------------------------------------------------
// RENDER COURSE PLAN
// ---------------------------------------------------------

function renderCoursePlan() {

    const container =
        document.getElementById(
            "appView"
        );


    if (!container) {
        return;
    }


    const academicYear =
        AppState.getCurrentAcademicYear();


    if (!academicYear) {
        return;
    }


    container.innerHTML = `

        <div class="planner-view">

            <div class="view-toolbar">

                <div>

                    <div class="view-label">
                        ACADEMIC YEAR
                    </div>

                    <div class="academic-year-name">
                        ${escapeHTML(
                            academicYear.name
                        )}
                    </div>

                </div>

            </div>


            <div class="planner-tabs">

                <button
                    class="planner-tab"
                    onclick="switchPlannerTab(
                        'timetable'
                    )">

                    MY TIMETABLE

                </button>


                <button
                    class="planner-tab active">

                    COURSE PLAN

                </button>

            </div>


            ${renderCoursePlanSection(
                academicYear.id
            )}

        </div>

    `;

}


// ---------------------------------------------------------
// CHANGE WEEK
// ---------------------------------------------------------

function changeCoursePlanWeek(
    amount
) {

    coursePlanWeekStart =
        addDays(
            coursePlanWeekStart,
            amount * 7
        );


    renderCoursePlan();

}


// ---------------------------------------------------------
// TODAY
// ---------------------------------------------------------

function goToCoursePlanToday() {

    coursePlanWeekStart =
        getMonday(
            new Date()
        );


    renderCoursePlan();

}