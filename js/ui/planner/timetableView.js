// =========================================================
// TIMETABLE
// =========================================================


// ---------------------------------------------------------
// TIMETABLE SECTION
// ---------------------------------------------------------

function renderTimetableSection(
    academicYearId
) {

    return `

        <section class="timetable-section">

            <div class="section-header">

                <div>

                    <h3 class="section-title">
                        My timetable
                    </h3>

                    <p class="planner-description">
                        Set up your weekly teaching
                        schedule.
                    </p>

                </div>

                <button
                    class="btn-primary"
                    onclick="openAddTimetableModal()">

                    + ADD CLASS

                </button>

            </div>


            ${renderTimetableGrid(
                academicYearId
            )}

        </section>

    `;
}


// ---------------------------------------------------------
// RENDER TIMETABLE GRID
// ---------------------------------------------------------

function renderTimetableGrid(
    academicYearId
) {

    const entries =
        TimetableManager.getByAcademicYear(
            academicYearId
        );


    const allTimes = [];


    entries.forEach(
        entry => {

            allTimes.push(
                entry.startTime
            );

            allTimes.push(
                entry.endTime
            );

        }
    );


    if (!allTimes.length) {

        return `

            <div class="timetable-empty">

                <div class="timetable-empty-icon">
                    ✎
                </div>

                <h4>
                    Your timetable is empty
                </h4>

                <p>
                    Add your first class to start
                    building your weekly schedule.
                </p>

                <button
                    class="btn-secondary"
                    onclick="openAddTimetableModal()">

                    + ADD FIRST CLASS

                </button>

            </div>

        `;
    }


    const sortedTimes =
        [...new Set(allTimes)]
            .sort();


    return `

        <div class="timetable-grid">

            <div class="timetable-corner">
                TIME
            </div>


            ${PLANNER_DAYS.map(
                day => `

                    <div
                        class="timetable-day-header">

                        <span>
                            ${day.short}
                        </span>

                        <small>
                            ${day.name}
                        </small>

                    </div>

                `
            ).join("")}


            ${sortedTimes.map(
                time => `

                    <div class="timetable-time">
                        ${time}
                    </div>


                    ${PLANNER_DAYS.map(
                        day => {

                            const dayEntries =
                                entries.filter(
                                    entry =>
                                        entry.dayOfWeek ===
                                        day.id &&
                                        entry.startTime ===
                                        time
                                );


                            return `

                                <div
                                    class="timetable-cell">

                                    ${
                                        dayEntries
                                            .map(
                                                entry =>
                                                    renderTimetableEntry(
                                                        entry
                                                    )
                                            )
                                            .join("")
                                    }

                                </div>

                            `;

                        }
                    ).join("")}

                `
            ).join("")}

        </div>

    `;
}


// ---------------------------------------------------------
// TIMETABLE ENTRY
// ---------------------------------------------------------

function renderTimetableEntry(
    entry
) {

    const classItem =
        ClassManager.getById(
            entry.classId
        );


    if (!classItem) {
        return "";
    }


    return `

        <button
            class="timetable-entry"
            onclick="openEditTimetableModal(
                '${entry.id}'
            )">

            <span class="timetable-entry-time">

                ${entry.startTime}
                –
                ${entry.endTime}

            </span>


            <strong>
                ${escapeHTML(
                    classItem.name
                )}
            </strong>


            <span class="timetable-entry-subject">

                ${escapeHTML(
                    classItem.subject ||
                    "English"
                )}

                ${
                    entry.room
                        ? `
                            ·
                            ${escapeHTML(
                                entry.room
                            )}
                          `
                        : ""
                }

            </span>

        </button>

    `;
}

// =========================================================
// TIMETABLE MODALS
// =========================================================


// ---------------------------------------------------------
// ADD TIMETABLE ENTRY
// ---------------------------------------------------------

function openAddTimetableModal() {

    const academicYear =
        AppState.getCurrentAcademicYear();

    if (!academicYear) {
        alert(
            "Please select an academic year first."
        );
        return;
    }

    const classes =
        ClassManager.getByAcademicYear(
            academicYear.id
        );

    if (!classes.length) {
        alert(
            "Create a class before adding it to your timetable."
        );
        return;
    }

    const modal =
        document.getElementById(
            "modalContainer"
        );

    modal.innerHTML = `

        <div
            class="modal-backdrop"
            onclick="closeModal(event)">

            <div
                class="modal"
                onclick="event.stopPropagation()">

                <div class="modal-header">

                    <div>

                        <div class="modal-kicker">
                            TIMETABLE
                        </div>

                        <h3>
                            Add class
                        </h3>

                    </div>

                    <button
                        class="modal-close"
                        onclick="closeModal()">

                        ×

                    </button>

                </div>


                <div class="modal-body">

                    <label>
                        Class
                    </label>

                    <select
                        id="timetableClass">

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


                    <label>
                        Day
                    </label>

                    <select
                        id="timetableDay">

                        ${PLANNER_DAYS.map(
                            day => `
                                <option
                                    value="${day.id}">
                                    ${escapeHTML(
                                        day.name
                                    )}
                                </option>
                            `
                        ).join("")}

                    </select>


                    <div class="form-row">

                        <div>

                            <label>
                                Start time
                            </label>

                            <input
                                id="timetableStartTime"
                                type="time">

                        </div>


                        <div>

                            <label>
                                End time
                            </label>

                            <input
                                id="timetableEndTime"
                                type="time">

                        </div>

                    </div>


                    <label>
                        Room
                    </label>

                    <input
                        id="timetableRoom"
                        type="text"
                        placeholder="Optional">

                </div>


                <div class="modal-footer">

                    <button
                        class="btn-secondary"
                        onclick="closeModal()">

                        CANCEL

                    </button>

                    <button
                        class="btn-primary"
                        onclick="createTimetableFromView()">

                        ADD CLASS

                    </button>

                </div>

            </div>

        </div>

    `;

    document
        .getElementById("timetableClass")
        .focus();
}


// ---------------------------------------------------------
// CREATE FROM VIEW
// ---------------------------------------------------------

function createTimetableFromView() {

    const academicYear =
        AppState.getCurrentAcademicYear();

    if (!academicYear) {
        alert(
            "Please select an academic year first."
        );
        return;
    }

    const classId =
        document
            .getElementById("timetableClass")
            .value;

    const dayOfWeek =
        Number(
            document
                .getElementById("timetableDay")
                .value
        );

    const startTime =
        document
            .getElementById("timetableStartTime")
            .value;

    const endTime =
        document
            .getElementById("timetableEndTime")
            .value;

    const room =
        document
            .getElementById("timetableRoom")
            .value
            .trim();


    try {

        TimetableManager.create({

            academicYearId:
                academicYear.id,

            classId,

            dayOfWeek,

            startTime,

            endTime,

            room

        });

        closeModal();

        renderPlannerView();

    } catch (error) {

        alert(
            error.message
        );

    }
}


// ---------------------------------------------------------
// EDIT TIMETABLE ENTRY
// ---------------------------------------------------------

function openEditTimetableModal(
    timetableId
) {

    const entry =
        TimetableManager.getById(
            timetableId
        );

    if (!entry) {
        alert(
            "Timetable entry not found."
        );
        return;
    }

    const classes =
        ClassManager.getByAcademicYear(
            entry.academicYearId
        );

    const modal =
        document.getElementById(
            "modalContainer"
        );

    modal.innerHTML = `

        <div
            class="modal-backdrop"
            onclick="closeModal(event)">

            <div
                class="modal"
                onclick="event.stopPropagation()">

                <div class="modal-header">

                    <div>

                        <div class="modal-kicker">
                            TIMETABLE
                        </div>

                        <h3>
                            Edit class
                        </h3>

                    </div>

                    <button
                        class="modal-close"
                        onclick="closeModal()">

                        ×

                    </button>

                </div>


                <div class="modal-body">

                    <label>
                        Class
                    </label>

                    <select
                        id="timetableClass">

                        ${classes.map(
                            classItem => `
                                <option
                                    value="${classItem.id}"
                                    ${
                                        classItem.id ===
                                        entry.classId
                                            ? "selected"
                                            : ""
                                    }>
                                    ${escapeHTML(
                                        classItem.name
                                    )}
                                </option>
                            `
                        ).join("")}

                    </select>


                    <label>
                        Day
                    </label>

                    <select
                        id="timetableDay">

                        ${PLANNER_DAYS.map(
                            day => `
                                <option
                                    value="${day.id}"
                                    ${
                                        day.id ===
                                        entry.dayOfWeek
                                            ? "selected"
                                            : ""
                                    }>
                                    ${escapeHTML(
                                        day.name
                                    )}
                                </option>
                            `
                        ).join("")}

                    </select>


                    <div class="form-row">

                        <div>

                            <label>
                                Start time
                            </label>

                            <input
                                id="timetableStartTime"
                                type="time"
                                value="${entry.startTime}">

                        </div>


                        <div>

                            <label>
                                End time
                            </label>

                            <input
                                id="timetableEndTime"
                                type="time"
                                value="${entry.endTime}">

                        </div>

                    </div>


                    <label>
                        Room
                    </label>

                    <input
                        id="timetableRoom"
                        type="text"
                        value="${escapeHTML(
                            entry.room || ""
                        )}"
                        placeholder="Optional">

                </div>


                <div class="modal-footer">

                    <button
                        class="btn-danger"
                        onclick="deleteTimetableFromView(
                            '${entry.id}'
                        )">

                        DELETE

                    </button>


                    <div class="modal-footer-actions">

                        <button
                            class="btn-secondary"
                            onclick="closeModal()">

                            CANCEL

                        </button>

                        <button
                            class="btn-primary"
                            onclick="updateTimetableFromView(
                                '${entry.id}'
                            )">

                            SAVE CHANGES

                        </button>

                    </div>

                </div>

            </div>

        </div>

    `;
}


// ---------------------------------------------------------
// UPDATE FROM VIEW
// ---------------------------------------------------------

function updateTimetableFromView(
    timetableId
) {

    const classId =
        document
            .getElementById("timetableClass")
            .value;

    const dayOfWeek =
        Number(
            document
                .getElementById("timetableDay")
                .value
        );

    const startTime =
        document
            .getElementById("timetableStartTime")
            .value;

    const endTime =
        document
            .getElementById("timetableEndTime")
            .value;

    const room =
        document
            .getElementById("timetableRoom")
            .value
            .trim();


    try {

        const entry =
            TimetableManager.update(
                timetableId,
                {
                    classId,
                    dayOfWeek,
                    startTime,
                    endTime,
                    room
                }
            );

        closeModal();

        renderPlannerView();

    } catch (error) {

        alert(
            error.message
        );

    }
}


// ---------------------------------------------------------
// DELETE FROM VIEW
// ---------------------------------------------------------

function deleteTimetableFromView(
    timetableId
) {

    const entry =
        TimetableManager.getById(
            timetableId
        );

    if (!entry) {
        return;
    }

    showConfirmModal(
        "DELETE TIMETABLE ENTRY",
        "Delete this class from your timetable?",
        () => {

            TimetableManager.delete(
                timetableId
            );

            closeModal();

            renderPlannerView();

        }
    );
}