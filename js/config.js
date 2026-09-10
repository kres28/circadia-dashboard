/*
==========================================
Partnership Dashboard
Configuration
==========================================
*/

const CONFIG = {

    /*
    ======================================
    Google Sheets
    ======================================
    */

    GOOGLE: {

        // Replace these before deployment

        // API_KEY: "",
        // SHEET_ID: "",
        SHARE_URL: "",
        SHEETS: {
            CUSTOMERS: "Customers",
            HISTORY: "HistoricalData",
            OPEN_ORDERS: "Open Orders",
            LOYALTY_POINTS: "LoyaltyPointsApp"
        }

    },



    /*
    ======================================
    Dashboard
    ======================================
    */

    DASHBOARD: {

        TITLE: "Partnership Dashboard",

        COMPANY: "Circadia Australia",

        CURRENCY: "AUD",

        DATE_FORMAT: "en-AU",

        MONEY_FORMAT: "en-AU"

    },



    /*
    ======================================
    Tier Thresholds
    ======================================
    */

    TIERS: [

        {
            name: "Member",
            minimum: 0
        },

        {
            name: "Bronze",
            minimum: 3000
        },

        {
            name: "Silver",
            minimum: 6000
        },

        {
            name: "Gold",
            minimum: 10500
        },

        {
            name: "Platinum",
            minimum: 15000
        },

        {
            name: "Diamond",
            minimum: 22500
        },

        {
            name: "Blue Diamond",
            minimum: 30000
        }

    ],

    /*
    ======================================
    Payment Statuses
    Included in Total Paid
    ======================================
    */

    VALID_PAYMENT_STATUSES: [

        "paid",

        "partially_paid",

        "refunded",

        "refund",

        "partially_refunded"

    ],



    /*
    ======================================
    Cache
    ======================================
    */

    CACHE: {

        ENABLED: true,

        DURATION_MINUTES: 5

    }

};



/*
==========================================
Global App State
==========================================
*/

const AppState = {

    customers: [],

    historicalData: [],

    openOrders: [],

    mergedData: [],

    filteredData: [],

    filteredOpenOrders: [],

    lastUpdated: null,

    selectedCustomer: null,

    sort: {

        column: "totalPaid",

        direction: "desc"

    },

    openOrderSort: {

        column: "createdDate",

        direction: "desc"

    },

    filters: {

        dateFrom: null,

        dateTo: null,

        year: "",

        quarter: "",

        tier: "",

        tag: "",

        status: "",

        stockistsOnly: false,

        search: ""

    }

};