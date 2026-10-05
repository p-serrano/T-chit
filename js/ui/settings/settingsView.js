// ----------------------------------------
// T-CHIT — SETTINGS VIEW
// ----------------------------------------
function renderSettingsView() {
	const container =
		document.getElementById("appView");
	if (!container) {
		console.error("T-chit: #appView not found.");
		return;
	}
	container.innerHTML = `
		<div class="settings-view">
			<div class="settings-section">
				<div class="view-label">
					PRIVATE ACCESS
				</div>
				<div class="academic-year-name">
					Connect this device to your T-chit data
				</div>
				<div class="access-key-row">
					<input
						id="tchitAccessKey"
						type="password"
						placeholder="Enter access key"
						autocomplete="off">
					<button
						class="btn-primary"
						onclick="connectTchitDevice()">
						CONNECT
					</button>
				</div>
				<div
					id="tchitAccessStatus"
					class="page-subtitle">
					This device is not connected yet.
				</div>
			</div>
		</div>
	`;
}
// ----------------------------------------
// Connect T-chit device
// ----------------------------------------
async function connectTchitDevice() {
	const input =
		document.getElementById(
			"tchitAccessKey"
		);
	const status =
		document.getElementById(
			"tchitAccessStatus"
		);
	const key =
		input.value.trim();
	if (!key) {
		status.textContent =
			"Enter your access key.";
		return;
	}
	status.textContent =
		"Connecting...";
	setTchitAccessKey(key);
	const remote =
		await SupabaseSync.load();
	if (!remote || !remote.data) {
		status.textContent =
			"Unable to connect. Check your access key.";
		return;
	}
	AppState.data =
		remote.data;
	Storage.save(
		AppState.data
	);
	const academicYears =
		AppState.data.academicYears || [];
	if (
		!AppState.currentAcademicYearId &&
		academicYears.length === 1
	) {
		AppState.currentAcademicYearId =
			academicYears[0].id;
		AppState.saveContext();
	}
	status.textContent =
		"Connected successfully.";
	renderSettingsView();
	updateAcademicYearBadge(
		AppState.getCurrentAcademicYear()
	);
	console.log(
		"T-chit: device connected to remote data."
	);
}