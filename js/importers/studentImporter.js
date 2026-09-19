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

    console.log(
        "🔎 Detecting student names from PDF..."
    );

    const results = [];

    // --------------------------------------------------
    // HELPERS
    // --------------------------------------------------

    const normalize = value => {

        return String(value || "")
            .replace(/\s+/g, " ")
            .trim();

    };

    const normalizeKey = value => {

        return normalize(value)
            .toUpperCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");
    };

    const isStudentName = value => {

        const text = normalize(value);

        if (!text) {
            return false;
        }

        // A student name in these school PDFs
        // follows the format:
        //
        // SURNAME, FIRST NAME
        //
        if (!text.includes(",")) {
            return false;
        }

        // Avoid obvious headers / institution data.
        const key = normalizeKey(text);

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

        if (
            forbidden.some(
                word => key.includes(word)
            )
        ) {
            return false;
        }

        const parts =
            text.split(",");

        if (parts.length < 2) {
            return false;
        }

        const surname =
            normalize(parts[0]);

        const firstName =
            normalize(
                parts
                    .slice(1)
                    .join(",")
            );

        if (
            surname.length < 2 ||
            firstName.length < 2
        ) {
            return false;
        }

        // Names should contain letters.
        if (
            !/[A-Za-zÁÉÍÓÚÀÈÌÒÙÜÑÇáéíóúàèìòùüñç]/.test(
                surname
            )
        ) {
            return false;
        }

        if (
            !/[A-Za-zÁÉÍÓÚÀÈÌÒÙÜÑÇáéíóúàèìòùüñç]/.test(
                firstName
            )
        ) {
            return false;
        }

        return true;
    };

    const addName = value => {

        const name =
            normalize(value);

        if (!isStudentName(name)) {
            return;
        }

        const key =
            normalizeKey(name);

        if (
            results.some(
                item =>
                    normalizeKey(
                        item.fullName
                    ) === key
            )
        ) {
            return;
        }

        results.push({
            fullName: name
        });
    };


    // --------------------------------------------------
    // STRATEGY 1
    // PDF.js RAW ITEMS
    //
    // Look for the numbered student records.
    // --------------------------------------------------

    if (
        Array.isArray(items) &&
        items.length
    ) {

        console.log(
            "🔎 Looking for numbered student rows..."
        );

        /*
         * Only use the first page.
         *
         * We know the student table starts with
         * order 1 and continues through 29.
         */
        const firstPageItems =
            items.filter(
                item =>
                    item.page === 1
            );

        /*
         * Find items containing order numbers 1–29.
         *
         * We deliberately require the text to be
         * exactly the number.
         */
        const orderItems =
            firstPageItems.filter(
                item => {

                    const text =
                        normalize(item.text);

                    if (
                        !/^\d{1,2}$/.test(text)
                    ) {
                        return false;
                    }

                    const number =
                        Number(text);

                    return (
                        number >= 1 &&
                        number <= 29
                    );
                }
            );

        console.log(
            "🔢 Possible order numbers:",
            orderItems.map(
                item => ({
                    number:
                        Number(
                            normalize(
                                item.text
                            )
                        ),
                    index:
                        firstPageItems.indexOf(
                            item
                        ),
                    text:
                        item.text,
                    transform:
                        item.transform
                })
            )
        );


        /*
         * The PDF extraction has a very useful
         * structure:
         *
         *   ORDER
         *   blank
         *   NIA
         *   blank
         *   NAME
         *   blank
         *   SUBJECTS
         *   REPEAT
         *
         * Therefore, for each order number,
         * inspect the following items until the
         * next order number.
         */
        const sortedOrders =
            orderItems
                .map(
                    item => ({
                        item,
                        number:
                            Number(
                                normalize(
                                    item.text
                                )
                            ),
                        index:
                            firstPageItems.indexOf(
                                item
                            )
                    })
                )
                .sort(
                    (a, b) =>
                        a.index - b.index
                );


        /*
         * We want the FIRST occurrence of each
         * student number.
         *
         * The PDF also contains things such as
         * "1 de", "2 de", page numbers, etc.
         * Those are ignored because they don't
         * produce a valid name in the following
         * block.
         */
        const usedNumbers =
            new Set();


        for (
            let i = 0;
            i < sortedOrders.length;
            i++
        ) {

            const current =
                sortedOrders[i];

            if (
                usedNumbers.has(
                    current.number
                )
            ) {
                continue;
            }

            const next =
                sortedOrders
                    .slice(i + 1)
                    .find(
                        candidate =>
                            candidate.index >
                                current.index &&
                            candidate.number !==
                                current.number
                    );

            const endIndex =
                next
                    ? next.index
                    : firstPageItems.length;


            const block =
                firstPageItems.slice(
                    current.index,
                    endIndex
                );

            console.log(
                `🔎 STUDENT BLOCK ${current.number}:`,
                block.map(
                    item => item.text
                )
            );


            /*
             * Search the block for the first
             * valid "SURNAME, NAME" value.
             */
            const candidates =
                block.filter(
                    item =>
                        isStudentName(
                            item.text
                        )
                );

            console.log(
                `👤 BLOCK ${current.number} NAME CANDIDATES:`,
                candidates.map(
                    item => item.text
                )
            );


            if (
                candidates.length
            ) {

                addName(
                    candidates[0].text
                );

                usedNumbers.add(
                    current.number
                );
            }
        }
    }


    // --------------------------------------------------
    // VALIDATION
    // --------------------------------------------------

    /*
     * If we successfully found the numbered
     * student table, DON'T run the generic line
     * parser.
     *
     * This is crucial for 4C.pdf because PDF.js
     * reconstructs the entire NAME column as
     * one giant line.
     */
    if (
        results.length >= 2
    ) {

        console.log(
            "✅ Names found from numbered PDF rows:",
            results
        );

        return results;
    }


    // --------------------------------------------------
    // STRATEGY 2
    // GENERIC TEXT-LINE FALLBACK
    //
    // Used for PDFs such as 4C_OPT_MOD.pdf
    // where PDF.js gives us one student per line.
    // --------------------------------------------------

    console.log(
        "⚠️ Numbered-row detection did not find enough names."
    );

    console.log(
        "🔎 Trying generic line-based detection..."
    );


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


    const prefixCodes =
        new Set([
            "R",
            "PA",
            "PI"
        ]);


    const ignored =
        new Set([
            "APELLIDOS Y NOMBRE",
            "NOMBRE Y APELLIDOS",
            "LISTADO DE ALUMNOS",
            "ALUMNOS",
            "NOMBRE",
            "APELLIDOS",
            "ORDEN",
            "REPITE"
        ]);


    lines.forEach(
        line => {

            let text =
                normalize(line);

            if (!text) {
                return;
            }

            const key =
                normalizeKey(text);

            if (
                ignored.has(key)
            ) {
                return;
            }

            /*
             * If the line contains several names
             * concatenated together, don't attempt
             * to interpret it as one student.
             */
            const commaCount =
                (
                    text.match(/,/g) || []
                ).length;

            if (
                commaCount !== 1
            ) {
                return;
            }

            /*
             * Remove order number.
             */
            text =
                text.replace(
                    /^\d{1,2}\s+/,
                    ""
                );

            /*
             * Remove status prefix.
             */
            const firstWord =
                text
                    .split(/\s+/)[0]
                    ?.toUpperCase();

            if (
                prefixCodes.has(
                    firstWord
                )
            ) {

                text =
                    text
                        .split(/\s+/)
                        .slice(1)
                        .join(" ");
            }

            /*
             * Cut after the name if subject
             * codes follow it.
             */
            const words =
                text.split(/\s+/);

            const commaIndex =
                words.findIndex(
                    word =>
                        word.includes(",")
                );

            if (
                commaIndex === -1
            ) {
                return;
            }

            let end =
                words.length;

            for (
                let i =
                    commaIndex + 1;
                i < words.length;
                i++
            ) {

                const clean =
                    words[i]
                        .replace(
                            /[^A-Za-z0-9]/g,
                            ""
                        )
                        .toUpperCase();

                if (
                    columnCodes.has(
                        clean
                    )
                ) {

                    end = i;
                    break;
                }
            }

            const name =
                words
                    .slice(
                        0,
                        end
                    )
                    .join(" ");

            addName(name);
        }
    );


    console.log(
        "👥 NAMES FOUND FROM FALLBACK:",
        results
    );

    return results;
},


    // =================================================
    // IMPORT
    // =================================================

    importStudents(
        names,
        classId,
        academicYearId
    ) {

        if (!classId) {
            throw new Error(
                "No class selected."
            );
        }

        if (!academicYearId) {
            throw new Error(
                "No academic year selected."
            );
        }

        if (
            !Array.isArray(names) ||
            !names.length
        ) {
            throw new Error(
                "No students selected."
            );
        }

        const imported = [];

        const existingStudents =
            EnrollmentManager
                .getStudentsForClass(
                    classId
                );

        names.forEach(
            fullName => {

                const nameParts =
                    String(
                        fullName
                    )
                        .trim()
                        .split(",");

                if (
                    nameParts.length < 2
                ) {
                    return;
                }

                const lastName =
                    nameParts[0]
                        .trim();

                const firstName =
                    nameParts
                        .slice(1)
                        .join(",")
                        .trim();

                if (
                    !firstName ||
                    !lastName
                ) {
                    return;
                }

                const normalizeName =
                    value =>
                        String(
                            value || ""
                        )
                            .trim()
                            .toLocaleLowerCase()
                            .normalize("NFD")
                            .replace(
                                /[\u0300-\u036f]/g,
                                ""
                            );

                const normalized =
                    normalizeName(
                        fullName
                    );

                const exists =
                    existingStudents.some(
                        student => {

                            const existingName =
                                `${student.firstName} ${student.lastName}`;

                            return (
                                normalizeName(
                                    existingName
                                ) ===
                                normalized
                            );
                        }
                    );

                if (exists) {
                    return;
                }

                const alreadyImported =
                    imported.some(
                        student => {

                            const importedName =
                                `${student.firstName} ${student.lastName}`;

                            return (
                                normalizeName(
                                    importedName
                                ) ===
                                normalized
                            );
                        }
                    );

                if (
                    alreadyImported
                ) {
                    return;
                }

                const student =
                    StudentManager.create({
                        firstName,
                        lastName
                    });

                EnrollmentManager.create({
                    studentId:
                        student.id,

                    classId,

                    academicYearId
                });

                imported.push(
                    student
                );
            }
        );

        return imported;
    }

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