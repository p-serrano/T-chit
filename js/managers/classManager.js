// ----------------------------------------
// T-CHIT — classManager.js
// ----------------------------------------

const ClassManager = {

    // ------------------------------------
    // CLASS TYPES
    // ------------------------------------

    TYPES: {
        CLASS: "class",
        ACTIVITY: "activity"
    },


    // ------------------------------------
    // AVAILABLE CLASS COLORS
    // ------------------------------------

    COLORS: [
        "#7C5B96", // purple
        "#C27E99", // pink
        "#C6AA5B", // ochre
        "#5B8B89", // teal
        "#96705B", // brown
        "#6C7197", // blue-violet
        "#AB7E5B", // warm brown
        "#75916C", // green
        "#A65F5F", // terracotta red
        "#5F7890", // dusty blue
        "#9A6F8F", // mauve
        "#8C8060", // olive
        "#6F8790"  // slate teal
    ],


    // ------------------------------------
    // Get available colors
    // ------------------------------------

    getAvailableColors(academicYearId) {

        const usedColors =
            this.getByAcademicYear(academicYearId)
                .map(cls => cls.color)
                .filter(Boolean);

        return this.COLORS.filter(
            color =>
                !usedColors.includes(color)
        );
    },


    // ------------------------------------
    // Check color availability
    // ------------------------------------

    isColorAvailable(
        academicYearId,
        color,
        excludeClassId = null
    ) {

        if (!color) {
            return true;
        }

        return !this.getByAcademicYear(
            academicYearId
        ).some(cls =>
            cls.id !== excludeClassId &&
            cls.color === color
        );
    },


    // ------------------------------------
    // Create class
    // ------------------------------------

    create({
        name,
        subject = "English",
        academicYearId,
        curriculumId = null,
        color = null,
        type = "class"
    }) {

        name = String(name || "").trim();

        if (!name) {
            throw new Error(
                "Class name cannot be empty."
            );
        }

        if (!academicYearId) {
            throw new Error(
                "Academic year is required."
            );
        }

        if (
            type !== this.TYPES.CLASS &&
            type !== this.TYPES.ACTIVITY
        ) {
            throw new Error(
                "Invalid class type."
            );
        }

        const exists =
            AppState.data.classes.some(
                cls =>
                    cls.name === name &&
                    cls.academicYearId === academicYearId
            );

        if (exists) {
            throw new Error(
                "This class already exists."
            );
        }


        // --------------------------------
        // COLOR
        // --------------------------------

        if (color) {

            if (
                !this.COLORS.includes(color)
            ) {
                throw new Error(
                    "Invalid class color."
                );
            }

            if (
                !this.isColorAvailable(
                    academicYearId,
                    color
                )
            ) {
                throw new Error(
                    "This color is already being used by another class."
                );
            }

        } else {

            const availableColors =
                this.getAvailableColors(
                    academicYearId
                );

            if (availableColors.length) {
                color = availableColors[0];
            }

        }


        const newClass = {

            id: Utils.createId("class"),

            academicYearId,

            name,

            subject,

            curriculumId,

            color,

            type,

            createdAt:
                new Date().toISOString(),

            updatedAt:
                new Date().toISOString()
        };


        AppState.data.classes.push(
            newClass
        );

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


    // ------------------------------------
    // Get curriculum
    // ------------------------------------

    getCurriculum(classId) {

        const classItem =
            this.getById(classId);

        if (
            !classItem ||
            !classItem.curriculumId
        ) {
            return null;
        }

        return (
            AppState.data.curricula.find(
                curriculum =>
                    curriculum.id ===
                    classItem.curriculumId
            ) || null
        );
    },


    // ------------------------------------
    // Set curriculum
    // ------------------------------------

    setCurriculum(
        classId,
        curriculumId
    ) {

        const classItem =
            this.getById(classId);

        if (!classItem) {
            throw new Error(
                "Class not found."
            );
        }

        const curriculum =
            AppState.data.curricula.find(
                item =>
                    item.id === curriculumId
            );

        if (!curriculum) {
            throw new Error(
                "Curriculum not found."
            );
        }

        classItem.curriculumId =
            curriculumId;

        classItem.updatedAt =
            new Date().toISOString();

        AppState.save();

        return classItem;
    },


    // ------------------------------------
    // Update class
    // ------------------------------------

    update(id, {
        name,
        subject,
        curriculumId,
        color,
        type
    }) {

        const classItem =
            this.getById(id);

        if (!classItem) {
            throw new Error(
                "Class not found."
            );
        }


        // --------------------------------
        // NAME
        // --------------------------------

        if (name !== undefined) {

            const cleanName =
                String(name || "").trim();

            if (!cleanName) {
                throw new Error(
                    "Class name cannot be empty."
                );
            }

            classItem.name =
                cleanName;
        }


        // --------------------------------
        // SUBJECT
        // --------------------------------

        if (subject !== undefined) {

            classItem.subject =
                String(subject || "").trim();
        }


        // --------------------------------
        // CURRICULUM
        // --------------------------------

        if (curriculumId !== undefined) {

            classItem.curriculumId =
                curriculumId || null;
        }


        // --------------------------------
        // TYPE
        // --------------------------------

        if (type !== undefined) {

            if (
                type !== this.TYPES.CLASS &&
                type !== this.TYPES.ACTIVITY
            ) {
                throw new Error(
                    "Invalid class type."
                );
            }

            classItem.type =
                type;
        }


        // --------------------------------
        // COLOR
        // --------------------------------

        if (color !== undefined) {

            if (
                color &&
                !this.COLORS.includes(color)
            ) {
                throw new Error(
                    "Invalid class color."
                );
            }

            if (
                color &&
                !this.isColorAvailable(
                    classItem.academicYearId,
                    color,
                    classItem.id
                )
            ) {
                throw new Error(
                    "This color is already being used by another class."
                );
            }

            classItem.color =
                color || null;
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