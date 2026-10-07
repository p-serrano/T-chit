// =========================================================
// T-CHIT — NOTES VIEW
// =========================================================


function renderNotesView() {

	const container =
		document.getElementById(
			"appView"
		);


	if (!container) {

		console.error(
			"T-chit: #appView not found."
		);

		return;

	}


	const academicYear =
		AppState.getCurrentAcademicYear();


	if (!academicYear) {

		container.innerHTML = `

			<div class="empty-state">

				<div class="empty-state-icon">
					✎
				</div>

				<h3>
					NO ACADEMIC YEAR
				</h3>

				<p>
					Create or select an academic year
					to start using Notes.
				</p>

			</div>

		`;

		return;

	}


	const notes =
		NoteManager.getByAcademicYear(
			academicYear.id
		);


	container.innerHTML = `

		<div class="notes-view">

			<div class="notes-header">

				<div>

					<div class="view-label">
						NOTES
					</div>

					<h2 class="section-title">
						Your teaching notes
					</h2>

					<p class="section-description">
						Keep ideas, tasks and reminders
						connected to your teaching.
					</p>

				</div>


				<button
					type="button"
					class="btn-primary"
					id="addNoteButton">

					+ ADD NOTE

				</button>

			</div>


			<div class="notes-filters">

				<button
					type="button"
					class="notes-filter active"
					data-note-filter="all">

					ALL

				</button>


				<button
					type="button"
					class="notes-filter"
					data-note-filter="note">

					NOTES

				</button>


				<button
					type="button"
					class="notes-filter"
					data-note-filter="todo">

					TO-DO

				</button>


				<button
					type="button"
					class="notes-filter"
					data-note-filter="reminder">

					REMINDERS

				</button>

			</div>


			<div
				class="notes-content"
				id="notesContent">

				${
					notes.length
						? renderNotesList(
							notes
						)
						: renderNotesEmptyState()
				}

			</div>

		</div>

	`;


	setupNotesView();

}


function filterNotes(
	filter
) {

	const academicYear =
		AppState.getCurrentAcademicYear();


	if (!academicYear) {
		return;
	}


	const allNotes =
		NoteManager.getByAcademicYear(
			academicYear.id
		);


	const filteredNotes =
		filter === "all"
			? allNotes
			: allNotes.filter(
				note =>
					note.type === filter
			);


	const content =
		document.getElementById(
			"notesContent"
		);


	if (!content) {
		return;
	}


	content.innerHTML =
		filteredNotes.length
			? renderNotesList(
				filteredNotes
			)
			: renderNotesEmptyState();

}


// =========================================================
// EMPTY STATE
// =========================================================


function renderNotesEmptyState() {

	return `

		<div class="empty-state">

			<div class="empty-state-icon">
				✎
			</div>

			<h3>
				NO NOTES YET
			</h3>

			<p>
				Create your first note,
				task or reminder.
			</p>

		</div>

	`;

}


// =========================================================
// NOTES LIST
// =========================================================


function renderNotesList(
	notes
) {

	return `

		<div class="notes-list">

			${notes
				.map(
					note =>
						renderNoteCard(
							note
						)
				)
				.join("")}

		</div>

	`;

}


// =========================================================
// NOTE CARD
// =========================================================


function renderNoteCard(
	note
) {

	const typeLabel =
		{
			note: "NOTE",
			todo: "TODO",
			reminder: "REMINDER"
		}[note.type] ||
		"NOTE";


	const completedClass =
		note.isCompleted
			? " completed"
			: "";


	const contextParts = [];


	if (note.classId) {

		const classItem =
			ClassManager.getById(
				note.classId
			);


		if (classItem) {

			contextParts.push(
				escapeHTML(
					classItem.name ||
					classItem.title ||
					"Class"
				)
			);

		}

	}


	if (note.studentId) {

		const student =
			StudentManager.getById(
				note.studentId
			);


		if (student) {

			const firstName =
				student.firstName ||
				"";


			const lastName =
				student.lastName ||
				"";


			const studentName =
				lastName &&
				firstName
					? `${lastName}, ${firstName}`
					: lastName ||
						firstName ||
						student.name ||
						"Student";


			contextParts.push(
				escapeHTML(
					studentName
				)
			);

		}

	}


	if (note.lessonId) {

		contextParts.push(
			"LESSON"
		);

	}


	if (note.activityId) {

		contextParts.push(
			"ACTIVITY"
		);

	}


	if (note.calendarEventId) {

		contextParts.push(
			"CALENDAR"
		);

	}


	let reminderHTML = "";


	if (note.notify) {

		let reminderText =
			"REMINDER";


		if (note.notifyAt) {

			const reminderDate =
				new Date(
					note.notifyAt
				);


			if (
				!Number.isNaN(
					reminderDate.getTime()
				)
			) {

				reminderText =
					`REMINDER · ${
						reminderDate.toLocaleString(
							"en-GB",
							{
								dateStyle:
									"short",
								timeStyle:
									"short"
							}
						)
					}`;

			}

		}


		reminderHTML = `

			<span>
				🔔 ${escapeHTML(
					reminderText
				)}
			</span>

		`;

	}


	const completionHTML =
		note.type !== "note"
			? `

				<label class="note-completion">

					<input
						type="checkbox"
						class="note-completion-checkbox"
						data-note-id="${note.id}"
						${note.isCompleted
							? "checked"
							: ""}>

					<span>
						${
							note.isCompleted
								? "COMPLETED"
								: "MARK AS DONE"
						}
					</span>

				</label>

			`
			: "";


	return `

        <article
            class="note-card${completedClass}"
            data-note-type="${note.type}">


			<div class="note-card-header">

				<div class="note-type">
					${typeLabel}
				</div>


				${
					note.isCompleted
						? `
							<div class="note-status">
								COMPLETED
							</div>
						`
						: ""
				}

			</div>


			${
				note.title
					? `
						<h3 class="note-card-title">
							${escapeHTML(
								note.title
							)}
						</h3>
					`
					: ""
			}


			${
				note.text
					? `
						<p class="note-card-text">
							${escapeHTML(
								note.text
							)}
						</p>
					`
					: ""
			}


			${
				contextParts.length
					? `
						<div class="note-card-context">

							${contextParts
								.map(
									context =>
										`<span>${context}</span>`
								)
								.join("")}

						</div>
					`
					: ""
			}


			<div class="note-card-meta">

				${
					note.date
						? `
							<span>
								📅 ${escapeHTML(
									note.date
								)}
							</span>
						`
						: ""
				}


				${reminderHTML}

			</div>


			${completionHTML}


            <div class="note-card-actions">

                <button
                    type="button"
                    class="note-edit-button"
                    onclick="openAddNoteModal('${note.id}')">
                    EDIT
                </button>

                <button
                    type="button"
                    class="note-delete-button"
                    onclick="deleteNote('${note.id}')">
                    DELETE
                </button>

            </div>

		</article>

	`;

}


// =========================================================
// SETUP
// =========================================================


function setupNotesView() {

	const button =
		document.getElementById(
			"addNoteButton"
		);


	if (!button) {
		return;
	}


	button.addEventListener(
		"click",
		() => {

			openAddNoteModal();

		}
	);


	// =====================================================
	// NOTE FILTERS
	// =====================================================

	const filterButtons =
		document.querySelectorAll(
			".notes-filter"
		);


	filterButtons.forEach(
		button => {

			button.addEventListener(
				"click",
				() => {

					const filter =
						button.dataset.noteFilter;


					filterNotes(
						filter
					);


					filterButtons.forEach(
						item => {

							item.classList.remove(
								"active"
							);

						}
					);


					button.classList.add(
						"active"
					);

				}
			);

		}
	);


	const completionCheckboxes =
		document.querySelectorAll(
			".note-completion-checkbox"
		);


	completionCheckboxes.forEach(
		checkbox => {

			checkbox.addEventListener(
				"change",
				() => {

					const noteId =
						checkbox.dataset.noteId;


					if (!noteId) {
						return;
					}


					NoteManager.update(
						noteId,
						{
							isCompleted:
								checkbox.checked
						}
					);


					renderNotesView();

				}
			);

		}
	);

}


//=========================================================
// DELETE NOTE
//=========================================================


function deleteNote(noteId) {

	const note =
		NoteManager.getById(noteId);

	if (!note) {
		return;
	}


	const confirmed =
		confirm(
			`Delete "${note.title}"?`
		);

	if (!confirmed) {
		return;
	}


	NoteManager.delete(noteId);

	renderNotesView();

}