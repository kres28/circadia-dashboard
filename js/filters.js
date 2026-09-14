/*
==========================================
Partnership Dashboard
Filters
==========================================
*/

    /*
    ==========================================
    State Mapping
    ==========================================
    */

    const STATE_MAP = {

        "NEW SOUTH WALES": "NSW",

        "QUEENSLAND": "QLD",

        "VICTORIA": "VIC",

        "WESTERN AUSTRALIA": "WA",

        "SOUTH AUSTRALIA": "SA",

        "TASMANIA": "TAS",

        "NORTHERN TERRITORY": "NT",

        "AUSTRALIAN CAPITAL TERRITORY": "ACT"

    };

/*
==========================================
Payment Date Helpers
==========================================
*/

function parsePaymentDate(value) {

    if (value === null || value === undefined) {
        return null;
    }

    const text = String(value).trim();

    if (!text) {
        return null;
    }


    /*
    ======================================
    MM/DD/YYYY
    ======================================
    */

    const slashMatch = text.match(
        /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/
    );

    if (slashMatch) {

        const month = Number(slashMatch[1]);
        const day = Number(slashMatch[2]);
        const year = Number(slashMatch[3]);

        const date = new Date(
            year,
            month - 1,
            day
        );

        date.setHours(0, 0, 0, 0);

        return date;

    }


    /*
    ======================================
    YYYY-MM-DD
    ======================================
    */

    const isoDateMatch = text.match(
        /^(\d{4})-(\d{1,2})-(\d{1,2})$/
    );

    if (isoDateMatch) {

        const year = Number(isoDateMatch[1]);
        const month = Number(isoDateMatch[2]);
        const day = Number(isoDateMatch[3]);

        const date = new Date(
            year,
            month - 1,
            day
        );

        date.setHours(0, 0, 0, 0);

        return date;

    }


    /*
    ======================================
    ISO Timestamp
    Example:
    2026-07-08T15:20:15.000+08:00
    ======================================
    */

    const isoTimestamp = new Date(text);

    if (!isNaN(isoTimestamp.getTime())) {

        isoTimestamp.setHours(0, 0, 0, 0);

        return isoTimestamp;

    }


    return null;

}


function getQuarterFromDate(date) {

    if (!date) return "";

    const month = date.getMonth() + 1;

    if (month <= 3) return "Q1";

    if (month <= 6) return "Q2";

    if (month <= 9) return "Q3";

    return "Q4";

}

const Filters = {

    /*
    ======================================
    Initialize
    ======================================
    */

    initialize() {

        this.populateFilters();

        this.initializeDateRangePicker();

        this.attachEvents();

        this.updateFilterStates();

        this.toggleStatusColumn();

        this.apply();

    },


    /*
    ======================================
    Date Range Picker
    ======================================
    */

    initializeDateRangePicker() {

        const dateRange =
            document.getElementById("dateRange");

        AppState.dateRangePicker = flatpickr(dateRange, {

            mode: "range",

            dateFormat: "Y-m-d",

            allowInput: false,

            onChange: (selectedDates) => {

                if (selectedDates.length === 2) {

                    const formatDate = date =>
                        `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

                    AppState.filters.from =
                        formatDate(selectedDates[0]);

                    AppState.filters.to =
                        formatDate(selectedDates[1]);

                    if (
                        savedFilters.from &&
                        savedFilters.to &&
                        AppState.dateRangePicker
                    ) {
                        AppState.dateRangePicker.setDate(
                            [
                                savedFilters.from,
                                savedFilters.to
                            ],
                            false
                        );
                    }

                    // Clear Year and Quarter
                    document.getElementById("yearFilter").value = "";
                    document.getElementById("quarterFilter").value = "";

                    this.apply();

                }

            },

            onReady: (selectedDates, dateStr, instance) => {

                const clearButton =
                    document.createElement("button");

                clearButton.type = "button";

                clearButton.textContent = "Clear";

                clearButton.className =
                    "flatpickr-clear-button";

                clearButton.addEventListener("click", () => {

                    instance.clear();

                    AppState.filters.from = "";
                    AppState.filters.to = "";

                    document.getElementById("yearFilter").disabled = false;
                    document.getElementById("quarterFilter").disabled = false;

                    // Restore current year
                    const currentYear =
                        new Date().getFullYear().toString();

                    document.getElementById("yearFilter").value =
                        currentYear;

                    this.apply();

                    instance.close();

                });

                instance.calendarContainer
                    .appendChild(clearButton);

            }

        });

    },



    /*
    ======================================
    Populate Filters
    ======================================
    */

    populateFilters() {
        this.populateYears();
        this.populateQuarters();
        this.populateActiveTiers();
        this.populateTiers();
        this.populateTags();
        this.populateStates();
    },



    /*
    ======================================
    Years
    ======================================
    */

    populateYears() {
        const select = document.getElementById("yearFilter");

        select.innerHTML = `<option value="">All Years</option>`;

        const years = [...new Set(
            AppState.historicalData
                .map(o => o["Year"])
                .filter(Boolean)
        )]
        .sort((a, b) => Number(b) - Number(a));

        years.forEach(year => {
            select.innerHTML += `
                <option value="${year}">${year}</option>
            `;
        });

        // Automatically select the current year
        const currentYear = new Date().getFullYear();

        if (years.includes(String(currentYear))) {
            select.value = String(currentYear);
        }
    },



    /*
    ======================================
    Quarters
    ======================================
    */

    populateQuarters() {

        const select = document.getElementById("quarterFilter");

        select.innerHTML = `<option value="">All Quarters</option>`;

        const quarters = [...new Set(

            AppState.historicalData.map(o => o["Quarter"])

        )].filter(Boolean);

        ["Q1","Q2","Q3","Q4"].forEach(q => {

            if (quarters.includes(q)) {

                select.innerHTML +=
                    `<option value="${q}">${q}</option>`;

            }

        });

    },



    /*
    ======================================
    Tiers
    ======================================
    */

    populateTiers() {

        const select = document.getElementById("tierFilter");

        select.innerHTML = `<option value="">All Running Tiers</option>`;

        CONFIG.TIERS.forEach(tier => {

            select.innerHTML +=
                `<option value="${tier.name}">${tier.name}</option>`;

        });

    },

    /*
    ======================================
    Active Tiers
    ======================================
    */

    populateActiveTiers() {

        const select =
            document.getElementById("activeTierFilter");

        select.innerHTML =
            `<option value="">All Tiers</option>`;

        CONFIG.TIERS.forEach(tier => {

            select.innerHTML +=
                `<option value="${tier.name}">${tier.name}</option>`;

        });

    },



    /*
    ======================================
    Tags
    ======================================
    */

    populateTags() {

        const select = document.getElementById("tagFilter");

        select.innerHTML = `<option value="">All Tags</option>`;

        const tags = new Set();

        AppState.customers.forEach(customer => {

            const value = String(customer["Tags"] || "");

            value.split(/[,|]/)

                .map(t => t.trim())

                .filter(Boolean)

                .forEach(tag => tags.add(tag));

        });

        [...tags].sort().forEach(tag => {

            select.innerHTML +=
                `<option value="${tag}">${tag}</option>`;

        });

    },



    /*
    ======================================
    Events
    ======================================
    */

    attachEvents() {

        [

            "yearFilter",
            "quarterFilter",
            "activeTierFilter",
            "tierFilter",
            "tagFilter",
            "stateFilter",
            "statusFilter",
            "stockistOnly"

        ].forEach(id => {

            document
                .getElementById(id)
                .addEventListener("change", () => this.apply());

        });

        document
            .getElementById("searchCustomer")
            .addEventListener("input", () => this.apply());

        document
            .getElementById("showStatusColumn")
            .addEventListener("change", () => this.toggleStatusColumn());

        document
            .getElementById("openOrderValueFilter")
            ?.addEventListener("change", () => this.apply());

        document
            .getElementById("newCustomerFilter")
            ?.addEventListener("change", () => this.apply());

    },

    toggleStatusColumn() {

        const checkbox =
            document.getElementById("showStatusColumn");

        const show = checkbox.checked;

        const header =
            document.getElementById("statusColumn");

        if (header) {
            header.style.display = show ? "" : "none";
        }

        document
            .querySelectorAll(".status-column")
            .forEach(cell => {
                cell.style.display = show ? "" : "none";
            });
    },

   /*
    ======================================
    States
    ======================================
    */

    populateStates() {

        const select =
            document.getElementById("stateFilter");

        select.innerHTML =
            `<option value="">All States</option>`;

        const states = [
            ...new Set(
                AppState.customers
                    .map(customer =>
                        String(
                            customer["Default Address Province Code"] || ""
                        )
                            .trim()
                            .toUpperCase()
                    )
                    .filter(Boolean)
            )
        ].sort();

        states.forEach(state => {

            select.innerHTML +=
                `<option value="${state}">${state}</option>`;

        });

    },

    /*
    ======================================
    Enable / Disable Filter Controls
    ======================================
    */

    updateFilterStates() {

        const dateRange =
            document.getElementById("dateRange");

        const year =
            document.getElementById("yearFilter");

        const quarter =
            document.getElementById("quarterFilter");

        const hasDate =
            Boolean(AppState.filters.from) ||
            Boolean(AppState.filters.to);

        const hasYear =
            year.value !== "";

        // Custom date selected
        year.disabled = hasDate;
        quarter.disabled = hasDate;

        // Year selected
        if (dateRange) {
            dateRange.disabled = hasYear;
        }

    },


    /*
    ======================================
    Previous Period Orders
    ======================================
    */

    getPreviousPeriodOrders(filters) {

        /*
        ======================================
        No period filter
        ======================================
        */

        if (!filters.quarter && !filters.from && !filters.to) {

            return [];

        }


        /*
        ======================================
        Previous Quarter
        ======================================
        */

        if (filters.quarter) {

            const selectedYear =
                Number(
                    filters.year ||
                    new Date().getFullYear()
                );

            let quarter =
                String(filters.quarter)
                    .toUpperCase()
                    .replace(/^\d{4}-/, "");

            const quarterNumber =
                Number(quarter.replace("Q", ""));

            if (!quarterNumber) {
                return [];
            }

            let previousQuarter =
                quarterNumber - 1;

            let previousYear =
                selectedYear;

            /*
            Q1 → previous year's Q4
            */

            if (previousQuarter === 0) {

                previousQuarter = 4;
                previousYear--;

            }

            const previousQuarterName =
                `Q${previousQuarter}`;

            return AppState.historicalData.filter(order => {

                const paymentDate =
                    parsePaymentDate(order["UpdatedAt"]);

                if (!paymentDate) {
                    return false;
                }

                const orderDate =
                    parsePaymentDate(order["Created Date"]);

                if (!orderDate) {
                    return false;
                }

                const paymentYear =
                    paymentDate.getFullYear();

                const orderYear =
                    orderDate.getFullYear();

                const paymentQuarter =
                    getQuarterFromDate(paymentDate);

                const orderQuarter =
                    getQuarterFromDate(orderDate);


                /*
                Payment and order must
                belong to the same quarter/year
                */

                if (paymentYear !== orderYear) {
                    return false;
                }

                if (paymentQuarter !== orderQuarter) {
                    return false;
                }


                /*
                Previous quarter
                */

                if (paymentYear !== previousYear) {
                    return false;
                }

                if (paymentQuarter !== previousQuarterName) {
                    return false;
                }

                return true;

            });

        }


        /*
        ======================================
        Previous Custom Date Range
        ======================================
        */

        if (filters.from && filters.to) {

            const currentFrom =
                parsePaymentDate(filters.from);

            const currentTo =
                parsePaymentDate(filters.to);

            if (!currentFrom || !currentTo) {
                return [];
            }


            /*
            Calculate inclusive range length
            */

            const millisecondsPerDay =
                1000 * 60 * 60 * 24;

            const days =
                Math.round(
                    (currentTo - currentFrom) /
                    millisecondsPerDay
                ) + 1;


            /*
            Previous range ends the day
            before the current range
            */

            const previousTo =
                new Date(currentFrom);

            previousTo.setDate(
                previousTo.getDate() - 1
            );

            previousTo.setHours(23, 59, 59, 999);


            /*
            Previous range starts
            `days` before previousTo
            */

            const previousFrom =
                new Date(currentFrom);

            previousFrom.setDate(
                previousFrom.getDate() - days
            );

            previousFrom.setHours(0, 0, 0, 0);


            return AppState.historicalData.filter(order => {

                const paymentDate =
                    parsePaymentDate(order["UpdatedAt"]);

                if (!paymentDate) {
                    return false;
                }

                const orderDate =
                    parsePaymentDate(order["Created Date"]);

                if (!orderDate) {
                    return false;
                }


                /*
                Payment and order must still
                belong to the same quarter/year
                */

                if (
                    paymentDate.getFullYear() !==
                    orderDate.getFullYear()
                ) {
                    return false;
                }

                if (
                    getQuarterFromDate(paymentDate) !==
                    getQuarterFromDate(orderDate)
                ) {
                    return false;
                }


                /*
                Previous date range
                */

                if (paymentDate < previousFrom) {
                    return false;
                }

                if (paymentDate > previousTo) {
                    return false;
                }

                return true;

            });

        }


        return [];

    },


    /*
    ======================================
    Apply Filters
    ======================================
    */

    apply() {

        const filters = {

            year:

                document.getElementById("yearFilter").value,

            quarter:

                document.getElementById("quarterFilter").value,

            tier:

                document.getElementById("tierFilter").value,

            activeTier:
                document.getElementById("activeTierFilter").value,

            tag:

                document.getElementById("tagFilter").value,
            
            state:

                document.getElementById("stateFilter").value,

            status:

                document.getElementById("statusFilter").value,

            search:

                document.getElementById("searchCustomer")
                    .value
                    .trim()
                    .toLowerCase(),

            stockist:

                document.getElementById("stockistOnly").checked,

            from: AppState.filters.from || "",

            to: AppState.filters.to || "",

            openOrderValue:
                document.getElementById("openOrderValueFilter")?.value || "",

            newCustomer:
                document.getElementById("newCustomerFilter")?.value || ""

        };

        /*
        ======================================
        Update UI
        ======================================
        */

        this.updateFilterStates();

        /*
        ======================================
        Save Active Filters
        ======================================
        */

        AppState.filters.year = filters.year;
        AppState.filters.quarter = filters.quarter;
        AppState.filters.from = filters.from;
        AppState.filters.to = filters.to;



        /*
        ======================================
        Filter HistoricalData
        Uses UpdatedAt as Payment Date
        ======================================
        */

        const filteredOrders = AppState.historicalData.filter(order => {

            /*
            ======================================
            Payment Date
            ======================================
            */

            const paymentDate =
                parsePaymentDate(order["UpdatedAt"]);

                console.log("PAYMENT DATE CHECK:", {
                    order: order["Order Name"],
                    rawUpdatedAt: order["UpdatedAt"],
                    parsedPaymentDate: paymentDate
                });

            /*
            ======================================
            Skip rows without UpdatedAt
            ======================================
            */

            if (!paymentDate) {

                return false;

            }

            /*
            ======================================
            Order Date
            ======================================
            */

            const orderDate =
                parsePaymentDate(order["Created Date"]);

            /*
            ======================================
            Skip if order date is invalid
            ======================================
            */

            if (!orderDate) {

                return false;

            }

            /*
            ======================================
            Payment Quarter
            Must match Order Quarter
            ======================================
            */

            const paymentQuarter =
                getQuarterFromDate(paymentDate);

            const orderQuarter =
                getQuarterFromDate(orderDate);

            if (paymentQuarter !== orderQuarter) {

                return false;

            }

            /*
            ======================================
            Payment Year
            Must match Order Year
            ======================================
            */

            const paymentYear =
                paymentDate.getFullYear();

            const orderYear =
                orderDate.getFullYear();

            if (paymentYear !== orderYear) {

                return false;

            }

            /*
            ======================================
            Selected Year
            Uses Payment Date
            ======================================
            */

            if (filters.year) {

                if (paymentYear != Number(filters.year)) {

                    return false;

                }

            }

            /*
            ======================================
            Selected Quarter
            Uses Payment Date
            ======================================
            */

            if (filters.quarter) {

                /*
                Supports both:
                Q3
                2026-Q3
                */

                const selectedQuarter =
                    String(filters.quarter)
                        .trim()
                        .toUpperCase();

                const paymentQuarterValue =
                    `${paymentYear}-${paymentQuarter}`;

                if (

                    selectedQuarter !== paymentQuarter &&

                    selectedQuarter !== paymentQuarterValue

                ) {

                    return false;

                }

            }

            /*
            ======================================
            Custom Date From
            Uses UpdatedAt
            ======================================
            */

            if (filters.from) {

                const fromDate =
                    parsePaymentDate(filters.from);

                if (fromDate && paymentDate < fromDate) {

                    return false;

                }

            }

            /*
            ======================================
            Custom Date To
            Uses UpdatedAt
            ======================================
            */

            if (filters.to) {

                const toDate =
                    parsePaymentDate(filters.to);

                if (toDate) {

                    // Include the entire selected end date
                    toDate.setHours(23, 59, 59, 999);

                    if (paymentDate > toDate) {

                        return false;

                    }

                }

            }

            console.log("PAYMENT FILTER PASS:", {
                order: order["Order Name"],
                updatedAt: order["UpdatedAt"],
                paymentDate: paymentDate,
                paymentQuarter: paymentQuarter,
                orderQuarter: orderQuarter,
                paymentYear: paymentYear,
                orderYear: orderYear,
                selectedYear: filters.year,
                selectedQuarter: filters.quarter,
                from: filters.from,
                to: filters.to
            });

            return true;

        });



        /*
        ======================================
        Recalculate Dashboard
        ======================================
        */

        const previousPeriodOrders =
            this.getPreviousPeriodOrders(filters);

        CalculationEngine.buildDashboardData(
            filteredOrders,
            previousPeriodOrders
        );



        /*
        ======================================
        Customer Filters
        ======================================
        */

        AppState.filteredData = AppState.mergedData.filter(customer => {

            const tags = String(customer.tags || "")
            .toLowerCase()
            .split(/[,|]/)
            .map(tag => tag.trim())
            .filter(Boolean);

            /*
            ======================================
            Active Tier Filter
            Filters the Tier column
            ======================================
            */

            if (filters.activeTier) {

                const activeTier =
                    String(customer.previousQuarterTier || "")
                        .trim()
                        .toLowerCase();

                const selectedActiveTier =
                    String(filters.activeTier)
                        .trim()
                        .toLowerCase();

                if (activeTier !== selectedActiveTier) {
                    return false;
                }

            }

            /*
            ======================================
            Running Tier Filter
            Filters the Running Tier column
            ======================================
            */

            if (filters.tier) {

                const currentTier = String(customer.currentTier || "")
                    .trim()
                    .toLowerCase();

                const selectedTier = String(filters.tier)
                    .trim()
                    .toLowerCase();

                if (currentTier !== selectedTier) {

                    return false;

                }

            }

            if (filters.state) {

                const state = String(customer.state || "")
                    .trim()
                    .toUpperCase();

                const selectedState = String(filters.state)
                    .trim()
                    .toUpperCase();

                if (state !== selectedState) {

                    return false;

                }

            }


            /*
            ======================================
            Status Filter
            Filters Status II column
            ======================================
            */

            if (filters.status) {
                const statusII = String(customer.tierStatusII || "")
                    .trim()
                    .toLowerCase();

                const statusMap = {
                    upgrade: "upgrading",
                    maintained: "maintained",
                    downgrade: "downgrading"
                };

                if (statusII !== statusMap[filters.status]) return false;
            }



            if (filters.tag) {

                if (!tags.includes(filters.tag.toLowerCase())) {

                    return false;

                }

            }



            if (filters.stockist) {

                if (!tags.includes("stockist")) {

                    return false;

                }

            }



            if (filters.search) {

                const search = [

                    customer.customerId,

                    customer.name,

                    customer.email,

                    customer.currentTier,

                    customer.state

                ]
                .join(" ")
                .toLowerCase();

                if (!search.includes(filters.search)) {

                    return false;

                }

            }

            return true;

        });

        /*
        ======================================
        Open Orders
        Latest Entry Per Order
        ======================================
        */

        const latestOpenOrders = new Map();

        AppState.openOrders.forEach(order => {

            const orderName = String(order["Order Name"] || "")
                .trim();

            if (!orderName) return;

            // Later rows overwrite earlier rows
            latestOpenOrders.set(orderName, order);

        });

        AppState.filteredOpenOrders = [...latestOpenOrders.values()].filter(order => {

            /*
            ======================================
            Hide Fulfilled Orders
            Latest status wins
            ======================================
            */

            const fulfillmentStatus = String(
                order["Fulfillment Status"] || ""
            )
                .trim()
                .toLowerCase();

            // Hide fully fulfilled orders (case-insensitive)
            if (fulfillmentStatus.includes("fulfilled") &&
                !fulfillmentStatus.includes("partially")) {

                return false;

            }

            /*
            ======================================
            Year
            ======================================
            */

            if (filters.year && order["Year"] != filters.year) {

                return false;

            }

            /*
            ======================================
            Quarter
            ======================================
            */

            if (filters.quarter && order["Quarter"] != filters.quarter) {

                return false;

            }

            /*
            ======================================
            State
            ======================================
            */

            if (filters.state) {

                const state = STATE_MAP[
                    String(order["Customer State"] || "")
                        .trim()
                        .toUpperCase()
                ] || "";

                if (state !== filters.state.toUpperCase()) {

                    return false;

                }

            }

            /*
            ======================================
            Order Value Filter
            ======================================
            */

            if (filters.openOrderValue === "5000") {

                const orderTotal = Number(
                    String(order["Order Total"] || 0)
                        .replace(/,/g, "")
                        .replace("$", "")
                        .trim()
                ) || 0;

                if (orderTotal <= 5000) {
                    return false;
                }

            }

            /*
            ======================================
            Tags
            ======================================
            */

            if (filters.tag) {

                const tags = String(order["Customer Tags"] || "")
                    .toLowerCase()
                    .split(/[,|]/)
                    .map(tag => tag.trim())
                    .filter(Boolean);

                if (!tags.includes(filters.tag.toLowerCase())) {

                    return false;

                }

            }

            /*
            ======================================
            Stockists
            ======================================
            */

            if (filters.stockist) {

                const tags = String(order["Customer Tags"] || "")
                    .toLowerCase();

                if (!tags.includes("stockist")) {

                    return false;

                }

            }

            /*
            ======================================
            Search
            ======================================
            */

            if (filters.search) {

                const search = [

                    order["Order Name"],

                    order["Customer ID"],

                    order["Customer Email"]

                ]
                .join(" ")
                .toLowerCase();

                if (!search.includes(filters.search)) {

                    return false;

                }

            }

            /*
            ======================================
            Custom Date
            ======================================
            */

            const orderDate = new Date(order["Created Date"]);

            orderDate.setHours(0, 0, 0, 0);

            if (filters.from) {

                const from = new Date(filters.from);

                from.setHours(0, 0, 0, 0);

                if (orderDate < from) {

                    return false;

                }

            }

            if (filters.to) {

                const to = new Date(filters.to);

                to.setHours(0, 0, 0, 0);

                if (orderDate > to) {

                    return false;

                }

            }

            console.log({
                order: order["Order Name"],
                tags: order["Customer Tags"]
            });

            return true;

        });


        const showingOpenOrders =
            !document
                .getElementById("openOrdersSection")
                ?.classList.contains("hidden");

        if (showingOpenOrders) {

            Table.renderOpenOrders();

        } else {

            Dashboard.render();

            Table.render();

            Charts.render();

        }

        this.toggleStatusColumn();

    }

};
 
