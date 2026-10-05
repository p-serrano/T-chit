// =========================================================
// T-CHIT — ASSESSMENT VIEW
// =========================================================


// ---------------------------------------------------------
// ASSESSMENT STATE
// ---------------------------------------------------------

let assessmentSelectedClassId = null;

let assessmentSelectedTermId = null;

let assessmentActiveTab = "gradebook";


// ---------------------------------------------------------
// MAIN VIEW
// ---------------------------------------------------------

function renderAssessmentView() {

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


    if (!academicYear) {

        container.innerHTML = `

            <div class="assessment-view">

                <div class="empty-state">

                    <div class="empty-state-icon">
                        ✎
                    </div>

                    <h3>
                        No academic year selected
                    </h3>

                    <p>
                        Set up your academic year before
                        using assessment.
                    </p>

                    <button
                        class="btn-primary"
                        onclick="navigateTo('settings')"
                    >
                        GO TO SETTINGS
                    </button>

                </div>

            </div>

        `;

        return;
    }


    const classes =
        ClassManager.getByAcademicYear(
            academicYear.id
        );


    const terms =
        Array.isArray(academicYear.terms)
            ? academicYear.terms
            : [];


    // -----------------------------------------------------
    // VALIDATE CLASS
    // -----------------------------------------------------

    if (
        assessmentSelectedClassId &&
        !classes.some(
            classItem =>
                classItem.id ===
                assessmentSelectedClassId
        )
    ) {

        assessmentSelectedClassId = null;

    }


    // -----------------------------------------------------
    // VALIDATE TERM
    // -----------------------------------------------------

    if (
        assessmentSelectedTermId &&
        !terms.some(
            term =>
                term.id ===
                assessmentSelectedTermId
        )
    ) {

        assessmentSelectedTermId = null;

    }


    // -----------------------------------------------------
    // DEFAULT TERM
    // -----------------------------------------------------

    if (
        !assessmentSelectedTermId &&
        terms.length
    ) {

        const currentTerm =
            AcademicYearManager.getTermByDate(
                academicYear.id,
                new Date()
            );

        if (currentTerm) {

            assessmentSelectedTermId =
                currentTerm.id;

        }

    }


    container.innerHTML = `

        <div class="assessment-view">

            <!-- CONTEXT -->

            <section class="assessment-section">

                <div class="gradebook-filters">

                    <div class="gradebook-filter">

                        <select
                            id="assessmentClassFilter"
                            onchange="
                                changeAssessmentClass(
                                    this.value
                                )
                            "
                        >

                            <option
                                value=""
                                ${
                                    !assessmentSelectedClassId
                                        ? "selected"
                                        : ""
                                }
                            >
                                Select class...
                            </option>

                            ${
                                classes
                                    .map(
                                        classItem => `
                                            <option
                                                value="${escapeHTML(
                                                    classItem.id
                                                )}"
                                                ${
                                                    classItem.id ===
                                                    assessmentSelectedClassId
                                                        ? "selected"
                                                        : ""
                                                }
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

                </div>

            </section>


            ${
                assessmentSelectedClassId
                    ? `

                        <!-- TABS -->

                        <section class="assessment-section">

                            <div class="assessment-tabs">

                                <button
                                    type="button"
                                    class="
                                        assessment-tab
                                        ${
                                            assessmentActiveTab ===
                                            "gradebook"
                                                ? "active"
                                                : ""
                                        }
                                    "
                                    onclick="
                                        changeAssessmentTab(
                                            'gradebook'
                                        )
                                    "
                                >
                                    GRADEBOOK
                                </button>


                                <button
                                    type="button"
                                    class="
                                        assessment-tab
                                        ${
                                            assessmentActiveTab ===
                                            "competenceWeight"
                                                ? "active"
                                                : ""
                                        }
                                    "
                                    onclick="
                                        changeAssessmentTab(
                                            'competenceWeight'
                                        )
                                    "
                                >
                                    COMPETENCE WEIGHT
                                </button>


                                <button
                                    type="button"
                                    class="
                                        assessment-tab
                                        ${
                                            assessmentActiveTab ===
                                            "termWeight"
                                                ? "active"
                                                : ""
                                        }
                                    "
                                    onclick="
                                        changeAssessmentTab(
                                            'termWeight'
                                        )
                                    "
                                >
                                    TERM WEIGHT
                                </button>

                            </div>


                            <div
                                id="assessmentContent"
                                class="assessment-tab-content"
                            >
                            </div>

                        </section>

                    `
                    : ""
            }

        </div>

    `;


    // -----------------------------------------------------
    // RENDER ACTIVE TAB
    // -----------------------------------------------------

    if (
        assessmentSelectedClassId
    ) {

        renderAssessmentActiveTab();

    }

}


// ---------------------------------------------------------
// CLASS CHANGE
// ---------------------------------------------------------

function changeAssessmentClass(
    classId
) {

    assessmentSelectedClassId =
        classId || null;


    /*
     * When the user selects a new class,
     * always start in Gradebook.
     */

    assessmentActiveTab =
        "gradebook";


    renderAssessmentView();

}


function changeAssessmentTerm(termId) {

    assessmentSelectedTermId =
        termId || null;

    renderAssessmentActiveTab();
}


// ---------------------------------------------------------
// TAB CHANGE
// ---------------------------------------------------------

function changeAssessmentTab(
    tab
) {

    assessmentActiveTab =
        tab;


    renderAssessmentView();

}


// ---------------------------------------------------------
// ACTIVE TAB
// ---------------------------------------------------------

function renderAssessmentActiveTab() {

    const content =
        document.getElementById(
            "assessmentContent"
        );


    if (!content) {
        return;
    }


    switch (
        assessmentActiveTab
    ) {

        case "gradebook":

            renderGradebookContent(
                content
            );

            break;


        case "competenceWeight":

            renderCompetenceWeightContent(
                content
            );

            break;


        case "termWeight":

            renderTermWeightContent(
                content
            );

            break;

    }

}