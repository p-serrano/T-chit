// ---------------------------------------------------------
// TAKE ATTENDANCE TAB
// ---------------------------------------------------------

function renderAttendanceTakeTab(
    academicYear
) {

    const today =
        getTodayISODate();


    const dayOfWeek =
        getTodayDayOfWeek();


    const timetableEntries =
        TimetableManager.getByDay(
            academicYear.id,
            dayOfWeek
        );


    const classIds =
        [
            ...new Set(
                timetableEntries
                    .map(
                        entry =>
                            entry.classId
                    )
                    .filter(Boolean)
            )
        ];


    const classes =
        classIds
            .map(
                classId =>
                    ClassManager.getById(
                        classId
                    )
            )
            .filter(
                classItem =>
                    classItem &&
                    (
                        !classItem.type ||
                        classItem.type ===
                        ClassManager.TYPES.CLASS
                    ) &&
                    EnrollmentManager
                        .getStudentsForClass(
                            classItem.id
                        )
                        .length > 0
            );


    return `

        <section class="attendance-record-section">

            <div class="attendance-heading">

                <div>

                    <div class="attendance-section-label">
                        RECORD ATTENDANCE
                    </div>

                    <h3>
                        Take attendance
                    </h3>

                    <p>
                        Select a date and class to record
                        student attendance.
                    </p>

                </div>

            </div>


            <div class="attendance-selector">


                <!-- DATE -->

                <div class="attendance-selector-field">

                    <label
                        for="attendanceDateInput"
                    >
                        DATE
                    </label>

                    <input
                        type="date"
                        id="attendanceDateInput"
                        value="${today}"
                    >

                </div>


                <!-- CLASS -->

                <div class="attendance-selector-field">

                    <label
                        for="attendanceClassSelect"
                    >
                        CLASS
                    </label>

                    <select
                        id="attendanceClassSelect"
                    >

                        <option value="">
                            SELECT CLASS
                        </option>

                        ${
                            classes
                                .map(
                                    classItem => `

                                        <option
                                            value="${classItem.id}"
                                        >
                                            ${escapeHTML(
                                                classItem.name
                                            )}
                                        </option>

                                    `
                                )
                                .join("")
                        }

                    </select>

                </div>


                <!-- LOAD -->

                <div class="attendance-selector-action">

                    <button
                        type="button"
                        class="btn-primary"
                        id="loadAttendanceBtn"
                    >
                        LOAD ATTENDANCE
                    </button>

                </div>


            </div>


            <div
                id="attendanceDailyContainer"
                class="attendance-daily-container"
            >

                <div class="attendance-daily-empty">

                    <div class="empty-state-icon">
                        ✓
                    </div>

                    <h3>
                        Ready to take attendance
                    </h3>

                    <p>
                        Select a date and class above
                        to load the student list.
                    </p>

                </div>

            </div>


        </section>

    `;

}


function setupAttendanceTakeTab() {

    document
        .getElementById("loadAttendanceBtn")
        ?.addEventListener(
            "click",
            loadAttendanceForSelectedDate
        );


    document
        .getElementById("attendanceDateInput")
        ?.addEventListener(
            "change",
            () => {

                updateAttendanceClassSelector();

            }
        );
}


// ---------------------------------------------------------
// UPDATE CLASSES WHEN DATE CHANGES
// ---------------------------------------------------------

function updateAttendanceClassSelector() {

    const dateInput =
        document.getElementById(
            "attendanceDateInput"
        );

    const classSelect =
        document.getElementById(
            "attendanceClassSelect"
        );


    if (
        !dateInput ||
        !classSelect
    ) {
        return;
    }


    const date =
        dateInput.value;


    if (!date) {
        return;
    }


    const academicYear =
        AppState.getCurrentAcademicYear();


    if (!academicYear) {
        return;
    }


    const dayOfWeek =
        getDayOfWeekFromISODate(
            date
        );


    const timetableEntries =
        TimetableManager.getByDay(
            academicYear.id,
            dayOfWeek
        );


    const classIds =
        [
            ...new Set(
                timetableEntries
                    .map(
                        entry =>
                            entry.classId
                    )
                    .filter(Boolean)
            )
        ];


    const classes =
        classIds
            .map(
                classId =>
                    ClassManager.getById(
                        classId
                    )
            )
            .filter(
                classItem =>
                    classItem &&
                    (
                        !classItem.type ||
                        classItem.type ===
                        ClassManager.TYPES.CLASS
                    ) &&
                    EnrollmentManager
                        .getStudentsForClass(
                            classItem.id
                        )
                        .length > 0
            );


    classSelect.innerHTML = `

        <option value="">
            SELECT CLASS
        </option>

        ${
            classes
                .map(
                    classItem => `

                        <option
                            value="${classItem.id}"
                        >
                            ${escapeHTML(
                                classItem.name
                            )}
                        </option>

                    `
                )
                .join("")
        }

    `;
}


// ---------------------------------------------------------
// DAY OF WEEK FROM ISO DATE
// ---------------------------------------------------------

function getDayOfWeekFromISODate(
    isoDate
) {

    const date =
        new Date(
            `${isoDate}T00:00:00`
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return null;
    }


    const day =
        date.getDay();


    return day === 0
        ? 7
        : day;
}


// ---------------------------------------------------------
// LOAD DAILY ATTENDANCE
// ---------------------------------------------------------

function loadAttendanceForSelectedDate() {

    const classSelect =
        document.getElementById(
            "attendanceClassSelect"
        );

    const dateInput =
        document.getElementById(
            "attendanceDateInput"
        );

    const container =
        document.getElementById(
            "attendanceDailyContainer"
        );


    if (
        !classSelect ||
        !dateInput ||
        !container
    ) {
        return;
    }


    const classId =
        classSelect.value;


    const date =
        dateInput.value;


    if (!classId) {

        showAlertModal(
            "SELECT CLASS",
            "Please select a class first.",
            "error"
        );

        return;
    }


    if (!date) {

        showAlertModal(
            "SELECT DATE",
            "Please select a date.",
            "error"
        );

        return;
    }


    const classItem =
        ClassManager.getById(
            classId
        );


    if (!classItem) {

        showAlertModal(
            "CLASS NOT FOUND",
            "The selected class could not be found.",
            "error"
        );

        return;
    }


    const students =
        EnrollmentManager.getStudentsForClass(
            classId
        );

        console.log(
            "TAKE ATTENDANCE",
            {
                classId,
                students: students.map(
                    student => ({
                        id: student.id,
                        name: student.firstName,
                        lastName: student.lastName
                    })
                )
            }
        );


    const attendance =
        AttendanceManager.getForClassAndDate(
            classId,
            date
        );


    const attendanceRecords =
        attendance?.records || [];


    container.innerHTML = `

        <div class="attendance-daily-loaded">

            <div class="attendance-daily-loaded-header">

                <div>

                    <div class="attendance-section-label">
                        ATTENDANCE
                    </div>

                    <h3>
                        ${escapeHTML(
                            classItem.name
                        )}
                    </h3>

                    <p>
                        ${escapeHTML(
                            formatAttendanceDate(
                                date
                            )
                        )}
                    </p>

                </div>


                <div class="attendance-student-count">

                    ${students.length}

                    ${
                        students.length === 1
                            ? "student"
                            : "students"
                    }

                </div>

            </div>


            ${
                students.length
                    ? renderAttendanceStudents(
                        students,
                        attendanceRecords,
                        classId,
                        date
                    )
                    : `
                        <div class="attendance-empty">

                            No students are enrolled
                            in this class.

                        </div>
                    `
            }


            ${
                students.length
                    ? `
                        <div class="attendance-daily-actions">

                            <button
                                type="button"
                                class="btn-primary"
                                id="saveDailyAttendanceBtn"
                            >
                                SAVE ATTENDANCE
                            </button>

                        </div>
                    `
                    : ""
            }

        </div>
    `;


    setupAttendanceStatusControls(
        container
    );


    document
        .getElementById(
            "saveDailyAttendanceBtn"
        )
        ?.addEventListener(
            "click",
            () =>
                saveDailyAttendance(
                    classId,
                    date
                )
        );
}


// ---------------------------------------------------------
// SAVE DAILY ATTENDANCE
// ---------------------------------------------------------

function saveDailyAttendance(
    classId,
    date
) {

    const academicYear =
        AppState.getCurrentAcademicYear();


    if (!academicYear) {
        return;
    }


    const container =
        document.getElementById(
            "attendanceDailyContainer"
        );


    if (!container) {
        return;
    }


    const radios =
        Array.from(
            container.querySelectorAll(
                ".attendance-status input:checked"
            )
        );


    const records =
        radios.map(
            radio => ({

                studentId:
                    radio.dataset.studentId,

                status:
                    radio.value

            })
        );


    try {

        AttendanceManager.save({

            academicYearId:
                academicYear.id,

            classId,

            date,

            records

        });


        showAlertModal(
            "ATTENDANCE SAVED",
            "Attendance has been saved successfully.",
            "success"
        );


        loadAttendanceForSelectedDate();


    } catch (error) {

        console.error(
            "T-chit: failed to save daily attendance.",
            error
        );


        showAlertModal(
            "COULD NOT SAVE",
            "Attendance could not be saved. Please try again.",
            "error"
        );

    }
}