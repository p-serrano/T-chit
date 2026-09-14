// =========================================================
// T-CHIT — CLASSES VIEW
// =========================================================

function renderClassesView() {

    const container =
        document.getElementById("appView");

    const academicYear =
        AppState.getCurrentAcademicYear();

    if (!academicYear) {

        container.innerHTML =
            renderNoAcademicYear();

        return;
    }

    const classes =
        ClassManager.getByAcademicYear(
            academicYear.id
        );

    container.innerHTML = `

        <div class="classes-view">

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

                ${
                    classes.length
                        ? `
                            <button
                                class="btn-primary"
                                onclick="openNewClassModal()">
                                + NEW CLASS
                            </button>
                          `
                        : ""
                }

            </div>

            ${
                classes.length
                    ? renderClassesGrid(classes)
                    : renderNoClasses()
            }

        </div>
    `;
}


// ---------------------------------------------------------
// CLASSES GRID
// ---------------------------------------------------------

function renderClassesGrid(classes) {

    return `

        <div class="classes-grid">

            ${classes.map(classItem => {

                const students =
                    EnrollmentManager.getStudentsForClass(
                        classItem.id
                    );

                return `

                    <article class="class-tile">

                        <div class="class-tile-top">

                            <span class="class-subject-tag">
                                ${escapeHTML(
                                    classItem.subject || "English"
                                )}
                            </span>

                            <button
                                class="small-icon-button"
                                onclick="deleteClassFromView('${classItem.id}')"
                                title="Delete class">

                                ×

                            </button>

                        </div>


                        <h3>
                            ${escapeHTML(classItem.name)}
                        </h3>


                        <div class="class-student-count">

                            ${students.length}

                            ${
                                students.length === 1
                                    ? "student"
                                    : "students"
                            }

                        </div>


                        <button
                            class="open-class-button"
                            onclick="openClassView('${classItem.id}')">

                            OPEN CLASS →

                        </button>

                    </article>

                `;

            }).join("")}

        </div>

    `;
}


// ---------------------------------------------------------
// EMPTY STATES
// ---------------------------------------------------------

function renderNoAcademicYear() {

    const container =
        document.getElementById("appView");

    container.innerHTML = `

        <div class="empty-state">

            <div class="empty-state-icon">
                📚
            </div>

            <h3>
                No academic year yet
            </h3>

            <p>
                Create your academic year first.
                Then you can start adding your classes.
            </p>

        </div>

    `;
}


function renderNoClasses() {

    return `

        <div class="empty-state">

            <div class="empty-state-icon">
                🏫
            </div>

            <h3>
                No classes yet
            </h3>

            <p>
                Create your first class
                to start organising your students.
            </p>

            <button
                class="btn-primary"
                onclick="openNewClassModal()">
                + CREATE CLASS
            </button>

        </div>
    `;
}


// ---------------------------------------------------------
// NEW CLASS
// ---------------------------------------------------------

function openNewClassModal() {

    const modal =
        document.getElementById("modalContainer");

    modal.innerHTML = `

        <div class="modal-backdrop"
             onclick="closeModal(event)">

            <div class="modal"
                 onclick="event.stopPropagation()">

                <div class="modal-header">

                    <div>
                        <div class="modal-kicker">
                            NEW CLASS
                        </div>

                        <h3>
                            Create a class
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
                        Class name
                    </label>

                    <input
                        id="newClassName"
                        type="text"
                        placeholder="e.g. 2ESO A"
                        autocomplete="off">


                    <label>
                        Subject
                    </label>

                    <input
                        id="newClassSubject"
                        type="text"
                        value="English"
                        placeholder="e.g. English">


                </div>


                <div class="modal-footer">

                    <button
                        class="btn-secondary"
                        onclick="closeModal()">

                        CANCEL

                    </button>

                    <button
                        class="btn-primary"
                        onclick="createClassFromView()">

                        CREATE CLASS

                    </button>

                </div>

            </div>

        </div>

    `;

    document
        .getElementById("newClassName")
        .focus();

}


function createClassFromView() {

    const name =
        document
            .getElementById("newClassName")
            .value
            .trim();

    const subject =
        document
            .getElementById("newClassSubject")
            .value
            .trim() || "English";


    if (!name) {

        alert("Enter a class name.");

        return;
    }


    const academicYear =
        AppState.getCurrentAcademicYear();


    if (!academicYear) return;


    ClassManager.create({

        name,
        subject,
        academicYearId: academicYear.id

    });


    closeModal();

    renderClassesView();

}


// ---------------------------------------------------------
// DELETE CLASS
// ---------------------------------------------------------

function deleteClassFromView(id) {

    const classItem =
        ClassManager.getById(id);

    if (!classItem) return;


    showConfirmModal(

        "DELETE CLASS",

        `Delete "${classItem.name}"?`,

        () => {

            ClassManager.delete(id);

            renderClassesView();

        }

    );

}


// ---------------------------------------------------------
// OPEN CLASS
// ---------------------------------------------------------

function openClassView(id) {

    AppState.currentClassId = id;

    AppState.saveContext();

    renderSingleClassView(id);

}


// ---------------------------------------------------------
// MODAL
// ---------------------------------------------------------

function closeModal(event) {

    if (
        event &&
        event.target !== event.currentTarget
    ) {
        return;
    }

    document
        .getElementById("modalContainer")
        .innerHTML = "";

}