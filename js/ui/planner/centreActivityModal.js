// =========================================================
// T-CHIT — CENTRE ACTIVITY MODAL
// =========================================================


// ---------------------------------------------------------
// OPEN ACTIVITY NOTE MODAL
// ---------------------------------------------------------

function openCentreActivityModal(
    timetableEntryId,
    date
) {

    const timetableEntry =
        TimetableManager.getById(
            timetableEntryId
        );

    if (!timetableEntry) {
        return;
    }


    const classItem =
        ClassManager.getById(
            timetableEntry.classId
        );

    if (!classItem) {
        return;
    }


    const existingNote =
        ActivityNoteManager
            .getByTimetableEntryAndDate(
                timetableEntryId,
                date
            );


    const note =
        existingNote?.note || "";


    const modalContainer =
        document.getElementById(
            "modalContainer"
        );

    if (!modalContainer) {
        return;
    }


    modalContainer.innerHTML = `

        <div class="modal-backdrop">

            <div class="modal centre-activity-modal">

                <div class="modal-header">

                    <div>

                        <h3>
                            ${escapeHTML(classItem.name)}
                        </h3>

                        <p>
                            ${date}
                            ·
                            ${timetableEntry.startTime}
                            –
                            ${timetableEntry.endTime}
                        </p>

                    </div>

                    <button
                        type="button"
                        class="modal-close"
                        onclick="closeCentreActivityModal()"
                        aria-label="Close">
                        ×
                    </button>

                </div>


                <div class="modal-body">

                    <label
                        for="centreActivityNote">
                        Note
                    </label>

                    <textarea
                        id="centreActivityNote"
                        rows="6"
                        placeholder="Add a note for this activity..."
                    >${escapeHTML(note)}</textarea>

                </div>


                <div class="modal-footer">

                    ${
                        existingNote
                            ? `
                                <button
                                    type="button"
                                    class="btn btn-secondary"
                                    onclick="
                                        deleteCentreActivityNote(
                                            '${existingNote.id}'
                                        )
                                    ">
                                    DELETE NOTE
                                </button>
                            `
                            : ""
                    }

                    <button
                        type="button"
                        class="btn btn-secondary"
                        onclick="closeCentreActivityModal()">
                        CANCEL
                    </button>

                    <button
                        type="button"
                        class="btn btn-primary"
                        onclick="
                            saveCentreActivityNote(
                                '${timetableEntryId}',
                                '${date}'
                            )
                        ">
                        SAVE NOTE
                    </button>

                </div>

            </div>

        </div>
    `;
}


// ---------------------------------------------------------
// CLOSE
// ---------------------------------------------------------

function closeCentreActivityModal() {

    const modalContainer =
        document.getElementById(
            "modalContainer"
        );

    if (!modalContainer) {
        return;
    }

    modalContainer.innerHTML = "";
}


// ---------------------------------------------------------
// SAVE
// ---------------------------------------------------------

function saveCentreActivityNote(
    timetableEntryId,
    date
) {

    const textarea =
        document.getElementById(
            "centreActivityNote"
        );

    if (!textarea) {
        return;
    }


    const timetableEntry =
        TimetableManager.getById(
            timetableEntryId
        );

    if (!timetableEntry) {
        return;
    }


    const classItem =
        ClassManager.getById(
            timetableEntry.classId
        );

    if (!classItem) {
        return;
    }


    const academicYear =
        AppState.getCurrentAcademicYear();

    if (!academicYear) {
        return;
    }


    ActivityNoteManager.create({

        academicYearId:
            academicYear.id,

        timetableEntryId,

        classId:
            classItem.id,

        date,

        note:
            textarea.value

    });


    closeCentreActivityModal();


    renderPlannerView();
}


// ---------------------------------------------------------
// DELETE
// ---------------------------------------------------------

function deleteCentreActivityNote(
    noteId
) {

    if (!confirm(
        "Delete this note?"
    )) {
        return;
    }


    ActivityNoteManager.delete(
        noteId
    );


    closeCentreActivityModal();


    renderPlannerView();
}