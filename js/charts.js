/*
==========================================
Partnership Dashboard
Charts
==========================================
*/

const Charts = {

    revenueChart: null,

    tierChart: null,



    /*
    ======================================
    Render All Charts
    ======================================
    */

    render() {

        this.destroyCharts();

        this.renderRevenueChart();

        this.renderTierChart();

    },



    /*
    ======================================
    Destroy Existing Charts
    ======================================
    */

    destroyCharts() {

        if (this.revenueChart) {

            this.revenueChart.destroy();

            this.revenueChart = null;

        }

        if (this.tierChart) {

            this.tierChart.destroy();

            this.tierChart = null;

        }

    },



    /*
    ======================================
    Revenue Trend
    ======================================
    */

    renderRevenueChart() {

        const canvas = document.getElementById("revenueChart");

        if (!canvas) return;

        const revenue = this.getMonthlyRevenue();

        this.revenueChart = new Chart(canvas, {

            type: "line",

            data: {

                labels: revenue.labels,

                datasets: [

                    {

                        label: "Total Paid",

                        data: revenue.values,

                        borderColor: "#24374A",

                        backgroundColor: "rgba(36,55,74,.08)",

                        borderWidth: 3,

                        tension: .35,

                        fill: true,

                        pointRadius: 4,

                        pointHoverRadius: 6

                    }

                ]

            },

            options: {

                responsive: true,

                maintainAspectRatio: false,

                plugins: {

                    legend: {

                        display: false

                    }

                },

                scales: {

                    y: {

                        beginAtZero: true,

                        ticks: {

                            callback(value) {

                                return "$" + value.toLocaleString();

                            }

                        }

                    }

                }

            }

        });

    },



    /*
    ======================================
    Tier Distribution
    ======================================
    */

    renderTierChart() {

        const canvas = document.getElementById("tierChart");

        if (!canvas) return;

        const tiers = this.getTierDistribution();

        this.tierChart = new Chart(canvas, {

            type: "doughnut",

            data: {

                labels: tiers.labels,

                datasets: [

                    {

                        data: tiers.values,

                        backgroundColor: [

                            "#9CA3AF", // Member
                            "#C67A42", // Bronze
                            "#B8C2CC", // Silver
                            "#E3B63F", // Gold
                            "#8B99A8", // Platinum
                            "#42C5F5", // Diamond
                            "#5B7DFF"  // Blue Diamond

                        ],

                        borderWidth: 0,

                        hoverOffset: 8

                    }

                ]

            },

            options: {

                responsive: true,

                maintainAspectRatio: false,

                cutout: "68%",

                plugins: {

                    title: {

                        display: true,

                        text: "Customer Distribution by Tier",

                        font: {

                            size: 16,

                            weight: "600"

                        }

                    },

                    legend: {

                        position: "bottom",

                        labels: {

                            usePointStyle: true,

                            boxWidth: 10,

                            padding: 18

                        }

                    },

                    tooltip: {

                        callbacks: {

                            label(context) {

                                const total = context.dataset.data.reduce(

                                    (a, b) => a + b,

                                    0

                                );

                                const value = context.raw;

                                const percent =

                                    total === 0

                                        ? 0

                                        : ((value / total) * 100).toFixed(1);

                                return `${context.label}: ${value} customers (${percent}%)`;

                            }

                        }

                    }

                }

            }

        });

    },



    /*
    ======================================
    Monthly Revenue
    ======================================
    */

    getMonthlyRevenue() {

        const monthTotals = {};

        AppState.filteredData.forEach(customer => {

            customer.orders.forEach(order => {

                const month = String(order["Month"] || "").trim();

                const amount = Number(order["Amount"]) || 0;

                if (!month) return;

                monthTotals[month] = (monthTotals[month] || 0) + amount;

            });

        });

        const monthOrder = [

            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December"

        ];

        const labels = monthOrder.filter(month => monthTotals[month]);

        return {

            labels,

            values: labels.map(month => monthTotals[month])

        };

    },



    /*
    ======================================
    Tier Distribution
    ======================================
    */

    getTierDistribution() {

        const distribution = {};

        CONFIG.TIERS.forEach(tier => {

            distribution[tier.name] = 0;

        });

        AppState.filteredData.forEach(customer => {

            const tierName = String(customer.currentTier || "")
                .trim()
                .toLowerCase();

            const match = CONFIG.TIERS.find(t =>
                t.name.toLowerCase() === tierName
            );

            if (match) {

                distribution[match.name]++;

            }

        });

        return {

            labels: Object.keys(distribution),

            values: Object.values(distribution)

        };

    }

};