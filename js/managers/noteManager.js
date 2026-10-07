// =========================================================
// T-CHIT — NOTE MANAGER
// =========================================================


const NoteManager = {

	// -----------------------------------------------------
	// CREATE
	// -----------------------------------------------------

	create({
		academicYearId,
		type = "note",
		title = "",
		text = "",
		date = null,
		classId = null,
		studentId = null,
		lessonId = null,
		activityId = null,
		calendarEventId = null,
		notify = false,
		notifyAt = null,
		isCompleted = false
	}) {

		if (!academicYearId) {

			throw new Error(
				"Academic year is required."
			);

		}


		const validTypes = [
			"note",
			"todo",
			"reminder"
		];


		if (
			!validTypes.includes(type)
		) {

			throw new Error(
				"Invalid note type."
			);

		}


		const cleanTitle =
			String(
				title || ""
			).trim();


		const cleanText =
			String(
				text || ""
			).trim();


		if (
			!cleanTitle &&
			!cleanText
		) {

			throw new Error(
				"Note cannot be empty."
			);

		}


		const now =
			new Date().toISOString();


		const note = {

			id:
				Utils.createId(
					"note"
				),

			academicYearId,

			type,

			title:
				cleanTitle,

			text:
				cleanText,

			date:
				date || null,

			classId:
				classId || null,

			studentId:
				studentId || null,

			lessonId:
				lessonId || null,

			activityId:
				activityId || null,

			calendarEventId:
				calendarEventId || null,

			notify:
				notify === true,

			notifyAt:
				notifyAt || null,

			isCompleted:
				isCompleted === true,

			createdAt:
				now,

			updatedAt:
				now

		};


		AppState.data.notes.push(
			note
		);


		AppState.save();


		return note;

	},


	// -----------------------------------------------------
	// GET BY ID
	// -----------------------------------------------------

	getById(id) {

		return (
			AppState.data.notes.find(
				note =>
					note.id === id
			)
			|| null
		);

	},


	// -----------------------------------------------------
	// GET ALL
	// -----------------------------------------------------

	getAll() {

		return (
			AppState.data.notes
			|| []
		);

	},


	// -----------------------------------------------------
	// GET BY ACADEMIC YEAR
	// -----------------------------------------------------

	getByAcademicYear(
		academicYearId
	) {

		return this.getAll()
			.filter(
				note =>
					note.academicYearId ===
					academicYearId
			);

	},


	// -----------------------------------------------------
	// GET BY DATE
	// -----------------------------------------------------

	getByDate(
		academicYearId,
		date
	) {

		return this.getByAcademicYear(
			academicYearId
		)
		.filter(
			note =>
				note.date === date
		);

	},


	// -----------------------------------------------------
	// GET BY CLASS
	// -----------------------------------------------------

	getByClass(
		classId
	) {

		return this.getAll()
			.filter(
				note =>
					note.classId === classId
			);

	},


	// -----------------------------------------------------
	// GET BY STUDENT
	// -----------------------------------------------------

	getByStudent(
		studentId
	) {

		return this.getAll()
			.filter(
				note =>
					note.studentId === studentId
			);

	},


	// -----------------------------------------------------
	// GET BY LESSON
	// -----------------------------------------------------

	getByLesson(
		lessonId
	) {

		return this.getAll()
			.filter(
				note =>
					note.lessonId === lessonId
			);

	},


	// -----------------------------------------------------
	// GET BY ACTIVITY
	// -----------------------------------------------------

	getByActivity(
		activityId
	) {

		return this.getAll()
			.filter(
				note =>
					note.activityId === activityId
			);

	},


	// -----------------------------------------------------
	// GET BY CALENDAR EVENT
	// -----------------------------------------------------

	getByCalendarEvent(
		calendarEventId
	) {

		return this.getAll()
			.filter(
				note =>
					note.calendarEventId ===
					calendarEventId
			);

	},


	// -----------------------------------------------------
	// UPDATE
	// -----------------------------------------------------

	update(
		id,
		data
	) {

		const note =
			this.getById(id);


		if (!note) {

			throw new Error(
				"Note not found."
			);

		}


		const validTypes = [
			"note",
			"todo",
			"reminder"
		];


		if (
			data.type !== undefined
		) {

			if (
				!validTypes.includes(
					data.type
				)
			) {

				throw new Error(
					"Invalid note type."
				);

			}


			note.type =
				data.type;

		}


		if (
			data.title !== undefined
		) {

			note.title =
				String(
					data.title || ""
				).trim();

		}


		if (
			data.text !== undefined
		) {

			note.text =
				String(
					data.text || ""
				).trim();

		}


		if (
			data.date !== undefined
		) {

			note.date =
				data.date || null;

		}


		if (
			data.classId !== undefined
		) {

			note.classId =
				data.classId || null;

		}


		if (
			data.studentId !== undefined
		) {

			note.studentId =
				data.studentId || null;

		}


		if (
			data.lessonId !== undefined
		) {

			note.lessonId =
				data.lessonId || null;

		}


		if (
			data.activityId !== undefined
		) {

			note.activityId =
				data.activityId || null;

		}


		if (
			data.calendarEventId !== undefined
		) {

			note.calendarEventId =
				data.calendarEventId || null;

		}


		if (
			data.notify !== undefined
		) {

			note.notify =
				data.notify === true;

		}


		if (
			data.notifyAt !== undefined
		) {

			note.notifyAt =
				data.notifyAt || null;

		}


		if (
			data.isCompleted !== undefined
		) {

			note.isCompleted =
				data.isCompleted === true;

		}


		if (
			!note.title &&
			!note.text
		) {

			throw new Error(
				"Note cannot be empty."
			);

		}


		note.updatedAt =
			new Date().toISOString();


		AppState.save();


		return note;

	},


	// -----------------------------------------------------
	// DELETE
	// -----------------------------------------------------

	delete(id) {

		const exists =
			this.getById(id);


		if (!exists) {
			return;
		}


		AppState.data.notes =
			this.getAll()
				.filter(
					note =>
						note.id !== id
				);


		AppState.save();

	}

};
