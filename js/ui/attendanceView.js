// =========================================================
// T-CHIT — ATTENDANCE VIEW
// =========================================================


// ---------------------------------------------------------
// OPEN CLASS SESSION
// ---------------------------------------------------------

function openClassSession(classId) {

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


    const academicYear =
        AppState.getCurrentAcademicYear();

    if (!academicYear) {
        showAlertModal(
            "ACADEMIC YEAR",
            "No academic year is currently selected.",
            "error"
        );
        return;
    }


    const today =
        getTodayISODate();


    const timetableEntries =
        TimetableManager.getByDay(
            academicYear.id,
            getTodayDayOfWeek()
        ).filter(
            entry =>
                entry.classId === classId
        );


    const timetableEntry =
        timetableEntries
            .sort(
                (a, b) =>
                    a.startTime.localeCompare(
                        b.startTime
                    )
            )[0] || null;


    const lessons =
        LessonManager.getByDate(
            academicYear.id,
            today
        ).filter(
            lesson =>
                lesson.classId === classId
        );


    const lesson =
        lessons[0] || null;


    const students =
        EnrollmentManager.getStudentsForClass(
            classId
        );


    const existingAttendance =
        AttendanceManager.getForClassAndDate(
            classId,
            today
        );


    renderAttendanceView({
        academicYear,
        classItem,
        today,
        timetableEntry,
        lesson,
        students,
        existingAttendance
    });
}


// ---------------------------------------------------------
// RENDER
// ---------------------------------------------------------

function renderAttendanceView({
    academicYear,
    classItem,
    today,
    timetableEntry,
    lesson,
    students,
    existingAttendance
}) {

    closeClassSession();


    const overlay =
        document.createElement("div");

    overlay.id =
        "attendanceModal";

    overlay.className =
        "modal-overlay";


    const formattedDate =
        formatAttendanceDate(today);


    const timeLabel =
        timetableEntry
            ? `${timetableEntry.startTime}–${timetableEntry.endTime}`
            : "TIME NOT SCHEDULED";


    const roomLabel =
        timetableEntry?.room
            ? ` · ${escapeHTML(timetableEntry.room)}`
            : "";


    const attendanceRecords =
        existingAttendance?.records || [];


    overlay.innerHTML = `

        <div
            class="modal attendance-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="attendanceModalTitle"
        >

            <div class="modal-header">

                <div>

                    <h2 id="attendanceModalTitle">
                        ${escapeHTML(classItem.name)}
                    </h2>

                    <div class="attendance-session-meta">

                        ${escapeHTML(formattedDate)}
                        ·
                        ${escapeHTML(timeLabel)}
                        ${roomLabel}

                    </div>

                </div>


                <button
                    type="button"
                    class="modal-close"
                    id="attendanceModalClose"
                    aria-label="Close class session"
                >
                    ×
                </button>

            </div>


            <div class="modal-body attendance-modal-body">


                <section class="attendance-lesson">

                    <div class="attendance-section-label">
                        TODAY'S LESSON
                    </div>


                    ${
                        lesson
                            ? `
                                <div class="attendance-lesson-card">

                                    <div class="attendance-lesson-title">
                                        ${escapeHTML(
                                            lesson.title ||
                                            "Untitled lesson"
                                        )}
                                    </div>

                                    ${
                                        lesson.notes
                                            ? `
                                                <div class="attendance-lesson-notes">
                                                    ${escapeHTML(
                                                        lesson.notes
                                                    )}
                                                </div>
                                            `
                                            : ""
                                    }

                                </div>
                            `
                            : `
                                <div class="attendance-no-lesson">
                                    NO LESSON PLANNED
                                </div>
                            `
                    }

                </section>


                <section class="attendance-section">

                    <div class="attendance-section-heading">

                        <div>
                            <div class="attendance-section-label">
                                ATTENDANCE
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

                    </div>


                    ${
                        students.length
                            ? renderAttendanceStudents(
                                students,
                                attendanceRecords,
                                classItem.id,
                                today
                            )
                            : `
                                <div class="attendance-empty">
                                    No students are enrolled in this class.
                                </div>
                            `
                    }

                </section>

            </div>


            <div class="modal-footer attendance-modal-footer">

                <button
                    type="button"
                    class="btn-secondary"
                    id="attendanceCancelBtn"
                >
                    CANCEL
                </button>


                <button
                    type="button"
                    class="btn-primary"
                    id="attendanceSaveBtn"
                >
                    SAVE ATTENDANCE
                </button>

            </div>

        </div>
    `;


    document.body.appendChild(overlay);


    // Activate attendance controls
    setupAttendanceStatusControls();


    document
        .getElementById("attendanceModalClose")
        ?.addEventListener(
            "click",
            closeClassSession
        );


    document
        .getElementById("attendanceCancelBtn")
        ?.addEventListener(
            "click",
            closeClassSession
        );


    document
        .getElementById("attendanceSaveBtn")
        ?.addEventListener(
            "click",
            () => saveClassAttendance(
                academicYear.id,
                classItem.id,
                today
            )
        );
}


// ---------------------------------------------------------
// STUDENT ROWS
// ---------------------------------------------------------

function renderAttendanceStudents(
    students,
    attendanceRecords,
    classId,
    date
) {

    return `

        <div
            class="attendance-student-list"
            role="list"
        >

            ${
                students.map(
                    student =>
                        renderAttendanceStudent(
                            student,
                            attendanceRecords,
                            classId,
                            date
                        )
                ).join("")
            }

        </div>
    `;
}


function renderAttendanceStudent(
    student,
    attendanceRecords,
    classId,
    date
) {

    const savedRecord =
        attendanceRecords.find(
            record =>
                record.studentId === student.id
        );


    const status =
        savedRecord?.status || "present";


    const name =
        student.name ||
        `${student.firstName || ""} ${student.lastName || ""}`.trim() ||
        "Unnamed student";


    const groupName =
        `attendance_${classId}_${date}_${student.id}`;


    return `

        <div
            class="attendance-student"
            role="listitem"
        >

            <div class="attendance-student-name">
                ${escapeHTML(name)}
            </div>


            <div
                class="attendance-status-group"
                role="radiogroup"
                aria-label="Attendance status for ${escapeHTML(name)}"
            >

                ${renderAttendanceStatus(
                    groupName,
                    student.id,
                    "present",
                    "PRESENT",
                    status
                )}

                ${renderAttendanceStatus(
                    groupName,
                    student.id,
                    "absent",
                    "ABSENT",
                    status
                )}

                ${renderAttendanceStatus(
                    groupName,
                    student.id,
                    "justified",
                    "JUSTIFIED",
                    status
                )}

                ${renderAttendanceStatus(
                    groupName,
                    student.id,
                    "late",
                    "LATE",
                    status
                )}

            </div>

        </div>
    `;
}


// ---------------------------------------------------------
// STATUS CONTROL
// ---------------------------------------------------------

function renderAttendanceStatus(
    groupName,
    studentId,
    value,
    label,
    currentStatus
) {

    const id =
        `${groupName}_${value}`;


    return `

        <label
            class="
                attendance-status
                attendance-status-${value}
                ${
                    currentStatus === value
                        ? "selected"
                        : ""
                }
            "
            for="${id}"
        >

            <input
                type="radio"
                id="${id}"
                name="${groupName}"
                value="${value}"
                data-student-id="${studentId}"
                ${
                    currentStatus === value
                        ? "checked"
                        : ""
                }
            >

            <span>
                ${label}
            </span>

        </label>
    `;
}


// ---------------------------------------------------------
// SAVE
// ---------------------------------------------------------

function saveClassAttendance(
    academicYearId,
    classId,
    date
) {

    const radios =
        Array.from(
            document.querySelectorAll(
                "#attendanceModal " +
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

            academicYearId,

            classId,

            date,

            records

        });


        closeClassSession();


        showAlertModal(
            "ATTENDANCE SAVED",
            "Today's attendance has been saved.",
            "success"
        );


    } catch (error) {

        console.error(
            "T-chit: failed to save attendance.",
            error
        );


        showAlertModal(
            "COULD NOT SAVE",
            "Attendance could not be saved. Please try again.",
            "error"
        );
    }
}


// ---------------------------------------------------------
// CLOSE
// ---------------------------------------------------------

function closeClassSession() {

    const modal =
        document.getElementById(
            "attendanceModal"
        );

    if (modal) {
        modal.remove();
    }
}


// ---------------------------------------------------------
// DATE HELPERS
// ---------------------------------------------------------

function getTodayISODate() {

    const today =
        new Date();


    const year =
        today.getFullYear();


    const month =
        String(
            today.getMonth() + 1
        ).padStart(2, "0");


    const day =
        String(
            today.getDate()
        ).padStart(2, "0");


    return `${year}-${month}-${day}`;
}


function getTodayDayOfWeek() {

    const day =
        new Date().getDay();


    return day === 0
        ? 7
        : day;
}


function formatAttendanceDate(
    isoDate
) {

    const date =
        new Date(
            `${isoDate}T12:00:00`
        );


    return new Intl.DateTimeFormat(
        "en-GB",
        {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric"
        }
    ).format(date);
}
function setupAttendanceStatusControls() {

    const modal =
        document.getElementById("attendanceModal");

    if (!modal) return;


    const radios =
        modal.querySelectorAll(
            ".attendance-status input"
        );


    radios.forEach(radio => {

        radio.addEventListener(
            "change",
            () => {

                const group =
                    radio.closest(
                        ".attendance-status-group"
                    );

                if (!group) return;


                group
                    .querySelectorAll(
                        ".attendance-status"
                    )
                    .forEach(label => {

                        label.classList.remove(
                            "selected"
                        );

                    });


                const selectedLabel =
                    radio.closest(
                        ".attendance-status"
                    );

                if (selectedLabel) {

                    selectedLabel.classList.add(
                        "selected"
                    );
                }

            }
        );

    });
}