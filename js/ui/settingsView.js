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

            <div class="settings-section">

                <div class="view-label">
                    PRIVATE ACCESS
                </div>

                <div class="academic-year-name">
                    Connect this device to your T-chit data
                </div>

                <div class="access-key-row">

                    <input
                        id="tchitAccessKey"
                        type="password"
                        placeholder="Enter access key"
                        autocomplete="off">

                    <button
                        class="btn-primary"
                        onclick="connectTchitDevice()">
                        CONNECT
                    </button>

                </div>

                <div
                    id="tchitAccessStatus"
                    class="page-subtitle">
                    This device is not connected yet.
                </div>

            </div>

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

            ${years.map(year => {

                const terms = Array.isArray(year.terms)
                    ? year.terms
                    : [];

                return `
                    <article class="academic-year-card ${year.id === AppState.currentAcademicYearId ? "active" : ""}">

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
                                        ? `${escapeHTML(year.startDate)} → ${escapeHTML(year.endDate)}`
                                        : "Dates not configured"
                                }
                            </div>

                            ${
                                terms.length
                                    ? `
                                        <div class="academic-year-terms">

                                            ${terms.map(term => `
                                                <div class="academic-year-term">

                                                    <span class="academic-year-term-name">
                                                        ${escapeHTML(term.name)}
                                                    </span>

                                                    <span class="academic-year-term-dates">
                                                        ${
                                                            term.startDate && term.endDate
                                                                ? `${escapeHTML(term.startDate)} → ${escapeHTML(term.endDate)}`
                                                                : "Dates not configured"
                                                        }
                                                    </span>

                                                </div>
                                            `).join("")}

                                        </div>
                                    `
                                    : `
                                        <div class="academic-year-terms-empty">
                                            Terms not configured
                                        </div>
                                    `
                            }

                        </div>


                        <div class="academic-year-card-actions">

                            <button
                                class="btn-secondary"
                                onclick="openEditAcademicYearModal('${year.id}')">
                                EDIT
                            </button>

                            ${
                                year.id === AppState.currentAcademicYearId
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
                `;

            }).join("")}

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


function openEditAcademicYearModal(id) {

    const year =
        AcademicYearManager.getById(id);

    if (!year) {
        return;
    }

    const terms =
        Array.isArray(year.terms)
            ? year.terms
            : [];

    document.getElementById("modalContainer").innerHTML = `

        <div class="modal-backdrop">

            <div class="modal">

                <div class="modal-header">

                    <div>
                        <div class="view-label">
                            ACADEMIC YEAR
                        </div>

                        <h2>
                            Edit academic year
                        </h2>
                    </div>

                    <button
                        class="modal-close"
                        onclick="closeModal()">
                        ×
                    </button>

                </div>


                <div class="modal-body">

                    <label for="editAcademicYearName">
                        Name
                    </label>

                    <input
                        id="editAcademicYearName"
                        type="text"
                        value="${escapeHTML(year.name)}"
                    >


                    <div class="modal-section">

                        <div class="modal-section-title">
                            ACADEMIC YEAR DATES
                        </div>

                        <div class="date-range-row">

                            <input
                                id="editAcademicYearStartDate"
                                type="date"
                                value="${escapeHTML(year.startDate || "")}"
                            >

                            <span>→</span>

                            <input
                                id="editAcademicYearEndDate"
                                type="date"
                                value="${escapeHTML(year.endDate || "")}"
                            >

                        </div>

                    </div>


                    <div class="modal-section">

                        <div class="modal-section-title">
                            TERMS
                        </div>

                        <div class="term-editor">

                            ${[0, 1, 2].map(index => {

                                const term =
                                    terms[index] || {};

                                return `
                                    <div class="term-row">

                                        <div class="term-name">
                                            ${escapeHTML(
                                                term.name ||
                                                `Term ${index + 1}`
                                            )}
                                        </div>

                                        <input
                                            id="editTerm${index + 1}StartDate"
                                            type="date"
                                            value="${escapeHTML(term.startDate || "")}"
                                        >

                                        <span>→</span>

                                        <input
                                            id="editTerm${index + 1}EndDate"
                                            type="date"
                                            value="${escapeHTML(term.endDate || "")}"
                                        >

                                    </div>
                                `;

                            }).join("")}

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
                        onclick="saveAcademicYearEdit('${id}')">
                        SAVE CHANGES
                    </button>

                </div>

            </div>

        </div>
    `;
}


function saveAcademicYearEdit(id) {

    const year =
        AcademicYearManager.getById(id);

    if (!year) {
        return;
    }


    const name =
        document
            .getElementById("editAcademicYearName")
            .value
            .trim();

    const startDate =
        document
            .getElementById("editAcademicYearStartDate")
            .value;

    const endDate =
        document
            .getElementById("editAcademicYearEndDate")
            .value;


    if (!name) {
        alert("Academic year name is required.");
        return;
    }


    if (!startDate || !endDate) {
        alert("Academic year dates are required.");
        return;
    }


    if (startDate >= endDate) {
        alert("Academic year start date must be before the end date.");
        return;
    }


    const terms = [0, 1, 2].map(index => {

        const existingTerm =
            year.terms?.[index] || {};

        return {
            id:
                existingTerm.id ||
                Utils.createId("term"),

            name:
                existingTerm.name ||
                `Term ${index + 1}`,

            startDate:
                document
                    .getElementById(
                        `editTerm${index + 1}StartDate`
                    )
                    .value,

            endDate:
                document
                    .getElementById(
                        `editTerm${index + 1}EndDate`
                    )
                    .value
        };
    });


    const incompleteTerm =
        terms.some(term =>
            !term.startDate ||
            !term.endDate
        );

    if (incompleteTerm) {
        alert("All term dates are required.");
        return;
    }


    const invalidTerm =
        terms.some(term =>
            term.startDate >= term.endDate
        );

    if (invalidTerm) {
        alert("Each term must start before it ends.");
        return;
    }


    const outsideAcademicYear =
        terms.some(term =>
            term.startDate < startDate ||
            term.endDate > endDate
        );

    if (outsideAcademicYear) {
        alert(
            "All terms must be inside the academic year."
        );
        return;
    }


    const overlappingTerms =
        terms.some((term, index) => {

            if (index === 0) {
                return false;
            }

            return (
                term.startDate <
                terms[index - 1].endDate
            );
        });

    if (overlappingTerms) {
        alert("Terms cannot overlap.");
        return;
    }


    AcademicYearManager.update(
        id,
        {
            name,
            startDate,
            endDate,
            terms
        }
    );


    closeModal();

    renderSettingsView();

    updateAcademicYearBadge();
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

// ----------------------------------------
// connect T-chit device
// ----------------------------------------

async function connectTchitDevice() {

    const input =
        document.getElementById("tchitAccessKey");

    const status =
        document.getElementById("tchitAccessStatus");

    const key =
        input.value.trim();


    if (!key) {

        status.textContent =
            "Enter your access key.";

        return;
    }


    status.textContent =
        "Connecting...";


    setTchitAccessKey(key);


    const remote =
        await SupabaseSync.load();


    if (!remote || !remote.data) {

        status.textContent =
            "Unable to connect. Check your access key.";

        return;
    }


    AppState.data =
        remote.data;


    Storage.save(
        AppState.data
    );


    const academicYears =
        AppState.data.academicYears || [];


    if (
        !AppState.currentAcademicYearId &&
        academicYears.length === 1
    ) {

        AppState.currentAcademicYearId =
            academicYears[0].id;

        AppState.saveContext();
    }


    status.textContent =
        "Connected successfully.";


    renderSettingsView();


    updateAcademicYearBadge(
        AppState.getCurrentAcademicYear()
    );


    console.log(
        "T-chit: device connected to remote data."
    );
}