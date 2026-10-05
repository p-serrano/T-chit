// =========================================================
// T-CHIT — GRADEBOOK MANAGER
// =========================================================


const GradebookManager = {

    // -----------------------------------------------------
    // GET CONFIG
    // -----------------------------------------------------

    getConfig(
        academicYearId,
        classId,
        termId
    ) {

        return AppState
            .data
            .gradebookConfigs
            .find(
                config =>
                    config.academicYearId ===
                        academicYearId &&

                    config.classId ===
                        classId &&

                    config.termId ===
                        termId
            ) || null;

    },


    // -----------------------------------------------------
    // CREATE CONFIG
    // -----------------------------------------------------

    createConfig({
        academicYearId,
        classId,
        termId
    }) {

        if (!academicYearId) {
            throw new Error(
                "Academic year is required."
            );
        }


        if (!classId) {
            throw new Error(
                "Class is required."
            );
        }


        if (!termId) {
            throw new Error(
                "Term is required."
            );
        }


        const existing =
            this.getConfig(
                academicYearId,
                classId,
                termId
            );


        if (existing) {
            return existing;
        }


        const now =
            new Date().toISOString();


        const config = {

            id:
                Utils.createId(
                    "gradebook"
                ),

            academicYearId,

            classId,

            termId,

            competenceWeights: [],

            createdAt:
                now,

            updatedAt:
                now

        };


        AppState
            .data
            .gradebookConfigs
            .push(config);


        AppState.save();


        return config;

    },


    // -----------------------------------------------------
    // GET OR CREATE CONFIG
    // -----------------------------------------------------

    getOrCreateConfig(
        academicYearId,
        classId,
        termId
    ) {

        const existing =
            this.getConfig(
                academicYearId,
                classId,
                termId
            );


        if (existing) {
            return existing;
        }


        return this.createConfig({
            academicYearId,
            classId,
            termId
        });

    },


    // -----------------------------------------------------
    // GET WEIGHT
    // -----------------------------------------------------

    getWeight(
        academicYearId,
        classId,
        termId,
        specificCompetenceId,
        assessmentActivityId
    ) {

        const config =
            this.getConfig(
                academicYearId,
                classId,
                termId
            );


        if (!config) {
            return null;
        }


        const competence =
            config.competenceWeights.find(
                item =>
                    item.specificCompetenceId ===
                    specificCompetenceId
            );


        if (!competence) {
            return null;
        }


        const activity =
            competence.activities.find(
                item =>
                    item.assessmentActivityId ===
                    assessmentActivityId
            );


        if (!activity) {
            return null;
        }


        return activity.weight;

    },


    // -----------------------------------------------------
    // SET WEIGHT
    // -----------------------------------------------------

    setWeight(
        academicYearId,
        classId,
        termId,
        specificCompetenceId,
        assessmentActivityId,
        weight
    ) {

        const config =
            this.getOrCreateConfig(
                academicYearId,
                classId,
                termId
            );


        const normalizedWeight =
            Number(weight);


        if (
            !Number.isFinite(
                normalizedWeight
            )
        ) {

            throw new Error(
                "Weight must be a number."
            );

        }


        if (
            normalizedWeight < 0 ||
            normalizedWeight > 100
        ) {

            throw new Error(
                "Weight must be between 0 and 100."
            );

        }


        // ---------------------------------------------
        // Find competence
        // ---------------------------------------------

        let competence =
            config.competenceWeights.find(
                item =>
                    item.specificCompetenceId ===
                    specificCompetenceId
            );


        if (!competence) {

            competence = {

                specificCompetenceId,

                activities: []

            };


            config.competenceWeights.push(
                competence
            );

        }


        // ---------------------------------------------
        // Find activity
        // ---------------------------------------------

        const existing =
            competence.activities.find(
                item =>
                    item.assessmentActivityId ===
                    assessmentActivityId
            );


        if (existing) {

            existing.weight =
                normalizedWeight;

        }
        else {

            competence.activities.push({

                assessmentActivityId,

                weight:
                    normalizedWeight

            });

        }


        config.updatedAt =
            new Date().toISOString();


        AppState.save();


        return config;

    },


    // -----------------------------------------------------
    // REMOVE WEIGHT
    // -----------------------------------------------------

    removeWeight(
        academicYearId,
        classId,
        termId,
        specificCompetenceId,
        assessmentActivityId
    ) {

        const config =
            this.getConfig(
                academicYearId,
                classId,
                termId
            );


        if (!config) {
            return null;
        }


        const competence =
            config.competenceWeights.find(
                item =>
                    item.specificCompetenceId ===
                    specificCompetenceId
            );


        if (!competence) {
            return config;
        }


        competence.activities =
            competence.activities.filter(
                item =>
                    item.assessmentActivityId !==
                    assessmentActivityId
            );


        // Remove empty competence entries.

        config.competenceWeights =
            config.competenceWeights.filter(
                item =>
                    item.activities.length > 0
            );


        config.updatedAt =
            new Date().toISOString();


        AppState.save();


        return config;

    },


    // -----------------------------------------------------
    // GET WEIGHTS FOR COMPETENCE
    // -----------------------------------------------------

    getWeightsForCompetence(
        academicYearId,
        classId,
        termId,
        specificCompetenceId
    ) {

        const config =
            this.getConfig(
                academicYearId,
                classId,
                termId
            );


        if (!config) {
            return [];

        }


        const competence =
            config.competenceWeights.find(
                item =>
                    item.specificCompetenceId ===
                    specificCompetenceId
            );


        if (!competence) {
            return [];

        }


        return competence.activities;

    },


    // -----------------------------------------------------
    // GET WEIGHT TOTAL
    // -----------------------------------------------------

    getWeightTotal(
        academicYearId,
        classId,
        termId,
        specificCompetenceId
    ) {

        const activities =
            this.getWeightsForCompetence(
                academicYearId,
                classId,
                termId,
                specificCompetenceId
            );


        return activities.reduce(
            (
                total,
                activity
            ) =>
                total +
                Number(
                    activity.weight
                ),

            0
        );

    },


    // -----------------------------------------------------
    // GET COMPETENCE WEIGHT
    // -----------------------------------------------------

    getCompetenceWeight(
        academicYearId,
        classId,
        termId,
        specificCompetenceId
    ) {

        const config =
            this.getConfig(
                academicYearId,
                classId,
                termId
            );


        if (!config) {
            return null;
        }


        const competence =
            config.competenceWeights.find(
                item =>
                    item.specificCompetenceId ===
                    specificCompetenceId
            );


        if (!competence) {
            return null;
        }


        /*
         * Older configurations may not yet have
         * a competence-level weight.
         */

        if (
            competence.weight === undefined ||
            competence.weight === null
        ) {
            return null;
        }


        return Number(
            competence.weight
        );

    },


    // -----------------------------------------------------
    // SET COMPETENCE WEIGHT
    // -----------------------------------------------------

    setCompetenceWeight(
        academicYearId,
        classId,
        termId,
        specificCompetenceId,
        weight
    ) {

        const config =
            this.getOrCreateConfig(
                academicYearId,
                classId,
                termId
            );


        const normalizedWeight =
            Number(weight);


        if (
            !Number.isFinite(
                normalizedWeight
            )
        ) {

            throw new Error(
                "Competence weight must be a number."
            );

        }


        if (
            normalizedWeight < 0 ||
            normalizedWeight > 100
        ) {

            throw new Error(
                "Competence weight must be between 0 and 100."
            );

        }


        // ---------------------------------------------
        // Find competence
        // ---------------------------------------------

        let competence =
            config.competenceWeights.find(
                item =>
                    item.specificCompetenceId ===
                    specificCompetenceId
            );


        // ---------------------------------------------
        // Create competence entry if necessary
        // ---------------------------------------------

        if (!competence) {

            competence = {

                specificCompetenceId,

                weight:
                    normalizedWeight,

                activities: []

            };


            config.competenceWeights.push(
                competence
            );

        }
        else {

            competence.weight =
                normalizedWeight;

        }


        config.updatedAt =
            new Date().toISOString();


        AppState.save();


        return config;

    },


    // -----------------------------------------------------
    // REMOVE COMPETENCE WEIGHT
    // -----------------------------------------------------

    removeCompetenceWeight(
        academicYearId,
        classId,
        termId,
        specificCompetenceId
    ) {

        const config =
            this.getConfig(
                academicYearId,
                classId,
                termId
            );


        if (!config) {
            return null;
        }


        const competence =
            config.competenceWeights.find(
                item =>
                    item.specificCompetenceId ===
                    specificCompetenceId
            );


        if (!competence) {
            return config;
        }


        /*
         * Important:
         * removing the competence weight must NOT
         * remove the activity weights.
         *
         * Level 1 and level 2 are independent.
         */

        delete competence.weight;


        config.updatedAt =
            new Date().toISOString();


        AppState.save();


        return config;

    },


    // -----------------------------------------------------
    // GET COMPETENCE WEIGHTS
    // -----------------------------------------------------

    getCompetenceWeights(
        academicYearId,
        classId,
        termId
    ) {

        const config =
            this.getConfig(
                academicYearId,
                classId,
                termId
            );


        if (!config) {
            return [];

        }


        return config.competenceWeights
            .filter(
                competence =>
                    competence.weight !== undefined &&
                    competence.weight !== null
            )
            .map(
                competence => ({
                    specificCompetenceId:
                        competence.specificCompetenceId,

                    weight:
                        Number(
                            competence.weight
                        )
                })
            );

    },


    // -----------------------------------------------------
    // GET COMPETENCE WEIGHT TOTAL
    // -----------------------------------------------------

    getCompetenceWeightTotal(
        academicYearId,
        classId,
        termId
    ) {

        const weights =
            this.getCompetenceWeights(
                academicYearId,
                classId,
                termId
            );


        return weights.reduce(
            (
                total,
                competence
            ) =>
                total +
                Number(
                    competence.weight
                ),

            0
        );

    },


    // -----------------------------------------------------
    // GET ALL CONFIGS
    // -----------------------------------------------------

    getAll() {

        return AppState
            .data
            .gradebookConfigs;

    },


    // -----------------------------------------------------
    // DELETE CONFIG
    // -----------------------------------------------------

    deleteConfig(
        academicYearId,
        classId,
        termId
    ) {

        AppState.data.gradebookConfigs =
            AppState
                .data
                .gradebookConfigs
                .filter(
                    config =>
                        !(
                            config.academicYearId ===
                                academicYearId &&

                            config.classId ===
                                classId &&

                            config.termId ===
                                termId
                        )
                );


        AppState.save();

    },

    // =====================================================
    // LEVEL 3 — TERM WEIGHTS
    // =====================================================

    getTermWeight(
        academicYearId,
        classId,
        termId
    ) {

        const configs =
            AppState
                .data
                .gradebookConfigs
                .filter(
                    config =>
                        config.academicYearId ===
                            academicYearId &&

                        config.classId ===
                            classId
                );


        for (const config of configs) {

            if (
                !Array.isArray(
                    config.termWeights
                )
            ) {
                continue;
            }


            const termWeight =
                config.termWeights.find(
                    item =>
                        item.termId ===
                        termId
                );


            if (termWeight) {

                return Number(
                    termWeight.weight
                ) || 0;

            }
        }


        return 0;

    },


    // -----------------------------------------------------
    // SET TERM WEIGHT
    // -----------------------------------------------------

    setTermWeight(
        academicYearId,
        classId,
        termId,
        weight
    ) {

        const normalizedWeight =
            Number(weight);


        if (
            !Number.isFinite(
                normalizedWeight
            )
        ) {

            throw new Error(
                "Term weight must be a number."
            );

        }


        if (
            normalizedWeight < 0 ||
            normalizedWeight > 100
        ) {

            throw new Error(
                "Term weight must be between 0 and 100."
            );

        }


        /*
         * Term weights are stored in the
         * academic year + class context.
         *
         * We use the first existing config
         * for this year/class.
         */

        let config =
            AppState
                .data
                .gradebookConfigs
                .find(
                    item =>
                        item.academicYearId ===
                            academicYearId &&

                        item.classId ===
                            classId
                );


        /*
         * If there is no gradebook config yet,
         * create one for the supplied term.
         */

        if (!config) {

            config =
                this.getOrCreateConfig(
                    academicYearId,
                    classId,
                    termId
                );

        }


        if (
            !Array.isArray(
                config.termWeights
            )
        ) {

            config.termWeights = [];

        }


        const existing =
            config.termWeights.find(
                item =>
                    item.termId ===
                    termId
            );


        if (existing) {

            existing.weight =
                normalizedWeight;

        }
        else {

            config.termWeights.push({

                termId,

                weight:
                    normalizedWeight

            });

        }


        config.updatedAt =
            new Date().toISOString();


        AppState.save();


        return config;

    },


    // -----------------------------------------------------
    // REMOVE TERM WEIGHT
    // -----------------------------------------------------

    removeTermWeight(
        academicYearId,
        classId,
        termId
    ) {

        const config =
            AppState
                .data
                .gradebookConfigs
                .find(
                    item =>
                        item.academicYearId ===
                            academicYearId &&

                        item.classId ===
                            classId
                );


        if (!config) {
            return null;
        }


        if (
            !Array.isArray(
                config.termWeights
            )
        ) {
            return config;
        }


        config.termWeights =
            config.termWeights.filter(
                item =>
                    item.termId !==
                    termId
            );


        config.updatedAt =
            new Date().toISOString();


        AppState.save();


        return config;

    },


    // -----------------------------------------------------
    // GET TERM WEIGHTS
    // -----------------------------------------------------

    getTermWeights(
        academicYearId,
        classId
    ) {

        const config =
            AppState
                .data
                .gradebookConfigs
                .find(
                    item =>
                        item.academicYearId ===
                            academicYearId &&

                        item.classId ===
                            classId
                );


        if (
            !config ||
            !Array.isArray(
                config.termWeights
            )
        ) {
            return [];
        }


        return config.termWeights.map(
            item => ({

                termId:
                    item.termId,

                weight:
                    Number(
                        item.weight
                    ) || 0

            })
        );

    },


    // -----------------------------------------------------
    // GET TERM WEIGHT TOTAL
    // -----------------------------------------------------

    getTermWeightTotal(
        academicYearId,
        classId
    ) {

        const weights =
            this.getTermWeights(
                academicYearId,
                classId
            );


        return weights.reduce(
            (
                total,
                term
            ) =>
                total +
                (
                    Number(
                        term.weight
                    ) || 0
                ),

            0
        );

    },

};