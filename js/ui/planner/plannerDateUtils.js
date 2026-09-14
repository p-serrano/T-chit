// =========================================================
// DATE HELPERS
// =========================================================


// ---------------------------------------------------------
// GET MONDAY
// ---------------------------------------------------------

function getMonday(
    date
) {

    const result =
        new Date(date);


    const day =
        result.getDay();


    const diff =
        day === 0
            ? -6
            : 1 - day;


    result.setDate(
        result.getDate() + diff
    );


    result.setHours(
        0,
        0,
        0,
        0
    );


    return result;

}


// ---------------------------------------------------------
// ADD DAYS
// ---------------------------------------------------------

function addDays(
    date,
    amount
) {

    const result =
        new Date(date);


    result.setDate(
        result.getDate() + amount
    );


    return result;

}


// ---------------------------------------------------------
// ISO DATE
// ---------------------------------------------------------

function formatISODate(
    date
) {

    const year =
        date.getFullYear();


    const month =
        String(
            date.getMonth() + 1
        ).padStart(
            2,
            "0"
        );


    const day =
        String(
            date.getDate()
        ).padStart(
            2,
            "0"
        );


    return `${year}-${month}-${day}`;

}


// ---------------------------------------------------------
// WEEK RANGE
// ---------------------------------------------------------

function formatWeekRange(
    start,
    end
) {

    const startText =
        new Intl.DateTimeFormat(
            "en-GB",
            {
                day: "2-digit",
                month: "short"
            }
        ).format(start);


    const endText =
        new Intl.DateTimeFormat(
            "en-GB",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        ).format(end);


    return `${startText} – ${endText}`;

}


// ---------------------------------------------------------
// DAY NUMBER
// ---------------------------------------------------------

function formatDayNumber(
    date
) {

    return new Intl.DateTimeFormat(
        "en-GB",
        {
            day: "2-digit"
        }
    ).format(date);

}


// ---------------------------------------------------------
// DAY NAME
// ---------------------------------------------------------

function formatDayName(
    date
) {

    return new Intl.DateTimeFormat(
        "en-GB",
        {
            weekday: "long"
        }
    ).format(date);

}