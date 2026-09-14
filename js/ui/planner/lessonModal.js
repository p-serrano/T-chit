// =========================================================
// LESSON MODALS
// =========================================================


// ---------------------------------------------------------
// ADD LESSON MODAL
// ---------------------------------------------------------

function openAddLessonModal(
    classId,
    date
) {

    const academicYear =
        AppState.getCurrentAcademicYear();


    if (!academicYear) {
        return;
    }


    const classItem =
        ClassManager.getById(
            classId
        );


    if (!classItem) {
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
                            COURSE PLAN
                        </div>

                        <h3>
                            Plan lesson
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

                    <input
                        type="text"
                        value="${escapeHTML(
                            classItem.name
                        )}"
                        disabled>


                    <label>
                        Date
                    </label>

                    <input
                        type="date"
                        id="lessonDate"
                        value="${date}">


                    <label>
                        Lesson title
                    </label>

                    <input
                        id="lessonTitle"
                        type="text"
                        placeholder="e.g. Present simple"
                        autocomplete="off">


                    <label>
                        Notes
                    </label>

                    <textarea
                        id="lessonNotes"
                        rows="5"
                        placeholder="What are you going to do?"></textarea>


                    <!-- =================================
                         ASSESSMENT
                         ================================= -->

                    <div class="lesson-assessment">

                        <label
                            class="lesson-assessment-toggle">

                            <input
                                id="lessonEvaluable"
                                type="checkbox"
                                onchange="toggleLessonAssessment()">

                            <span>
                                Evaluable activity
                            </span>

                        </label>


                        <div
                            id="lessonAssessmentFields"
                            class="lesson-assessment-fields hidden">

                            <label>
                                Activity title
                            </label>

                            <input
                                id="lessonAssessmentTitle"
                                type="text"
                                placeholder="e.g. Tech for Good presentation"
                                autocomplete="off">


                            <div
                                class="lesson-assessment-group">

                                <div
                                    class="lesson-assessment-label">

                                    Assessment instrument

                                </div>


                                <div
                                    class="lesson-assessment-options">

                                    ${renderInstrumentCheckboxes()}

                                </div>

                            </div>


                            <div
                                class="lesson-assessment-group">

                                <div
                                    class="lesson-assessment-label">

                                    Key competences

                                </div>


                                <div
                                    class="lesson-assessment-options">

                                    ${renderCompetenceCheckboxes()}

                                </div>

                            </div>

                        </div>

                    </div>


                    <label>
                        Status
                    </label>

                    <select
                        id="lessonStatus">

                        <option value="planned">
                            Planned
                        </option>

                        <option value="done">
                            Done
                        </option>

                        <option value="cancelled">
                            Cancelled
                        </option>

                    </select>

                </div>


                <div class="modal-footer">

                    <button
                        class="btn-secondary"
                        onclick="closeModal()">

                        CANCEL

                    </button>


                    <button
                        class="btn-primary"
                        onclick="createLesson(
                            '${classId}'
                        )">

                        ADD LESSON

                    </button>

                </div>

            </div>

        </div>

    `;


    document
        .getElementById(
            "lessonTitle"
        )
        .focus();

}


// ---------------------------------------------------------
// RENDER INSTRUMENT CHECKBOXES
// ---------------------------------------------------------

function renderInstrumentCheckboxes(
    selected = []
) {

    return ASSESSMENT_INSTRUMENTS
        .map(
            instrument => `

                <label
                    class="assessment-check-option">

                    <input
                        type="checkbox"
                        name="lessonInstrument"
                        value="${instrument.id}"
                        ${
                            selected.includes(
                                instrument.id
                            )
                                ? "checked"
                                : ""
                        }>

                    <span>
                        ${escapeHTML(
                            instrument.name
                        )}
                    </span>

                    <small>
                        ${instrument.weight}%
                    </small>

                </label>

            `
        )
        .join("");

}


// ---------------------------------------------------------
// RENDER COMPETENCE CHECKBOXES
// ---------------------------------------------------------

function renderCompetenceCheckboxes(
    selected = []
) {

    return KEY_COMPETENCES
        .map(
            competence => `

                <label
                    class="assessment-check-option">

                    <input
                        type="checkbox"
                        name="lessonCompetence"
                        value="${competence.id}"
                        ${
                            selected.includes(
                                competence.id
                            )
                                ? "checked"
                                : ""
                        }>

                    <span>
                        ${escapeHTML(
                            competence.name
                        )}
                    </span>

                    <small>
                        ${competence.weight}%
                    </small>

                </label>

            `
        )
        .join("");

}


// ---------------------------------------------------------
// TOGGLE ASSESSMENT FIELDS
// ---------------------------------------------------------

function toggleLessonAssessment() {

    const checkbox =
        document.getElementById(
            "lessonEvaluable"
        );


    const fields =
        document.getElementById(
            "lessonAssessmentFields"
        );


    if (!checkbox || !fields) {
        return;
    }


    fields.classList.toggle(
        "hidden",
        !checkbox.checked
    );


    if (
        checkbox.checked
    ) {

        document
            .getElementById(
                "lessonAssessmentTitle"
            )
            ?.focus();

    }

}


// ---------------------------------------------------------
// GET SELECTED INSTRUMENTS
// ---------------------------------------------------------

function getSelectedAssessmentInstruments(
    container = document
) {

    return Array.from(
        container.querySelectorAll(
            'input[name="lessonInstrument"]:checked'
        )
    ).map(
        input =>
            input.value
    );

}


// ---------------------------------------------------------
// GET SELECTED COMPETENCES
// ---------------------------------------------------------

function getSelectedAssessmentCompetences(
    container = document
) {

    return Array.from(
        container.querySelectorAll(
            'input[name="lessonCompetence"]:checked'
        )
    ).map(
        input =>
            input.value
    );

}


// ---------------------------------------------------------
// CREATE LESSON
// ---------------------------------------------------------

function createLesson(
    classId
) {

    const academicYear =
        AppState.getCurrentAcademicYear();


    const date =
        document.getElementById(
            "lessonDate"
        ).value;


    const title =
        document.getElementById(
            "lessonTitle"
        ).value;


    const notes =
        document.getElementById(
            "lessonNotes"
        ).value;


    const status =
        document.getElementById(
            "lessonStatus"
        ).value;


    const isEvaluable =
        document.getElementById(
            "lessonEvaluable"
        )?.checked === true;


    const assessmentTitle =
        document.getElementById(
            "lessonAssessmentTitle"
        )?.value || "";


    const instruments =
        getSelectedAssessmentInstruments();


    const competences =
        getSelectedAssessmentCompetences();


    if (
        !date ||
        !title.trim()
    ) {

        alert(
            "Please enter a date and lesson title."
        );

        return;
    }


    if (
        isEvaluable &&
        !assessmentTitle.trim()
    ) {

        alert(
            "Please enter a title for the evaluable activity."
        );

        return;
    }


    if (
        isEvaluable &&
        !instruments.length
    ) {

        alert(
            "Please select at least one assessment instrument."
        );

        return;
    }


    if (
        isEvaluable &&
        !competences.length
    ) {

        alert(
            "Please select at least one key competence."
        );

        return;
    }


    try {

        LessonManager.create({

            academicYearId:
                academicYear.id,

            classId,

            date,

            title,

            notes,

            status,

            assessment: {

                isEvaluable,

                title:
                    isEvaluable
                        ? assessmentTitle
                        : "",

                instruments:
                    isEvaluable
                        ? instruments
                        : [],

                competences:
                    isEvaluable
                        ? competences
                        : []

            }

        });


        closeModal();

        renderCoursePlan();

    } catch (error) {

        console.error(
            "Failed to create lesson:",
            error
        );

        alert(
            error.message
        );

    }

}


// ---------------------------------------------------------
// EDIT LESSON MODAL
// ---------------------------------------------------------

function openEditLessonModal(
    lessonId
) {

    const lesson =
        LessonManager.getById(
            lessonId
        );


    if (!lesson) {
        return;
    }


    const classItem =
        ClassManager.getById(
            lesson.classId
        );


    if (!classItem) {
        return;
    }


    const assessment =
        lesson.assessment ||
        {
            isEvaluable: false,
            title: "",
            instruments: [],
            competences: []
        };


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
                            COURSE PLAN
                        </div>

                        <h3>
                            Edit lesson
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

                    <input
                        type="text"
                        value="${escapeHTML(
                            classItem.name
                        )}"
                        disabled>


                    <label>
                        Date
                    </label>

                    <input
                        type="date"
                        id="editLessonDate"
                        value="${lesson.date}">


                    <label>
                        Lesson title
                    </label>

                    <input
                        id="editLessonTitle"
                        type="text"
                        value="${escapeHTML(
                            lesson.title
                        )}"
                        autocomplete="off">


                    <label>
                        Notes
                    </label>

                    <textarea
                        id="editLessonNotes"
                        rows="5">${escapeHTML(
                            lesson.notes || ""
                        )}</textarea>


                    <!-- =================================
                         ASSESSMENT
                         ================================= -->

                    <div class="lesson-assessment">

                        <label
                            class="lesson-assessment-toggle">

                            <input
                                id="editLessonEvaluable"
                                type="checkbox"
                                ${
                                    assessment.isEvaluable
                                        ? "checked"
                                        : ""
                                }
                                onchange="toggleEditLessonAssessment()">

                            <span>
                                Evaluable activity
                            </span>

                        </label>


                        <div
                            id="editLessonAssessmentFields"
                            class="lesson-assessment-fields
                                ${
                                    assessment.isEvaluable
                                        ? ""
                                        : "hidden"
                                }">

                            <label>
                                Activity title
                            </label>

                            <input
                                id="editLessonAssessmentTitle"
                                type="text"
                                value="${escapeHTML(
                                    assessment.title ||
                                    ""
                                )}"
                                placeholder="e.g. Tech for Good presentation"
                                autocomplete="off">


                            <div
                                class="lesson-assessment-group">

                                <div
                                    class="lesson-assessment-label">

                                    Assessment instrument

                                </div>


                                <div
                                    class="lesson-assessment-options">

                                    ${renderInstrumentCheckboxes(
                                        assessment.instruments ||
                                        []
                                    )}

                                </div>

                            </div>


                            <div
                                class="lesson-assessment-group">

                                <div
                                    class="lesson-assessment-label">

                                    Key competences

                                </div>


                                <div
                                    class="lesson-assessment-options">

                                    ${renderCompetenceCheckboxes(
                                        assessment.competences ||
                                        []
                                    )}

                                </div>

                            </div>

                        </div>

                    </div>


                    <label>
                        Status
                    </label>

                    <select
                        id="editLessonStatus">

                        <option
                            value="planned"
                            ${
                                lesson.status ===
                                "planned"
                                    ? "selected"
                                    : ""
                            }>

                            Planned

                        </option>

                        <option
                            value="done"
                            ${
                                lesson.status ===
                                "done"
                                    ? "selected"
                                    : ""
                            }>

                            Done

                        </option>

                        <option
                            value="cancelled"
                            ${
                                lesson.status ===
                                "cancelled"
                                    ? "selected"
                                    : ""
                            }>

                            Cancelled

                        </option>

                    </select>

                </div>


                <div class="modal-footer">

                    <button
                        class="btn-danger"
                        onclick="deleteLesson(
                            '${lesson.id}'
                        )">

                        DELETE

                    </button>


                    <button
                        class="btn-secondary"
                        onclick="closeModal()">

                        CANCEL

                    </button>


                    <button
                        class="btn-primary"
                        onclick="saveLessonEdit(
                            '${lesson.id}'
                        )">

                        SAVE CHANGES

                    </button>

                </div>

            </div>

        </div>

    `;

}


// ---------------------------------------------------------
// TOGGLE EDIT ASSESSMENT
// ---------------------------------------------------------

function toggleEditLessonAssessment() {

    const checkbox =
        document.getElementById(
            "editLessonEvaluable"
        );


    const fields =
        document.getElementById(
            "editLessonAssessmentFields"
        );


    if (!checkbox || !fields) {
        return;
    }


    fields.classList.toggle(
        "hidden",
        !checkbox.checked
    );


    if (
        checkbox.checked
    ) {

        document
            .getElementById(
                "editLessonAssessmentTitle"
            )
            ?.focus();

    }

}


// ---------------------------------------------------------
// GET EDIT SELECTED INSTRUMENTS
// ---------------------------------------------------------

function getEditSelectedAssessmentInstruments() {

    return Array.from(
        document.querySelectorAll(
            'input[name="lessonInstrument"]:checked'
        )
    ).map(
        input =>
            input.value
    );

}


// ---------------------------------------------------------
// GET EDIT SELECTED COMPETENCES
// ---------------------------------------------------------

function getEditSelectedAssessmentCompetences() {

    return Array.from(
        document.querySelectorAll(
            'input[name="lessonCompetence"]:checked'
        )
    ).map(
        input =>
            input.value
    );

}


// ---------------------------------------------------------
// SAVE LESSON EDIT
// ---------------------------------------------------------

function saveLessonEdit(
    lessonId
) {

    const lesson =
        LessonManager.getById(
            lessonId
        );


    if (!lesson) {
        return;
    }


    const date =
        document.getElementById(
            "editLessonDate"
        ).value;


    const title =
        document.getElementById(
            "editLessonTitle"
        ).value;


    const notes =
        document.getElementById(
            "editLessonNotes"
        ).value;


    const status =
        document.getElementById(
            "editLessonStatus"
        ).value;


    const isEvaluable =
        document.getElementById(
            "editLessonEvaluable"
        )?.checked === true;


    const assessmentTitle =
        document.getElementById(
            "editLessonAssessmentTitle"
        )?.value || "";


    const instruments =
        getEditSelectedAssessmentInstruments();


    const competences =
        getEditSelectedAssessmentCompetences();


    if (
        !date ||
        !title.trim()
    ) {

        alert(
            "Please enter a date and lesson title."
        );

        return;
    }


    if (
        isEvaluable &&
        !assessmentTitle.trim()
    ) {

        alert(
            "Please enter a title for the evaluable activity."
        );

        return;
    }


    if (
        isEvaluable &&
        !instruments.length
    ) {

        alert(
            "Please select at least one assessment instrument."
        );

        return;
    }


    if (
        isEvaluable &&
        !competences.length
    ) {

        alert(
            "Please select at least one key competence."
        );

        return;
    }


    try {

        LessonManager.update(

            lessonId,

            {

                date,

                title,

                notes,

                status,

                assessment: {

                    isEvaluable,

                    title:
                        isEvaluable
                            ? assessmentTitle
                            : "",

                    instruments:
                        isEvaluable
                            ? instruments
                            : [],

                    competences:
                        isEvaluable
                            ? competences
                            : []

                }

            }

        );


        closeModal();

        renderCoursePlan();

    } catch (error) {

        console.error(
            "Failed to update lesson:",
            error
        );

        alert(
            error.message
        );

    }

}


// ---------------------------------------------------------
// DELETE LESSON
// ---------------------------------------------------------

function deleteLesson(
    lessonId
) {

    showConfirmModal(

        "DELETE LESSON",

        "Delete this lesson from your course plan?",

        () => {

            LessonManager.delete(
                lessonId
            );

            closeModal();

            renderCoursePlan();

        }

    );

}