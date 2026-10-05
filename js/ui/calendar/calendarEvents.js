// ----------------------------------------
// T-CHIT — CALENDAR EVENTS
// ----------------------------------------
function renderCalendarEventsTab() {
	const academicYear =
		AppState.getCurrentAcademicYear();
	if (!academicYear) {
		return `
			<div class="settings-section">
				<div class="view-label">
					CALENDAR
				</div>
				<div class="page-subtitle">
					Select an academic year to manage calendar events.
				</div>
			</div>
		`;
	}
	const events =
		CalendarManager
			.getByAcademicYearId(
				academicYear.id
			)
			.sort(
				(a, b) =>
					a.date.localeCompare(
						b.date
					)
			);
	return `
		<div class="calendar-events-section">
			<div class="view-toolbar">
				<div>
					<div class="view-label">
						CALENDAR
					</div>
					<div class="academic-year-name">
						${escapeHTML(
							academicYear.name
						)}
					</div>
				</div>
				<button
					class="btn-primary"
					onclick="openNewCalendarEventModal()">
					+ NEW EVENT
				</button>
			</div>
			${
				events.length
					? renderCalendarEvents(events)
					: `
						<div class="empty-state calendar-empty-state">
							<div class="empty-state-icon">
								📅
							</div>
							<h3>
								No calendar events yet
							</h3>
							<p>
								Add holidays, exams, trips, meetings and other school events.
							</p>
							<button
								class="btn-primary"
								onclick="openNewCalendarEventModal()">
								+ ADD EVENT
							</button>
						</div>
					`
			}
		</div>
	`;
}
// ----------------------------------------
// Calendar events list
// ----------------------------------------
function renderCalendarEvents(events) {
	return `
		<div class="calendar-events-list">
			${events.map(event => `
				<article class="calendar-event-card">
					<div class="calendar-event-date">
						<div class="calendar-event-date-day">
							${escapeHTML(
								event.date
							)}
						</div>
						<div class="calendar-event-type">
							${escapeHTML(
								event.type
							)}
						</div>
					</div>
					<div class="calendar-event-info">
						<div class="calendar-event-title">
							${
								escapeHTML(
									event.title ||
									"Untitled event"
								)
							}
						</div>
						${
							event.description
								? `
									<div class="calendar-event-description">
										${escapeHTML(
											event.description
										)}
									</div>
								`
								: ""
						}
					</div>
					<div class="calendar-event-actions">
						<button
							class="btn-secondary"
							onclick="openEditCalendarEventModal('${event.id}')">
							EDIT
						</button>
						<button
							class="small-icon-button"
							onclick="deleteCalendarEventFromView('${event.id}')"
							title="Delete event">
							×
						</button>
					</div>
				</article>
			`).join("")}
		</div>
	`;
}
// ----------------------------------------
// New calendar event modal
// ----------------------------------------
function openNewCalendarEventModal() {
	const academicYear =
		AppState.getCurrentAcademicYear();
	if (!academicYear) {
		return;
	}
	document.getElementById(
		"modalContainer"
	).innerHTML = `
		<div
			class="modal-backdrop"
			onclick="closeModal(event)">
			<div
				class="modal"
				onclick="event.stopPropagation()">
				<div class="modal-header">
					<div>
						<div class="modal-kicker">
							CALENDAR
						</div>
						<h3>
							New calendar event
						</h3>
					</div>
					<button
						class="modal-close"
						onclick="closeModal()">
						×
					</button>
				</div>
				<div class="modal-body">
					<label for="calendarEventDate">
						Date
					</label>
					<input
						id="calendarEventDate"
						type="date">
					<label for="calendarEventType">
						Type
					</label>
					<select
						id="calendarEventType">
						<option value="holiday">
							Holiday
						</option>
						<option value="non_school_day">
							Non-school day
						</option>
						<option value="exam">
							Exam
						</option>
						<option value="trip">
							Trip / excursion
						</option>
						<option value="meeting">
							Meeting
						</option>
						<option value="event">
							School event
						</option>
						<option value="other">
							Other
						</option>
					</select>
					<label for="calendarEventTitle">
						Title
					</label>
					<input
						id="calendarEventTitle"
						type="text"
						placeholder="Event title">
					<label for="calendarEventDescription">
						Description
					</label>
					<textarea
						id="calendarEventDescription"
						rows="3"
						placeholder="Optional description"
					></textarea>
				</div>
				<div class="modal-footer">
					<button
						class="btn-secondary"
						onclick="closeModal()">
						CANCEL
					</button>
					<button
						class="btn-primary"
						onclick="saveNewCalendarEvent()">
						CREATE EVENT
					</button>
				</div>
			</div>
		</div>
	`;
}
// ----------------------------------------
// Save new calendar event
// ----------------------------------------
function saveNewCalendarEvent() {
	const academicYear =
		AppState.getCurrentAcademicYear();
	if (!academicYear) {
		return;
	}
	const date =
		document
			.getElementById(
				"calendarEventDate"
			)
			.value;
	const type =
		document
			.getElementById(
				"calendarEventType"
			)
			.value;
	const title =
		document
			.getElementById(
				"calendarEventTitle"
			)
			.value
			.trim();
	const description =
		document
			.getElementById(
				"calendarEventDescription"
			)
			.value
			.trim();
	if (!date) {
		alert(
			"Event date is required."
		);
		return;
	}
	if (!title) {
		alert(
			"Event title is required."
		);
		return;
	}
	CalendarManager.create({
		academicYearId:
			academicYear.id,
		date,
		type,
		title,
		description,
		allDay: true
	});
	closeModal();
	renderCalendarView();
}
// ----------------------------------------
// Edit calendar event modal
// ----------------------------------------
function openEditCalendarEventModal(id) {
	const event =
		CalendarManager.getById(id);
	if (!event) {
		return;
	}
	document.getElementById(
		"modalContainer"
	).innerHTML = `
		<div
			class="modal-backdrop"
			onclick="closeModal(event)">
			<div
				class="modal"
				onclick="event.stopPropagation()">
				<div class="modal-header">
					<div>
						<div class="modal-kicker">
							CALENDAR
						</div>
						<h3>
							Edit calendar event
						</h3>
					</div>
					<button
						class="modal-close"
						onclick="closeModal()">
						×
					</button>
				</div>
				<div class="modal-body">
					<label for="editCalendarEventDate">
						Date
					</label>
					<input
						id="editCalendarEventDate"
						type="date"
						value="${escapeHTML(
							event.date || ""
						)}">
					<label for="editCalendarEventType">
						Type
					</label>
					<select
						id="editCalendarEventType">
						${[
							[
								"holiday",
								"Holiday"
							],
							[
								"non_school_day",
								"Non-school day"
							],
							[
								"exam",
								"Exam"
							],
							[
								"trip",
								"Trip / excursion"
							],
							[
								"meeting",
								"Meeting"
							],
							[
								"event",
								"School event"
							],
							[
								"other",
								"Other"
							]
						].map(
							([value, label]) => `
								<option
									value="${value}"
									${
										event.type ===
										value
											? "selected"
											: ""
									}>
									${label}
								</option>
							`
						).join("")}
					</select>
					<label for="editCalendarEventTitle">
						Title
					</label>
					<input
						id="editCalendarEventTitle"
						type="text"
						value="${escapeHTML(
							event.title || ""
						)}">
					<label for="editCalendarEventDescription">
						Description
					</label>
					<textarea
						id="editCalendarEventDescription"
						rows="3"
					>${escapeHTML(
						event.description || ""
					)}</textarea>
				</div>
				<div class="modal-footer">
					<button
						class="btn btn-danger"
						onclick="deleteCalendarEventFromView('${id}')">
						DELETE
					</button>
					<div class="modal-footer-actions">
						<button
							class="btn btn-secondary"
							onclick="closeModal()">
							CANCEL
						</button>
						<button
							class="btn btn-primary"
							onclick="saveCalendarEventEdit('${id}')">
							SAVE
						</button>
					</div>
				</div>
			</div>
		</div>
	`;
}
// ----------------------------------------
// Save calendar event edit
// ----------------------------------------
function saveCalendarEventEdit(id) {
	const date =
		document
			.getElementById(
				"editCalendarEventDate"
			)
			.value;
	const type =
		document
			.getElementById(
				"editCalendarEventType"
			)
			.value;
	const title =
		document
			.getElementById(
				"editCalendarEventTitle"
			)
			.value
			.trim();
	const description =
		document
			.getElementById(
				"editCalendarEventDescription"
			)
			.value
			.trim();
	if (!date) {
		alert(
			"Event date is required."
		);
		return;
	}
	if (!title) {
		alert(
			"Event title is required."
		);
		return;
	}
	CalendarManager.update(
		id,
		{
			date,
			type,
			title,
			description,
			allDay: true
		}
	);
	closeModal();
	renderCalendarView();
}
// ----------------------------------------
// Delete calendar event
// ----------------------------------------
function deleteCalendarEventFromView(id) {
	const event =
		CalendarManager.getById(id);
	if (!event) {
		return;
	}
	const confirmed =
		confirm(
			`Delete "${event.title}"?`
		);
	if (!confirmed) {
		return;
	}
	CalendarManager.delete(id);
	renderCalendarView();
}