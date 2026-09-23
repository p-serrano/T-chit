// =========================================================
// T-CHIT — PLANNER VIEW
// =========================================================





// ---------------------------------------------------------
// PLANNER STATE
// ---------------------------------------------------------

let plannerActiveTab = "timetable";

let coursePlanWeekStart = getMonday(
    new Date()
);


// ---------------------------------------------------------
// RENDER PLANNER
// ---------------------------------------------------------

function renderPlannerView() {

    const container =
        document.getElementById(
            "appView"
        );

    if (!container) {
        return;
    }


    const academicYear =
        AppState.getCurrentAcademicYear();


    if (!academicYear) {

        container.innerHTML = `

            <div class="planner-view">

                <div class="empty-state">

                    <div class="empty-state-icon">
                        🗓️
                    </div>

                    <h3>
                        No academic year selected
                    </h3>

                    <p>
                        Create or select an academic
                        year before using the planner.
                    </p>

                    <br>

                    <button
                        class="btn-primary"
                        onclick="navigateTo('settings')">

                        GO TO SETTINGS

                    </button>

                </div>

            </div>

        `;

        return;
    }


    container.innerHTML = `

        <div class="planner-view">

            <!-- =====================================
                 PLANNER HEADER
                 ===================================== -->

            <div class="view-toolbar">

                <div>

                    <div class="view-label">
                        ACADEMIC YEAR
                    </div>

                    <div class="academic-year-name">
                        ${escapeHTML(
                            academicYear.name
                        )}
                    </div>

                </div>

            </div>


            <!-- =====================================
                 PLANNER TABS
                 ===================================== -->

            <div class="planner-tabs">

                <button
                    class="planner-tab
                        ${
                            plannerActiveTab ===
                            "timetable"
                                ? "active"
                                : ""
                        }"
                    onclick="switchPlannerTab(
                        'timetable'
                    )">

                    MY TIMETABLE

                </button>


                <button
                    class="planner-tab
                        ${
                            plannerActiveTab ===
                            "course"
                                ? "active"
                                : ""
                        }"
                    onclick="switchPlannerTab(
                        'course'
                    )">

                    COURSE PLAN

                </button>

            </div>


            ${
                plannerActiveTab === "timetable"
                    ? renderTimetableSection(
                        academicYear.id
                    )
                    : renderCoursePlanSection(
                        academicYear.id
                    )
            }

        </div>

    `;
}


// ---------------------------------------------------------
// SWITCH PLANNER TAB
// ---------------------------------------------------------

function switchPlannerTab(
    tab
) {

    plannerActiveTab = tab;

    renderPlannerView();

}


// =========================================================
// END PLANNER VIEW
// =========================================================


// =========================================================
// ASSESSMENT FORM HELPERS
// =========================================================


// ---------------------------------------------------------
// GET CURRICULUM FOR CLASS
// ---------------------------------------------------------

function getAssessmentCurriculum(
    classId
) {

    const classItem =
        ClassManager.getById(
            classId
        );


    if (
        !classItem ||
        !classItem.curriculumId
    ) {

        return null;

    }


    return CurriculumManager.getById(
        classItem.curriculumId
    );

}


// =========================================================
// ASSESSMENT INSTRUMENT
// =========================================================


function renderAssessmentInstrumentSelect(
    selected = "",
    id = "lessonAssessmentInstrument",
    disabled = false
) {

    const instruments = [
        {
            id: "rubric",
            name: "Rubric"
        },
        {
            id: "checklist",
            name: "Checklist"
        },
        {
            id: "rating_scale",
            name: "Rating scale"
        },
        {
            id: "learning_diary",
            name: "Learning diary"
        },
        {
            id: "portfolio",
            name: "Portfolio"
        },
        {
            id: "objective_test",
            name: "Objective test"
        }
    ];

    return `
        <select
            id="${id}"
            ${disabled ? "disabled" : ""}
        >
            <option value="">
                Select instrument
            </option>

            ${
                instruments.map(instrument => `
                    <option
                        value="${escapeHTML(instrument.id)}"
                        ${selected === instrument.id ? "selected" : ""}
                    >
                        ${escapeHTML(instrument.name)}
                    </option>
                `).join("")
            }
        </select>
    `;
}


// ---------------------------------------------------------
// RENDER ASSESSMENT EVALUATORS
// ---------------------------------------------------------

function renderAssessmentEvaluators(
    evaluations = [],
    prefix = "lesson"
) {

    const evaluationMap = new Map(
        evaluations.map(item => [
            item.evaluator,
            item.instrumentId
        ])
    );

    const evaluators = [
        {
            id: "teacher",
            label: "Teacher assessment"
        },
        {
            id: "self",
            label: "Self-assessment"
        },
        {
            id: "peer",
            label: "Peer-assessment"
        }
    ];

    return `
        <div class="assessment-evaluators">

            ${
                evaluators.map(evaluator => {

                    const selected =
                        evaluationMap.has(evaluator.id);

                    const instrumentId =
                        evaluationMap.get(evaluator.id) || "";

                    const capitalized =
                        evaluator.id.charAt(0).toUpperCase() +
                        evaluator.id.slice(1);

                    return `
                        <div
                            class="
                                assessment-evaluator-option
                                ${selected ? "selected" : ""}
                            "
                        >

                            <label>
                                <input
                                    type="checkbox"
                                    name="${prefix}Evaluator"
                                    value="${evaluator.id}"
                                    ${selected ? "checked" : ""}
                                    onchange="
                                        toggleAssessmentEvaluator(
                                            this,
                                            '${prefix}'
                                        )
                                    "
                                >

                                <span>
                                    ${evaluator.label}
                                </span>
                            </label>

                            <div
                                class="assessment-evaluator-instrument"
                                ${selected ? "" : 'style="display:none;"'}
                            >

                                ${renderAssessmentInstrumentSelect(
                                    instrumentId,
                                    `${prefix}${capitalized}Instrument`,
                                    !selected
                                )}

                            </div>

                        </div>
                    `;

                }).join("")
            }

        </div>
    `;
}


// ---------------------------------------------------------
// TOGGLE ASSESSMENT EVALUATOR
// ---------------------------------------------------------

function toggleAssessmentEvaluator(
    input,
    prefix = "lesson"
) {

    const option =
        input.closest(".assessment-evaluator-option");

    if (!option) return;

    const instrumentContainer =
        option.querySelector(
            ".assessment-evaluator-instrument"
        );

    const instrument =
        instrumentContainer?.querySelector("select");

    const isChecked = input.checked;

    option.classList.toggle(
        "selected",
        isChecked
    );

    if (instrumentContainer) {
        instrumentContainer.style.display =
            isChecked ? "" : "none";
    }

    if (instrument) {
        instrument.disabled = !isChecked;

        if (!isChecked) {
            instrument.value = "";
        }
    }
}


// ---------------------------------------------------------
// GET SELECTED ASSESSMENT EVALUATORS
// ---------------------------------------------------------

function getSelectedAssessmentEvaluations(
    container = document,
    prefix = "lesson"
) {

    return Array.from(
        container.querySelectorAll(
            `input[name="${prefix}Evaluator"]:checked`
        )
    )
        .map(
            input => {

                const evaluator =
                    input.value;


                const capitalized =
                    evaluator.charAt(0).toUpperCase() +
                    evaluator.slice(1);


                const instrument =
                    document.getElementById(
                        `${prefix}${capitalized}Instrument`
                    );


                return {

                    evaluator,

                    instrumentId:
                        instrument?.value ||
                        null

                };

            }
        )
        .filter(
            item =>
                item.instrumentId
        );

}


// =========================================================
// SPECIFIC COMPETENCES
// =========================================================


// ---------------------------------------------------------
// GET OPERATIONAL DESCRIPTORS
// ---------------------------------------------------------

function getAssessmentOperationalDescriptors(
    specificCompetence
) {

    if (
        !specificCompetence
    ) {

        return [];

    }


    // Current curriculum model:
    // operational descriptors belong to
    // the Specific Competence.

    if (
        Array.isArray(
            specificCompetence.operationalDescriptors
        )
    ) {

        return specificCompetence
            .operationalDescriptors;

    }


    // Legacy fallback.
    // Some older curriculum data may have
    // descriptors inside criteria.

    const descriptors = [];


    (
        specificCompetence.criteria ||
        []
    ).forEach(
        criterion => {

            if (
                !Array.isArray(
                    criterion.operationalDescriptors
                )
            ) {

                return;

            }


            criterion
                .operationalDescriptors
                .forEach(
                    descriptor => {

                        if (
                            !descriptors.includes(
                                descriptor
                            )
                        ) {

                            descriptors.push(
                                descriptor
                            );

                        }

                    }
                );

        }
    );


    return descriptors;

}


// ---------------------------------------------------------
// RENDER SPECIFIC COMPETENCES
// ---------------------------------------------------------

function renderAssessmentSpecificCompetences(
    classId,
    selectedCompetences = [],
    prefix = "lesson"
) {

    const curriculum =
        getAssessmentCurriculum(
            classId
        );


    if (!curriculum) {

        return `

            <div class="assessment-form-empty">

                This class has no curriculum
                assigned yet.

            </div>

        `;

    }


    const selectedMap =
        new Map(
            selectedCompetences.map(
                item => [

                    item.specificCompetenceId,

                    Number.isFinite(
                        Number(
                            item.weight
                        )
                    )
                        ? Number(
                            item.weight
                        )
                        : 0

                ]
            )
        );


    const competences =
        Array.isArray(
            curriculum.specificCompetences
        )
            ? curriculum.specificCompetences
            : [];


    if (!competences.length) {

        return `

            <div class="assessment-form-empty">

                No specific competences are
                available for this curriculum.

            </div>

        `;

    }


    return `

        <div
            class="assessment-specific-competences">

            ${
                competences
                    .map(
                        specificCompetence => {

                            const competenceId =
                                String(
                                    specificCompetence.id ||
                                    ""
                                ).trim();


                            if (!competenceId) {
                                return "";
                            }


                            const code =
                                specificCompetence.code ||
                                competenceId;


                            const selected =
                                selectedMap.has(
                                    competenceId
                                );


                            const weight =
                                selectedMap.get(
                                    competenceId
                                ) ?? 0;


                            const descriptors =
                                getAssessmentOperationalDescriptors(
                                    specificCompetence
                                );


                            const safeId =
                                competenceId
                                    .replace(
                                        /[^A-Za-z0-9_-]/g,
                                        "_"
                                    );


                            return `

                                <div
                                    class="assessment-competence-option
                                        ${
                                            selected
                                                ? "selected"
                                                : ""
                                        }">

                                    <div
                                        class="assessment-competence-main">

                                        <label>

                                            <input
                                                type="checkbox"
                                                name="${prefix}SpecificCompetence"
                                                value="${escapeHTML(
                                                    competenceId
                                                )}"
                                                data-competence-key="${safeId}"
                                                ${
                                                    selected
                                                        ? "checked"
                                                        : ""
                                                }
                                                onchange="updateAssessmentCompetenceState(this, '${prefix}')">

                                            <span>

                                                <strong>
                                                    ${escapeHTML(
                                                        code
                                                    )}
                                                </strong>

                                                <span>
                                                    ${escapeHTML(
                                                        specificCompetence.title ||
                                                        specificCompetence.name ||
                                                        ""
                                                    )}
                                                </span>

                                            </span>

                                        </label>


                                        <div
                                            class="assessment-competence-weight">

                                            <input
                                                type="number"
                                                id="${prefix}SpecificCompetenceWeight_${safeId}"
                                                min="0"
                                                max="100"
                                                step="0.01"
                                                value="${weight}"
                                                ${selected ? "" : "disabled"}
                                                title="Weight of this activity for this specific competence (%)">

                                            <span>
                                                %
                                            </span>

                                        </div>

                                    </div>


                                    ${
                                        descriptors.length
                                            ? `

                                                <div
                                                    class="assessment-operational-descriptors">

                                                    <div
                                                        class="assessment-operational-descriptors-label">

                                                        Operational descriptors

                                                    </div>

                                                    <div
                                                        class="assessment-operational-descriptors-list">

                                                        ${
                                                            descriptors
                                                                .map(
                                                                    descriptor =>
                                                                        `

                                                                            <span
                                                                                class="assessment-operational-descriptor">

                                                                                ${escapeHTML(
                                                                                    typeof descriptor ===
                                                                                    "string"
                                                                                        ? descriptor
                                                                                        : (
                                                                                            descriptor.code ||
                                                                                            descriptor.id ||
                                                                                            ""
                                                                                        )
                                                                                )}

                                                                            </span>

                                                                        `
                                                                )
                                                                .join("")
                                                        }

                                                    </div>

                                                </div>

                                            `
                                            : ""
                                    }

                                </div>

                            `;

                        }
                    )
                    .join("")
            }

        </div>

    `;

}


// ---------------------------------------------------------
// GET SELECTED SPECIFIC COMPETENCES
// ---------------------------------------------------------

function getSelectedAssessmentSpecificCompetences(
    container = document,
    prefix = "lesson"
) {

    return Array.from(
        container.querySelectorAll(
            `input[name="${prefix}SpecificCompetence"]:checked`
        )
    )
        .map(
            input => {

                const key =
                    input.dataset
                        .competenceKey;


                const weightInput =
                    document.getElementById(
                        `${prefix}SpecificCompetenceWeight_${key}`
                    );


                return {

                    specificCompetenceId:
                        input.value,

                    weight:
                        Number(
                            weightInput?.value || 0
                        )

                };

            }
        );

}


// ---------------------------------------------------------
// UPDATE COMPETENCE VISUAL STATE
// ---------------------------------------------------------

function updateAssessmentCompetenceState(
    input,
    prefix = "lesson"
) {

    if (!input) {
        return;
    }


    const option =
        input.closest(
            ".assessment-competence-option"
        );


    if (!option) {
        return;
    }


    const key =
        input.dataset
            .competenceKey;


    const weightInput =
        document.getElementById(
            `${prefix}SpecificCompetenceWeight_${key}`
        );


    if (input.checked) {

        option.classList.add(
            "selected"
        );


        if (weightInput) {

            weightInput.disabled =
                false;

        }

    } else {

        option.classList.remove(
            "selected"
        );


        if (weightInput) {

            weightInput.disabled =
                true;

        }

    }

}


// =========================================================
// BASIC KNOWLEDGE
// =========================================================


// ---------------------------------------------------------
// SEARCH BASIC KNOWLEDGE
// ---------------------------------------------------------

function searchAssessmentBasicKnowledge(
    classId,
    searchTerm = ""
) {

    const curriculum =
        getAssessmentCurriculum(
            classId
        );


    if (!curriculum) {
        return [];
    }


    const basicKnowledge =
        Array.isArray(
            curriculum.basicKnowledge
        )
            ? curriculum.basicKnowledge
            : [];


    const normalizedSearch =
        String(
            searchTerm || ""
        )
            .trim()
            .toLocaleLowerCase();


    if (!normalizedSearch) {

        return basicKnowledge;

    }


    return basicKnowledge.filter(
        item => {

            const searchableText = [

                item.id,

                item.code,

                item.block,

                item.title,

                item.description

            ]
                .filter(Boolean)
                .join(" ")
                .toLocaleLowerCase();


            return searchableText.includes(
                normalizedSearch
            );

        }
    );

}


// ---------------------------------------------------------
// RENDER BASIC KNOWLEDGE
// ---------------------------------------------------------

function renderAssessmentBasicKnowledgeOptions(
    classId,
    selectedIds = [],
    prefix = "lesson",
    searchTerm = ""
) {

    const curriculum =
        getAssessmentCurriculum(
            classId
        );


    if (!curriculum) {

        return `

            <div class="assessment-form-empty">

                This class has no curriculum
                assigned yet.

            </div>

        `;

    }


    const selected =
        new Set(
            Array.isArray(selectedIds)
                ? selectedIds
                : []
        );


    const items =
        searchAssessmentBasicKnowledge(
            classId,
            searchTerm
        );


    if (!items.length) {

        return `

            <div class="assessment-form-empty">

                ${
                    searchTerm
                        ? "No basic knowledge matches your search."
                        : "No basic knowledge is available."
                }

            </div>

        `;

    }


    return `

        <div
            class="assessment-basic-knowledge-results">

            ${
                items
                    .map(
                        item => `

                            <label
                                class="assessment-check-option">

                                <input
                                    type="checkbox"
                                    name="${prefix}BasicKnowledge"
                                    value="${escapeHTML(
                                        item.id
                                    )}"
                                    ${
                                        selected.has(
                                            item.id
                                        )
                                            ? "checked"
                                            : ""
                                    }
                                    onchange="
                                        updateAssessmentBasicKnowledgeState(
                                            this,
                                            '${prefix}',
                                            '${escapeHTML(classId)}'
                                        )
                                    "
                                >

                                <span>

                                    <strong>
                                        ${escapeHTML(
                                            item.title ||
                                            item.id
                                        )}
                                    </strong>

                                    ${
                                        item.code
                                            ? `

                                                <small>
                                                    ${escapeHTML(
                                                        item.code
                                                    )}
                                                </small>

                                            `
                                            : ""
                                    }

                                    ${
                                        item.description
                                            ? `

                                                <small>
                                                    ${escapeHTML(
                                                        item.description
                                                    )}
                                                </small>

                                            `
                                            : ""
                                    }

                                </span>

                            </label>

                        `
                    )
                    .join("")
            }

        </div>

    `;

}


// ---------------------------------------------------------
// UPDATE BASIC KNOWLEDGE SELECTION
// ---------------------------------------------------------

function updateAssessmentBasicKnowledgeState(
    input,
    prefix = "lesson",
    classId = ""
) {

    if (!input) {
        return;
    }


    const container =
        input.closest(
            ".lesson-assessment-fields"
        );


    if (!container) {
        return;
    }


    const selectedIds =
        getSelectedAssessmentBasicKnowledge(
            container,
            prefix
        );


    const selectedContainer =
        container.querySelector(
            `#${prefix}SelectedBasicKnowledge`
        );


    if (!selectedContainer) {
        return;
    }


    selectedContainer.innerHTML =
        renderSelectedAssessmentBasicKnowledge(
            classId,
            selectedIds
        );

}


// ---------------------------------------------------------
// GET SELECTED BASIC KNOWLEDGE
// ---------------------------------------------------------

function getSelectedAssessmentBasicKnowledge(
    container = document,
    prefix = "lesson"
) {

    return Array.from(
        container.querySelectorAll(
            `input[name="${prefix}BasicKnowledge"]:checked`
        )
    )
        .map(
            input =>
                input.value
        );

}


// ---------------------------------------------------------
// RENDER SELECTED BASIC KNOWLEDGE
// ---------------------------------------------------------

function renderSelectedAssessmentBasicKnowledge(
    classId,
    selectedIds = []
) {

    const curriculum =
        getAssessmentCurriculum(
            classId
        );


    if (!curriculum) {
        return "";
    }


    const selected =
        Array.isArray(selectedIds)
            ? selectedIds
            : [];


    if (!selected.length) {

        return `

            <div class="assessment-selected-empty">

                No basic knowledge selected.

            </div>

        `;

    }


    const items =
        (
            curriculum.basicKnowledge ||
            []
        )
            .filter(
                item =>
                    selected.includes(
                        item.id
                    )
            );


    return `

        <div
            class="assessment-basic-knowledge-selected">

            ${
                items
                    .map(
                        item => `

                            <div
                                class="assessment-selected-knowledge-item">

                                <span>
                                    ${escapeHTML(
                                        item.title ||
                                        item.id
                                    )}
                                </span>

                            </div>

                        `
                    )
                    .join("")
            }

        </div>

    `;

}


// =========================================================
// ASSESSMENT WEIGHT SUMMARY
// =========================================================


// ---------------------------------------------------------
// CALCULATE COMPETENCE WEIGHT TOTALS
// ---------------------------------------------------------

function calculateAssessmentCompetenceWeightTotals(
    container = document,
    prefix = "lesson"
) {

    const selected =
        getSelectedAssessmentSpecificCompetences(
            container,
            prefix
        );


    return selected.reduce(
        (totals, item) => {

            totals.total +=
                Number(
                    item.weight || 0
                );

            return totals;

        },
        {
            total: 0
        }
    );

}