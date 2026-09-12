/*
==========================================
Partnership Dashboard
Dashboard
==========================================
*/

const Dashboard = {

    render() {

        this.renderKPIs();
        this.renderTableSummary();
        this.renderTierGuide();

    },

    /*
    ======================================
    KPI Cards
    ======================================
    */

    renderKPIs() {

        const container = document.getElementById("kpiContainer");

        const customers = AppState.filteredData;

        const totalCustomers = customers.length;

        const totalPaid = customers.reduce(
            (sum, customer) => sum + customer.metrics.totalPaid,
            0
        );

        const totalOrderValue = customers.reduce(
            (sum, customer) => sum + customer.metrics.orderTotal,
            0
        );

        const totalStoreCredit = customers.reduce(
            (sum, customer) => sum + customer.metrics.storeCredit,
            0
        );

        const totalGiftCard = customers.reduce(
            (sum, customer) => sum + customer.metrics.giftCard,
            0
        );

        const totalOrders = customers.reduce(
            (sum, customer) => sum + customer.metrics.orderCount,
            0
        );

        const upgrading = customers.filter(c =>
            c.tier.status === "Upgrading"
        ).length;

        const maintained = customers.filter(c =>
            c.tier.status === "Maintained"
        ).length;

        const downgrading = customers.filter(c =>
            c.tier.status === "Downgrading"
        ).length;

        container.innerHTML = "";

        container.appendChild(
            this.createCard("Total Customers", totalCustomers)
        );

        container.appendChild(
            this.createCard("Total Paid", this.money(totalPaid))
        );

        container.appendChild(
            this.createCard("Total Order Value", this.money(totalOrderValue))
        );

        container.appendChild(
            this.createCard(
                "Store Credit Used",
                this.money(totalStoreCredit)
            )
        );

        container.appendChild(
            this.createCard(
                "Gift Card Used",
                this.money(totalGiftCard)
            )
        );

        container.appendChild(
            this.createCard("Total Orders", totalOrders)
        );

        container.appendChild(
            this.createCard("Upgrading", upgrading)
        );

        container.appendChild(
            this.createCard("Maintained", maintained)
        );

        container.appendChild(
            this.createCard("Downgrading", downgrading)
        );

    },



    /*
    ======================================
    KPI Card
    ======================================
    */

    createCard(title, value) {

        const card = document.createElement("div");

        card.className = "card";

        card.innerHTML = `
            <label>${title}</label>
            <h2>${value}</h2>
        `;

        return card;

    },



    /*
    ======================================
    Table Summary
    ======================================
    */

    renderTableSummary() {

        const summary =
            document.getElementById("tableSummary");

        summary.innerHTML =
            `${AppState.filteredData.length} Customers`;

    },

   /*
    ======================================
    Tier Guide
    ======================================
    */

    renderTierGuide() {

        const container = document.getElementById("tierGuideList");

        if (!container || !CONFIG.TIERS) return;

        container.innerHTML = CONFIG.TIERS.map(tier => `
            <div class="tier-guide-item">
                <span class="tier-guide-name">${tier.name}</span>
                <span class="tier-guide-amount">
                    ${new Intl.NumberFormat(CONFIG.DASHBOARD.DATE_FORMAT, {
                        style: "currency",
                        currency: CONFIG.DASHBOARD.CURRENCY,
                        minimumFractionDigits: 0
                    }).format(tier.minimum)}
                </span>
            </div>
        `).join("");

    },


    /*
    ======================================
    Currency
    ======================================
    */

    money(value) {

        return new Intl.NumberFormat("en-AU", {

            style: "currency",

            currency: "AUD",

            minimumFractionDigits: 2

        }).format(value);

    }

};
