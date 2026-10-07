// =========================================================
// T-CHIT — NOTE MODALS
// =========================================================


// ---------------------------------------------------------
// ADD / EDIT NOTE MODAL
// ---------------------------------------------------------

function openAddNoteModal(noteId = null) {

	const academicYear =
		AppState.getCurrentAcademicYear();

	if (!academicYear) {
		alert("No academic year selected.");
		return;
	}


	const classes =
		ClassManager.getByAcademicYear(
			academicYear.id
		);

	const students =
		StudentManager.getAll();


	const note =
		noteId
			? NoteManager.getById(noteId)
			: null;


	if (noteId && !note) {
		alert("Note not found.");
		return;
	}


	const isEditing =
		Boolean(note);


	const modalContainer =
		document.getElementById("modalContainer");

	if (!modalContainer) {
		return;
	}


	modalContainer.innerHTML = `

		<div class="modal-overlay">

			<div class="modal note-modal">

				<div class="modal-header">

					<div>

						<div class="modal-label">
							NOTES
						</div>

						<h2 class="modal-title">
							${isEditing
								? "Edit note"
								: "Add note"}
						</h2>

					</div>

					<button
						type="button"
						class="modal-close"
						id="closeNoteModal">
						×
					</button>

				</div>


				<div class="modal-body">


					<div class="form-group">

						<label for="noteType">
							TYPE
						</label>

						<select id="noteType">

							<option
								value="note"
								${note?.type === "note" ? "selected" : ""}>
								Note
							</option>

							<option
								value="todo"
								${note?.type === "todo" ? "selected" : ""}>
								To-do
							</option>

							<option
								value="reminder"
								${note?.type === "reminder" ? "selected" : ""}>
								Reminder
							</option>

						</select>

					</div>


					<div class="form-group">

						<label for="noteTitle">
							TITLE
						</label>

						<input
							type="text"
							id="noteTitle"
							value="${escapeHTML(note?.title || "")}"
							placeholder="What do you need to remember?">

					</div>


					<div class="form-group">

						<label for="noteText">
							NOTE
						</label>

						<textarea
							id="noteText"
							rows="5"
							placeholder="Write your note here...">${escapeHTML(note?.text || "")}</textarea>

					</div>


					<div class="form-group">

						<label for="noteDate">
							DATE
						</label>

						<input
							type="date"
							id="noteDate"
							value="${note?.date || ""}">

					</div>


					<div class="form-group">

						<label for="noteClass">
							CLASS
						</label>

						<select id="noteClass">

							<option value="">
								No class
							</option>

							${classes.map(
								classItem => `
									<option
										value="${classItem.id}"
										${note?.classId === classItem.id
											? "selected"
											: ""}>
										${escapeHTML(classItem.name)}
									</option>
								`
							).join("")}

						</select>

					</div>


					<div class="form-group">

						<label for="noteStudent">
							STUDENT
						</label>

						<select id="noteStudent">

							<option value="">
								No student
							</option>

							${students.map(
								student => `
									<option
										value="${student.id}"
										${note?.studentId === student.id
											? "selected"
											: ""}>
										${escapeHTML(
											[
												student.surname,
												student.name
											]
												.filter(Boolean)
												.join(", ")
										)}
									</option>
								`
							).join("")}

						</select>

					</div>


					<div class="form-group">

						<label class="checkbox-label">

							<input
								type="checkbox"
								id="noteNotify"
								${note?.notify ? "checked" : ""}>

							<span>
								Set reminder
							</span>

						</label>

					</div>


					<div
						class="form-group"
						id="noteNotifyFields"
						style="${note?.notify ? "" : "display:none;"}">

						<label for="noteNotifyAt">
							REMINDER DATE
						</label>

						<input
							type="datetime-local"
							id="noteNotifyAt"
							value="${note?.notifyAt || ""}">

					</div>


				</div>


				<div class="modal-footer">

					<button
						type="button"
						class="button-secondary"
						id="cancelNoteModal">
						CANCEL
					</button>

					<button
						type="button"
						class="button-primary"
						id="saveNoteButton">
						${isEditing
							? "SAVE CHANGES"
							: "SAVE NOTE"}
					</button>

				</div>

			</div>

		</div>
	`;


	const closeButton =
		document.getElementById("closeNoteModal");

	const cancelButton =
		document.getElementById("cancelNoteModal");

	const notifyCheckbox =
		document.getElementById("noteNotify");

	const notifyFields =
		document.getElementById("noteNotifyFields");

	const saveButton =
		document.getElementById("saveNoteButton");


	function closeNoteModal() {

		modalContainer.innerHTML = "";

	}


	closeButton.addEventListener(
		"click",
		closeNoteModal
	);


	cancelButton.addEventListener(
		"click",
		closeNoteModal
	);


	notifyCheckbox.addEventListener(
		"change",
		() => {

			notifyFields.style.display =
				notifyCheckbox.checked
					? ""
					: "none";

		}
	);


	saveButton.addEventListener(
		"click",
		() => {

			if (isEditing) {

				updateNoteFromModal(note.id);

			} else {

				createNoteFromModal();

			}

		}
	);


	document
		.getElementById("noteTitle")
		.focus();

}


// ---------------------------------------------------------
// CREATE NOTE
// ---------------------------------------------------------

function createNoteFromModal() {

	const academicYear =
		AppState.getCurrentAcademicYear();

	if (!academicYear) {
		return;
	}


	const type =
		document.getElementById("noteType").value;

	const title =
		document.getElementById("noteTitle").value.trim();

	const text =
		document.getElementById("noteText").value.trim();

	const date =
		document.getElementById("noteDate").value || null;

	const classId =
		document.getElementById("noteClass").value || null;

	const studentId =
		document.getElementById("noteStudent").value || null;

	const notify =
		document.getElementById("noteNotify").checked;

	const notifyAt =
		notify
			? document.getElementById("noteNotifyAt").value || null
			: null;


	if (!title || !text) {

		alert("Please enter a title and note.");

		return;

	}


	NoteManager.create({

		academicYearId:
			academicYear.id,

		type,

		title,

		text,

		date,

		classId,

		studentId,

		notify,

		notifyAt,

		isCompleted: false

	});


	closeModal();

	renderNotesView();

}


// ---------------------------------------------------------
// UPDATE NOTE
// ---------------------------------------------------------

function updateNoteFromModal(noteId) {

	const note =
		NoteManager.getById(noteId);

	if (!note) {
		alert("Note not found.");
		return;
	}


	const type =
		document.getElementById("noteType").value;

	const title =
		document.getElementById("noteTitle").value.trim();

	const text =
		document.getElementById("noteText").value.trim();

	const date =
		document.getElementById("noteDate").value || null;

	const classId =
		document.getElementById("noteClass").value || null;

	const studentId =
		document.getElementById("noteStudent").value || null;

	const notify =
		document.getElementById("noteNotify").checked;

	const notifyAt =
		notify
			? document.getElementById("noteNotifyAt").value || null
			: null;


	if (!title || !text) {

		alert("Please enter a title and note.");

		return;

	}


	NoteManager.update(

		noteId,

		{

			type,

			title,

			text,

			date,

			classId,

			studentId,

			notify,

			notifyAt

		}

	);


	closeModal();

	renderNotesView();

}