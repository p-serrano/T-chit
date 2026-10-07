// =========================================================
// T-CHIT — GRADEBOOK
// ====================================================



// ---------------------------------------------------------
// GRADEBOOK STATE
// ---------------------------------------------------------

// Gradebook now uses the shared Assessment context.
// Class and term are stored in assessmentView.js.



// ---------------------------------------------------------
// GRADEBOOK CONTENT
// ---------------------------------------------------------

function renderGradebookContent(
    container
) {

    if (!container) {
        return;
    }


    const academicYear =
        AppState.getCurrentAcademicYear();


    if (!academicYear) {

        container.innerHTML = `

            <div class="empty-state">

                <div class="empty-state-icon">
                    ✓
                </div>

                <h3>
                    No academic year selected
                </h3>

                <p>
                    Set up your academic year before
                    using the gradebook.
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


    // -----------------------------------------------------
    // CLASSES
    // -----------------------------------------------------

    const classes =
        ClassManager.getByAcademicYear(
            academicYear.id
        );


    // -----------------------------------------------------
    // TERMS
    // -----------------------------------------------------

    const terms =
        Array.isArray(academicYear.terms)
            ? academicYear.terms
            : [];


    // -----------------------------------------------------
    // CURRENT CLASS
    // -----------------------------------------------------

    const selectedClass =
        classes.find(
            classItem =>
                classItem.id ===
                assessmentSelectedClassId
        ) || null;


    // -----------------------------------------------------
    // CURRENT TERM
    // -----------------------------------------------------

    const selectedTerm =
        terms.find(
            term =>
                term.id ===
                assessmentSelectedTermId
        ) || null;


    // -----------------------------------------------------
    // STUDENTS
    // -----------------------------------------------------

    const students =
        selectedClass
            ? EnrollmentManager
                .getStudentsForClass(
                    selectedClass.id
                )
            : [];


    // -----------------------------------------------------
    // ACTIVITIES
    // -----------------------------------------------------

    const activities =
        selectedClass &&
        selectedTerm
            ? AssessmentActivityManager.getByTerm(
                academicYear.id,
                selectedClass.id,
                selectedTerm.id
            )
            : [];


    // -----------------------------------------------------
    // GRADEBOOK CONFIG
    // -----------------------------------------------------

    if (
        selectedClass &&
        selectedTerm
    ) {

        GradebookManager.getOrCreateConfig(
            academicYear.id,
            selectedClass.id,
            selectedTerm.id
        );

    }


    // -----------------------------------------------------
    // RENDER
    // -----------------------------------------------------

    container.innerHTML = `

        <div class="gradebook-view">


            <!-- TERM CONTEXT -->

            <section class="gradebook-context">

                <div class="gradebook-filter">

                    <label>
                        TERM
                    </label>

                    <select
                        onchange="changeGradebookTerm(this.value)"
                    >

                        <option
                            value=""
                            ${
                                !assessmentSelectedTermId
                                    ? "selected"
                                    : ""
                            }
                        >
                            Select term...
                        </option>

                        ${
                            terms
                                .map(
                                    term => `
                                        <option
                                            value="${escapeHTML(
                                                term.id
                                            )}"
                                            ${
                                                term.id ===
                                                assessmentSelectedTermId
                                                    ? "selected"
                                                    : ""
                                            }
                                        >
                                            ${escapeHTML(
                                                term.name
                                            )}
                                        </option>
                                    `
                                )
                                .join("")
                        }

                    </select>

                </div>

            </section>


            <!-- GRADEBOOK CONTENT -->

            ${
                !selectedClass ||
                !selectedTerm

                    ? ""

                    : !students.length

                        ? renderGradebookEmpty(
                            "No students",
                            "This class has no enrolled students."
                        )


                        : !activities.length

                            ? renderGradebookEmpty(
                                "No evaluable activities",
                                "No evaluable activities have been programmed for this class during this term."
                            )


                            : renderGradebookStudents(
                                activities,
                                students,
                                selectedClass
                            )
            }

        </div>

    `;

}



// ---------------------------------------------------------
// CLASS CHANGE
// ---------------------------------------------------------

function changeGradebookClass(
    classId
) {

    assessmentSelectedClassId =
        classId || null;

    assessmentActiveTab =
        "gradebook";

    renderAssessmentView();

}



// ---------------------------------------------------------
// TERM CHANGE
// ---------------------------------------------------------

function changeGradebookTerm(
    termId
) {

    assessmentSelectedTermId =
        termId || null;

    renderAssessmentActiveTab();

}



// ---------------------------------------------------------
// EMPTY STATE
// ---------------------------------------------------------

function renderGradebookEmpty(
    title,
    message
) {

    return `

        <section class="gradebook-empty">

            <div class="empty-state">

                <div class="empty-state-icon">
                    ✓
                </div>

                <h3>
                    ${escapeHTML(title)}
                </h3>

                <p>
                    ${escapeHTML(message)}
                </p>

            </div>

        </section>

    `;
}



// ---------------------------------------------------------
// ALL STUDENTS
// ---------------------------------------------------------

function renderGradebookStudents(
    activities,
    students,
    classItem
) {

    return `

        <section class="gradebook-students">

            <div class="gradebook-class-heading">

                <span class="gradebook-class-pill">
                    ${escapeHTML(
                        classItem.name
                    )}
                </span>


                <span class="gradebook-student-count">

                    ${students.length}

                    ${
                        students.length === 1
                            ? "student"
                            : "students"
                    }

                </span>

            </div>


            <div class="gradebook-student-list">

                ${
                    students
                        .map(
                            student =>
                                renderGradebookStudent(
                                    student,
                                    activities
                                )
                        )
                        .join("")
                }

            </div>

        </section>

    `;
}



// ---------------------------------------------------------
// STUDENT
// ---------------------------------------------------------

function renderGradebookStudent(
    student,
    activities
) {

    const competenceIds =
        getGradebookCompetenceIds(activities)
            .filter(competenceId =>
                activities.some(activity =>
                    activity.specificCompetences?.some(
                        competence =>
                            competence.specificCompetenceId ===
                            competenceId
                    )
                )
            );


    return `

        <section
            class="
                assessment-data-section
                gradebook-student
            "
        >

            <div
                class="
                    assessment-data-header
                    gradebook-student-header
                "
            >

                <h3 class="gradebook-student-name">

                    ${escapeHTML(
                        getGradebookStudentName(
                            student
                        )
                    )}

                </h3>

            </div>


            <div
                class="
                    assessment-data-sheet
                    gradebook-sheet
                "
            >

                <div
                    class="
                        assessment-data-table-wrapper
                        gradebook-table-wrapper
                    "
                >

                    <table
                        class="
                            assessment-data-table
                            gradebook-table
                        "
                    >

                        <thead>

                            <!-- HEADER -->

                            <tr>

                                <th
                                    class="gradebook-competence-column"
                                    rowspan="2"
                                >
                                    SPECIFIC
                                    <br>
                                    COMPETENCE
                                </th>


                                ${activities
                                    .map(
                                        (activity, index) =>
                                            renderGradebookActivityHeader(
                                                activity,
                                                index
                                            )
                                    )
                                    .join("")
                                }


                                <th
                                    class="gradebook-total-column"
                                    rowspan="2"
                                >
                                    TOTAL
                                </th>

                            </tr>


                            <!-- SUBHEADER -->

                            <tr>

                                ${activities
                                    .map(
                                        () => `
                                            <th
                                                class="
                                                    gradebook-subheader
                                                    gradebook-grade-header
                                                "
                                            >
                                                GRADE
                                            </th>

                                            <th
                                                class="
                                                    gradebook-subheader
                                                    gradebook-weight-header
                                                "
                                            >
                                                WEIGHT
                                            </th>
                                        `
                                    )
                                    .join("")
                                }

                            </tr>

                        </thead>


                        <tbody>

                            ${
                                competenceIds
                                    .map(
                                        competenceId =>
                                            renderGradebookCompetenceRow(
                                                competenceId,
                                                activities,
                                                student
                                            )
                                    )
                                    .join("")
                            }

                        </tbody>

                    </table>

                </div>

            </div>

        </section>

    `;
}



// ---------------------------------------------------------
// ACTIVITY HEADER
// ---------------------------------------------------------

function renderGradebookActivityHeader(
    activity,
    activityIndex
) {

    const lesson =
        AppState.data.lessons.find(
            item => item.id === activity.lessonId
        );


    const date =
        lesson
            ? formatGradebookDate(lesson.date)
            : "";


    return `
        <th
            class="
                gradebook-activity-header
                gradebook-activity-column-${activityIndex}
            "
            colspan="2"
        >
            <div class="gradebook-activity-title">
                ${escapeHTML(activity.title)}
            </div>

            ${
                date
                    ? `
                        <div class="gradebook-activity-date">
                            ${escapeHTML(date)}
                        </div>
                    `
                    : ""
            }
        </th>
    `;
}



// ---------------------------------------------------------
// COMPETENCE ROW
// ---------------------------------------------------------

function renderGradebookCompetenceRow(
    competenceId,
    activities,
    student
) {

    const relevantActivities =
        activities.filter(
            activity =>
                activity.specificCompetences
                    ?.some(
                        competence =>
                            competence.specificCompetenceId ===
                            competenceId
                    )
        );


    const total =
        calculateGradebookCompetenceTotal(
            competenceId,
            relevantActivities,
            student.id
        );


    const weightTotal =
        calculateGradebookWeightTotal(
            competenceId,
            relevantActivities
        );


    const weightStatus =
        getGradebookWeightStatus(
            weightTotal
        );


    return `

        <tr>


            <!-- SPECIFIC COMPETENCE -->

            <th
                class="gradebook-competence-cell"
                title="${escapeHTML(
                    getGradebookCompetenceName(
                        competenceId
                    )
                )}"
            >

                <span
                    class="gradebook-competence-code"
                >
                    ${escapeHTML(
                        getGradebookCompetenceCode(
                            competenceId
                        )
                    )}
                </span>

            </th>


            <!-- ACTIVITIES -->

            ${
                activities
                    .map(
                        (activity, index) =>
                            renderGradebookActivityCell(
                                activity,
                                competenceId,
                                student,
                                index
                            )
                    )
                    .join("")
            }


            <!-- TOTAL -->

            <td
                class="
                    gradebook-total-cell
                    gradebook-weight-${weightStatus}
                "
            >

                <div
                    class="gradebook-total-value"
                >
                    ${
                        total === null
                            ? "—"
                            : formatGradebookNumber(
                                total
                            )
                    }
                </div>


                <div
                    class="gradebook-total-weight"
                >
                    ${formatGradebookNumber(
                        weightTotal
                    )}%
                </div>

            </td>

        </tr>

    `;

}



// ---------------------------------------------------------
// ACTIVITY CELL
// ---------------------------------------------------------

function renderGradebookActivityCell(
    activity,
    competenceId,
    student,
    activityIndex
) {

    const competenceAssigned =
        activity.specificCompetences
            ?.some(
                competence =>
                    competence.specificCompetenceId ===
                    competenceId
            );


    if (!competenceAssigned) {

        return `
            <td
                class="
                    gradebook-cell
                    gradebook-cell-empty
                    gradebook-activity-column-${activityIndex}
                "
            >
                —
            </td>

            <td
                class="
                    gradebook-cell
                    gradebook-cell-empty
                    gradebook-activity-column-${activityIndex}
                "
            >
                —
            </td>
        `;

    }


    const result =
        AssessmentResultManager
            .getByStudentActivityCompetence(
                student.id,
                activity.id,
                competenceId
            );


    const value =
        result
            ? result.value
            : null;


    const weight =
        getGradebookWeight(
            activity.id,
            competenceId
        );


    return `
        <!-- GRADE -->
        <td
            class="
                gradebook-cell
                gradebook-grade-cell
                gradebook-activity-column-${activityIndex}
            "
        >
            <input
                type="text"
                inputmode="decimal"
                autocomplete="off"
                value="${
                    value === null
                        ? ""
                        : escapeHTML(String(value))
                }"
                placeholder="—"
                aria-label="Grade"
                onchange="
                    changeGradebookGrade(
                        '${activity.id}',
                        '${competenceId}',
                        '${student.id}',
                        this.value
                    )
                "
            >
        </td>

        <!-- WEIGHT -->
        <td
            class="
                gradebook-cell
                gradebook-weight-cell
                gradebook-activity-column-${activityIndex}
            "
        >
            <div class="gradebook-weight-input">
                <input
                    type="text"
                    inputmode="numeric"
                    autocomplete="off"
                    value="${
                        weight === null
                            ? ""
                            : escapeHTML(String(weight))
                    }"
                    placeholder="0"
                    aria-label="Weight"
                    onchange="
                        changeGradebookWeight(
                            '${activity.id}',
                            '${competenceId}',
                            this.value
                        )
                    "
                >
                <span>%</span>
            </div>
        </td>
    `;

}



// ---------------------------------------------------------
// SAVE GRADE
// ---------------------------------------------------------

function changeGradebookGrade(
    activityId,
    competenceId,
    studentId,
    value
) {

    const academicYear =
        AppState.getCurrentAcademicYear();


    if (!academicYear) {
        return;
    }


    // Empty value removes the existing result.

    if (value === "") {

        const existing =
            AssessmentResultManager
                .getByStudentActivityCompetence(
                    studentId,
                    activityId,
                    competenceId
                );


        if (existing) {

            AssessmentResultManager.delete(
                existing.id
            );

        }


        renderGradebookContent(
            document.getElementById(
                "assessmentContent"
            )
        );

        return;
    }


    const numericValue =
        Number(value);


    if (
        !Number.isFinite(numericValue)
    ) {
        return;
    }


    const safeValue =
        Math.max(
            0,
            Math.min(
                10,
                numericValue
            )
        );


    AssessmentResultManager.create({

        assessmentActivityId:
            activityId,

        studentId:
            studentId,

        specificCompetenceId:
            competenceId,

        value:
            safeValue

    });


    renderGradebookContent(
        document.getElementById(
            "assessmentContent"
        )
    );

}



// ---------------------------------------------------------
// COMPETENCE IDS
// ---------------------------------------------------------

function getGradebookCompetenceIds(
    activities
) {

    const competenceIds = [];


    if (!Array.isArray(activities)) {
        return competenceIds;
    }


    /*
     * Collect only the specific competences
     * actually assigned to the activities.
     */

    activities.forEach(
        activity => {

            if (
                !Array.isArray(
                    activity.specificCompetences
                )
            ) {
                return;
            }


            activity.specificCompetences.forEach(
                competence => {

                    const competenceId =
                        competence?.specificCompetenceId;


                    if (
                        !competenceId
                    ) {
                        return;
                    }


                    if (
                        !competenceIds.includes(
                            competenceId
                        )
                    ) {

                        competenceIds.push(
                            competenceId
                        );

                    }

                }
            );

        }
    );


    /*
     * Sort by CE number.
     *
     * We use the curriculum only for
     * ordering, never for discovering
     * which competences are present.
     */

    const classItem =
        ClassManager.getById(
            assessmentSelectedClassId
        );


    const curriculum =
        classItem
            ? ClassManager.getCurriculum(
                classItem.id
            )
            : null;


    if (!curriculum) {
        return competenceIds;
    }


    competenceIds.sort(
        (a, b) => {

            const competenceA =
                findGradebookObjectById(
                    curriculum,
                    a
                );


            const competenceB =
                findGradebookObjectById(
                    curriculum,
                    b
                );


            const codeA =
                competenceA?.code ||
                competenceA?.shortCode ||
                "";


            const codeB =
                competenceB?.code ||
                competenceB?.shortCode ||
                "";


            const numberA =
                parseInt(
                    String(codeA)
                        .replace(/\D/g, ""),
                    10
                );


            const numberB =
                parseInt(
                    String(codeB)
                        .replace(/\D/g, ""),
                    10
                );


            /*
             * If the code does not contain a
             * number, keep its original order.
             */

            if (
                Number.isNaN(numberA) ||
                Number.isNaN(numberB)
            ) {
                return 0;
            }


            return numberA - numberB;

        }
    );


    return competenceIds;

}



// ---------------------------------------------------------
// WEIGHT
// ---------------------------------------------------------

function getGradebookWeight(
    activityId,
    competenceId
) {

    const academicYear =
        AppState.getCurrentAcademicYear();


    if (!academicYear) {
        return null;
    }


    if (
        !assessmentSelectedClassId ||
        !assessmentSelectedTermId
    ) {
        return null;
    }


    return GradebookManager.getWeight(
        academicYear.id,
        assessmentSelectedClassId,
        assessmentSelectedTermId,
        competenceId,
        activityId
    );

}



// ---------------------------------------------------------
// CHANGE WEIGHT
// ---------------------------------------------------------

function changeGradebookWeight(
    activityId,
    competenceId,
    value
) {

    const academicYear =
        AppState.getCurrentAcademicYear();


    if (!academicYear) {
        return;
    }


    if (
        !assessmentSelectedClassId ||
        !assessmentSelectedTermId
    ) {
        return;
    }


    // Empty value removes the weight.

    if (value === "") {

        GradebookManager.removeWeight(
            academicYear.id,
            assessmentSelectedClassId,
            assessmentSelectedTermId,
            competenceId,
            activityId
        );


        renderGradebookContent(
            document.getElementById(
                "assessmentContent"
            )
        );

        return;

    }


    const numericValue =
        Number(value);


    if (
        !Number.isFinite(numericValue)
    ) {
        return;
    }


    const safeValue =
        Math.max(
            0,
            Math.min(
                100,
                numericValue
            )
        );


    GradebookManager.setWeight(
        academicYear.id,
        assessmentSelectedClassId,
        assessmentSelectedTermId,
        competenceId,
        activityId,
        safeValue
    );


    renderGradebookContent(
        document.getElementById(
            "assessmentContent"
        )
    );

}



// ---------------------------------------------------------
// WEIGHT TOTAL
// ---------------------------------------------------------

function calculateGradebookWeightTotal(
    competenceId,
    activities
) {

    const academicYear =
        AppState.getCurrentAcademicYear();


    if (!academicYear) {
        return 0;
    }


    if (
        !assessmentSelectedClassId ||
        !assessmentSelectedTermId
    ) {
        return 0;
    }


    return GradebookManager.getWeightTotal(
        academicYear.id,
        assessmentSelectedClassId,
        assessmentSelectedTermId,
        competenceId
    );

}



// ---------------------------------------------------------
// WEIGHT STATUS
// ---------------------------------------------------------

function getGradebookWeightStatus(
    total
) {

    if (total === 100) {
        return "complete";
    }


    if (total < 100) {
        return "under";
    }


    return "over";

}



// ---------------------------------------------------------
// COMPETENCE TOTAL
// ---------------------------------------------------------

function calculateGradebookCompetenceTotal(
    competenceId,
    activities,
    studentId
) {

    let weightedTotal = 0;

    let hasGrade = false;


    activities.forEach(
        activity => {

            const weight =
                getGradebookWeight(
                    activity.id,
                    competenceId
                );


            if (
                weight === null ||
                weight <= 0
            ) {
                return;
            }


            const result =
                AssessmentResultManager
                    .getByStudentActivityCompetence(
                        studentId,
                        activity.id,
                        competenceId
                    );


            if (!result) {
                return;
            }


            hasGrade = true;


            weightedTotal +=
                result.value *
                (weight / 100);

        }
    );


    if (!hasGrade) {
        return null;
    }


    return weightedTotal;

}



// ---------------------------------------------------------
// STUDENT NAME
// ---------------------------------------------------------

function getGradebookStudentName(
    student
) {

    if (!student) {
        return "No student";
    }


    const firstName =
        student.firstName ||
        student.name ||
        "";


    const lastName =
        student.lastName ||
        "";


    if (lastName && firstName) {

        return `${lastName}, ${firstName}`;

    }


    return (
        lastName ||
        firstName ||
        "Unnamed student"
    );

}



// ---------------------------------------------------------
// COMPETENCE CODE
// ---------------------------------------------------------

function getGradebookCompetenceCode(
    competenceId
) {

    const academicYear =
        AppState.getCurrentAcademicYear();


    if (!academicYear) {
        return competenceId;
    }


    const classItem =
        ClassManager.getById(
            assessmentSelectedClassId
        );


    if (!classItem) {
        return competenceId;
    }


    const curriculum =
        ClassManager.getCurriculum(
            classItem.id
        );


    if (!curriculum) {
        return competenceId;
    }


    const competence =
        findGradebookObjectById(
            curriculum,
            competenceId
        );


    if (!competence) {
        return competenceId;
    }


    return (
        competence.code ||
        competence.shortCode ||
        competenceId
    );

}



// ---------------------------------------------------------
// COMPETENCE NAME
// ---------------------------------------------------------

function getGradebookCompetenceName(
    competenceId
) {

    const academicYear =
        AppState.getCurrentAcademicYear();


    if (!academicYear) {
        return competenceId;
    }


    const classItem =
        ClassManager.getById(
            assessmentSelectedClassId
        );


    if (!classItem) {
        return competenceId;
    }


    const curriculum =
        ClassManager.getCurriculum(
            classItem.id
        );


    if (!curriculum) {
        return competenceId;
    }


    const competence =
        findGradebookObjectById(
            curriculum,
            competenceId
        );


    if (!competence) {
        return competenceId;
    }


    const code =
        competence.code ||
        competence.shortCode ||
        "";


    const name =
        competence.name ||
        competence.title ||
        competence.description ||
        "";


    if (code && name) {
        return `${code} — ${name}`;
    }


    return (
        code ||
        name ||
        competenceId
    );

}



// ---------------------------------------------------------
// GENERIC CURRICULUM SEARCH
// ---------------------------------------------------------

function findGradebookObjectById(
    object,
    id
) {

    if (
        !object ||
        typeof object !== "object"
    ) {
        return null;
    }


    if (
        object.id === id
    ) {
        return object;
    }


    for (
        const key in object
    ) {

        if (
            !Object.prototype.hasOwnProperty
                .call(object, key)
        ) {
            continue;
        }


        const value =
            object[key];


        if (
            Array.isArray(value)
        ) {

            for (
                const item of value
            ) {

                const found =
                    findGradebookObjectById(
                        item,
                        id
                    );


                if (found) {
                    return found;
                }

            }

        }
        else if (
            value &&
            typeof value === "object"
        ) {

            const found =
                findGradebookObjectById(
                    value,
                    id
                );


            if (found) {
                return found;
            }

        }

    }


    return null;

}



// ---------------------------------------------------------
// DATE
// ---------------------------------------------------------

function formatGradebookDate(
    date
) {

    if (!date) {
        return "";
    }


    const parsed =
        new Date(
            `${date}T00:00:00`
        );


    if (
        Number.isNaN(
            parsed.getTime()
        )
    ) {
        return date;
    }


    return parsed.toLocaleDateString(
        "en-GB",
        {
            day: "2-digit",
            month: "short"
        }
    ).toUpperCase();

}



// ---------------------------------------------------------
// NUMBER
// ---------------------------------------------------------

function formatGradebookNumber(
    value
) {

    const number =
        Number(value);


    if (
        !Number.isFinite(number)
    ) {
        return "—";
    }


    return Number(
        number.toFixed(2)
    );

}
