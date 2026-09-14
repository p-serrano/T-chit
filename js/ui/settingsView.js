// ----------------------------------------
// T-CHIT — SETTINGS VIEW
// ----------------------------------------

function renderSettingsView() {

    const container =
        document.getElementById("appView");

    const academicYears =
        AppState.data.academicYears || [];

    container.innerHTML = `

        <div class="settings-view">

            <div class="view-toolbar">

                <div>
                    <div class="view-label">
                        ACADEMIC YEARS
                    </div>

                    <div class="academic-year-name">
                        Manage your school years
                    </div>
                </div>

                ${
                    academicYears.length
                        ? `
                            <button
                                class="btn-primary"
                                onclick="openNewAcademicYearModal()">
                                + NEW YEAR
                            </button>
                          `
                        : ""
                }

            </div>

            ${
                academicYears.length
                    ? renderAcademicYears(
                        academicYears
                    )
                    : renderNoAcademicYears()
            }

        </div>
    `;
}


// ----------------------------------------
// Academic years list
// ----------------------------------------

function renderAcademicYears(years) {

    return `

        <div class="academic-years-list">

            ${years.map(year => `

                <article
                    class="academic-year-card
                    ${year.id === AppState.currentAcademicYearId
                        ? "active"
                        : ""}">

                    <div class="academic-year-card-info">

                        <div class="view-label">
                            ACADEMIC YEAR
                        </div>

                        <h3>
                            ${escapeHTML(year.name)}
                        </h3>

                        <div class="academic-year-dates">

                            ${
                                year.startDate && year.endDate
                                    ? `${year.startDate} → ${year.endDate}`
                                    : "Dates not configured"
                            }

                        </div>

                    </div>

                    <div class="academic-year-card-actions">

                        ${
                            year.id ===
                            AppState.currentAcademicYearId

                                ? `
                                    <span class="active-badge">
                                        ACTIVE
                                    </span>
                                  `

                                : `
                                    <button
                                        class="btn-secondary"
                                        onclick="selectAcademicYear('${year.id}')">
                                        USE THIS YEAR
                                    </button>
                                  `
                        }

                        <button
                            class="small-icon-button"
                            onclick="deleteAcademicYearFromView('${year.id}')"
                            title="Delete academic year">
                            ×
                        </button>

                    </div>

                </article>

            `).join("")}

        </div>
    `;
}


// ----------------------------------------
// Empty state
// ----------------------------------------

function renderNoAcademicYears() {

    return `

        <div class="empty-state">

            <div class="empty-state-icon">
                📚
            </div>

            <h3>
                No academic year yet
            </h3>

            <p>
                Create your first academic year
                to start building your classes.
            </p>

            <button
                class="btn-primary"
                onclick="openNewAcademicYearModal()">
                + CREATE ACADEMIC YEAR
            </button>

        </div>
    `;
}


// ----------------------------------------
// New academic year modal
// ----------------------------------------

function openNewAcademicYearModal() {

    const modal =
        document.getElementById("modalContainer");

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
                            ACADEMIC YEAR
                        </div>

                        <h3>
                            New academic year
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
                        Academic year
                    </label>

                    <input
                        id="newAcademicYearName"
                        type="text"
                        placeholder="e.g. 2026–2027"
                        autocomplete="off">

                    <label>
                        Start date
                    </label>

                    <input
                        id="newAcademicYearStartDate"
                        type="date">

                    <label>
                        End date
                    </label>

                    <input
                        id="newAcademicYearEndDate"
                        type="date">

                    <div class="modal-section">

                        <div class="modal-section-title">
                            TERMS
                        </div>

                        <div class="term-editor">

                            <div class="term-row">

                                <div class="term-name">
                                    Term 1
                                </div>

                                <input
                                    id="newTerm1StartDate"
                                    type="date">

                                <span>→</span>

                                <input
                                    id="newTerm1EndDate"
                                    type="date">

                            </div>

                            <div class="term-row">

                                <div class="term-name">
                                    Term 2
                                </div>

                                <input
                                    id="newTerm2StartDate"
                                    type="date">

                                <span>→</span>

                                <input
                                    id="newTerm2EndDate"
                                    type="date">

                            </div>

                            <div class="term-row">

                                <div class="term-name">
                                    Term 3
                                </div>

                                <input
                                    id="newTerm3StartDate"
                                    type="date">

                                <span>→</span>

                                <input
                                    id="newTerm3EndDate"
                                    type="date">

                            </div>

                        </div>

                    </div>

                </div>

                <div class="modal-footer">

                    <button
                        class="btn-secondary"
                        onclick="closeModal()">
                        CANCEL
                    </button>

                    <button
                        class="btn-primary"
                        onclick="createAcademicYearFromView()">
                        CREATE YEAR
                    </button>

                </div>

            </div>

        </div>
    `;

    document
        .getElementById("newAcademicYearName")
        .focus();
}


// ----------------------------------------
// Create academic year
// ----------------------------------------

function createAcademicYearFromView() {

    const name =
        document
            .getElementById("newAcademicYearName")
            .value
            .trim();

    const startDate =
        document
            .getElementById("newAcademicYearStartDate")
            .value;

    const endDate =
        document
            .getElementById("newAcademicYearEndDate")
            .value;


    if (!name) {

        alert(
            "Enter an academic year."
        );

        return;
    }


    if (!startDate || !endDate) {

        alert(
            "Enter the start and end dates."
        );

        return;
    }


    if (startDate >= endDate) {

        alert(
            "The academic year end date must be after the start date."
        );

        return;
    }


    const terms = [
        {
            id: Utils.createId("term"),
            name: "Term 1",
            startDate:
                document
                    .getElementById("newTerm1StartDate")
                    .value,
            endDate:
                document
                    .getElementById("newTerm1EndDate")
                    .value
        },
        {
            id: Utils.createId("term"),
            name: "Term 2",
            startDate:
                document
                    .getElementById("newTerm2StartDate")
                    .value,
            endDate:
                document
                    .getElementById("newTerm2EndDate")
                    .value
        },
        {
            id: Utils.createId("term"),
            name: "Term 3",
            startDate:
                document
                    .getElementById("newTerm3StartDate")
                    .value,
            endDate:
                document
                    .getElementById("newTerm3EndDate")
                    .value
        }
    ];


    const incompleteTerm =
        terms.some(
            term =>
                !term.startDate ||
                !term.endDate
        );


    if (incompleteTerm) {

        alert(
            "Enter the dates for all three terms."
        );

        return;
    }


    const invalidTerm =
        terms.some(
            term =>
                term.startDate >= term.endDate
        );


    if (invalidTerm) {

        alert(
            "Each term must have an end date after its start date."
        );

        return;
    }


    const outsideAcademicYear =
        terms.some(
            term =>
                term.startDate < startDate ||
                term.endDate > endDate
        );


    if (outsideAcademicYear) {

        alert(
            "Term dates must be inside the academic year."
        );

        return;
    }


    const overlappingTerms =
        terms.some(
            (term, index) => {

                if (index === 0) {
                    return false;
                }

                return (
                    term.startDate <
                    terms[index - 1].endDate
                );
            }
        );


    if (overlappingTerms) {

        alert(
            "Terms cannot overlap."
        );

        return;
    }


    const year =
        AcademicYearManager.create({
            name,
            startDate,
            endDate,
            terms
        });


    AppState.currentAcademicYearId =
        year.id;

    AppState.saveContext();

    closeModal();

    renderSettingsView();

    updateAcademicYearBadge(year);
}


// ----------------------------------------
// Select academic year
// ----------------------------------------

function selectAcademicYear(id) {

    const year =
        AcademicYearManager.getById(id);

    if (!year) return;

    AcademicYearManager.setActive(id);

    AppState.currentAcademicYearId =
        id;

    AppState.saveContext();

    renderSettingsView();

    updateAcademicYearBadge(year);
}


// ----------------------------------------
// Delete academic year
// ----------------------------------------

function deleteAcademicYearFromView(id) {

    const year =
        AcademicYearManager.getById(id);

    if (!year) return;


    showConfirmModal(

        "DELETE ACADEMIC YEAR",

        `Delete "${year.name}"?`,

        () => {

            AcademicYearManager.delete(id);


            if (
                AppState.currentAcademicYearId === id
            ) {

                AppState.currentAcademicYearId =
                    null;

                AppState.saveContext();

            }


            renderSettingsView();

            updateAcademicYearBadge(
                AppState.getCurrentAcademicYear()
            );

        }

    );

}