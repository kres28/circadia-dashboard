/*
==========================================
Partnership Dashboard
Application Entry
==========================================
*/

document.addEventListener("DOMContentLoaded", init);

async function init() {

    try {

        console.log("=================================");
        console.log(CONFIG.DASHBOARD.TITLE);
        console.log("Loading...");
        console.log("=================================");

        const savedUrl = localStorage.getItem("sheetUrl");

        if (savedUrl) {

            document.getElementById("sheetUrl").value = savedUrl;

        }

        document
            .getElementById("saveSheetUrl")
            ?.addEventListener("click", async () => {

                const url = document
                    .getElementById("sheetUrl")
                    .value
                    .trim();

                if (!url) {

                    alert("Please enter a Google Sheet URL.");

                    return;

                }

                localStorage.setItem("sheetUrl", url);

                await refreshDashboard();

            });

        await Api.loadData();

        Filters.initialize();

        initializeHelpPanel();

        initializeChartToggle();

        initializeOpenOrders();

        console.log("Dashboard Ready");

    }

    catch (error) {

        console.error(error);

        alert("Failed to initialize dashboard.");

    }

}

/*
==========================================
Refresh
==========================================
*/

document
    .getElementById("refreshButton")
    ?.addEventListener("click", refreshDashboard);

async function refreshDashboard() {

    const button =
        document.getElementById("refreshButton");

    button.disabled = true;

    button.textContent = "Refreshing...";


    /*
    ======================================
    Save Current Filters
    ======================================
    */

    const savedFilters = {

        year:
            document.getElementById("yearFilter").value,

        quarter:
            document.getElementById("quarterFilter").value,

        tier:
            document.getElementById("tierFilter").value,

        tag:
            document.getElementById("tagFilter").value,

        state:
            document.getElementById("stateFilter").value,

        status:
            document.getElementById("statusFilter").value,

        stockist:
            document.getElementById("stockistOnly").checked,

        search:
            document.getElementById("searchCustomer").value,

        from:
            AppState.filters.from || "",

        to:
            AppState.filters.to || ""

    };


    try {

        /*
        ======================================
        Reload Data
        ======================================
        */

        await Api.loadData();


        /*
        ======================================
        Repopulate Filter Options
        ======================================
        */

        Filters.populateFilters();


        /*
        ======================================
        Restore Filter UI
        ======================================
        */

        document.getElementById("yearFilter").value =
            savedFilters.year;

        document.getElementById("quarterFilter").value =
            savedFilters.quarter;

        document.getElementById("tierFilter").value =
            savedFilters.tier;

        document.getElementById("tagFilter").value =
            savedFilters.tag;

        document.getElementById("stateFilter").value =
            savedFilters.state;

        document.getElementById("statusFilter").value =
            savedFilters.status;

        document.getElementById("stockistOnly").checked =
            savedFilters.stockist;

        document.getElementById("searchCustomer").value =
            savedFilters.search;


        /*
        ======================================
        Restore Date Range State
        ======================================
        */

        AppState.filters.from =
            savedFilters.from;

        AppState.filters.to =
            savedFilters.to;


        /*
        ======================================
        Reapply Filters
        ======================================
        */

        Filters.updateFilterStates();

        Filters.apply();

    }

    catch (error) {

        console.error(error);

    }

    finally {

        button.disabled = false;

        button.textContent = "Refresh Data";

    }

}

function initializeChartToggle() {

    const button = document.getElementById("toggleCharts");

    const charts = document.getElementById("dashboardCharts");

    if (!button || !charts) return;

    const hidden = localStorage.getItem("chartsHidden") === "true";

    if (hidden) {

        charts.classList.add("hidden");
        button.textContent = "Show Charts";

    }

    button.addEventListener("click", () => {

        const hidden = charts.classList.toggle("hidden");

        localStorage.setItem("chartsHidden", hidden);

        button.textContent = hidden
            ? "Show Charts"
            : "Hide Charts";

    });

}

/*
==========================================
Open Orders View
==========================================
*/

function initializeOpenOrders() {

    const openOrdersButton =
        document.getElementById("openOrdersButton");

    const backButton =
        document.getElementById("backToDashboard");

    openOrdersButton?.addEventListener("click", showOpenOrders);

    backButton?.addEventListener("click", showDashboard);

}


/*
==========================================
Show Open Orders
==========================================
*/

function showOpenOrders() {

    document
        .getElementById("customerSection")
        ?.classList.add("hidden");

    document
        .getElementById("openOrdersSection")
        ?.classList.remove("hidden");

    Filters.apply();

}


/*
==========================================
Show Dashboard
==========================================
*/

function showDashboard() {

    document
        .getElementById("openOrdersSection")
        ?.classList.add("hidden");

    document
        .getElementById("customerSection")
        ?.classList.remove("hidden");

}


/*
======================================
Help Center
======================================
*/

function initializeHelpPanel() {

    const helpButton =
        document.getElementById("helpButton");

    const helpPanel =
        document.getElementById("helpPanel");

    const closeHelp =
        document.getElementById("closeHelp");

    const helpTabs =
        document.querySelectorAll(".help-tab");

    const helpContents =
        document.querySelectorAll(".help-content");

    if (!helpButton || !helpPanel) return;

    helpButton.addEventListener("click", () => {
        helpPanel.classList.toggle("active");
    });

    closeHelp?.addEventListener("click", () => {
        helpPanel.classList.remove("active");
    });

    helpTabs.forEach(tab => {

        tab.addEventListener("click", () => {

            const target =
                tab.dataset.helpTab;

            helpTabs.forEach(item => {
                item.classList.remove("active");
            });

            helpContents.forEach(content => {
                content.classList.remove("active");
            });

            tab.classList.add("active");

            document
                .querySelector(
                    `[data-help-content="${target}"]`
                )
                ?.classList.add("active");

        });

    });

}
