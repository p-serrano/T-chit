// =========================================================
// T-CHIT — COMPETENCE WEIGHT
// =========================================================


function renderCompetenceWeightContent(
    container
) {

    const academicYear =
        AppState.getCurrentAcademicYear();


    if (!academicYear) {

        container.innerHTML = `

            <div class="assessment-empty-state">

                No academic year selected.

            </div>

        `;

        return;
    }


    const classId =
        assessmentSelectedClassId;


    const termId =
        assessmentSelectedTermId;


    if (
        !classId ||
        !termId
    ) {

        container.innerHTML = `

            <div class="assessment-empty-state">

                Select a class and term.

            </div>

        `;

        return;
    }


    const selectedClass =
        ClassManager.getById(
            classId
        );


    const selectedTerm =
        AcademicYearManager.getTermById(
            academicYear.id,
            termId
        );


    if (
        !selectedClass ||
        !selectedTerm
    ) {

        container.innerHTML = `

            <div class="assessment-empty-state">

                Invalid class or term.

            </div>

        `;

        return;
    }


    const activities =
        AssessmentActivityManager.getByTerm(
            academicYear.id,
            selectedClass.id,
            selectedTerm.id
        );


    const terms =
        Array.isArray(
            academicYear.terms
        )
            ? academicYear.terms
            : [];


    // ---------------------------------------------------------
    // COMPETENCES ACTUALLY WORKED
    // ---------------------------------------------------------

    const competenceIds = [];


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
                        competence.specificCompetenceId;


                    if (
                        competenceId &&
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


    // ---------------------------------------------------------
    // SORT
    // ---------------------------------------------------------

    competenceIds.sort(
        (a, b) => {

            const getNumber =
                id => {

                    const match =
                        String(id).match(
                            /_sc_(\d+)$/
                        );

                    return match
                        ? Number(match[1])
                        : Number.MAX_SAFE_INTEGER;

                };


            return (
                getNumber(a) -
                getNumber(b)
            );

        }
    );


    // ---------------------------------------------------------
    // STUDENTS
    // ---------------------------------------------------------

    const students =
        EnrollmentManager.getStudentsForClass(
            selectedClass.id
        );


    // ---------------------------------------------------------
    // WEIGHTS
    // ---------------------------------------------------------

    const competenceWeights = {};


    competenceIds.forEach(
        competenceId => {

            competenceWeights[
                competenceId
            ] =
                GradebookManager.getCompetenceWeight(
                    academicYear.id,
                    selectedClass.id,
                    selectedTerm.id,
                    competenceId
                ) || 0;

        }
    );


    const weightTotal =
        GradebookManager.getCompetenceWeightTotal(
            academicYear.id,
            selectedClass.id,
            selectedTerm.id
        );


    // ---------------------------------------------------------
    // VIEW
    // ---------------------------------------------------------

    let html = `

        <div class="
            assessment-data-section
            competence-weight-view
        ">


            <!-- HEADER -->

            <div class="
                assessment-data-header
                assessment-section-header
            ">

                <div>

                    <h2>
                        COMPETENCE WEIGHT
                    </h2>

                    <p>
                        Competence grades calculated from
                        Gradebook are weighted to obtain
                        the term grade.
                    </p>

                </div>


                <div class="assessment-term-selector">

                    <label
                        for="competenceWeightTerm"
                    >
                        TERM
                    </label>

                    <select
                        id="competenceWeightTerm"
                        onchange="
                            changeAssessmentTerm(
                                this.value
                            )
                        "
                    >

    `;


    terms.forEach(
        term => {

            html += `

                <option
                    value="${escapeHTML(term.id)}"
                    ${
                        term.id === termId
                            ? "selected"
                            : ""
                    }
                >
                    ${escapeHTML(term.name)}
                </option>

            `;

        }
    );


    html += `

                    </select>

                </div>

            </div>


            <!-- SHEET -->

            <div class="
                assessment-data-sheet
                competence-weight-sheet
            ">


                <!-- TABLE -->

                <div class="
                    assessment-data-table-wrapper
                    competence-weight-table-wrapper
                ">

                    <table class="
                        assessment-data-table
                        competence-weight-table
                    ">

                        <thead>

                            <tr>

                                <th
                                    class="student-name-column"
                                >
                                    STUDENT
                                </th>

    `;


    competenceIds.forEach(
        (competenceId, index) => {

            const code =
                getGradebookCompetenceCode(
                    competenceId
                );


            const weight =
                competenceWeights[
                    competenceId
                ];


            html += `

                <th
                    class="
                        competence-weight-column
                        gradebook-activity-column-${index}
                    "
                >

                    <div class="competence-header">

                        <div class="competence-header-code">

                            ${escapeHTML(code)}

                        </div>


                        <div class="competence-header-weight">

                            <input
                                type="text"
                                inputmode="numeric"
                                value="${weight}"
                                data-competence-id="${escapeHTML(
                                    competenceId
                                )}"
                                class="competence-weight-input"
                                autocomplete="off"
                            >

                            <span>%</span>

                        </div>

                    </div>

                </th>

            `;

        }
    );


    html += `

                                <th
                                    class="term-total-column"
                                >
                                    TOTAL
                                </th>

                            </tr>

                        </thead>


                        <tbody>

    `;


    // ---------------------------------------------------------
    // STUDENTS
    // ---------------------------------------------------------

    students.forEach(
        student => {

            html += `

                <tr>

                    <td class="student-name-cell">

                        ${escapeHTML(
                            getStudentDisplayName(
                                student
                            )
                        )}

                    </td>

            `;


            let studentTotal = 0;

            let hasGrade = false;


            competenceIds.forEach(
                competenceId => {

                    const relevantActivities =
                        activities.filter(
                            activity =>
                                activity.specificCompetences
                                    ?.some(
                                        competence =>
                                            competence
                                                .specificCompetenceId ===
                                            competenceId
                                    )
                        );


                    const competenceGrade =
                        calculateGradebookCompetenceTotal(
                            competenceId,
                            relevantActivities,
                            student.id
                        );


                    const weight =
                        competenceWeights[
                            competenceId
                        ] || 0;


                    if (
                        competenceGrade !== null &&
                        weight > 0
                    ) {

                        studentTotal +=
                            competenceGrade *
                            (
                                weight /
                                100
                            );

                        hasGrade = true;

                    }


                    html += `

                        <td
                            class="competence-grade-cell"
                        >

                            ${
                                competenceGrade === null
                                    ? "—"
                                    : competenceGrade.toFixed(2)
                            }

                        </td>

                    `;

                }
            );


            html += `

                    <td
                        class="term-total-cell"
                    >

                        ${
                            hasGrade
                                ? studentTotal.toFixed(2)
                                : "—"
                        }

                    </td>

                </tr>

            `;

        }
    );


    if (!students.length) {

        html += `

            <tr>

                <td
                    colspan="${competenceIds.length + 2}"
                    class="assessment-empty-row"
                >
                    No students found.
                </td>

            </tr>

        `;

    }


    html += `

                        </tbody>

                    </table>

                </div>


                <!-- FOOTER -->

                <div class="
                    assessment-data-footer
                    competence-weight-footer
                ">

                    <div class="competence-weight-total">

                        <span>
                            TOTAL WEIGHT
                        </span>

                        <strong>
                            ${weightTotal.toFixed(0)}%
                        </strong>

                    </div>


                    ${
                        weightTotal !== 100
                            ? `

                                <div
                                    class="
                                        competence-weight-warning
                                    "
                                >
                                    The competence weights
                                    must total 100%.
                                </div>

                            `
                            : ""
                    }

                </div>

            </div>

        </div>

    `;


    container.innerHTML =
        html;

}