// =========================================================
// T-CHIT — CLASS DETAIL VIEW
// =========================================================

function renderSingleClassView(classId) {

    const container =
        document.getElementById("appView");


    const classItem =
        ClassManager.getById(classId);


    if (!classItem) {

        renderClassesView();

        return;
    }


    const students =
        EnrollmentManager.getStudentsForClass(
            classId
        );


    const academicYear =
        AppState.getCurrentAcademicYear();


    container.innerHTML = `

        <div class="class-detail">


            <!-- BACK -->

            <button
                class="back-button"
                onclick="renderClassesView()">

                ← CLASSES

            </button>


            <!-- HEADER -->

            <div class="class-detail-header">

                <div>

                    <div class="class-detail-kicker">
                        ${escapeHTML(
                            academicYear?.name || ""
                        )}
                    </div>

                    <h2>
                        ${escapeHTML(classItem.name)}
                    </h2>

                    <p>
                        ${escapeHTML(
                            classItem.subject || "English"
                        )}
                    </p>

                </div>


                <div class="class-detail-actions">

                    <button
                        class="btn-secondary"
                        onclick="openStudentImport()">

                        ↓ IMPORT

                    </button>

                    <button
                        class="btn-primary"
                        onclick="openAddStudentModal()">

                        + ADD STUDENT

                    </button>

                </div>

            </div>


            <!-- STUDENTS -->

            <div class="student-section">

                <div class="section-header">

                    <h3 class="section-title">
                        Students
                    </h3>

                    <span class="student-total">
                        ${students.length}
                    </span>

                </div>


                ${
                    students.length
                        ? renderStudentTable(students)
                        : renderNoStudents()
                }

            </div>

        </div>

    `;
}


// ---------------------------------------------------------
// STUDENT TABLE
// ---------------------------------------------------------

function renderStudentTable(students) {

    return `

        <div class="student-table">

            <div class="student-row student-header">

                <span class="student-select">

                    <input
                        type="checkbox"
                        id="selectAllStudents"
                        onchange="toggleAllStudents(this.checked)">

                </span>

                <span>#</span>

                <span>Student</span>

                <span></span>

            </div>


            ${students.map((student, index) => `

                <div
                    class="student-row"
                    data-student-id="${student.id}">

                    <span class="student-select">

                        <input
                            type="checkbox"
                            class="student-checkbox"
                            value="${student.id}"
                            onchange="updateStudentSelection()">

                    </span>

                    <span class="student-number">
                        ${index + 1}
                    </span>

                    <span class="student-name">
                        ${escapeHTML(
                            student.firstName +
                            " " +
                            student.lastName
                        )}
                    </span>

                    <button
                        class="student-edit"
                        onclick="editStudent('${student.id}')">

                        ✎

                    </button>

                </div>

            `).join("")}

        </div>


        <div
            id="studentSelectionBar"
            class="student-selection-bar hidden">

            <span id="studentSelectionCount">
                0 selected
            </span>

            <button
                class="btn-danger"
                onclick="removeSelectedStudents()">

                REMOVE SELECTED

            </button>

        </div>

    `;
}


// ---------------------------------------------------------
// STUDENT SELECTION
// ---------------------------------------------------------

function updateStudentSelection() {

    const checkboxes =
        Array.from(
            document.querySelectorAll(
                ".student-checkbox"
            )
        );

    const selected =
        checkboxes.filter(
            checkbox =>
                checkbox.checked
        );

    const selectionBar =
        document.getElementById(
            "studentSelectionBar"
        );

    const selectionCount =
        document.getElementById(
            "studentSelectionCount"
        );

    const selectAll =
        document.getElementById(
            "selectAllStudents"
        );


    if (!selectionBar || !selectionCount) {
        return;
    }


    const count =
        selected.length;


    // ---------------------------------------------
    // Selection bar
    // ---------------------------------------------

    selectionBar.classList.toggle(
        "hidden",
        count === 0
    );


    selectionCount.textContent =
        `${count} selected`;


    // ---------------------------------------------
    // Select-all checkbox
    // ---------------------------------------------

    if (selectAll) {

        selectAll.checked =
            count > 0 &&
            count === checkboxes.length;

        selectAll.indeterminate =
            count > 0 &&
            count < checkboxes.length;

    }

}


// ---------------------------------------------------------
// SELECT / DESELECT ALL
// ---------------------------------------------------------

function toggleAllStudents(checked) {

    document
        .querySelectorAll(
            ".student-checkbox"
        )
        .forEach(
            checkbox => {
                checkbox.checked =
                    checked;
            }
        );


    updateStudentSelection();

}


// ---------------------------------------------------------
// REMOVE SELECTED STUDENTS
// ---------------------------------------------------------

function removeSelectedStudents() {

    const selected =
        Array.from(
            document.querySelectorAll(
                ".student-checkbox:checked"
            )
        );


    if (!selected.length) {
        return;
    }


    const studentIds =
        selected.map(
            checkbox =>
                checkbox.value
        );


    const count =
        studentIds.length;


    showConfirmModal(

        "REMOVE STUDENTS",

        `Remove ${count} student${
            count === 1
                ? ""
                : "s"
        } from this class?\n\n` +
        `The student record will be kept in T-chit.`,

        () => {

            const classId =
                AppState.currentClassId;


            if (!classId) {

                console.error(
                    "No current class selected."
                );

                return;
            }


            // ---------------------------------------------
            // Remove the enrollment, NOT the student
            // ---------------------------------------------

            studentIds.forEach(
                studentId => {

                    const enrollment =
                        EnrollmentManager.getForStudentInClass(
                            studentId,
                            classId
                        );


                    if (enrollment) {

                        EnrollmentManager.remove(
                            enrollment.id
                        );

                    }

                }
            );


            // ---------------------------------------------
            // Refresh class view
            // ---------------------------------------------

            renderSingleClassView(
                classId
            );

        }

    );

}


// ---------------------------------------------------------
// EMPTY
// ---------------------------------------------------------

function renderNoStudents() {

    return `

        <div class="empty-state">

            <div class="empty-state-icon">
                👩‍🎓
            </div>

            <h3>
                No students yet
            </h3>

            <p>
                Add students manually or import
                a class list from Excel or PDF.
            </p>

        </div>

    `;
}


// ---------------------------------------------------------
// ADD STUDENT
// ---------------------------------------------------------

function openAddStudentModal() {

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
                            NEW STUDENT
                        </div>

                        <h3>
                            Add student
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
                        First name
                    </label>

                    <input
                        id="studentFirstName"
                        type="text"
                        autocomplete="off">


                    <label>
                        Last name
                    </label>

                    <input
                        id="studentLastName"
                        type="text"
                        autocomplete="off">

                </div>


                <div class="modal-footer">

                    <button
                        class="btn-secondary"
                        onclick="closeModal()">

                        CANCEL

                    </button>

                    <button
                        class="btn-primary"
                        onclick="createStudentFromView()">

                        ADD STUDENT

                    </button>

                </div>

            </div>

        </div>

    `;


    document
        .getElementById("studentFirstName")
        .focus();

}


// ---------------------------------------------------------
// CREATE STUDENT
// ---------------------------------------------------------

function createStudentFromView() {

    const firstName =
        document
            .getElementById("studentFirstName")
            .value
            .trim();

    const lastName =
        document
            .getElementById("studentLastName")
            .value
            .trim();

    if (!firstName || !lastName) {

        alert(
            "Please enter the student's name."
        );

        return;
    }

    const classId =
        AppState.currentClassId;

    const academicYearId =
        AppState.currentAcademicYearId;

    if (!classId || !academicYearId) {

        alert(
            "No class or academic year selected."
        );

        return;
    }

    // -------------------------------
    // 1. Create the student
    // -------------------------------

    const student =
        StudentManager.create({
            firstName,
            lastName
        });

    // -------------------------------
    // 2. Enrol the student in the class
    // -------------------------------

    EnrollmentManager.create({
        studentId: student.id,
        classId,
        academicYearId
    });

    closeModal();

    renderSingleClassView(classId);
}


// ---------------------------------------------------------
// EDIT STUDENT
// ---------------------------------------------------------

function editStudent(studentId) {

    const student =
        StudentManager.getById(
            studentId
        );

    if (!student) {

        console.error(
            "Student not found:",
            studentId
        );

        return;
    }

    const classId =
        AppState.currentClassId;

    if (!classId) {

        console.error(
            "No current class selected."
        );

        return;
    }

    const modal =
        document.getElementById(
            "modalContainer"
        );

    modal.innerHTML = `

        <div class="modal-backdrop"
             onclick="closeModal(event)">

            <div class="modal"
                 onclick="event.stopPropagation()">

                <div class="modal-header">

                    <div>

                        <div class="modal-kicker">
                            STUDENT
                        </div>

                        <h3>
                            Edit student
                        </h3>

                    </div>

                    <button
                        class="modal-close"
                        onclick="closeModal()">

                        ×

                    </button>

                </div>


                <div class="modal-body">

                    <label
                        for="editStudentFirstName">

                        First name

                    </label>

                    <input
                        id="editStudentFirstName"
                        type="text"
                        value="${escapeHTML(
                            student.firstName
                        )}"
                        autocomplete="off">


                    <label
                        for="editStudentLastName">

                        Last name

                    </label>

                    <input
                        id="editStudentLastName"
                        type="text"
                        value="${escapeHTML(
                            student.lastName
                        )}"
                        autocomplete="off">

                </div>


                <div class="modal-footer">

                    <button
                        class="btn-secondary"
                        onclick="closeModal()">

                        CANCEL

                    </button>

                    <button
                        class="btn-primary"
                        onclick="saveStudentEdit(
                            '${student.id}',
                            '${classId}'
                        )">

                        SAVE CHANGES

                    </button>

                </div>

            </div>

        </div>

    `;


    document
        .getElementById(
            "editStudentFirstName"
        )
        .focus();

}

// ---------------------------------------------------------
// SAVE STUDENT EDIT
// ---------------------------------------------------------

function saveStudentEdit(
    studentId,
    classId
) {

    const firstNameInput =
        document.getElementById(
            "editStudentFirstName"
        );

    const lastNameInput =
        document.getElementById(
            "editStudentLastName"
        );

    if (
        !firstNameInput ||
        !lastNameInput
    ) {
        return;
    }

    const firstName =
        firstNameInput.value.trim();

    const lastName =
        lastNameInput.value.trim();

    if (!firstName || !lastName) {

        alert(
            "Please enter the student's first and last name."
        );

        return;
    }

    const student =
        StudentManager.getById(
            studentId
        );

    if (!student) {

        alert(
            "Student could not be found."
        );

        return;
    }

    student.firstName =
        firstName;

    student.lastName =
        lastName;

    AppState.save();

    closeModal();

    renderSingleClassView(
        classId
    );
}