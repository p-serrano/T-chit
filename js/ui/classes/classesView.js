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

                const isActivity =
                    classItem.type ===
                    ClassManager.TYPES.ACTIVITY;

                const students =
                    isActivity
                        ? []
                        : EnrollmentManager.getStudentsForClass(
                            classItem.id
                        );

                const color =
                    classItem.color ||
                    "var(--purple)";

                return `

                    <article
                        class="class-tile ${
                            isActivity
                                ? "class-tile-activity"
                                : ""
                        }"
                        style="
                            --class-color: ${escapeHTML(color)};
                        ">

                        <div class="class-tile-top">

                            <span class="class-subject-tag">

                                ${
                                    isActivity
                                        ? "CENTRE ACTIVITY"
                                        : escapeHTML(
                                            classItem.subject ||
                                            "English"
                                        )
                                }

                            </span>

                            <button
                                class="small-icon-button"
                                onclick="deleteClassFromView('${classItem.id}')"
                                title="${
                                    isActivity
                                        ? "Delete activity"
                                        : "Delete class"
                                }">

                                ×

                            </button>

                        </div>


                        <h3>
                            ${escapeHTML(classItem.name)}
                        </h3>


                        ${
                            isActivity
                                ? ""
                                : `
                                    <div class="class-student-count">

                                        ${students.length}

                                        ${
                                            students.length === 1
                                                ? "student"
                                                : "students"
                                        }

                                    </div>
                                `
                        }


                        <button
                            class="open-class-button"
                            onclick="openClassView('${classItem.id}')">

                            ${
                                isActivity
                                    ? "OPEN ACTIVITY →"
                                    : "OPEN CLASS →"
                            }

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
// NEW CLASS / ACTIVITY
// ---------------------------------------------------------

function openNewClassModal() {

    const modal =
        document.getElementById("modalContainer");

    const academicYear =
        AppState.getCurrentAcademicYear();

    if (!academicYear) {
        return;
    }

    const availableColors =
        ClassManager.getAvailableColors(
            academicYear.id
        );

    const hasAvailableColors =
        availableColors.length > 0;

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


                    <!-- TYPE -->

                    <label>
                        Type
                    </label>

                    <div class="class-type-selector">

                        <button
                            type="button"
                            id="newClassTypeClass"
                            class="class-type-option active"
                            onclick="selectNewClassType('class')">

                            CLASS

                        </button>

                        <button
                            type="button"
                            id="newClassTypeActivity"
                            class="class-type-option"
                            onclick="selectNewClassType('activity')">

                            CENTRE ACTIVITY

                        </button>

                    </div>


                    <!-- NAME -->

                    <label for="newClassName">
                        Class name
                    </label>

                    <input
                        id="newClassName"
                        type="text"
                        placeholder="e.g. 2ESO A"
                        autocomplete="off">


                    <!-- SUBJECT -->

                    <div id="newClassSubjectGroup">

                        <label for="newClassSubject">
                            Subject
                        </label>

                        <input
                            id="newClassSubject"
                            type="text"
                            value="English"
                            placeholder="e.g. English">

                    </div>


                    <!-- COLOUR -->

                    <label>
                        Colour
                    </label>

                    ${
                        hasAvailableColors
                            ? `
                                <div
                                    class="class-color-selector"
                                    id="newClassColorSelector">

                                    ${
                                        availableColors
                                            .map((color, index) => `
                                                <button
                                                    type="button"
                                                    class="class-color-option ${
                                                        index === 0
                                                            ? "selected"
                                                            : ""
                                                    }"
                                                    data-color="${escapeHTML(color)}"
                                                    style="
                                                        --class-color-option:
                                                            ${escapeHTML(color)};
                                                    "
                                                    onclick="
                                                        selectNewClassColor(
                                                            '${escapeHTML(color)}'
                                                        )
                                                    "
                                                    aria-label="Select colour">
                                                </button>
                                            `)
                                            .join("")
                                    }

                                </div>
                              `
                            : `
                                <div class="class-color-empty">
                                    All class colours are already in use.
                                </div>
                              `
                    }

                    <input
                        id="newClassColor"
                        type="hidden"
                        value="${
                            hasAvailableColors
                                ? escapeHTML(
                                    availableColors[0]
                                )
                                : ""
                        }">


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


// ---------------------------------------------------------
// SELECT TYPE
// ---------------------------------------------------------

function selectNewClassType(type) {

    const classButton =
        document.getElementById(
            "newClassTypeClass"
        );

    const activityButton =
        document.getElementById(
            "newClassTypeActivity"
        );

    const subjectGroup =
        document.getElementById(
            "newClassSubjectGroup"
        );

    const nameInput =
        document.getElementById(
            "newClassName"
        );


    if (!classButton || !activityButton) {
        return;
    }


    const isActivity =
        type === "activity";


    classButton.classList.toggle(
        "active",
        !isActivity
    );

    activityButton.classList.toggle(
        "active",
        isActivity
    );


    if (subjectGroup) {

        subjectGroup.style.display =
            isActivity
                ? "none"
                : "";
    }


    if (nameInput) {

        nameInput.placeholder =
            isActivity
                ? "e.g. Guardia"
                : "e.g. 2ESO A";
    }
}


// ---------------------------------------------------------
// SELECT COLOR
// ---------------------------------------------------------

function selectNewClassColor(color) {

    const input =
        document.getElementById(
            "newClassColor"
        );

    if (!input) {
        return;
    }

    input.value = color;


    document
        .querySelectorAll(
            "#newClassColorSelector .class-color-option"
        )
        .forEach(button => {

            button.classList.toggle(
                "selected",
                button.dataset.color === color
            );

        });
}


// ---------------------------------------------------------
// CREATE CLASS / ACTIVITY
// ---------------------------------------------------------

function createClassFromView() {

    const nameInput =
        document.getElementById(
            "newClassName"
        );

    const subjectInput =
        document.getElementById(
            "newClassSubject"
        );

    const colorInput =
        document.getElementById(
            "newClassColor"
        );

    const name =
        nameInput
            ? nameInput.value.trim()
            : "";

    const subject =
        subjectInput
            ? subjectInput.value.trim() || "English"
            : "English";

    const color =
        colorInput
            ? colorInput.value
            : null;


    const activityButton =
        document.getElementById(
            "newClassTypeActivity"
        );

    const type =
        activityButton &&
        activityButton.classList.contains("active")
            ? ClassManager.TYPES.ACTIVITY
            : ClassManager.TYPES.CLASS;


    if (!name) {

        alert(
            type === ClassManager.TYPES.ACTIVITY
                ? "Enter an activity name."
                : "Enter a class name."
        );

        return;
    }


    const academicYear =
        AppState.getCurrentAcademicYear();

    if (!academicYear) {
        return;
    }


    try {

        ClassManager.create({

            name,

            subject:
                type === ClassManager.TYPES.ACTIVITY
                    ? ""
                    : subject,

            academicYearId:
                academicYear.id,

            color,

            type

        });

    } catch (error) {

        alert(
            error.message ||
            "Could not create this item."
        );

        return;
    }


    closeModal();

    renderClassesView();

}


// ---------------------------------------------------------
// DELETE CLASS / ACTIVITY
// ---------------------------------------------------------

function deleteClassFromView(id) {

    const classItem =
        ClassManager.getById(id);

    if (!classItem) return;


    const isActivity =
        classItem.type ===
        ClassManager.TYPES.ACTIVITY;


    showConfirmModal(

        isActivity
            ? "DELETE ACTIVITY"
            : "DELETE CLASS",

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