/*
==========================================
Partnership Dashboard
Calculation Engine
==========================================
*/

const CalculationEngine = {

    /*
    ======================================
    Build Dashboard Data
    ======================================
    */

    buildDashboardData(
        history = AppState.historicalData
    ) {

        const customerMap = new Map();

        /*
        ======================================
        Build Customer List (MASTER)
        ======================================
        */

        AppState.customers.forEach(customer => {

            const customerId = String(customer["Customer ID"] || "").trim();

            if (!customerId) return;

            const firstName = String(customer["First Name"] || "").trim();
            const lastName = String(customer["Last Name"] || "").trim();

            customerMap.set(customerId, {

                customerId,

                firstName,

                lastName,

                name: `${firstName} ${lastName}`.trim(),

                email: customer["Email"] || "",

                tags: customer["Tags"] || "",

                updatedTag: customer["UpdatedTag"] || "",

                state: customer["Default Address Province Code"] || "",

                currentTier: "",

                previousQuarterTier: "Member",

                previousPeriodTier: "Member",

                orders: [],

                hasOpenOrders: false,

                openOrderCount: 0,

                metrics: {

                    totalPaid: 0,

                    orderTotal: 0,

                    orderCount: 0,

                    refundCount: 0,

                    refundTotal: 0,

                    averageOrder: 0,

                    storeCredit: 0,

                    giftCard: 0

                },

                points: 0,

                tier: {}

            });

        });


        /*
        ======================================
        Attach Loyalty Points
        Maps Customer ID → Points
        ======================================
        */

        const loyaltyPointsMap = new Map();

        AppState.loyaltyPoints.forEach(row => {

            const customerId =
                String(row["Customer ID"] || "").trim();

            if (!customerId) return;

            const points =
                Number(
                    String(row["Points"] || 0)
                        .replace(/,/g, "")
                        .trim()
                ) || 0;

            loyaltyPointsMap.set(
                customerId,
                points
            );

        });

        customerMap.forEach(customer => {

            customer.points =
                loyaltyPointsMap.get(
                    customer.customerId
                ) || 0;

        });



        /*
        ======================================
        Attach Orders
        ======================================
        */

        history.forEach(order => {

            const customerId = String(order["Customer ID"] || "").trim();

            const customer = customerMap.get(customerId);

            if (!customer) return;

            customer.orders.push(order);

        });


        /*
        ======================================
        Attach Open Orders
        ======================================
        */

        AppState.openOrders.forEach(order => {

            const customerId = String(
                order["Customer ID"] || ""
            ).trim();

            const customer = customerMap.get(customerId);

            if (!customer) return;

            customer.hasOpenOrders = true;

            customer.openOrderCount++;

        });



        /*
        ======================================
        Calculate Metrics
        ======================================
        */

        customerMap.forEach(customer => {

            /*
            ======================================
            Calculate payment metrics first
            ======================================
            */

            this.calculateMetrics(customer);

            /*
            ======================================
            Current Tier
            ======================================
            */

            customer.currentTier =
                this.getTierFromTotalPaid(
                    customer.metrics.totalPaid
                );


            /*
            ======================================
            Tier from Customers UpdatedTag
            ======================================
            */

            customer.previousQuarterTier =
                this.getTierFromUpdatedTag(
                    customer.updatedTag
                );

            /*
            ======================================
            Previous Period Tier
            Based on selected quarter/date range
            ======================================
            */

            customer.previousPeriodTier =
                this.getPreviousPeriodTier(
                    customer.customerId
                );

            /*
            ======================================
            Tier Status
            Compare Previous Quarter Tier
            against Current Tier
            ======================================
            */

            customer.tierStatus =
                this.getTierStatus(
                    customer.previousQuarterTier,
                    customer.currentTier
                );

            /*
            ======================================
            Tier Status II
            Compare Previous Tier
            against Running Tier
            ======================================
            */

            customer.tierStatusII =
                this.getTierStatus(
                    customer.previousPeriodTier,
                    customer.currentTier
                );


            /*
            ======================================
            Current Tier Status
            ======================================
            */

            customer.tier =
                TierEngine.calculate(
                    customer.currentTier,
                    customer.metrics.totalPaid
                );

        });



        AppState.mergedData = [...customerMap.values()];

        console.log(
            "Emma calculation orders:",
            customerMap.get("9282125988094")?.orders
        );

        console.log(
            "Emma calculation order count:",
            customerMap.get("9282125988094")?.orders.length
        );

        AppState.filteredData = [...AppState.mergedData];

        AppState.filteredOpenOrders = [...AppState.openOrders];

    },



    /*
    ======================================
    Current Tier
    ======================================
    */

    getTierFromTotalPaid(totalPaid) {

        const amount = Number(totalPaid) || 0;

        let currentTier = CONFIG.TIERS[0];

        CONFIG.TIERS.forEach(tier => {

            if (amount >= Number(tier.minimum)) {

                currentTier = tier;

            }

        });

        return currentTier.name;

    },

    /*
    ======================================
    Tier from Customers UpdatedTag
    ======================================
    */

    getTierFromUpdatedTag(updatedTag) {

        const tags = String(updatedTag || "")
            .toLowerCase()
            .split(/[,|]/)
            .map(tag => tag.trim())
            .filter(Boolean);


        /*
        ======================================
        Recognized Tier Tags
        ======================================
        */

        if (tags.includes("blue diamond")) {

            return "Blue Diamond";

        }

        if (tags.includes("bluediamond")) {

            return "Blue Diamond";

        }

        if (tags.includes("diamond")) {

            return "Diamond";

        }

        if (tags.includes("platinum")) {

            return "Platinum";

        }

        if (tags.includes("gold")) {

            return "Gold";

        }

        if (tags.includes("silver")) {

            return "Silver";

        }

        if (tags.includes("bronze")) {

            return "Bronze";

        }


        /*
        ======================================
        No recognized tier tag
        ======================================
        */

        return "Member";

    },


    /*
    ======================================
    Compare Tier Status
    ======================================
    */

    getTierStatus(previousTier, currentTier) {

        /*
        ======================================
        No previous tier available
        ======================================
        */

        if (
            !previousTier ||
            previousTier === "—"
        ) {

            return "Maintained";

        }


        /*
        ======================================
        Get tier positions
        ======================================
        */

        const previousIndex =
            CONFIG.TIERS.findIndex(
                tier =>
                    tier.name === previousTier
            );

        const currentIndex =
            CONFIG.TIERS.findIndex(
                tier =>
                    tier.name === currentTier
            );


        /*
        ======================================
        Invalid tier
        ======================================
        */

        if (
            previousIndex === -1 ||
            currentIndex === -1
        ) {

            return "Maintained";

        }


        /*
        ======================================
        Compare tiers
        ======================================
        */

        if (currentIndex > previousIndex) {

            return "Upgrading";

        }

        if (currentIndex < previousIndex) {

            return "Downgrading";

        }

        return "Maintained";

    },

    /*
    ======================================
    Previous Period Tier
    ======================================
    */

    getPreviousPeriodTier(customerId) {

        const filters = AppState.filters || {};

        const customerOrders =
            AppState.historicalData.filter(order => {

                const orderCustomerId =
                    String(order["Customer ID"] || "")
                        .trim();

                return (
                    orderCustomerId ===
                    String(customerId).trim()
                );

            });


        /*
        ======================================
        Previous Quarter
        ======================================
        */

        if (filters.quarter && filters.year) {

            const selectedYear =
                Number(filters.year);

            const selectedQuarter =
                Number(
                    String(filters.quarter)
                        .replace("Q", "")
                );

            if (
                !selectedYear ||
                ![1, 2, 3, 4].includes(selectedQuarter)
            ) {
                return "Member";
            }


            let previousQuarter =
                selectedQuarter - 1;

            let previousYear =
                selectedYear;


            if (previousQuarter === 0) {

                previousQuarter = 4;

                previousYear--;

            }


            const previousOrders =
                customerOrders.filter(order => {

                    const paymentDate =
                        parsePaymentDate(
                            order["UpdatedAt"]
                        );

                    if (!paymentDate) {

                        return false;

                    }


                    const orderDate =
                        parsePaymentDate(
                            order["Created Date"]
                        );

                    if (!orderDate) {

                        return false;

                    }


                    const paymentQuarter =
                        getQuarterFromDate(
                            paymentDate
                        );

                    const orderQuarter =
                        getQuarterFromDate(
                            orderDate
                        );


                    const paymentYear =
                        paymentDate.getFullYear();

                    const orderYear =
                        orderDate.getFullYear();


                    /*
                    Payment and order must
                    belong to same quarter/year
                    */

                    if (
                        paymentQuarter !==
                        orderQuarter
                    ) {

                        return false;

                    }

                    if (
                        paymentYear !==
                        orderYear
                    ) {

                        return false;

                    }


                    /*
                    Previous quarter
                    */

                    return (

                        paymentYear === previousYear &&

                        paymentQuarter ===
                            `Q${previousQuarter}`

                    );

                });


            if (!previousOrders.length) {

                return "Member";

            }


            return this.getTierFromPaymentOrders(
                previousOrders
            );

        }


        /*
        ======================================
        Previous Date Range
        ======================================
        */

        if (
            filters.dateFrom ||
            filters.dateTo
        ) {

            if (
                !filters.dateFrom ||
                !filters.dateTo
            ) {

                return "Member";

            }


            const currentFrom =
                new Date(
                    `${filters.dateFrom}T00:00:00`
                );

            const currentTo =
                new Date(
                    `${filters.dateTo}T23:59:59`
                );


            const periodLength =
                currentTo.getTime() -
                currentFrom.getTime() +
                1;


            const previousFrom =
                new Date(
                    currentFrom.getTime() -
                    periodLength
                );


            const previousTo =
                new Date(
                    currentTo.getTime() -
                    periodLength
                );


            const previousOrders =
                customerOrders.filter(order => {

                    const paymentDate =
                        parsePaymentDate(
                            order["UpdatedAt"]
                        );

                    if (!paymentDate) {

                        return false;

                    }


                    return (

                        paymentDate >= previousFrom &&

                        paymentDate <= previousTo

                    );

                });


            if (!previousOrders.length) {

                return "Member";

            }


            return this.getTierFromPaymentOrders(
                previousOrders
            );

        }


        /*
        ======================================
        No quarter/date filter
        ======================================
        */

        return "Member";

    },

    /*
    ======================================
    Tier from Payment Orders
    ======================================
    */

    getTierFromPaymentOrders(orders) {

        const previousCustomer = {

            customerId: "",

            orders: orders,

            metrics: {

                totalPaid: 0,

                orderTotal: 0,

                orderCount: 0,

                refundCount: 0,

                refundTotal: 0,

                averageOrder: 0,

                storeCredit: 0,

                giftCard: 0

            }

        };


        this.calculateMetrics(
            previousCustomer
        );


        return this.getTierFromTotalPaid(
            previousCustomer.metrics.totalPaid
        );

    },


    /*
    ======================================
    Parse Money
    ======================================
    */

    parseMoney(value) {

        return Number(

            String(value || 0)

                .replace(/,/g, "")

                .replace("$", "")

                .trim()

        );

    },



    /*
    ======================================
    Metrics
    ======================================
    */

    calculateMetrics(customer) {

        let totalPaid = 0;

        let orderTotal = 0;

        let refundTotal = 0;

        let refundCount = 0;

        let orderCount = 0;

        const processedOrders = new Map();

        customer.orders.forEach(order => {

            const amount = this.parseMoney(order["Amount"]);

            const paymentStatus = String(
                order["Payment Status"] || ""
            )
            .trim()
            .toLowerCase();

            const gateway = String(
                order["Payment Gateway"] || ""
            )
            .trim()
            .toLowerCase();

            const total = this.parseMoney(order["Order Total"]);

            const orderName = String(
                order["Order Name"] || ""
            ).trim();

            /*
            ======================================
            Include only completed payments
            ======================================
            */

            const validStatuses = CONFIG.VALID_PAYMENT_STATUSES;

            /*
            ======================================
            Total Paid
            Exclude Store Credit & Gift Card
            ======================================
            */

            const excludedGateways = [

                "shopify_store_credit",

                "gift_card"

            ];

            if (

                validStatuses.includes(paymentStatus) &&

                !excludedGateways.includes(gateway)

            ) {

                totalPaid += amount;

            }

            if (validStatuses.includes(paymentStatus)) {

                switch (gateway) {

                    case "shopify_store_credit":
                        customer.metrics.storeCredit += amount;
                        break;

                    case "gift_card":
                        customer.metrics.giftCard += amount;
                        break;

                }

            }

            /*
            ======================================
            Latest Order Total per Order
            Exclude Pending / Void / Voided
            ======================================
            */

            const excludedOrderStatuses = [

                "pending",

                "void",

                "voided"

            ];

            if (
                orderName &&
                !excludedOrderStatuses.includes(paymentStatus)
            ) {

                /*
                Keep the latest Order Total encountered
                for each Order Name.
                */

                processedOrders.set(
                    orderName,
                    total
                );

            }

            /*
            ======================================
            Refunds
            ======================================
            */

            if (amount < 0) {

                refundCount++;

                refundTotal += Math.abs(amount);

            }

        });

        customer.metrics.totalPaid = totalPaid;

        /*
        ======================================
        Calculate Order Total
        from latest row per order
        ======================================
        */

        orderTotal = 0;

        orderCount = processedOrders.size;

        processedOrders.forEach(total => {

            orderTotal += total;

        });


        customer.metrics.orderTotal = orderTotal;

        customer.metrics.orderCount = orderCount;

        customer.metrics.refundCount = refundCount;

        customer.metrics.refundTotal = refundTotal;

        customer.metrics.averageOrder =

            orderCount === 0

                ? 0

                : orderTotal / orderCount;

    }

};