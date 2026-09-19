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

    window.currentAssessmentLessonClassId =
        classItem.id;


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


                            <!-- =================================
                                 INSTRUMENT
                                 ================================= -->

                            <label>
                                Assessment instrument
                            </label>

                            ${renderAssessmentInstrumentSelect()}


                            <!-- =================================
                                 SPECIFIC COMPETENCES
                                 ================================= -->

                            <div
                                class="lesson-assessment-group">

                                <div
                                    class="lesson-assessment-label">

                                    Specific competences

                                </div>


                                <div
                                    class="lesson-assessment-help">

                                    Select the specific competences
                                    assessed by this activity and
                                    assign the percentage of the
                                    activity that contributes to
                                    each competence.

                                </div>


                                <div
                                    id="lessonSpecificCompetences"
                                    class="lesson-assessment-options">

                                    ${renderAssessmentSpecificCompetences(
                                        classId,
                                        [],
                                        "lesson"
                                    )}

                                </div>

                            </div>


                            <!-- =================================
                                 BASIC KNOWLEDGE
                                 ================================= -->

                            <div
                                class="lesson-assessment-group">

                                <div
                                    class="lesson-assessment-label">

                                    Basic knowledge

                                </div>


                                <div
                                    class="lesson-assessment-help">

                                    Search the basic knowledge
                                    elements related to this activity.

                                </div>


                                <input
                                    id="lessonBasicKnowledgeSearch"
                                    type="search"
                                    placeholder="Search basic knowledge..."
                                    autocomplete="off"
                                    oninput="filterLessonBasicKnowledge()">


                                <div
                                    id="lessonBasicKnowledgeOptions"
                                    class="lesson-assessment-options">

                                    ${renderAssessmentBasicKnowledgeOptions(
                                        classId,
                                        [],
                                        "lesson"
                                    )}

                                </div>


                                <div
                                    id="lessonSelectedBasicKnowledge">

                                    ${renderSelectedAssessmentBasicKnowledge(
                                        classId,
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
        ?.focus();

}


// =========================================================
// ASSESSMENT FORM INTERACTION
// =========================================================


// ---------------------------------------------------------
// REFRESH SELECTED BASIC KNOWLEDGE
// ---------------------------------------------------------

function refreshSelectedLessonBasicKnowledge() {

    const classId =
        window.currentAssessmentLessonClassId;


    if (!classId) {
        return;
    }


    const selectedIds =
        getSelectedAssessmentBasicKnowledge(
            document,
            "lesson"
        );


    const container =
        document.getElementById(
            "lessonSelectedBasicKnowledge"
        );


    if (!container) {
        return;
    }


    container.innerHTML =
        renderSelectedAssessmentBasicKnowledge(
            classId,
            selectedIds
        );

}


// ---------------------------------------------------------
// FILTER BASIC KNOWLEDGE — ADD
// ---------------------------------------------------------

function filterLessonBasicKnowledge() {

    const searchInput =
        document.getElementById(
            "lessonBasicKnowledgeSearch"
        );


    const optionsContainer =
        document.getElementById(
            "lessonBasicKnowledgeOptions"
        );


    if (
        !searchInput ||
        !optionsContainer
    ) {

        return;

    }


    const classId =
        window.currentAssessmentLessonClassId;


    if (!classId) {
        return;
    }


    const selectedIds =
        getSelectedAssessmentBasicKnowledge(
            document,
            "lesson"
        );


    optionsContainer.innerHTML =
        renderAssessmentBasicKnowledgeOptions(
            classId,
            selectedIds,
            "lesson",
            searchInput.value
        );


    refreshSelectedLessonBasicKnowledge();

}


// ---------------------------------------------------------
// FILTER BASIC KNOWLEDGE — EDIT
// ---------------------------------------------------------

function filterEditLessonBasicKnowledge() {

    const searchInput =
        document.getElementById(
            "editLessonBasicKnowledgeSearch"
        );


    const optionsContainer =
        document.getElementById(
            "editLessonBasicKnowledgeOptions"
        );


    if (
        !searchInput ||
        !optionsContainer
    ) {

        return;

    }


    const classId =
        window.currentAssessmentLessonClassId;


    if (!classId) {
        return;
    }


    const selectedIds =
        getSelectedAssessmentBasicKnowledge(
            document,
            "editLesson"
        );


    optionsContainer.innerHTML =
        renderAssessmentBasicKnowledgeOptions(
            classId,
            selectedIds,
            "editLesson",
            searchInput.value
        );


    const selectedContainer =
        document.getElementById(
            "editLessonSelectedBasicKnowledge"
        );


    if (selectedContainer) {

        selectedContainer.innerHTML =
            renderSelectedAssessmentBasicKnowledge(
                classId,
                selectedIds
            );

    }

}


// ---------------------------------------------------------
// HANDLE BASIC KNOWLEDGE CHANGE
// ---------------------------------------------------------

function handleAssessmentBasicKnowledgeChange(
    mode = "lesson"
) {

    const classId =
        window.currentAssessmentLessonClassId;


    if (!classId) {
        return;
    }


    const selectedIds =
        getSelectedAssessmentBasicKnowledge(
            document,
            mode === "lesson"
                ? "lesson"
                : "editLesson"
        );


    const container =
        document.getElementById(
            mode === "lesson"
                ? "lessonSelectedBasicKnowledge"
                : "editLessonSelectedBasicKnowledge"
        );


    if (!container) {
        return;
    }


    container.innerHTML =
        renderSelectedAssessmentBasicKnowledge(
            classId,
            selectedIds
        );

}


// =========================================================
// TOGGLE ASSESSMENT
// =========================================================


// ---------------------------------------------------------
// TOGGLE ADD ASSESSMENT FIELDS
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


    if (
        !checkbox ||
        !fields
    ) {

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


    if (
        !checkbox ||
        !fields
    ) {

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


// =========================================================
// CREATE LESSON
// =========================================================


// ---------------------------------------------------------
// CREATE LESSON
// ---------------------------------------------------------

function createLesson(
    classId
) {

    const academicYear =
        AppState.getCurrentAcademicYear();


    if (!academicYear) {
        return;
    }


    const date =
        document.getElementById(
            "lessonDate"
        )?.value;


    const title =
        document.getElementById(
            "lessonTitle"
        )?.value || "";


    const notes =
        document.getElementById(
            "lessonNotes"
        )?.value || "";


    const status =
        document.getElementById(
            "lessonStatus"
        )?.value || "planned";


    const isEvaluable =
        document.getElementById(
            "lessonEvaluable"
        )?.checked === true;


    const assessmentTitle =
        document.getElementById(
            "lessonAssessmentTitle"
        )?.value || "";


    const instrumentId =
        document.getElementById(
            "lessonAssessmentInstrument"
        )?.value || null;


    const specificCompetences =
        getSelectedAssessmentSpecificCompetences(
            document,
            "lesson"
        );


    const basicKnowledgeIds =
        getSelectedAssessmentBasicKnowledge(
            document,
            "lesson"
        );


    // -----------------------------------------------------
    // VALIDATION
    // -----------------------------------------------------

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
        !isEvaluable
    ) {

        createLessonWithoutAssessment({

            academicYearId:
                academicYear.id,

            classId,

            date,

            title,

            notes,

            status

        });

        return;

    }


    if (
        !assessmentTitle.trim()
    ) {

        alert(
            "Please enter a title for the evaluable activity."
        );

        return;

    }


    if (
        !instrumentId
    ) {

        alert(
            "Please select an assessment instrument."
        );

        return;

    }


    if (
        !specificCompetences.length
    ) {

        alert(
            "Please select at least one specific competence."
        );

        return;

    }


    const curriculum =
        getAssessmentCurriculum(
            classId
        );


    if (!curriculum) {

        alert(
            "This class has no curriculum assigned. A curriculum is required for an evaluable activity."
        );

        return;

    }


    // -----------------------------------------------------
    // VALIDATE CE WEIGHTS
    // -----------------------------------------------------

    const invalidWeight =
        specificCompetences.some(
            item =>
                !Number.isFinite(
                    Number(item.weight)
                ) ||
                Number(item.weight) < 0 ||
                Number(item.weight) > 100
        );


    if (invalidWeight) {

        alert(
            "Specific competence weights must be between 0 and 100."
        );

        return;

    }


    // -----------------------------------------------------
    // CREATE LESSON
    // -----------------------------------------------------

    try {

        const lesson =
            LessonManager.create({

                academicYearId:
                    academicYear.id,

                classId,

                date,

                title,

                notes,

                status,

                // Legacy compatibility only.
                // AssessmentActivity is now the
                // real source of assessment data.

                assessment: {

                    isEvaluable: true,

                    title:
                        assessmentTitle,

                    instruments:
                        [instrumentId],

                    competences:
                        specificCompetences
                            .map(
                                item =>
                                    item.specificCompetenceId
                            )

                }

            });


        // -------------------------------------------------
        // CREATE REAL ASSESSMENT ACTIVITY
        // -------------------------------------------------

        try {

            AssessmentActivityManager.create({

                lessonId:
                    lesson.id,

                title:
                    assessmentTitle,

                instrumentId,

                specificCompetences,

                basicKnowledgeIds

            });

        }
        catch (error) {

            // Remove the lesson if creating the
            // assessment activity fails.

            LessonManager.delete(
                lesson.id
            );

            throw error;

        }


        closeModal();

        renderCoursePlan();

    }
    catch (error) {

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
// CREATE NON-ASSESSABLE LESSON
// ---------------------------------------------------------

function createLessonWithoutAssessment(
    {
        academicYearId,
        classId,
        date,
        title,
        notes,
        status
    }
) {

    try {

        LessonManager.create({

            academicYearId,

            classId,

            date,

            title,

            notes,

            status,

            assessment: {

                isEvaluable: false,

                title: "",

                instruments: [],

                competences: []

            }

        });


        closeModal();

        renderCoursePlan();

    }
    catch (error) {

        console.error(
            "Failed to create lesson:",
            error
        );

        alert(
            error.message
        );

    }

}


// =========================================================
// EDIT LESSON MODAL
// =========================================================


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


    const assessmentActivity =
        AssessmentActivityManager
            .getByLessonId(
                lessonId
            )[0] || null;


    const legacyAssessment =
        lesson.assessment ||
        {
            isEvaluable: false,
            title: "",
            instruments: [],
            competences: []
        };


    const isEvaluable =
        Boolean(
            assessmentActivity ||
            legacyAssessment.isEvaluable
        );


    const selectedCompetences =
        assessmentActivity
            ?.specificCompetences ||
        [];


    const selectedKnowledge =
        assessmentActivity
            ?.basicKnowledgeIds ||
        [];


    const selectedInstrument =
        assessmentActivity
            ?.instrumentId ||
        legacyAssessment
            ?.instruments?.[0] ||
        "";


    const assessmentTitle =
        assessmentActivity
            ?.title ||
        legacyAssessment
            ?.title ||
        "";


    window.currentAssessmentLessonClassId =
        classItem.id;


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
                                    isEvaluable
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
                                    isEvaluable
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
                                    assessmentTitle
                                )}"
                                placeholder="e.g. Tech for Good presentation"
                                autocomplete="off">


                            <!-- =================================
                                 INSTRUMENT
                                 ================================= -->

                            <label>
                                Assessment instrument
                            </label>

                            ${renderAssessmentInstrumentSelect(
                                selectedInstrument
                            )
                                .replace(
                                    'id="lessonAssessmentInstrument"',
                                    'id="editLessonAssessmentInstrument"'
                                )}


                            <!-- =================================
                                 SPECIFIC COMPETENCES
                                 ================================= -->

                            <div
                                class="lesson-assessment-group">

                                <div
                                    class="lesson-assessment-label">

                                    Specific competences

                                </div>


                                <div
                                    class="lesson-assessment-help">

                                    Select the specific competences
                                    assessed by this activity and
                                    assign the percentage of the
                                    activity that contributes to
                                    each competence.

                                </div>


                                <div
                                    id="editLessonSpecificCompetences"
                                    class="lesson-assessment-options">

                                    ${renderAssessmentSpecificCompetences(
                                        classItem.id,
                                        selectedCompetences,
                                        "editLesson"
                                    )}

                                </div>

                            </div>


                            <!-- =================================
                                 BASIC KNOWLEDGE
                                 ================================= -->

                            <div
                                class="lesson-assessment-group">

                                <div
                                    class="lesson-assessment-label">

                                    Basic knowledge

                                </div>


                                <div
                                    class="lesson-assessment-help">

                                    Search the basic knowledge
                                    elements related to this activity.

                                </div>


                                <input
                                    id="editLessonBasicKnowledgeSearch"
                                    type="search"
                                    placeholder="Search basic knowledge..."
                                    autocomplete="off"
                                    oninput="filterEditLessonBasicKnowledge()">


                                <div
                                    id="editLessonBasicKnowledgeOptions"
                                    class="lesson-assessment-options">

                                    ${renderAssessmentBasicKnowledgeOptions(
                                        classItem.id,
                                        selectedKnowledge,
                                        "editLesson"
                                    )}

                                </div>


                                <div
                                    id="editLessonSelectedBasicKnowledge">

                                    ${renderSelectedAssessmentBasicKnowledge(
                                        classItem.id,
                                        selectedKnowledge
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


// =========================================================
// SAVE LESSON EDIT
// =========================================================


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
        )?.value;


    const title =
        document.getElementById(
            "editLessonTitle"
        )?.value || "";


    const notes =
        document.getElementById(
            "editLessonNotes"
        )?.value || "";


    const status =
        document.getElementById(
            "editLessonStatus"
        )?.value || "planned";


    const isEvaluable =
        document.getElementById(
            "editLessonEvaluable"
        )?.checked === true;


    const assessmentTitle =
        document.getElementById(
            "editLessonAssessmentTitle"
        )?.value || "";


    const instrumentId =
        document.getElementById(
            "editLessonAssessmentInstrument"
        )?.value || null;


    const specificCompetences =
        getSelectedAssessmentSpecificCompetences(
            document,
            "editLesson"
        );


    const basicKnowledgeIds =
        getSelectedAssessmentBasicKnowledge(
            document,
            "editLesson"
        );


    // -----------------------------------------------------
    // VALIDATION — LESSON
    // -----------------------------------------------------

    if (
        !date ||
        !title.trim()
    ) {

        alert(
            "Please enter a date and lesson title."
        );

        return;

    }


    // -----------------------------------------------------
    // UPDATE BASIC LESSON DATA
    // -----------------------------------------------------

    try {

        LessonManager.update(

            lessonId,

            {

                date,

                title,

                notes,

                status,

                // Keep legacy structure synchronized
                // for now. The actual assessment data
                // lives in AssessmentActivity.

                assessment: {

                    isEvaluable,

                    title:
                        isEvaluable
                            ? assessmentTitle
                            : "",

                    instruments:
                        isEvaluable
                            ? [instrumentId]
                            : [],

                    competences:
                        isEvaluable
                            ? specificCompetences
                                .map(
                                    item =>
                                        item.specificCompetenceId
                                )
                            : []

                }

            }

        );


        // -------------------------------------------------
        // GET EXISTING ACTIVITIES
        // -------------------------------------------------

        const existingActivities =
            AssessmentActivityManager
                .getByLessonId(
                    lessonId
                );


        // -------------------------------------------------
        // TURN ASSESSMENT OFF
        // -------------------------------------------------

        if (!isEvaluable) {

            existingActivities.forEach(
                activity => {

                    AssessmentActivityManager
                        .delete(
                            activity.id
                        );

                }
            );


            closeModal();

            renderCoursePlan();

            return;

        }


        // -------------------------------------------------
        // VALIDATE ASSESSMENT
        // -------------------------------------------------

        if (
            !assessmentTitle.trim()
        ) {

            alert(
                "Please enter a title for the evaluable activity."
            );

            return;

        }


        if (
            !instrumentId
        ) {

            alert(
                "Please select an assessment instrument."
            );

            return;

        }


        const curriculum =
            getAssessmentCurriculum(
                lesson.classId
            );


        if (!curriculum) {

            alert(
                "This class has no curriculum assigned. A curriculum is required for an evaluable activity."
            );

            return;

        }


        if (
            !specificCompetences.length
        ) {

            alert(
                "Please select at least one specific competence."
            );

            return;

        }


        const invalidWeight =
            specificCompetences.some(
                item =>
                    !Number.isFinite(
                        Number(item.weight)
                    ) ||
                    Number(item.weight) < 0 ||
                    Number(item.weight) > 100
            );


        if (invalidWeight) {

            alert(
                "Specific competence weights must be between 0 and 100."
            );

            return;

        }


        // -------------------------------------------------
        // UPDATE OR CREATE ACTIVITY
        // -------------------------------------------------

        const existingActivity =
            existingActivities[0] ||
            null;


        if (existingActivity) {

            AssessmentActivityManager
                .update(

                    existingActivity.id,

                    {

                        title:
                            assessmentTitle,

                        instrumentId,

                        specificCompetences,

                        basicKnowledgeIds

                    }

                );


            // If somehow more than one activity exists
            // for the same lesson, remove the extras.

            existingActivities
                .slice(1)
                .forEach(
                    activity => {

                        AssessmentActivityManager
                            .delete(
                                activity.id
                            );

                    }
                );

        }
        else {

            AssessmentActivityManager
                .create({

                    lessonId,

                    title:
                        assessmentTitle,

                    instrumentId,

                    specificCompetences,

                    basicKnowledgeIds

                });

        }


        closeModal();

        renderCoursePlan();

    }
    catch (error) {

        console.error(
            "Failed to update lesson:",
            error
        );

        alert(
            error.message
        );

    }

}


// =========================================================
// DELETE LESSON
// =========================================================


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

            // Delete assessment activities first
            // so their results are also removed.

            const activities =
                AssessmentActivityManager
                    .getByLessonId(
                        lessonId
                    );


            activities.forEach(
                activity => {

                    AssessmentActivityManager
                        .delete(
                            activity.id
                        );

                }
            );


            LessonManager.delete(
                lessonId
            );


            closeModal();

            renderCoursePlan();

        }

    );

}