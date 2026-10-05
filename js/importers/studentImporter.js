const StudentImporter = {

    // =================================================
    // ANALYSE
    // =================================================

    async analyse(file) {

        if (!file) {
            throw new Error(
                "No file selected."
            );
        }

        const extension =
            file.name
                .split(".")
                .pop()
                .toLowerCase();

        switch (extension) {

            case "pdf":
                return await this.analysePDF(file);

            case "xlsx":
            case "xls":
                throw new Error(
                    "Excel import is not available yet."
                );

            case "csv":
                throw new Error(
                    "CSV import is not available yet."
                );

            default:
                throw new Error(
                    "Unsupported file type."
                );
        }
    },


    // =================================================
    // PDF
    // =================================================

    async analysePDF(file) {

        console.log(
            "📄 Starting PDF analysis:",
            file.name
        );

        if (typeof pdfjsLib === "undefined") {

            throw new Error(
                "PDF.js is not available."
            );
        }

        console.log(
            "✅ pdfjsLib available."
        );

        const arrayBuffer =
            await file.arrayBuffer();

        console.log(
            "📦 PDF loaded into memory:",
            arrayBuffer.byteLength,
            "bytes"
        );

        console.log(
            "🔓 Opening PDF..."
        );

        const pdf =
            await pdfjsLib.getDocument({
                data: arrayBuffer
            }).promise;

        console.log(
            "✅ PDF opened:",
            pdf.numPages,
            "pages"
        );

        const lines = [];

        const allItems = [];

        for (
            let pageNumber = 1;
            pageNumber <= pdf.numPages;
            pageNumber++
        ) {

            console.log(
                `📄 Reading page ${pageNumber}/${pdf.numPages}...`
            );

            const page =
                await pdf.getPage(
                    pageNumber
                );

            console.log(
                `✅ Page ${pageNumber} loaded.`
            );

            const textContent =
                await page.getTextContent();

            console.log(
                `📝 Page ${pageNumber} text items:`,
                textContent.items.length
            );

            // -----------------------------------------
            // Keep original PDF items
            // -----------------------------------------

            allItems.push(
                ...textContent.items.map(
                    item => ({
                        text: item.str,
                        x: item.transform[4],
                        y: item.transform[5],
                        page: pageNumber
                    })
                )
            );

            console.log(
                "🎯 SAMPLE STUDENT ITEM:",
                textContent.items.find(
                    item =>
                        item.str === "AIT KACI, ISMAIL"
                )
            );

            // -----------------------------------------
            // TEMPORARY DEBUG
            // -----------------------------------------

            console.table(
                textContent.items.map(
                    item => ({
                        text: item.str,
                        x: Math.round(
                            item.transform[4]
                        ),
                        y: Math.round(
                            item.transform[5]
                        )
                    })
                )
            );

            // -----------------------------------------
            // Build reconstructed lines
            // -----------------------------------------

            const pageLines =
                this.buildLines(
                    textContent.items
                );

            console.log(
                `📋 Page ${pageNumber} lines:`,
                pageLines
            );

            lines.push(
                ...pageLines
            );
        }

        console.log(
            "📄 ALL PDF TEXT LINES:",
            lines
        );

        console.log(
            "🔎 TOTAL RAW PDF ITEMS:",
            allItems.length
        );

        // -----------------------------------------
        // Detect names
        // -----------------------------------------

        const names =
            this.detectNames(
                lines,
                allItems
            );

        console.log(
            "👥 POSSIBLE STUDENT NAMES:",
            names
        );

        return {
            type: "pdf",
            fileName: file.name,
            pages: pdf.numPages,
            names
        };
    },


    // =================================================
    // BUILD LINES
    // =================================================

    buildLines(items) {

        const positioned =
            items
                .filter(
                    item =>
                        item.str &&
                        item.str.trim()
                )
                .map(
                    item => ({
                        text:
                            item.str.trim(),
                        x:
                            item.transform[4],
                        y:
                            item.transform[5]
                    })
                );

        positioned.sort(
            (a, b) => {

                if (
                    Math.abs(
                        a.y - b.y
                    ) > 3
                ) {
                    return b.y - a.y;
                }

                return a.x - b.x;
            }
        );

        const rows = [];

        positioned.forEach(
            item => {

                let row =
                    rows.find(
                        existing =>
                            Math.abs(
                                existing.y -
                                item.y
                            ) <= 3
                    );

                if (!row) {

                    row = {
                        y:
                            item.y,
                        items: []
                    };

                    rows.push(
                        row
                    );
                }

                row.items.push(
                    item
                );
            }
        );

        return rows
            .sort(
                (a, b) =>
                    b.y - a.y
            )
            .map(
                row =>
                    row.items
                        .sort(
                            (a, b) =>
                                a.x - b.x
                        )
                        .map(
                            item =>
                                item.text
                        )
                        .join(" ")
                        .replace(
                            /\s+/g,
                            " "
                        )
                        .trim()
            )
            .filter(Boolean);
    },


    // =================================================
    // NAME DETECTION
    // =================================================

    detectNames(lines, items = []) {

        const results = [];

        const normalize = value =>
            String(value || "")
                .replace(/\s+/g, " ")
                .trim();

        const normalizeKey = value =>
            normalize(value)
                .toUpperCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "");

        const forbidden = [
            "APELLIDOS Y NOMBRE",
            "NOMBRE Y APELLIDOS",
            "INSTITUTO DE EDUCACION",
            "LISTADO DE ALUMNOS",
            "DIRECCION",
            "LOCALIDAD",
            "CENTRO",
            "MATERIA",
            "TUTOR",
            "GRUPO"
        ];

        const isStudentName = value => {

            const text = normalize(value);

            if (!text) return false;
            if (!text.includes(",")) return false;

            const key = normalizeKey(text);

            if (
                forbidden.some(word =>
                    key.includes(word)
                )
            ) {
                return false;
            }

            const parts = text
                .split(",")
                .map(part => normalize(part))
                .filter(Boolean);

            if (parts.length < 2) {
                return false;
            }

            if (
                !/[A-Za-zÁÉÍÓÚÀÈÌÒÙÜÑÇáéíóúàèìòùüñç]/.test(text)
            ) {
                return false;
            }

            return true;
        };

        const addName = value => {

            const name = normalize(value);

            if (!isStudentName(name)) {
                return;
            }

            const key = normalizeKey(name);

            if (
                results.some(item =>
                    normalizeKey(item.fullName) === key
                )
            ) {
                return;
            }

            results.push({
                fullName: name
            });
        };


        /*
        * ---------------------------------------------------------
        * STRATEGY 1
        * PDF rows reconstructed from positioned PDF items.
        *
        * PDF.js does not necessarily return the complete student
        * name as one item. For example:
        *
        *   AIT
        *   KACI, ISMAIL
        *
        * or:
        *
        *   ABDELLAH,
        *   AYA,
        *   BEN
        *
        * Therefore we reconstruct the complete row first.
        * ---------------------------------------------------------
        */

        if (Array.isArray(items) && items.length) {

            const firstPageItems =
                items.filter(item => item.page === 1);

            const orderItems =
                firstPageItems.filter(item => {

                    const text = normalize(item.text);

                    if (!/^\d{1,2}$/.test(text)) {
                        return false;
                    }

                    const number = Number(text);

                    return number >= 1 && number <= 99;
                });

            const sortedOrders =
                orderItems
                    .map(item => ({
                        item,
                        number: Number(normalize(item.text)),
                        index: firstPageItems.indexOf(item)
                    }))
                    .sort((a, b) =>
                        a.index - b.index
                    );

            for (let i = 0; i < sortedOrders.length; i++) {

                const current = sortedOrders[i];

                const next =
                    sortedOrders
                        .slice(i + 1)
                        .find(candidate =>
                            candidate.index > current.index
                        );

                const endIndex =
                    next
                        ? next.index
                        : firstPageItems.length;

                const block =
                    firstPageItems.slice(
                        current.index + 1,
                        endIndex
                    );

                const blockText =
                    block
                        .map(item => normalize(item.text))
                        .filter(Boolean)
                        .join(" ")
                        .replace(/\s+/g, " ")
                        .trim();

                if (!blockText) {
                    continue;
                }

                /*
                * Find the first comma. Everything before it is part
                * of the surname area; everything after it is the
                * given-name area.
                *
                * A second comma is handled later by
                * normalizeImportedName().
                */

                if (isStudentName(blockText)) {
                    addName(blockText);
                    continue;
                }

                /*
                * Some PDFs put the surname and given name in separate
                * PDF items but without a useful row boundary.
                *
                * Try progressively smaller combinations.
                */

                for (let size = Math.min(block.length, 8); size >= 2; size--) {

                    let found = false;

                    for (
                        let start = 0;
                        start <= block.length - size;
                        start++
                    ) {

                        const candidate =
                            block
                                .slice(start, start + size)
                                .map(item => normalize(item.text))
                                .filter(Boolean)
                                .join(" ")
                                .replace(/\s+/g, " ")
                                .trim();

                        if (!isStudentName(candidate)) {
                            continue;
                        }

                        addName(candidate);
                        found = true;
                        break;
                    }

                    if (found) {
                        break;
                    }
                }
            }
        }


        /*
        * ---------------------------------------------------------
        * STRATEGY 2
        * Generic text-line fallback.
        * ---------------------------------------------------------
        */

        if (results.length >= 2) {
            return results;
        }

        const columnCodes = new Set([
            "CCO",
            "DIG",
            "DIG1",
            "DIG2",
            "DIG3",
            "FR",
            "TR",
            "ANG",
            "LAT",
            "TEC",
            "MAT",
            "AE",
            "REL",
            "FQ",
            "FQ1",
            "FQ2",
            "BIO1",
            "BIO2",
            "EE",
            "EA",
            "MUS",
            "VAL",
            "ARTE",
            "FIL",
            "FOPP",
            "CAS"
        ]);

        const prefixCodes = new Set([
            "R",
            "PA",
            "PI"
        ]);

        const ignored = new Set([
            "APELLIDOS Y NOMBRE",
            "NOMBRE Y APELLIDOS",
            "LISTADO DE ALUMNOS",
            "ALUMNOS",
            "NOMBRE",
            "APELLIDOS",
            "ORDEN",
            "REPITE"
        ]);

        lines.forEach(line => {

            let text = normalize(line);

            if (!text) {
                return;
            }

            const key = normalizeKey(text);

            if (ignored.has(key)) {
                return;
            }

            const commaCount =
                (text.match(/,/g) || []).length;

            if (commaCount < 1) {
                return;
            }

            text =
                text.replace(
                    /^\d{1,2}\s+/,
                    ""
                );

            const firstWord =
                text
                    .split(/\s+/)[0]
                    ?.toUpperCase();

            if (prefixCodes.has(firstWord)) {

                text =
                    text
                        .split(/\s+/)
                        .slice(1)
                        .join(" ");
            }

            const words =
                text.split(/\s+/);

            const commaIndex =
                words.findIndex(word =>
                    word.includes(",")
                );

            if (commaIndex === -1) {
                return;
            }

            let end = words.length;

            for (
                let i = commaIndex + 1;
                i < words.length;
                i++
            ) {

                const clean =
                    words[i]
                        .replace(/[^A-Za-z0-9]/g, "")
                        .toUpperCase();

                if (columnCodes.has(clean)) {
                    end = i;
                    break;
                }
            }

            const name =
                words
                    .slice(0, end)
                    .join(" ");

            addName(name);
        });

        return results;
    },



    // =================================================
    // IMPORT
    // =================================================

    importStudents(names, classId, academicYearId) {

        if (!classId) {
            throw new Error("No class selected.");
        }

        if (!academicYearId) {
            throw new Error("No academic year selected.");
        }

        if (!Array.isArray(names) || !names.length) {
            throw new Error("No students selected.");
        }

        const imported = [];

        const existingStudents =
            EnrollmentManager.getStudentsForClass(classId);

        const normalizeName = value =>
            String(value || "")
                .trim()
                .toLocaleLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .replace(/\s+/g, " ");


        /*
        * Convert the normalized PDF representation:
        *
        *   AIT KACI, ISMAIL
        *
        * into:
        *
        *   firstName: ISMAIL
        *   lastName: AIT KACI
        *
        * For three comma-separated parts:
        *
        *   ABDELLAH, AYA, BEN
        *
        * we interpret the middle part as the given name and
        * combine the two surname parts:
        *
        *   firstName: AYA
        *   lastName: BEN ABDELLAH
        */

        const parseStudentName = fullName => {

            const parts =
                String(fullName || "")
                    .split(",")
                    .map(part => part.trim())
                    .filter(Boolean);

            if (parts.length < 2) {
                return null;
            }

            let firstName = "";
            let lastName = "";

            if (parts.length === 2) {

                lastName = parts[0];
                firstName = parts[1];

            } else {

                firstName = parts[1];

                lastName =
                    [
                        ...parts.slice(2),
                        parts[0]
                    ]
                        .filter(Boolean)
                        .join(" ");
            }

            firstName = firstName
                .replace(/\s+/g, " ")
                .trim();

            lastName = lastName
                .replace(/\s+/g, " ")
                .trim();

            if (!firstName || !lastName) {
                return null;
            }

            return {
                firstName,
                lastName
            };
        };


        names.forEach(fullName => {

            const parsed =
                parseStudentName(fullName);

            if (!parsed) {
                return;
            }

            const normalized =
                normalizeName(
                    `${parsed.firstName} ${parsed.lastName}`
                );

            const exists =
                existingStudents.some(student => {

                    const existingName =
                        `${student.firstName} ${student.lastName}`;

                    return (
                        normalizeName(existingName) ===
                        normalized
                    );
                });

            if (exists) {
                return;
            }

            const alreadyImported =
                imported.some(student => {

                    const importedName =
                        `${student.firstName} ${student.lastName}`;

                    return (
                        normalizeName(importedName) ===
                        normalized
                    );
                });

            if (alreadyImported) {
                return;
            }

            const student =
                StudentManager.create({
                    firstName: parsed.firstName,
                    lastName: parsed.lastName
                });

            console.log("STUDENT CREATED:", student);

            EnrollmentManager.create({
                studentId: student.id,
                classId,
                academicYearId
            });

            imported.push(student);
        });

        return imported;
    },


};


// =====================================================
// PDF.JS CONFIGURATION
// =====================================================

if (
    typeof pdfjsLib !== "undefined"
) {

    pdfjsLib
        .GlobalWorkerOptions
        .workerSrc =
            "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

    console.log(
        "📚 PDF.js worker configured."
    );
}