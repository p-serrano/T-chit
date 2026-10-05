// =========================================================
// T-CHIT — TERM WEIGHT
// =========================================================


// ---------------------------------------------------------
// TERM GRADE CALCULATION
// ---------------------------------------------------------

function calculateTermGradeForStudent(
    academicYear,
    classId,
    termId,
    studentId
) {

    const activities =
        AssessmentActivityManager.getByTerm(
            academicYear.id,
            classId,
            termId
        );


    if (!activities.length) {
        return null;
    }


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


    let termTotal = 0;

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
                    studentId
                );


            const competenceWeight =
                GradebookManager.getCompetenceWeight(
                    academicYear.id,
                    classId,
                    termId,
                    competenceId
                ) || 0;


            if (
                competenceGrade !== null &&
                competenceWeight > 0
            ) {

                termTotal +=
                    competenceGrade *
                    (
                        competenceWeight /
                        100
                    );

                hasGrade = true;

            }

        }
    );


    return hasGrade
        ? termTotal
        : null;
}


// =========================================================
// TERM WEIGHT VIEW
// =========================================================

function renderTermWeightContent(
    container
) {

    const academicYear =
        AppState.getCurrentAcademicYear();


    if (!academicYear) {

        container.innerHTML = `

            <div class="term-weight-empty">
                No academic year selected.
            </div>

        `;

        return;
    }


    const classId =
        assessmentSelectedClassId;


    if (!classId) {

        container.innerHTML = `

            <div class="term-weight-empty">
                Select a class.
            </div>

        `;

        return;
    }


    const selectedClass =
        ClassManager.getById(
            classId
        );


    if (!selectedClass) {

        container.innerHTML = `

            <div class="term-weight-empty">
                Invalid class.
            </div>

        `;

        return;
    }


    const terms =
        Array.isArray(
            academicYear.terms
        )
            ? academicYear.terms
            : [];


    const students =
        EnrollmentManager.getStudentsForClass(
            selectedClass.id
        );


    // ---------------------------------------------------------
    // TERM WEIGHTS
    // ---------------------------------------------------------

    const termWeights = {};


    terms.forEach(
        term => {

            termWeights[
                term.id
            ] =
                GradebookManager.getTermWeight(
                    academicYear.id,
                    selectedClass.id,
                    term.id
                ) || 0;

        }
    );


    const weightTotal =
        GradebookManager.getTermWeightTotal(
            academicYear.id,
            selectedClass.id
        );


    // ---------------------------------------------------------
    // VIEW
    // ---------------------------------------------------------

    let html = `

        <div class="
            assessment-data-section
            term-weight-view
        ">


            <!-- HEADER -->

            <div class="
                assessment-data-header
                term-weight-header
            ">

                <div class="term-weight-header-main">

                    <h3>
                        TERM WEIGHT
                    </h3>

                    <p>
                        Term grades are weighted to obtain
                        the final subject grade.
                    </p>

                </div>

            </div>


            <!-- SHEET -->

            <div class="
                assessment-data-sheet
                term-weight-sheet
            ">


                <!-- TABLE -->

                <div class="
                    assessment-data-table-wrapper
                    term-weight-table-wrapper
                ">

                    <table class="
                        assessment-data-table
                        term-weight-table
                    ">

                        <thead>

                            <tr>

                                <th
                                    class="
                                        term-weight-student-column
                                    "
                                >
                                    STUDENT
                                </th>

    `;


    // ---------------------------------------------------------
    // TERM HEADERS
    // ---------------------------------------------------------

    terms.forEach(
        (term, index) => {

            const weight =
                termWeights[
                    term.id
                ] || 0;


            html += `

                <th
                    class="
                        term-weight-term-column
                        term-weight-column-${index}
                    "
                >

                    <div class="term-weight-term-header">


                        <div
                            class="
                                term-weight-term-name
                            "
                        >
                            ${escapeHTML(
                                term.name
                            )}
                        </div>


                        <div
                            class="
                                term-weight-term-weight
                            "
                        >

                            <div
                                class="
                                    term-weight-input-wrapper
                                "
                            >

                                <input
                                    type="text"
                                    inputmode="numeric"
                                    value="${weight}"
                                    data-term-id="${escapeHTML(
                                        term.id
                                    )}"
                                    class="term-weight-input"
                                    autocomplete="off"
                                >

                                <span
                                    class="
                                        term-weight-percent
                                    "
                                >
                                    %
                                </span>

                            </div>

                        </div>

                    </div>

                </th>

            `;

        }
    );


    // ---------------------------------------------------------
    // TOTAL HEADER
    // ---------------------------------------------------------

    html += `

                                <th
                                    class="
                                        term-weight-total-column
                                    "
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

                    <td
                        class="
                            student-name-cell
                        "
                    >

                        ${escapeHTML(
                            getStudentDisplayName(
                                student
                            )
                        )}

                    </td>

            `;


            let finalTotal = 0;

            let hasGrade = false;


            terms.forEach(
                term => {

                    const termGrade =
                        calculateTermGradeForStudent(
                            academicYear,
                            selectedClass.id,
                            term.id,
                            student.id
                        );


                    const weight =
                        termWeights[
                            term.id
                        ] || 0;


                    if (
                        termGrade !== null &&
                        weight > 0
                    ) {

                        finalTotal +=
                            termGrade *
                            (
                                weight /
                                100
                            );

                        hasGrade = true;

                    }


                    html += `

                        <td
                            class="
                                term-weight-grade-cell
                            "
                        >

                            ${
                                termGrade === null
                                    ? `
                                        <span
                                            class="
                                                term-weight-grade-empty
                                            "
                                        >
                                            —
                                        </span>
                                    `
                                    : `
                                        <span
                                            class="
                                                term-weight-grade
                                            "
                                        >
                                            ${termGrade.toFixed(2)}
                                        </span>
                                    `
                            }

                        </td>

                    `;

                }
            );


            html += `

                    <td
                        class="
                            term-weight-total-cell
                        "
                    >

                        <span
                            class="
                                term-weight-total-value
                            "
                        >

                            ${
                                hasGrade
                                    ? finalTotal.toFixed(2)
                                    : "—"
                            }

                        </span>

                    </td>

                </tr>

            `;

        }
    );


    if (!students.length) {

        html += `

            <tr>

                <td
                    colspan="${terms.length + 2}"
                    class="term-weight-empty"
                >

                    No students found.

                </td>

            </tr>

        `;

    }


    // ---------------------------------------------------------
    // CLOSE TABLE + FOOTER
    // ---------------------------------------------------------

    html += `

                        </tbody>

                    </table>

                </div>


                <!-- FOOTER -->

                <div class="
                    assessment-data-footer
                    term-weight-footer
                ">

                    <div class="term-weight-total">

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
                                        term-weight-warning
                                    "
                                >

                                    The term weights
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