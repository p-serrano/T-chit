// =========================================================
// T-CHIT — COURSE PLAN COPY
// =========================================================


// =========================================================
// STATE
// =========================================================

let coursePlanCopyMode = false;

let coursePlanCopySourceLessonId = null;


// =========================================================
// TOGGLE COPY MODE
// =========================================================

function toggleCoursePlanCopyMode() {

    if (coursePlanCopyMode) {

        exitCoursePlanCopyMode();

    }
    else {

        enterCoursePlanCopyMode();

    }

}


// =========================================================
// ENTER COPY MODE
// =========================================================

function enterCoursePlanCopyMode() {

    coursePlanCopyMode = true;

    document.body.classList.add(
        "course-plan-copy-mode"
    );

    updateCoursePlanCopyUI();

}


// =========================================================
// EXIT COPY MODE
// =========================================================

function exitCoursePlanCopyMode() {

    coursePlanCopyMode = false;

    coursePlanCopySourceLessonId = null;

    document.body.classList.remove(
        "course-plan-copy-mode"
    );

    closeCopyTargetModal();

    updateCoursePlanCopyUI();

}


// =========================================================
// UPDATE COPY MODE UI
// =========================================================

function updateCoursePlanCopyUI() {

    const button =
        document.getElementById(
            "coursePlanCopyButton"
        );


    if (button) {

        button.textContent =
            coursePlanCopyMode
                ? "EXIT COPY MODE"
                : "COPY PLAN";

    }


    updateCopyModeNotice();

}


// =========================================================
// COPY MODE NOTICE
// =========================================================

function updateCopyModeNotice() {

    const existing =
        document.getElementById(
            "coursePlanCopyNotice"
        );


    if (existing) {

        existing.remove();

    }


    if (!coursePlanCopyMode) {

        return;

    }


    const planner =
        document.querySelector(
            ".course-plan-section"
        );


    if (!planner) {

        return;

    }


    const notice =
        document.createElement(
            "div"
        );


    notice.id =
        "coursePlanCopyNotice";


    notice.className =
        "course-plan-copy-notice";


    notice.innerHTML = `

        <div>

            <strong>
                COPY PLAN MODE
            </strong>

            <span>
                Select a lesson to copy it to another class or date.
            </span>

        </div>


        <button
            type="button"
            onclick="exitCoursePlanCopyMode()">

            EXIT

        </button>

    `;


    planner.prepend(
        notice
    );

}


// =========================================================
// LESSON CLICK — EVENT DELEGATION
// =========================================================

document.addEventListener(
    "click",
    function(event) {

        if (!coursePlanCopyMode) {

            return;

        }


        const lessonElement =
            event.target.closest(
                "[data-lesson-id]"
            );


        if (!lessonElement) {

            return;

        }


        const lessonId =
            lessonElement.dataset.lessonId;


        if (!lessonId) {

            return;

        }


        /*
         * Stop the normal lesson onclick:
         *
         * openEditLessonModal(...)
         *
         * because we are in Copy Mode.
         */

        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();


        coursePlanCopySourceLessonId =
            lessonId;


        openCopyTargetModal(
            lessonId
        );

    },
    true
);


// =========================================================
// OPEN COPY TARGET MODAL
// =========================================================

function openCopyTargetModal(
    lessonId
) {

    const sourceLesson =
        LessonManager.getById(
            lessonId
        );


    if (!sourceLesson) {

        return;

    }


    const allClasses =
        AppState.data.classes || [];


    // -----------------------------------------------------
    // ONLY CLASSES THAT EXIST IN THE TIMETABLE
    // -----------------------------------------------------

    const timetableEntries =
        TimetableManager
            .getByAcademicYear(
                sourceLesson.academicYearId
            );


    const scheduledClassIds =
        [
            ...new Set(
                timetableEntries
                    .map(
                        entry =>
                            entry.classId
                    )
            )
        ];


    const classes =
        allClasses
            .filter(
                classItem =>
                    scheduledClassIds.includes(
                        classItem.id
                    )
            )
            .sort(
                (a, b) =>
                    a.name.localeCompare(
                        b.name
                    )
            );


    const currentClass =
        allClasses.find(
            classItem =>
                classItem.id ===
                sourceLesson.classId
        );


    const sourceClassName =
        currentClass
            ? currentClass.name
            : "Unknown class";


    closeCopyTargetModal();


    const overlay =
        document.createElement(
            "div"
        );


    overlay.id =
        "copyTargetModal";


    overlay.className =
        "modal-overlay";


    overlay.innerHTML = `

        <div class="modal">

            <div class="modal-header">

                <div>

                    <h2>
                        COPY TO
                    </h2>

                    <p>
                        Choose where to copy this lesson.
                    </p>

                </div>


                <button
                    type="button"
                    class="modal-close"
                    onclick="closeCopyTargetModal()">

                    ×

                </button>

            </div>


            <div class="modal-body">

                <!-- =====================================
                     SOURCE
                     ===================================== -->

                <div class="copy-plan-source">

                    <div class="copy-plan-label">
                        FROM
                    </div>


                    <div class="copy-plan-source-class">

                        ${escapeCopyText(
                            sourceClassName
                        )}

                    </div>


                    <div class="copy-plan-source-date">

                        ${formatCopyDate(
                            sourceLesson.date
                        )}

                    </div>


                    <div class="copy-plan-source-title">

                        ${escapeCopyText(
                            sourceLesson.title ||
                            "Untitled lesson"
                        )}

                    </div>

                </div>


                <!-- =====================================
                     TARGET CLASS
                     ===================================== -->

                <div class="form-group">

                    <label
                        for="copyPlanTargetClass">

                        CLASS

                    </label>


                    <select
                        id="copyPlanTargetClass">

                        ${
                            classes.length
                                ? classes
                                    .map(
                                        classItem => `

                                            <option
                                                value="${classItem.id}"
                                                ${
                                                    classItem.id ===
                                                    sourceLesson.classId
                                                        ? "selected"
                                                        : ""
                                                }>

                                                ${escapeCopyText(
                                                    classItem.name
                                                )}

                                            </option>

                                        `
                                    )
                                    .join("")
                                : `
                                    <option value="">
                                        No scheduled classes
                                    </option>
                                  `
                        }

                    </select>

                </div>


                <!-- =====================================
                     TARGET DATE
                     ===================================== -->

                <div class="form-group">

                    <label
                        for="copyPlanTargetDate">

                        DATE

                    </label>


                    <input
                        type="date"
                        id="copyPlanTargetDate"
                        value="${sourceLesson.date}">

                </div>


                <!-- =====================================
                     TARGET PREVIEW
                     ===================================== -->

                <div
                    id="copyPlanTargetPreview"
                    class="copy-plan-target-preview">

                </div>

            </div>


            <div class="modal-footer">

                <button
                    type="button"
                    class="btn-secondary"
                    onclick="closeCopyTargetModal()">

                    CANCEL

                </button>


                <button
                    type="button"
                    id="copyPlanConfirmButton"
                    class="btn-primary"
                    onclick="confirmCopyPlan()">

                    COPY PLAN

                </button>

            </div>

        </div>

    `;


    document.body.appendChild(
        overlay
    );


    const classSelect =
        document.getElementById(
            "copyPlanTargetClass"
        );


    const dateInput =
        document.getElementById(
            "copyPlanTargetDate"
        );


    if (classSelect) {

        classSelect.addEventListener(
            "change",
            updateCopyTargetPreview
        );

    }


    if (dateInput) {

        dateInput.addEventListener(
            "change",
            updateCopyTargetPreview
        );

    }


    updateCopyTargetPreview();

}


// =========================================================
// UPDATE TARGET PREVIEW
// =========================================================

function updateCopyTargetPreview() {

    const sourceLesson =
        LessonManager.getById(
            coursePlanCopySourceLessonId
        );


    const classSelect =
        document.getElementById(
            "copyPlanTargetClass"
        );


    const dateInput =
        document.getElementById(
            "copyPlanTargetDate"
        );


    const preview =
        document.getElementById(
            "copyPlanTargetPreview"
        );


    const confirmButton =
        document.getElementById(
            "copyPlanConfirmButton"
        );


    if (
        !sourceLesson ||
        !classSelect ||
        !dateInput ||
        !preview
    ) {

        return;

    }


    const targetClassId =
        classSelect.value;


    const targetDate =
        dateInput.value;


    // -----------------------------------------------------
    // RESET
    // -----------------------------------------------------

    if (confirmButton) {

        confirmButton.disabled = false;

    }


    if (
        !targetClassId ||
        !targetDate
    ) {

        preview.innerHTML = "";

        if (confirmButton) {

            confirmButton.disabled = true;

        }

        return;

    }


    // -----------------------------------------------------
    // CHECK TARGET CLASS SCHEDULE
    // -----------------------------------------------------

    const targetDateDayOfWeek =
        getCopyDayOfWeek(
            targetDate
        );


    const timetableEntries =
        TimetableManager
            .getByAcademicYear(
                sourceLesson.academicYearId
            );


    const targetClassSchedule =
        timetableEntries.filter(
            entry =>
                entry.classId ===
                    targetClassId &&
                entry.dayOfWeek ===
                    targetDateDayOfWeek
        );


    // -----------------------------------------------------
    // NO CLASS ON THAT DAY
    // -----------------------------------------------------

    if (!targetClassSchedule.length) {

        const targetClass =
            (AppState.data.classes || [])
                .find(
                    classItem =>
                        classItem.id ===
                        targetClassId
                );


        const targetClassName =
            targetClass
                ? targetClass.name
                : "This class";


        preview.innerHTML = `

            <div class="copy-plan-target-invalid">

                <strong>
                    NO CLASS SCHEDULED
                </strong>

                <span>
                    ${escapeCopyText(
                        targetClassName
                    )}
                    has no class scheduled on
                    ${formatCopyDate(
                        targetDate
                    )}.
                </span>

                <small>
                    Choose another date.
                </small>

            </div>

        `;


        if (confirmButton) {

            confirmButton.disabled = true;

        }


        return;

    }


    // -----------------------------------------------------
    // CHECK EXISTING LESSON
    // -----------------------------------------------------

    const targetLessons =
        LessonManager
            .getByDate(
                sourceLesson.academicYearId,
                targetDate
            )
            .filter(
                lesson =>
                    lesson.classId ===
                    targetClassId
            );


    // -----------------------------------------------------
    // EMPTY SESSION
    // -----------------------------------------------------

    if (!targetLessons.length) {

        preview.innerHTML = `

            <div class="copy-plan-target-empty">

                <strong>
                    CLASS SCHEDULED
                </strong>

                <span>
                    This class has a scheduled lesson on
                    ${formatCopyDate(
                        targetDate
                    )}.
                </span>

            </div>

        `;

        return;

    }


    // -----------------------------------------------------
    // SESSION ALREADY PLANNED
    // -----------------------------------------------------

    preview.innerHTML = `

        <div class="copy-plan-target-existing">

            <strong>
                SESSION ALREADY PLANNED
            </strong>


            ${targetLessons
                .map(
                    lesson => `

                        <div>
                            ${escapeCopyText(
                                lesson.title ||
                                "Untitled lesson"
                            )}
                        </div>

                    `
                )
                .join("")
            }


            <span class="copy-plan-existing-note">

                You can still create the copied lesson.

            </span>

        </div>

    `;

}


// =========================================================
// CONFIRM COPY
// =========================================================

function confirmCopyPlan() {

    const sourceLesson =
        LessonManager.getById(
            coursePlanCopySourceLessonId
        );

    if (!sourceLesson) {

        showAlertModal(
            "LESSON NOT FOUND",
            "The original lesson could not be found.",
            "error"
        );

        return;

    }


    const classSelect =
        document.getElementById(
            "copyPlanTargetClass"
        );

    const dateInput =
        document.getElementById(
            "copyPlanTargetDate"
        );


    if (
        !classSelect ||
        !dateInput
    ) {

        return;

    }


    const targetClassId =
        classSelect.value;

    const targetDate =
        dateInput.value;


    if (
        !targetClassId ||
        !targetDate
    ) {

        showAlertModal(
            "MISSING INFORMATION",
            "Please select a class and date.",
            "warning"
        );

        return;

    }


    // -----------------------------------------------------
    // CHECK SCHEDULE
    // -----------------------------------------------------

    const targetDateDayOfWeek =
        getCopyDayOfWeek(
            targetDate
        );


    const timetableEntries =
        TimetableManager
            .getByAcademicYear(
                sourceLesson.academicYearId
            );


    const targetClassSchedule =
        timetableEntries.filter(
            entry =>
                entry.classId ===
                    targetClassId &&
                entry.dayOfWeek ===
                    targetDateDayOfWeek
        );


    if (!targetClassSchedule.length) {

        showAlertModal(
            "NO CLASS SCHEDULED",
            "This class has no scheduled lesson on the selected date.",
            "warning"
        );

        updateCopyTargetPreview();

        return;

    }


    // -----------------------------------------------------
    // SAME DESTINATION
    // -----------------------------------------------------

    if (
        targetClassId ===
            sourceLesson.classId &&
        targetDate ===
            sourceLesson.date
    ) {

        showAlertModal(
            "SAME DESTINATION",
            "The destination is the same as the original lesson.",
            "warning"
        );

        return;

    }


    // -----------------------------------------------------
    // CHECK EXISTING LESSONS
    // -----------------------------------------------------

    const existingLessons =
        LessonManager
            .getByDate(
                sourceLesson.academicYearId,
                targetDate
            )
            .filter(
                lesson =>
                    lesson.classId ===
                    targetClassId
            );


    if (existingLessons.length) {

        const existingTitle =
            existingLessons
                .map(
                    lesson =>
                        lesson.title ||
                        "Untitled lesson"
                )
                .join(", ");


        showConfirmModal(

            "SESSION ALREADY PLANNED",

            `There is already a lesson planned for this class and date:\n\n${existingTitle}\n\nDo you want to create the copied lesson anyway?`,

            () => {

                createCopiedLesson(
                    sourceLesson,
                    targetClassId,
                    targetDate
                );

            }

        );

        return;

    }


    // -----------------------------------------------------
    // NO CONFLICT → COPY DIRECTLY
    // -----------------------------------------------------

    createCopiedLesson(
        sourceLesson,
        targetClassId,
        targetDate
    );

}


// =========================================================
// CREATE COPIED LESSON
// =========================================================

function createCopiedLesson(
    sourceLesson,
    targetClassId,
    targetDate
) {

    LessonManager.create({

        academicYearId:
            sourceLesson.academicYearId,

        classId:
            targetClassId,

        date:
            targetDate,

        title:
            sourceLesson.title,

        notes:
            sourceLesson.notes,

        status:
            "planned",

        assessment: {

            isEvaluable:
                sourceLesson.assessment
                    ?.isEvaluable === true,

            title:
                sourceLesson.assessment
                    ?.title || "",

            instruments:
                Array.isArray(
                    sourceLesson.assessment
                        ?.instruments
                )
                    ? [
                        ...sourceLesson
                            .assessment
                            .instruments
                    ]
                    : [],

            competences:
                Array.isArray(
                    sourceLesson.assessment
                        ?.competences
                )
                    ? [
                        ...sourceLesson
                            .assessment
                            .competences
                    ]
                    : []

        }

    });


    exitCoursePlanCopyMode();

    renderPlannerView();


    showAlertModal(
        "PLAN COPIED",
        `"${sourceLesson.title || "Untitled lesson"}" has been copied successfully.`,
        "success"
    );

}


// =========================================================
// CLOSE TARGET MODAL
// =========================================================

function closeCopyTargetModal() {

    const modal =
        document.getElementById(
            "copyTargetModal"
        );


    if (modal) {

        modal.remove();

    }

}


// =========================================================
// GET ISO DAY OF WEEK
// =========================================================

function getCopyDayOfWeek(
    dateString
) {

    if (!dateString) {

        return null;

    }


    const date =
        new Date(
            `${dateString}T00:00:00`
        );


    const day =
        date.getDay();


    /*
     * JavaScript:
     *
     * Sunday = 0
     * Monday = 1
     * ...
     * Saturday = 6
     *
     * Timetable:
     *
     * Monday = 1
     * ...
     * Sunday = 7
     */

    return day === 0
        ? 7
        : day;

}


// =========================================================
// DATE FORMAT
// =========================================================

function formatCopyDate(
    dateString
) {

    if (!dateString) {

        return "";

    }


    const date =
        new Date(
            `${dateString}T00:00:00`
        );


    return date.toLocaleDateString(
        "en-GB",
        {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric"
        }
    );

}


// =========================================================
// ESCAPE TEXT
// =========================================================

function escapeCopyText(
    value
) {

    return String(
        value || ""
    )
    .replace(
        /&/g,
        "&amp;"
    )
    .replace(
        /</g,
        "&lt;"
    )
    .replace(
        />/g,
        "&gt;"
    )
    .replace(
        /"/g,
        "&quot;"
    )
    .replace(
        /'/g,
        "&#039;"
    );

}