// =========================================================
// T-CHIT — PLANNER VIEW
// =========================================================





// ---------------------------------------------------------
// PLANNER STATE
// ---------------------------------------------------------

let plannerActiveTab = "timetable";

let coursePlanWeekStart = getMonday(
    new Date()
);


// ---------------------------------------------------------
// RENDER PLANNER
// ---------------------------------------------------------

function renderPlannerView() {

    const container =
        document.getElementById(
            "appView"
        );

    if (!container) {
        return;
    }


    const academicYear =
        AppState.getCurrentAcademicYear();


    if (!academicYear) {

        container.innerHTML = `

            <div class="planner-view">

                <div class="empty-state">

                    <div class="empty-state-icon">
                        🗓️
                    </div>

                    <h3>
                        No academic year selected
                    </h3>

                    <p>
                        Create or select an academic
                        year before using the planner.
                    </p>

                    <br>

                    <button
                        class="btn-primary"
                        onclick="navigateTo('settings')">

                        GO TO SETTINGS

                    </button>

                </div>

            </div>

        `;

        return;
    }


    container.innerHTML = `

        <div class="planner-view">

            <!-- =====================================
                 PLANNER HEADER
                 ===================================== -->

            <div class="view-toolbar">

                <div>

                    <div class="view-label">
                        ACADEMIC YEAR
                    </div>

                    <div class="academic-year-name">
                        ${escapeHTML(
                            academicYear.name
                        )}
                    </div>

                </div>

            </div>


            <!-- =====================================
                 PLANNER TABS
                 ===================================== -->

            <div class="planner-tabs">

                <button
                    class="planner-tab
                        ${
                            plannerActiveTab ===
                            "timetable"
                                ? "active"
                                : ""
                        }"
                    onclick="switchPlannerTab(
                        'timetable'
                    )">

                    MY TIMETABLE

                </button>


                <button
                    class="planner-tab
                        ${
                            plannerActiveTab ===
                            "course"
                                ? "active"
                                : ""
                        }"
                    onclick="switchPlannerTab(
                        'course'
                    )">

                    COURSE PLAN

                </button>

            </div>


            ${
                plannerActiveTab === "timetable"
                    ? renderTimetableSection(
                        academicYear.id
                    )
                    : renderCoursePlanSection(
                        academicYear.id
                    )
            }

        </div>

    `;
}


// ---------------------------------------------------------
// SWITCH PLANNER TAB
// ---------------------------------------------------------

function switchPlannerTab(
    tab
) {

    plannerActiveTab = tab;

    renderPlannerView();

}


// =========================================================
// END PLANNER VIEW
// =========================================================