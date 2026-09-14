// ----------------------------------------
// T-CHIT — utils.js
// ----------------------------------------

const Utils = {

    // ------------------------------------
    // Unique ID
    // ------------------------------------

    createId(prefix = "id") {

        return `${prefix}_${Date.now()}_${Math.random()
            .toString(36)
            .substring(2, 8)}`;
    },

    // ------------------------------------
    // Escape HTML
    // ------------------------------------

    escapeHTML(value) {

        const div = document.createElement("div");

        div.textContent = value ?? "";

        return div.innerHTML;
    },

    // ------------------------------------
    // Format date
    // ------------------------------------

    formatDate(date = new Date()) {

        return new Intl.DateTimeFormat(
            "en-GB",
            {
                day: "2-digit",
                month: "2-digit",
                year: "numeric"
            }
        ).format(date);
    }
};


// ----------------------------------------
// Global helper
// ----------------------------------------

function escapeHTML(value) {
    return Utils.escapeHTML(value);
}

// =========================================================
// GENERIC ALERT MODAL
// =========================================================

function showAlertModal(
    title,
    message,
    type = "info"
) {

    closeAlertModal();

    const overlay =
        document.createElement(
            "div"
        );

    overlay.id =
        "alertModal";

    overlay.className =
        "modal-overlay";

    overlay.innerHTML = `

        <div class="modal alert-modal">

            <div class="modal-header">

                <div>

                    <h2>
                        ${escapeHTML(title)}
                    </h2>

                </div>

                <button
                    type="button"
                    class="modal-close"
                    onclick="closeAlertModal()">

                    ×

                </button>

            </div>

            <div class="modal-body">

                <div
                    class="
                        alert-modal-message
                        alert-modal-${escapeHTML(type)}
                    ">

                    ${escapeHTML(message)}

                </div>

            </div>

            <div class="modal-footer">

                <button
                    type="button"
                    class="btn-primary"
                    onclick="closeAlertModal()">

                    OK

                </button>

            </div>

        </div>

    `;

    document.body.appendChild(
        overlay
    );

}


// =========================================================
// CLOSE ALERT MODAL
// =========================================================

function closeAlertModal() {

    const modal =
        document.getElementById(
            "alertModal"
        );

    if (modal) {

        modal.remove();

    }

}

// =========================================================
// GENERIC CONFIRM MODAL
// =========================================================

function showConfirmModal(
    title,
    message,
    onConfirm,
    onCancel = null
) {

    closeConfirmModal();

    const overlay =
        document.createElement(
            "div"
        );

    overlay.id =
        "confirmModal";

    overlay.className =
        "modal-overlay";

    overlay.innerHTML = `

        <div class="modal confirm-modal">

            <div class="modal-header">

                <div>

                    <h2>
                        ${escapeHTML(title)}
                    </h2>

                </div>

                <button
                    type="button"
                    class="modal-close"
                    id="confirmModalClose">

                    ×

                </button>

            </div>

            <div class="modal-body">

                <div class="confirm-modal-message">

                    ${escapeHTML(message)}

                </div>

            </div>

            <div class="modal-footer">

                <button
                    type="button"
                    class="btn-secondary"
                    id="confirmModalCancel">

                    CANCEL

                </button>

                <button
                    type="button"
                    class="btn-primary"
                    id="confirmModalConfirm">

                    CONFIRM

                </button>

            </div>

        </div>

    `;

    document.body.appendChild(
        overlay
    );


    // -----------------------------------------
    // CANCEL
    // -----------------------------------------

    const cancel =
        () => {

            closeConfirmModal();

            if (
                typeof onCancel ===
                "function"
            ) {

                onCancel();

            }

        };


    // -----------------------------------------
    // CONFIRM
    // -----------------------------------------

    const confirm =
        () => {

            closeConfirmModal();

            if (
                typeof onConfirm ===
                "function"
            ) {

                onConfirm();

            }

        };


    document
        .getElementById(
            "confirmModalClose"
        )
        ?.addEventListener(
            "click",
            cancel
        );


    document
        .getElementById(
            "confirmModalCancel"
        )
        ?.addEventListener(
            "click",
            cancel
        );


    document
        .getElementById(
            "confirmModalConfirm"
        )
        ?.addEventListener(
            "click",
            confirm
        );

}


// =========================================================
// CLOSE CONFIRM MODAL
// =========================================================

function closeConfirmModal() {

    const modal =
        document.getElementById(
            "confirmModal"
        );

    if (modal) {

        modal.remove();

    }

}