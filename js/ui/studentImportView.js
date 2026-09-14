let pendingStudentImport = [];


// =========================================================
// T-CHIT — STUDENT IMPORT VIEW
// =========================================================

function openStudentImport() {

    const modal =
        document.getElementById(
            "modalContainer"
        );

    pendingStudentImport = [];

    modal.innerHTML = `

        <div
            class="modal-backdrop"
            onclick="closeModal(event)">

            <div
                class="modal import-modal"
                onclick="event.stopPropagation()">

                <div class="modal-header">

                    <div>

                        <div class="modal-kicker">
                            STUDENT IMPORT
                        </div>

                        <h3>
                            Import students
                        </h3>

                    </div>

                    <button
                        class="modal-close"
                        onclick="closeModal()">
                        ×
                    </button>

                </div>


                <div class="modal-body">

                    <div
                        class="file-drop-zone"
                        id="studentDropZone">

                        <div class="drop-icon">
                            📄
                        </div>

                        <h4>
                            Drop your file here
                        </h4>

                        <p>
                            or choose a file from your computer
                        </p>

                        <input
                            type="file"
                            id="studentFileInput"
                            accept=".xlsx,.xls,.csv,.pdf">

                        <label
                            for="studentFileInput"
                            class="btn-secondary">

                            CHOOSE FILE

                        </label>

                        <div class="supported-files">
                            XLSX · XLS · CSV · PDF
                        </div>

                    </div>


                    <div
                        id="importPreview"
                        class="import-preview hidden">
                    </div>

                </div>


                <div class="modal-footer">

                    <button
                        class="btn-secondary"
                        onclick="closeModal()">

                        CANCEL

                    </button>

                    <button
                        id="confirmImportButton"
                        class="btn-primary"
                        disabled
                        onclick="confirmStudentImport()">

                        IMPORT STUDENTS

                    </button>

                </div>

            </div>

        </div>
    `;

    setupStudentImportInput();

    setupStudentDropZone();

}


// =========================================================
// FILE INPUT
// =========================================================

function setupStudentImportInput() {

    const input =
        document.getElementById(
            "studentFileInput"
        );

    if (!input) return;

    input.addEventListener(
        "change",
        event => {

            const file =
                event.target.files[0];

            if (!file) return;

            handleStudentFile(file);

        }
    );
}


// =========================================================
// DRAG & DROP
// =========================================================

function setupStudentDropZone() {

    const dropZone =
        document.getElementById(
            "studentDropZone"
        );

    if (!dropZone) return;


    [
        "dragenter",
        "dragover",
        "dragleave",
        "drop"
    ].forEach(eventName => {

        dropZone.addEventListener(
            eventName,
            event => {

                event.preventDefault();
                event.stopPropagation();

            }
        );

    });


    [
        "dragenter",
        "dragover"
    ].forEach(eventName => {

        dropZone.addEventListener(
            eventName,
            () => {

                dropZone.classList.add(
                    "drag-active"
                );

            }
        );

    });


    [
        "dragleave",
        "drop"
    ].forEach(eventName => {

        dropZone.addEventListener(
            eventName,
            () => {

                dropZone.classList.remove(
                    "drag-active"
                );

            }
        );

    });


    dropZone.addEventListener(
        "drop",
        event => {

            const files =
                event.dataTransfer.files;

            if (
                !files ||
                !files.length
            ) {
                return;
            }

            handleStudentFile(
                files[0]
            );

        }
    );

}


// =========================================================
// FILE HANDLER
// =========================================================

async function handleStudentFile(file) {

    console.log(
        "📄 Student file selected:",
        file.name
    );


    const preview =
        document.getElementById(
            "importPreview"
        );

    const button =
        document.getElementById(
            "confirmImportButton"
        );


    if (!preview || !button) {
        return;
    }


    pendingStudentImport = [];

    button.disabled = true;

    preview.classList.remove(
        "hidden"
    );


    const extension =
        file.name
            .split(".")
            .pop()
            .toLowerCase();


    const supported = [
        "pdf",
        "xlsx",
        "xls",
        "csv"
    ];


    if (!supported.includes(extension)) {

        preview.innerHTML = `

            <div class="import-status">

                ❌ Unsupported file type.

            </div>

        `;

        return;
    }


    preview.innerHTML = `

        <div class="import-file">

            <span>📄</span>

            <strong>
                ${escapeHTML(file.name)}
            </strong>

        </div>

        <div class="import-status">

            Reading file...

        </div>

    `;


    // =====================================================
    // ANALYSE FILE
    // =====================================================

    try {

        const result =
            await StudentImporter.analyse(
                file
            );


        console.log(
            "📋 Import analysis result:",
            result
        );


        // ---------------------------------------------
        // No names detected
        // ---------------------------------------------

        if (
            !result.names ||
            !result.names.length
        ) {

            preview.innerHTML = `

                <div class="import-file">

                    <span>📄</span>

                    <strong>
                        ${escapeHTML(
                            file.name
                        )}
                    </strong>

                </div>

                <div class="import-status">

                    No student names could be
                    detected in this file.

                    <br><br>

                    Make sure the PDF contains
                    selectable text.

                </div>

            `;

            return;
        }


        // ---------------------------------------------
        // Names detected
        // ---------------------------------------------

        pendingStudentImport =
            result.names.map(
                item =>
                    item.fullName
            );


        renderStudentImportPreview(
            file,
            result
        );


    } catch (error) {

        console.error(
            "❌ Student import analysis failed:",
            error
        );


        preview.innerHTML = `

            <div class="import-file">

                <span>📄</span>

                <strong>
                    ${escapeHTML(file.name)}
                </strong>

            </div>

            <div class="import-status">

                ❌ Could not analyse this file.

                <br><br>

                ${escapeHTML(
                    error.message ||
                    "Unknown error."
                )}

            </div>

        `;

    }

}


// =========================================================
// IMPORT PREVIEW
// =========================================================

function renderStudentImportPreview(
    file,
    result
) {

    const preview =
        document.getElementById(
            "importPreview"
        );

    const button =
        document.getElementById(
            "confirmImportButton"
        );


    if (!preview || !button) {
        return;
    }


    const names =
        result.names || [];


    preview.innerHTML = `

        <div class="import-file">

            <span>📄</span>

            <strong>
                ${escapeHTML(
                    file.name
                )}
            </strong>

        </div>


        <div class="import-result-summary">

            <strong>
                ${names.length}
            </strong>

            possible student
            ${names.length === 1
                ? "name"
                : "names"}
            detected

        </div>


        <div class="import-name-list">

            ${names.map(
                (item, index) => `

                    <label
                        class="import-name-row">

                        <input
                            type="checkbox"
                            class="import-student-checkbox"
                            data-index="${index}"
                            checked>

                        <span>
                            ${escapeHTML(
                                item.fullName
                            )}
                        </span>

                    </label>

                `
            ).join("")}

        </div>


        <div class="import-status">

            Check the names before importing.

        </div>

    `;


    button.disabled = false;


    preview
        .querySelectorAll(
            ".import-student-checkbox"
        )
        .forEach(
            checkbox => {

                checkbox.addEventListener(
                    "change",
                    updateImportButton
                );

            }
        );


    updateImportButton();

}


// =========================================================
// UPDATE IMPORT BUTTON
// =========================================================

function updateImportButton() {

    const button =
        document.getElementById(
            "confirmImportButton"
        );

    if (!button) return;


    const selected =
        document.querySelectorAll(
            ".import-student-checkbox:checked"
        );


    button.disabled =
        selected.length === 0;

}


// =========================================================
// CONFIRM IMPORT
// =========================================================

function confirmStudentImport() {

    const selected =
        Array.from(
            document.querySelectorAll(
                ".import-student-checkbox:checked"
            )
        );


    if (!selected.length) {
        return;
    }


    const names =
        selected.map(
            checkbox => {

                const index =
                    Number(
                        checkbox.dataset.index
                    );

                return pendingStudentImport[
                    index
                ];

            }
        );


    const classId =
        AppState.currentClassId;

    const academicYearId =
        AppState.currentAcademicYearId;


    if (
        !classId ||
        !academicYearId
    ) {

        alert(
            "No class or academic year selected."
        );

        return;
    }


    try {

        const imported =
            StudentImporter.importStudents(
                names,
                classId,
                academicYearId
            );


        console.log(
            "👥 Students imported:",
            imported
        );


        closeModal();


        renderSingleClassView(
            classId
        );


        alert(
            `${imported.length} student${
                imported.length === 1
                    ? ""
                    : "s"
            } imported successfully.`
        );


    } catch (error) {

        console.error(
            "❌ Student import failed:",
            error
        );


        alert(
            error.message
        );

    }

}