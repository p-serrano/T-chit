// ----------------------------------------
// T-CHIT — CURRICULUM MANAGER
// ----------------------------------------

const CurriculumManager = {

    BASE_PATH: "data/curriculum/",
    MANIFEST_FILE: "curricula.json",

    loaded: false,

    // ----------------------------------------
    // LOAD CURRICULUM DATA
    // ----------------------------------------

    async load() {

        try {

            const manifestResponse =
                await fetch(
                    `${this.BASE_PATH}${this.MANIFEST_FILE}`
                );

            if (!manifestResponse.ok) {
                throw new Error(
                    `Unable to load curriculum manifest: ${manifestResponse.status}`
                );
            }

            const manifest =
                await manifestResponse.json();

            if (!Array.isArray(manifest)) {
                throw new Error(
                    "Curriculum manifest must be an array."
                );
            }

            const curricula = [];

            for (const entry of manifest) {

                if (!entry.id || !entry.file) {
                    console.warn(
                        "Skipping invalid curriculum entry:",
                        entry
                    );
                    continue;
                }

                const response =
                    await fetch(
                        `${this.BASE_PATH}${entry.file}`
                    );

                if (!response.ok) {
                    throw new Error(
                        `Unable to load curriculum "${entry.file}": ${response.status}`
                    );
                }

                const curriculum =
                    await response.json();

                this.validate(curriculum);

                curricula.push(curriculum);
            }

            AppState.data.curricula =
                curricula;

            AppState.save();

            this.loaded = true;

            console.log(
                `T-chit Curriculum: loaded ${curricula.length} curricula.`
            );

            return curricula;

        } catch (error) {

            console.error(
                "T-chit Curriculum: failed to load curriculum data.",
                error
            );

            this.loaded = false;

            return [];
        }
    },

    // ----------------------------------------
    // VALIDATION
    // ----------------------------------------

    validate(curriculum) {

        if (!curriculum.id) {
            throw new Error(
                "Curriculum is missing an id."
            );
        }

        if (!Array.isArray(
            curriculum.specificCompetences
        )) {
            throw new Error(
                `Curriculum "${curriculum.id}" is missing specificCompetences.`
            );
        }

        if (!Array.isArray(
            curriculum.basicKnowledge
        )) {
            throw new Error(
                `Curriculum "${curriculum.id}" is missing basicKnowledge.`
            );
        }

        curriculum.specificCompetences.forEach(
            specificCompetence => {

                if (!specificCompetence.id) {
                    throw new Error(
                        `Curriculum "${curriculum.id}" contains a Specific Competence without an id.`
                    );
                }

                if (!Array.isArray(
                    specificCompetence.criteria
                )) {
                    throw new Error(
                        `Specific Competence "${specificCompetence.id}" is missing criteria.`
                    );
                }

            }
        );

        return true;
    },

    // ----------------------------------------
    // GET ALL
    // ----------------------------------------

    getAll() {

        return AppState.data.curricula || [];

    },

    // ----------------------------------------
    // GET BY ID
    // ----------------------------------------

    getById(id) {

        return this.getAll().find(
            curriculum =>
                curriculum.id === id
        ) || null;

    },

    // ----------------------------------------
    // GET CURRICULUM FOR CLASS
    // ----------------------------------------

    getForClass(classId) {

        const classItem =
            ClassManager.getById(classId);

        if (
            !classItem ||
            !classItem.curriculumId
        ) {
            return null;
        }

        return this.getById(
            classItem.curriculumId
        );

    },

    // ----------------------------------------
    // SPECIFIC COMPETENCES
    // ----------------------------------------

    getSpecificCompetences(
        curriculumId
    ) {

        const curriculum =
            this.getById(curriculumId);

        if (!curriculum) {
            return [];
        }

        return curriculum
            .specificCompetences || [];

    },

    // ----------------------------------------
    // EVALUATION CRITERIA
    // ----------------------------------------
    //
    // Criteria remain linked to their
    // Specific Competence.
    //
    // We add contextual information to each
    // returned criterion so the UI does not
    // have to search for its parent.
    // ----------------------------------------

    getCriteria(curriculumId) {

        const curriculum =
            this.getById(curriculumId);

        if (!curriculum) {
            return [];
        }

        return (
            curriculum.specificCompetences || []
        ).flatMap(
            specificCompetence => {

                return (
                    specificCompetence.criteria || []
                ).map(
                    criterion => ({

                        ...criterion,

                        specificCompetenceId:
                            specificCompetence.id,

                        specificCompetenceCode:
                            specificCompetence.code,

                        specificCompetenceTitle:
                            specificCompetence.title

                    })
                );

            }
        );

    },

    // ----------------------------------------
    // CRITERIA FOR A SPECIFIC COMPETENCE
    // ----------------------------------------

    getCriteriaForSpecificCompetence(
        curriculumId,
        specificCompetenceId
    ) {

        const specificCompetences =
            this.getSpecificCompetences(
                curriculumId
            );

        const specificCompetence =
            specificCompetences.find(
                item =>
                    item.id ===
                    specificCompetenceId
            );

        if (!specificCompetence) {
            return [];
        }

        return specificCompetence.criteria || [];

    },

    // ----------------------------------------
    // BASIC KNOWLEDGE
    // ----------------------------------------

    getBasicKnowledge(
        curriculumId
    ) {

        const curriculum =
            this.getById(curriculumId);

        if (!curriculum) {
            return [];
        }

        return curriculum.basicKnowledge || [];

    },

    // ----------------------------------------
    // OPERATIONAL DESCRIPTORS
    // ----------------------------------------
    //
    // These will later allow T-chit to derive
    // Key Competences automatically from the
    // selected Evaluation Criteria.
    //
    // We deliberately DO NOT invent descriptors
    // if the curriculum data does not contain
    // them.
    // ----------------------------------------

    getOperationalDescriptors(
        curriculumId
    ) {

        const criteria =
            this.getCriteria(curriculumId);

        const descriptors = [];

        criteria.forEach(criterion => {

            if (
                !Array.isArray(
                    criterion.operationalDescriptors
                )
            ) {
                return;
            }

            criterion.operationalDescriptors
                .forEach(descriptor => {

                    if (
                        descriptor &&
                        !descriptors.includes(
                            descriptor
                        )
                    ) {
                        descriptors.push(
                            descriptor
                        );
                    }

                });

        });

        return descriptors;

    }

};