const DashboardLogger = {

    endpoint:
        "https://script.google.com/macros/s/AKfycbxqMprMBYiV1S26v0NV6D0xe1gONHzcE-p-XdsrOri1GO0e_AItuAZGRlJk0dHPyOUDdA/exec",

    sessionId: null,

    sessionStart: null,

    lastActivity: null,

    inactivityTimer: null,

    heartbeatTimer: null,

    inactivityLimit: 5 * 60 * 1000,

    heartbeatInterval: 60 * 1000,


    /*
    ======================================
    Initialize
    ======================================
    */

    init() {

        this.sessionId =
            sessionStorage.getItem(
                "dashboardSessionId"
            );

        if (!this.sessionId) {

            this.sessionId =
                crypto.randomUUID();

            sessionStorage.setItem(
                "dashboardSessionId",
                this.sessionId
            );

        }

        this.sessionStart =
            Number(
                sessionStorage.getItem(
                    "dashboardSessionStart"
                )
            ) || Date.now();

        sessionStorage.setItem(
            "dashboardSessionStart",
            this.sessionStart
        );

        this.lastActivity = Date.now();

        this.log("Dashboard Opened");

        this.setupActivityTracking();

        this.startHeartbeat();

        this.setupErrorLogging();

    },


    /*
    ======================================
    Browser
    ======================================
    */

    getBrowser() {

        const ua = navigator.userAgent;

        if (ua.includes("Edg")) return "Edge";
        if (ua.includes("Chrome")) return "Chrome";
        if (ua.includes("Safari")) return "Safari";
        if (ua.includes("Firefox")) return "Firefox";

        return "Other";

    },


    /*
    ======================================
    Operating System
    ======================================
    */

    getOS() {

        const ua = navigator.userAgent;

        if (ua.includes("Windows")) return "Windows";
        if (ua.includes("Mac OS")) return "macOS";
        if (ua.includes("Android")) return "Android";

        if (
            ua.includes("iPhone") ||
            ua.includes("iPad")
        ) {
            return "iOS";
        }

        return "Other";

    },


    /*
    ======================================
    Device
    ======================================
    */

    getDevice() {

        return /Mobi|Android|iPhone|iPad/i.test(
            navigator.userAgent
        )
            ? "Mobile"
            : "Desktop";

    },


    /*
    ======================================
    Activity Tracking
    ======================================
    */

    setupActivityTracking() {

        const events = [
            "click",
            "keydown",
            "scroll",
            "mousemove",
            "touchstart"
        ];

        events.forEach(event => {

            window.addEventListener(
                event,
                () => this.recordActivity(),
                { passive: true }
            );

        });

        this.resetInactivityTimer();

    },


    /*
    ======================================
    Record Activity
    ======================================
    */

    recordActivity() {

        this.lastActivity = Date.now();

        this.resetInactivityTimer();

    },


    /*
    ======================================
    Inactivity Timer
    ======================================
    */

    resetInactivityTimer() {

        clearTimeout(
            this.inactivityTimer
        );

        this.inactivityTimer =
            setTimeout(
                () => this.sessionInactive(),
                this.inactivityLimit
            );

    },


    /*
    ======================================
    Session Inactive
    ======================================
    */

    sessionInactive() {

        if (!this.sessionStart) return;

        const duration =
            Date.now() -
            this.sessionStart;

        this.log(
            "Session Inactive",
            {
                sessionDuration:
                    this.formatDuration(duration)
            }
        );

        this.sessionStart = null;

        clearInterval(
            this.heartbeatTimer
        );

    },


    /*
    ======================================
    Heartbeat
    ======================================
    */

    startHeartbeat() {

        this.heartbeatTimer =
            setInterval(() => {

                if (!this.sessionStart) return;

                const inactiveTime =
                    Date.now() -
                    this.lastActivity;

                if (
                    inactiveTime >=
                    this.inactivityLimit
                ) {

                    this.sessionInactive();

                    return;

                }

                this.log("Activity");

            }, this.heartbeatInterval);

    },


    /*
    ======================================
    Error Logging
    ======================================
    */

    setupErrorLogging() {

        window.addEventListener(
            "error",
            event => {

                this.error(
                    event.message,
                    event.filename,
                    event.lineno,
                    event.colno
                );

            }
        );


        window.addEventListener(
            "unhandledrejection",
            event => {

                const message =
                    event.reason?.message ||
                    String(
                        event.reason ||
                        "Unhandled Promise Rejection"
                    );

                this.error(
                    message,
                    "",
                    "",
                    ""
                );

            }
        );

    },


    /*
    ======================================
    Log Normal Event
    ======================================
    */

    log(event, extra = {}) {

        const payload = {

            sessionId:
                this.sessionId,

            event:
                event,

            browser:
                this.getBrowser(),

            os:
                this.getOS(),

            device:
                this.getDevice(),

            screen:
                `${window.innerWidth}x${window.innerHeight}`,

            url:
                window.location.href,

            referrer:
                document.referrer || "",

            errorMessage:
                "",

            errorSource:
                "",

            sessionDuration:
                extra.sessionDuration || ""

        };

        this.send(payload);

    },


    /*
    ======================================
    Log Error
    ======================================
    */

    error(
        message,
        filename = "",
        line = "",
        column = ""
    ) {

        const source =
            filename
                ? `${filename}:${line}:${column}`
                : "";

        const payload = {

            sessionId:
                this.sessionId,

            event:
                "JavaScript Error",

            browser:
                this.getBrowser(),

            os:
                this.getOS(),

            device:
                this.getDevice(),

            screen:
                `${window.innerWidth}x${window.innerHeight}`,

            url:
                window.location.href,

            referrer:
                document.referrer || "",

            errorMessage:
                message || "",

            errorSource:
                source,

            sessionDuration:
                this.sessionStart
                    ? this.formatDuration(
                        Date.now() -
                        this.sessionStart
                    )
                    : ""

        };

        this.send(payload);

    },


    /*
    ======================================
    Format Duration
    ======================================
    */

    formatDuration(milliseconds) {

        const totalSeconds =
            Math.floor(
                milliseconds / 1000
            );

        const minutes =
            Math.floor(
                totalSeconds / 60
            );

        const seconds =
            totalSeconds % 60;

        return `${minutes}m ${seconds}s`;

    },


    /*
    ======================================
    Send
    ======================================
    */

    send(payload) {

        const body =
            JSON.stringify(payload);

        try {

            const blob =
                new Blob(
                    [body],
                    {
                        type:
                            "text/plain;charset=utf-8"
                    }
                );

            const sent =
                navigator.sendBeacon(
                    this.endpoint,
                    blob
                );

            if (sent) {
                return;
            }

        } catch (error) {

            // Fall back to fetch

        }

        fetch(
            this.endpoint,
            {
                method: "POST",
                mode: "no-cors",
                headers: {
                    "Content-Type":
                        "text/plain;charset=utf-8"
                },
                body: body,
                keepalive: true
            }
        ).catch(() => {

            // Logging must never break the dashboard

        });

    }

};
