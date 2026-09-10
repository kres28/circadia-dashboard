/*
==========================================
Partnership Dashboard
Customer Table
==========================================
*/

const Table = {

    render() {

        const tbody =
            document.getElementById("customerTableBody");

        tbody.innerHTML = "";

        const customers = [...AppState.filteredData];

        const sort = AppState.sort || {

            column: "totalPaid",

            direction: "desc"

        };

        const dir = sort.direction === "asc" ? 1 : -1;

        customers.sort((a, b) => {

            switch (sort.column) {

                case "totalPaid":
                    return (a.metrics.totalPaid - b.metrics.totalPaid) * dir;

                case "storeCredit":
                    return (a.metrics.storeCredit - b.metrics.storeCredit) * dir;

                case "giftCard":
                    return (a.metrics.giftCard - b.metrics.giftCard) * dir;

                case "orderTotal":
                    return (a.metrics.orderTotal - b.metrics.orderTotal) * dir;

                case "orderCount":
                    return (a.metrics.orderCount - b.metrics.orderCount) * dir;

                case "points":
                    return (Number(a.points || 0) - Number(b.points || 0)) * dir;

                case "status": {

                    const statusOrder = {

                        "Downgrading": 1,

                        "Maintained": 2,

                        "Upgrading": 3

                    };

                    return (
                        (statusOrder[a.tierStatus] || 0) -
                        (statusOrder[b.tierStatus] || 0)
                    ) * dir;

                }

                case "statusII": {

                    const statusOrder = {

                        "Downgrading": 1,

                        "Maintained": 2,

                        "Upgrading": 3

                    };

                    return (
                        (statusOrder[a.tierStatusII] || 0) -
                        (statusOrder[b.tierStatusII] || 0)
                    ) * dir;

                }

                default:
                    return 0;

            }

        });

        customers.forEach(customer => {

            const row = document.createElement("tr");

            row.innerHTML = `

                <td>
                    <div class="customer-name">
                        <strong>${customer.name}</strong>
                        <span>${customer.email}</span>
                    </div>
                </td>

                <td>${Number(customer.points || 0).toLocaleString()}</td>

                <td>

                    ${
                        customer.previousQuarterTier &&
                        customer.previousQuarterTier !== "—"

                        ? `

                            <span class="tier-badge tier-${customer.previousQuarterTier
                                .toLowerCase()
                                .replace(/\s+/g, "-")}">

                                ${customer.previousQuarterTier}

                            </span>

                        `

                        : `

                            <span class="tier-badge tier-member">

                                —

                            </span>

                        `

                    }

                </td>

                <td>

                    <span class="tier-badge tier-${(customer.currentTier || "member")
                        .toLowerCase()
                        .replace(/\s+/g, "-")}">

                        ${customer.currentTier || "Member"}

                    </span>

                </td>

                <td>

                    ${
                        customer.previousPeriodTier &&
                        customer.previousPeriodTier !== "—"

                        ? `

                            <span class="tier-badge tier-${customer.previousPeriodTier
                                .toLowerCase()
                                .replace(/\s+/g, "-")}">

                                ${customer.previousPeriodTier}

                            </span>

                        `

                        : `

                            <span class="tier-badge tier-member">

                                —

                            </span>

                        `

                    }

                </td>

                <td>

                    ${
                        customer.tier.nextTier

                        ? `

                            <span class="tier-badge tier-${customer.tier.nextTier.name
                                .toLowerCase()
                                .replace(/\s+/g,"-")}">

                                ${customer.tier.nextTier.name}

                            </span>

                        `

                        : `

                            <span class="tier-badge highest-tier">

                                Highest Tier

                            </span>

                        `

                    }

                </td>

                <td
                    class="status-column"
                    style="display:${
                        document.getElementById("showStatusColumn")?.checked === false
                            ? "none"
                            : ""
                    };"
                >
                    <span class="status ${customer.tierStatus.toLowerCase()}">
                        ${customer.tierStatus}
                    </span>
                </td>

                <td>
                    <span class="status ${customer.tierStatusII.toLowerCase()}">
                        ${customer.tierStatusII}
                    </span>
                </td>

                <td class="money">
                    ${this.money(customer.metrics.totalPaid)}
                </td>

                <td class="money">
                    ${this.money(customer.metrics.storeCredit)}
                </td>

                <td class="money">
                    ${this.money(customer.metrics.giftCard)}
                </td>

                <td class="money">
                    ${this.money(customer.metrics.orderTotal)}
                </td>

                <td class="money">
                    ${
                        customer.metrics.orderCount > 0
                            ? this.money(
                                customer.metrics.orderTotal /
                                customer.metrics.orderCount
                            )
                            : this.money(0)
                    }
                </td>

                <td class="money">
                    ${
                        customer.tier.nextTier
                            ? this.money(customer.tier.remaining)
                            : "-"
                    }
                </td>

                <td>
                    ${customer.metrics.orderCount}
                </td>

                <td>

                    <div class="progress-track">

                        <div
                            class="progress-fill"
                            style="width:${customer.tier.progress}%">
                        </div>

                    </div>

                    <small>

                        ${customer.tier.progress.toFixed(0)}%

                    </small>

                </td>

            `;

            tbody.appendChild(row);

        });

        this.attachSorting();

    },

    /*
    ==========================================
    Open Orders Table
    ==========================================
    */

    renderOpenOrders() {

        const tbody =
            document.getElementById("openOrdersTableBody");

        if (!tbody) return;

        tbody.innerHTML = "";

        const orders = [...AppState.filteredOpenOrders];

        const sort = AppState.openOrderSort;

        const dir = sort.direction === "asc" ? 1 : -1;

        orders.sort((a, b) => {

            switch (sort.column) {

                case "orderTotal":

                    return (
                        Number(a["Order Total"] || 0) -
                        Number(b["Order Total"] || 0)
                    ) * dir;

                case "createdDate":

                    return (
                        new Date(a["Created Date"]) -
                        new Date(b["Created Date"])
                    ) * dir;

                default:

                    return 0;

            }

        });

        orders.forEach(order => {

            const row = document.createElement("tr");

            row.innerHTML = `

                <td>${order["Order Name"] || ""}</td>

                <td>${order["Customer ID"] || ""}</td>

                <td>${order["Customer Email"] || ""}</td>

                <td>${order["Created Date"] || ""}</td>

                <td class="money">
                    ${this.money(
                        Number(
                            String(order["Order Total"] || 0)
                                .replace(/,/g, "")
                                .replace("$", "")
                        )
                    )}
                </td>

                <td>

                    ${order["Payment Status"] || "-"}

                </td>

                <td>

                    ${order["Fulfillment Status"] || "-"}

                </td>

                <td>

                    ${order["Customer State"] || "-"}

                </td>

            `;

            tbody.appendChild(row);

        });

        this.attachOpenOrderSorting();

    },


    attachSorting() {

        document
            .querySelectorAll("#customerTable th[data-sort]")
            .forEach(header => {

                header.onclick = () => {

                    const column = header.dataset.sort;

                    if (AppState.sort.column === column) {

                        AppState.sort.direction =
                            AppState.sort.direction === "asc"
                                ? "desc"
                                : "asc";

                    } else {

                        AppState.sort.column = column;

                        AppState.sort.direction = "desc";

                    }

                    this.render();

                };

            });

    },


    attachOpenOrderSorting() {

        document
            .querySelectorAll("#openOrdersTable th[data-open-sort]")
            .forEach(header => {

                header.onclick = () => {

                    const column = header.dataset.openSort;

                    if (AppState.openOrderSort.column === column) {

                        AppState.openOrderSort.direction =
                            AppState.openOrderSort.direction === "asc"
                                ? "desc"
                                : "asc";

                    } else {

                        AppState.openOrderSort.column = column;

                        AppState.openOrderSort.direction = "desc";

                    }

                    this.renderOpenOrders();

                };

            });

    },



    money(value) {

        return new Intl.NumberFormat("en-AU", {

            style: "currency",

            currency: "AUD",

            minimumFractionDigits: 2

        }).format(value);

    }

};

