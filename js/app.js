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

        CalculationEngine.buildDashboardData();

        Filters.initialize();

        document.getElementById("stockistOnly").checked = true;

        Filters.apply();

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
Default Quarter
==========================================
*/

function setCurrentQuarter() {

    const now = new Date();

    const year = now.getFullYear();

    const month = now.getMonth() + 1;

    let quarter = "";

    if (month <= 3) {

        quarter = "Q1";

    }

    else if (month <= 6) {

        quarter = "Q2";

    }

    else if (month <= 9) {

        quarter = "Q3";

    }

    else {

        quarter = "Q4";

    }

    AppState.filters.quarter = `${year}-${quarter}`;

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

    const button = document.getElementById("refreshButton");

    button.disabled = true;
    button.textContent = "Refreshing...";

    try {

        await Api.loadData();

        CalculationEngine.buildDashboardData();

        /*
        ======================================
        Restore Default Filters
        ======================================
        */

        document.getElementById("stockistOnly").checked = true;

        Filters.populateFilters();

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