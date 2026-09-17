/*
==========================================
Partnership Dashboard
Google Sheets Data Loader
==========================================
*/

const Api = {

    /*
    ======================================
    Load all dashboard data
    ======================================
    */

    async loadData() {

        try {

            const [

                customers,

                history,

                openOrders,

                loyaltyPoints

            ] = await Promise.all([

                this.loadSheet(CONFIG.GOOGLE.SHEETS.CUSTOMERS),

                this.loadSheet(CONFIG.GOOGLE.SHEETS.HISTORY),

                this.loadSheet(CONFIG.GOOGLE.SHEETS.OPEN_ORDERS),

                this.loadSheet(
                    CONFIG.GOOGLE.SHEETS.LOYALTY_POINTS
                )

            ]);

            AppState.customers = customers;
            AppState.historicalData = history;
            AppState.openOrders = openOrders;
            AppState.loyaltyPoints = loyaltyPoints;
            console.table(AppState.openOrders.slice(0,5));

            AppState.lastUpdated = new Date();

            console.log("Customers:", customers.length);
            console.log("Historical:", history.length);
            console.log("Open Orders:", openOrders.length);

            return true;

        }

        catch (error) {

            console.error(error);
            alert("Unable to load Google Sheets.");
            return false;

        }

    },



    /*
    ======================================
    Load one sheet
    ======================================
    */

    async loadSheet(sheetName) {

        const spreadsheetId = this.getSpreadsheetId();

        const url =
            `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`;

        const response = await fetch(url, {

            cache: "no-store"

        });

        if (!response.ok) {

            throw new Error(`Unable to load ${sheetName}`);

        }

        const csv = await response.text();

        return this.parseCSV(csv);

    },



    /*
    ======================================
    Get Spreadsheet ID
    ======================================
    */

    // getSpreadsheetId() {

    //     const url = CONFIG.GOOGLE.SHARE_URL;

    //     const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);

    //     if (!match) {

    //         throw new Error("Invalid Google Sheet URL.");

    //     }

    //     return match[1];

    // },

    getSpreadsheetId() {

        const url =
            localStorage.getItem("sheetUrl") ||
            CONFIG.GOOGLE.SHARE_URL;

        if (!url) {

            throw new Error(
                "Google Sheet URL has not been configured."
            );

        }

        const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);

        if (!match) {

            throw new Error("Invalid Google Sheet URL.");

        }

        return match[1];

    },



    /*
    ======================================
    CSV Parser
    ======================================
    */

    parseCSV(csv) {

        const result = Papa.parse(csv, {

            header: true,

            skipEmptyLines: true

        });

        return result.data;

    },



    /*
    ======================================
    Split CSV Row
    Handles commas inside quotes
    ======================================
    */

    splitCSV(line) {

        const result = [];

        let current = "";

        let insideQuotes = false;

        for (let i = 0; i < line.length; i++) {

            const char = line[i];

            if (char === '"') {

                insideQuotes = !insideQuotes;

                continue;

            }

            if (char === "," && !insideQuotes) {

                result.push(current);

                current = "";

                continue;

            }

            current += char;

        }

        result.push(current);

        return result;

    }

};
