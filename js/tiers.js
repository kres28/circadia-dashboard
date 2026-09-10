/*
==========================================
Partnership Dashboard
Tier Engine
==========================================
*/

const TierEngine = {

    /*
    ======================================
    Get tier object by name
    ======================================
    */

    getTier(tierName) {

        return CONFIG.TIERS.find(t =>
            t.name.toLowerCase() === String(tierName).toLowerCase()
        ) || null;

    },



    /*
    ======================================
    Get tier from paid amount
    ======================================
    */

    getQualifiedTier(amount) {

        let qualified = CONFIG.TIERS[0];

        CONFIG.TIERS.forEach(tier => {

            if (amount >= tier.minimum) {

                qualified = tier;

            }

        });

        return qualified;

    },



    /*
    ======================================
    Next Tier
    ======================================
    */

    getNextTier(currentTier) {

        const index = CONFIG.TIERS.findIndex(t =>
            t.name === currentTier
        );

        if (index === -1) {

            return null;

        }

        if (index === CONFIG.TIERS.length - 1) {

            return null;

        }

        return CONFIG.TIERS[index + 1];

    },



    /*
    ======================================
    Amount remaining to next tier
    ======================================
    */

    amountToNextTier(currentPaid) {

        const nextTier = this.getQualifiedTier(currentPaid);

        const nextIndex = CONFIG.TIERS.findIndex(t =>
            t.name === nextTier.name
        );

        if (nextIndex === CONFIG.TIERS.length - 1) {

            return 0;

        }

        return Math.max(
            0,
            CONFIG.TIERS[nextIndex + 1].minimum - currentPaid
        );

    },



    /*
    ======================================
    Progress %
    ======================================
    */

    getProgress(currentPaid) {

        const qualified = this.getQualifiedTier(currentPaid);

        const index = CONFIG.TIERS.findIndex(t =>
            t.name === qualified.name
        );

        if (index === CONFIG.TIERS.length - 1) {

            return 100;

        }

        const currentMinimum =
            CONFIG.TIERS[index].minimum;

        const nextMinimum =
            CONFIG.TIERS[index + 1].minimum;

        const progress =
            (
                (currentPaid - currentMinimum)
                /
                (nextMinimum - currentMinimum)
            ) * 100;

        return Math.max(
            0,
            Math.min(progress,100)
        );

    },



    /*
    ======================================
    Status
    ======================================
    */

    getStatus(currentTierName, paidAmount) {

        const currentTier =
            this.getTier(currentTierName);

        const qualifiedTier =
            this.getQualifiedTier(paidAmount);

        if (!currentTier) {

            return "Unknown";

        }

        const currentIndex =
            CONFIG.TIERS.findIndex(t =>
                t.name === currentTier.name
            );

        const qualifiedIndex =
            CONFIG.TIERS.findIndex(t =>
                t.name === qualifiedTier.name
            );

        if (qualifiedIndex > currentIndex) {

            return "Upgrading";

        }

        if (qualifiedIndex < currentIndex) {

            return "Downgrading";

        }

        return "Maintained";

    },



    /*
    ======================================
    Complete Summary
    ======================================
    */

    calculate(currentTier, paidAmount) {

        const qualifiedTier =
            this.getQualifiedTier(paidAmount);

        return {

            currentTier,

            qualifiedTier: qualifiedTier.name,

            nextTier:
                this.getNextTier(
                    qualifiedTier.name
                ),

            status:
                this.getStatus(
                    currentTier,
                    paidAmount
                ),

            progress:
                this.getProgress(
                    paidAmount
                ),

            remaining:
                this.amountToNextTier(
                    paidAmount
                )

        };

    }

};