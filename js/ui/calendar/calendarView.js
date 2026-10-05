// ----------------------------------------
// T-CHIT — CALENDAR VIEW
// ----------------------------------------
let calendarActiveTab = "academicYear";
function renderCalendarView() {
	const container = document.getElementById("appView");
	if (!container) {
		console.error("T-chit: #appView not found.");
		return;
	}
	container.innerHTML = `
		<div class="calendar-view">
			<div class="view-tabs">
				<button
					type="button"
					class="view-tab ${calendarActiveTab === "academicYear" ? "active" : ""}"
					data-calendar-tab="academicYear">
					ACADEMIC YEAR
				</button>
				<button
					type="button"
					class="view-tab ${calendarActiveTab === "calendar" ? "active" : ""}"
					data-calendar-tab="calendar">
					CALENDAR EVENT
				</button>
			</div>
			<div id="calendarTabContent"></div>
		</div>
	`;
	setupCalendarTabs();
	renderCalendarActiveTab();
}
function setupCalendarTabs() {
	const tabs = document.querySelectorAll(
		"[data-calendar-tab]"
	);
	tabs.forEach(tab => {
		tab.addEventListener("click", () => {
			const selectedTab = tab.dataset.calendarTab;
			if (!selectedTab) {
				return;
			}
			calendarActiveTab = selectedTab;
			document.querySelectorAll(
				"[data-calendar-tab]"
			).forEach(item => {
				item.classList.toggle(
					"active",
					item.dataset.calendarTab === calendarActiveTab
				);
			});
			renderCalendarActiveTab();
		});
	});
}
function renderCalendarActiveTab() {
	const container =
		document.getElementById("calendarTabContent");
	if (!container) {
		return;
	}
	if (calendarActiveTab === "calendar") {
		container.innerHTML =
			renderCalendarEventsTab();
		return;
	}
	container.innerHTML =
		renderAcademicYearTab();
}