// ----------------------------------------
// T-CHIT — classManager.js
// ----------------------------------------

const ClassManager = {

    // ------------------------------------
    // Create class
    // ------------------------------------

    create({
        name,
        subject = "English",
        academicYearId,
        curriculumId = null
    }) {
        name = String(name || "").trim();

        if (!name) {
            throw new Error("Class name cannot be empty.");
        }

        if (!academicYearId) {
            throw new Error("Academic year is required.");
        }

        const exists =
            AppState.data.classes.some(
                cls =>
                    cls.name === name &&
                    cls.academicYearId === academicYearId
            );

        if (exists) {
            throw new Error("This class already exists.");
        }

        const newClass = {
            id: Utils.createId("class"),
            academicYearId,
            name,
            subject,
            curriculumId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        AppState.data.classes.push(newClass);
        AppState.save();

        return newClass;
    },


    // ------------------------------------
    // Get by ID
    // ------------------------------------

    getById(id) {

        return AppState.data.classes.find(
            cls =>
                cls.id === id
        ) || null;
    },


    // ------------------------------------
    // Get classes for academic year
    // ------------------------------------

    getByAcademicYear(
            academicYearId
        ) {

            return AppState.data.classes.filter(
                cls =>
                    cls.academicYearId ===
                    academicYearId
            );
        },


    getCurriculum(classId) {

        const classItem = this.getById(classId);

        if (!classItem || !classItem.curriculumId) {
            return null;
        }

        return (
            AppState.data.curricula.find(
                curriculum =>
                    curriculum.id === classItem.curriculumId
            ) || null
        );
    },

    setCurriculum(classId, curriculumId) {

        const classItem = this.getById(classId);

        if (!classItem) {
            throw new Error("Class not found.");
        }

        const curriculum =
            AppState.data.curricula.find(
                item => item.id === curriculumId
            );

        if (!curriculum) {
            throw new Error("Curriculum not found.");
        }

        classItem.curriculumId = curriculumId;
        classItem.updatedAt = new Date().toISOString();

        AppState.save();

        return classItem;
    },

    // ------------------------------------
    // Update class
    // ------------------------------------
    update(id, {
        name,
        subject,
        curriculumId
    }) {
        const classItem = this.getById(id);

        if (!classItem) {
            throw new Error("Class not found.");
        }

        if (name !== undefined) {
            const cleanName =
                String(name || "").trim();

            if (!cleanName) {
                throw new Error(
                    "Class name cannot be empty."
                );
            }

            classItem.name = cleanName;
        }

        if (subject !== undefined) {
            classItem.subject =
                String(subject || "").trim();
        }

        if (curriculumId !== undefined) {
            classItem.curriculumId =
                curriculumId || null;
        }

        classItem.updatedAt =
            new Date().toISOString();

        AppState.save();

        return classItem;
    },


    // ------------------------------------
    // Delete
    // ------------------------------------

    delete(id) {

        AppState.data.classes =
            AppState.data.classes.filter(
                cls =>
                    cls.id !== id
            );

        if (
            AppState.currentClassId === id
        ) {

            AppState.currentClassId =
                null;

            AppState.saveContext();
        }

        AppState.save();
    }

};