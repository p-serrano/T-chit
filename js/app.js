// =========================================================
// T-CHIT — APP
// =========================================================


// ---------------------------------------------------------
// INIT
// ---------------------------------------------------------

document.addEventListener("DOMContentLoaded", async () => {

    // ---------------------------------------------
    // LOCAL DATA
    // ---------------------------------------------

    AppState.init();


    // ---------------------------------------------
    // CLOUD DATA
    // ---------------------------------------------

    await AppState.syncFromCloud();


    // ---------------------------------------------
    // CURRICULUM
    // ---------------------------------------------

    await CurriculumManager.load();


    // ---------------------------------------------
    // NAVIGATION
    // ---------------------------------------------

    setupNavigation();

    navigateTo(
        AppState.currentView || "dashboard"
    );


    // ---------------------------------------------
    // READY
    // ---------------------------------------------

    console.log("📚 T-chit ready.");
    console.log("Database:", AppState.data);

});


// ---------------------------------------------------------
// NAVIGATION
// ---------------------------------------------------------

function setupNavigation() {

    const navItems =
        document.querySelectorAll(
            ".nav-item[data-view]"
        );

    navItems.forEach(item => {

        item.addEventListener(
            "click",
            event => {

                event.preventDefault();

                navigateTo(
                    item.dataset.view
                );

            }
        );

    });

}


// ---------------------------------------------------------
// NAVIGATE
// ---------------------------------------------------------

function navigateTo(view) {

    // ---------------------------------------------
    // Active navigation item
    // ---------------------------------------------

    document
        .querySelectorAll(".nav-item")
        .forEach(item => {

            item.classList.toggle(
                "active",
                item.dataset.view === view
            );

        });


    // ---------------------------------------------
    // Page titles
    // ---------------------------------------------

    const titles = {

        dashboard: {
            title: "Home",
            subtitle: "Your teaching desk"
        },

        planner: {
            title: "Planner",
            subtitle: "Your teaching week"
        },

        classes: {
            title: "Classes",
            subtitle: "Manage your students and groups"
        },

        teaching: {
            title: "Teaching",
            subtitle: "Units, lessons and resources"
        },

        assessment: {
            title: "Assessment",
            subtitle: "Track learning and progress"
        },

        notes: {
            title: "Notes",
            subtitle: "Your teaching notes"
        },

        settings: {
            title: "Settings",
            subtitle: "T-chit preferences"
        }

    };


    const info =
        titles[view] || titles.dashboard;


    document.getElementById(
        "pageTitle"
    ).textContent = info.title;


    document.getElementById(
        "pageSubtitle"
    ).textContent = info.subtitle;


    // ---------------------------------------------
    // Save current view
    // ---------------------------------------------

    AppState.currentView = view;

    AppState.saveContext();


    // ---------------------------------------------
    // Render view
    // ---------------------------------------------

    switch (view) {

        case "dashboard":

            renderDashboard();

            break;


        case "planner":

            renderPlannerView();

            break;


        case "classes":

            renderClassesView();

            break;


        case "settings":

            renderSettingsView();

            break;

        case "assessment":

            renderAssessmentView();

            break;
            

        default:

            renderPlaceholder(view);

            break;

    }

}


// ---------------------------------------------------------
// PLACEHOLDER
// ---------------------------------------------------------

function renderPlaceholder(view) {

    const container =
        document.getElementById("appView");

    container.innerHTML = `

        <div class="empty-state">

            <div class="empty-state-icon">
                ✎
            </div>

            <h3>
                ${view}
            </h3>

            <p>
                This section is coming next.
            </p>

        </div>

    `;
}


// ---------------------------------------------------------
// START CLASS
// ---------------------------------------------------------

function startClass(classId) {

    if (!classId) {
        console.error(
            "T-chit: no class ID provided."
        );
        return;
    }

    const classItem =
        ClassManager.getById(classId);

    if (!classItem) {
        console.error(
            "T-chit: class not found:",
            classId
        );

        showAlertModal(
            "CLASS NOT FOUND",
            "The selected class could not be found.",
            "error"
        );

        return;
    }

    openClassSession(classId);
}