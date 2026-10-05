// =========================================================
// T-CHIT — ATTENDANCE VIEW
// =========================================================

// ---------------------------------------------------------
// ATTENDANCE STATE
// ---------------------------------------------------------

let attendanceActiveTab = "take";

// ---------------------------------------------------------
// MAIN VIEW
// ---------------------------------------------------------

function renderAttendanceView() {

    const container =
        document.getElementById("appView");


    if (!container) {

        console.error(
            "T-chit: #appView not found."
        );

        return;
    }


    const academicYear =
        AppState.getCurrentAcademicYear();


    if (!academicYear) {

        container.innerHTML = `

            <div class="empty-state">

                <div class="empty-state-icon">
                    ✎
                </div>

                <h3>
                    No academic year selected
                </h3>

                <p>
                    Set up your academic year before
                    viewing attendance.
                </p>

                <button
                    class="btn-primary"
                    onclick="navigateTo('settings')"
                >
                    GO TO SETTINGS
                </button>

            </div>

        `;

        return;
    }


    container.innerHTML = `

        <div class="attendance-view">

            <!-- =================================================
                 TABS
                 ================================================= -->

            <div class="attendance-tabs">

                <button
                    type="button"
                    class="
                        attendance-tab
                        ${
                            attendanceActiveTab === "take"
                                ? "active"
                                : ""
                        }
                    "
                    data-attendance-tab="take"
                >
                    TAKE ATTENDANCE
                </button>


                <button
                    type="button"
                    class="
                        attendance-tab
                        ${
                            attendanceActiveTab === "overview"
                                ? "active"
                                : ""
                        }
                    "
                    data-attendance-tab="overview"
                >
                    OVERVIEW
                </button>


                <button
                    type="button"
                    class="
                        attendance-tab
                        ${
                            attendanceActiveTab === "classes"
                                ? "active"
                                : ""
                        }
                    "
                    data-attendance-tab="classes"
                >
                    BY CLASS
                </button>

            </div>


            <!-- =================================================
                 TAB CONTENT
                 ================================================= -->

            <div
                id="attendanceTabContent"
                class="attendance-tab-content"
            >

                ${
                    attendanceActiveTab === "take"
                        ? renderAttendanceTakeTab(
                            academicYear
                        )
                        : attendanceActiveTab === "overview"
                            ? renderAttendanceOverviewTab(
                                academicYear
                            )
                            : renderAttendanceClassesTab(
                                academicYear
                            )
                }

            </div>


        </div>

    `;


    setupAttendanceTabs();

    if (
        attendanceActiveTab === "take"
    ) {
        setupAttendanceTakeTab();
    }
}


// ---------------------------------------------------------
// TABS
// ---------------------------------------------------------

function setupAttendanceTabs() {

    const tabs =
        document.querySelectorAll(
            "[data-attendance-tab]"
        );


    tabs.forEach(tab => {

        tab.addEventListener(
            "click",
            () => {

                const selectedTab =
                    tab.dataset.attendanceTab;


                if (
                    selectedTab ===
                    attendanceActiveTab
                ) {
                    return;
                }


                attendanceActiveTab =
                    selectedTab;


                renderAttendanceView();

            }
        );

    });
}