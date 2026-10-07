// =========================================================
// T-CHIT — DASHBOARD CALENDAR WIDGET
// =========================================================


// ---------------------------------------------------------
// STATE
// ---------------------------------------------------------

let dashboardCalendarDate =
    new Date();


// ---------------------------------------------------------
// RENDER WIDGET
// ---------------------------------------------------------

function renderDashboardCalendarWidget() {

    const academicYear =
        AppState.getCurrentAcademicYear();


    if (!academicYear) {
        return "";
    }


    const events =
        CalendarManager
            .getByAcademicYearId(
                academicYear.id
            );

    const reminders =
        NoteManager
            .getByAcademicYear(
                academicYear.id
            )
            .filter(note =>
                note.type === "reminder" &&
                note.notify === true &&
                note.notifyAt
            );


    const year =
        dashboardCalendarDate.getFullYear();

    const month =
        dashboardCalendarDate.getMonth();


    const monthName =
        dashboardCalendarDate.toLocaleDateString(
            "en-GB",
            {
                month: "long"
            }
        ).toUpperCase();


    const upcomingItems = [

        ...events.map(event => ({
            ...event,
            itemType: "event",
            sortDate: event.date,
            sortTime: "00:00"
        })),

        ...reminders.map(note => ({
            ...note,
            itemType: "reminder",
            sortDate:
                note.notifyAt.slice(0, 10),
            sortTime:
                note.notifyAt.slice(11, 16)
        }))

    ]
        .filter(item =>
            item.sortDate >= getTodayISODate()
        )
        .sort((a, b) => {

            const dateCompare =
                a.sortDate.localeCompare(
                    b.sortDate
                );

            if (dateCompare !== 0) {
                return dateCompare;
            }

            return a.sortTime.localeCompare(
                b.sortTime
            );

        })
        .slice(0, 5);


return `
    <section class="dashboard-calendar-widget">
        <div class="dashboard-calendar-header">
            <h4 class="dashboard-calendar-month">
                ${monthName}
            </h4>
            <div class="dashboard-calendar-nav">
                <button
                    class="small-icon-button"
                    onclick="changeDashboardCalendarMonth(-1)"
                    title="Previous month"
                >
                    ←
                </button>
                <button
                    class="small-icon-button"
                    onclick="changeDashboardCalendarMonth(1)"
                    title="Next month"
                >
                    →
                </button>
            </div>
        </div>
        

            <div class="dashboard-calendar-body">

                <div class="dashboard-mini-calendar">

                    ${renderDashboardMiniCalendar(
                        year,
                        month,
                        events,
                        reminders
                    )}

                </div>


                <div class="dashboard-calendar-upcoming">

                    <div class="dashboard-calendar-subtitle">
                        UPCOMING
                    </div>

                    ${
                        upcomingItems.length
                            ? renderDashboardUpcomingEvents(
                                upcomingItems
                            )
                            : `
                                <div class="dashboard-calendar-empty">
                                    No upcoming events.
                                </div>
                            `
                    }

                </div>

            </div>


            <div class="dashboard-calendar-footer">

                <button
                    class="section-link"
                    onclick="navigateTo('calendar')"
                >
                    MANAGE CALENDAR →
                </button>

            </div>

        </section>

    `;
}


// ---------------------------------------------------------
// MINI CALENDAR
// ---------------------------------------------------------

function renderDashboardMiniCalendar(
    year,
    month,
    events,
    reminders
) {

    const firstDay =
        new Date(
            year,
            month,
            1
        );


    const daysInMonth =
        new Date(
            year,
            month + 1,
            0
        ).getDate();


    let startDay =
        firstDay.getDay();


    // Monday = 0
    startDay =
        startDay === 0
            ? 6
            : startDay - 1;


    const weekdays = [
        "MON",
        "TUE",
        "WED",
        "THU",
        "FRI",
        "SAT",
        "SUN"
    ];


    let html = `

        <div class="dashboard-calendar-weekdays">

            ${
                weekdays.map(day => `
                    <div>
                        ${day}
                    </div>
                `).join("")
            }

        </div>


        <div class="dashboard-calendar-grid">
    `;


    for (
        let i = 0;
        i < startDay;
        i++
    ) {

        html += `
            <div class="dashboard-calendar-day empty">
            </div>
        `;
    }


    const today =
        getTodayISODate();


    for (
        let day = 1;
        day <= daysInMonth;
        day++
    ) {

        const date =
            `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;


        const dayEvents =
            events.filter(
                event =>
                    event.date === date
            );


        const dayReminders =
            reminders.filter(
                note =>
                    note.notifyAt &&
                    note.notifyAt.slice(
                        0,
                        10
                    ) === date
            );


        const isToday =
            date === today;


        html += `

            <div
                class="
                    dashboard-calendar-day
                    ${isToday ? "today" : ""}
                    ${
                        dayEvents.length ||
                        dayReminders.length
                            ? "has-events"
                            : ""
                    }
                "
                title="${
                    dayEvents.length
                        ? dayEvents
                            .map(event =>
                                event.title
                            )
                            .join(", ")
                        : ""
                }"
            >

                <span>
                    ${day}
                </span>


                ${
                    dayEvents.length
                        ? `
                            <div class="dashboard-calendar-event-dots">

                                ${
                                    dayEvents
                                        .slice(0, 3)
                                        .map(() =>
                                            `<i></i>`
                                        )
                                        .join("")
                                }

                            </div>
                        `
                        : ""
                }

            </div>

        `;
    }


    html += `
        </div>
    `;


    return html;
}


// ---------------------------------------------------------
// UPCOMING EVENTS
// ---------------------------------------------------------

function renderDashboardUpcomingEvents(items) {

	return `
		<div class="dashboard-upcoming-events">

			${
				items.map(item => {

					const date =
						new Date(
							`${item.sortDate}T00:00:00`
						);

					const day =
						date.getDate();

					const month =
						date.toLocaleDateString(
							"en-GB",
							{
								month: "short"
							}
						)
						.toUpperCase();

					return `
                        <div class="dashboard-upcoming-event ${
                            item.itemType === "reminder"
                                ? "is-reminder"
                                : "is-event"
                        }">

							<div class="dashboard-upcoming-date">
								<strong>${day}</strong>
								<span>${month}</span>
							</div>

							<div class="dashboard-upcoming-info">

								<div class="dashboard-upcoming-title">
									${escapeHTML(
										item.title ||
										"Untitled event"
									)}
								</div>

								<div class="dashboard-upcoming-type">

                                    ${
                                        item.itemType === "reminder"
                                            ? `Reminder · ${escapeHTML(
                                                item.sortTime
                                            )}`
                                            : escapeHTML(
                                                formatCalendarEventType(
                                                    item.type
                                                )
                                            )
                                    }

								</div>

							</div>

						</div>
					`;

				}).join("")
			}

		</div>
	`;
}



// ---------------------------------------------------------
// MONTH NAVIGATION
// ---------------------------------------------------------

function changeDashboardCalendarMonth(
    amount
) {

    dashboardCalendarDate =
        new Date(
            dashboardCalendarDate.getFullYear(),
            dashboardCalendarDate.getMonth() + amount,
            1
        );


    renderDashboard();
}


// ---------------------------------------------------------
// EVENT TYPE LABEL
// ---------------------------------------------------------

function formatCalendarEventType(
    type
) {

    const labels = {

        holiday:
            "Holiday",

        non_school_day:
            "Non-school day",

        exam:
            "Exam",

        trip:
            "Trip",

        meeting:
            "Meeting",

        event:
            "Event",

        other:
            "Other"

    };


    return labels[type] || "Event";
}