<template>
    <!-- Theta Web Widget -->
    <div
        id="theta-section"
        ref="theta-section"
        class="pa-3"
        style="min-height: 300px"
    >
        <div id="MY_THETA_WEB_WIDGET_ID"></div>
    </div>
</template>

<script>
export default {
    // head() {
    //     return {
    //         script: [
    //             {
    //                 hid: "ThetaWebWidget",
    //                 type: "application/javascript",
    //                 src: "https://theta-web-widgets.thetatoken.org/js/ThetaWebWidgets.js"
    //             }
    //         ]
    //     }

    // },
    methods: {
        createThetaObj(vid_id, vid_url, userId){
            const PEER_SERVER_HOST = "prod-theta-peerjs.thetatoken.org";
            const PEER_SERVER_PORT = 8700;
            const TRACKER_SERVER_HOST = "prod-testnet-grouping.thetatoken.org";
            const TRACKER_SERVER_PORT = 8700;

            const PLATFORM_THETA_WALLET_SERVICE_URL =
                "wss://api-wallet-service.thetatoken.org/theta/ws";

            // TODO Fill these in with your data
            const VIDEO_ID = vid_id;
            //const VIDEO_URL = "https://video-dev.github.io/streams/x36xhzz/x36xhzz.m3u8";
            const VIDEO_URL = vid_url
                "https://bitdash-a.akamaihd.net/content/MI201109210084_1/m3u8s/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.m3u8";
            let theta = new Theta({
                //TODO adjust params as needed depending on your HLS settings
                fragmentSize: 5000,
                failoverFactor: 0.7,
                fragmentTimeout: 3000,
                probeTimeout: 600,
                statsReportInterval: 90000,
                peerReqInterval: 120000,

                videoId: VIDEO_ID,
                userId: userId,
                wallet: null,

                peerServer: {
                    host: PEER_SERVER_HOST,
                    port: PEER_SERVER_PORT,
                    secure: true,
                },
                trackerServer: {
                    host: TRACKER_SERVER_HOST,
                    port: TRACKER_SERVER_PORT,
                    secure: true,
                    path: "",
                },

                debug: true,
            });

            // Event handlers
            theta.addEventListener(Theta.Events.PEERS_CHANGED, function (data) {
                // Connected peers changed
                // Data:
                // totalPeers : Integer
            });
            theta.addEventListener(Theta.Events.TRAFFIC, function (data) {
                // Bandwidth was used
                // Data:
                // type : String ('cdn', 'p2p_inbound', 'p2p_outbound')
                // stats : Object
                // stats.size : Integer - Total bytes
            });
            theta.addEventListener(
                Theta.Events.PAYMENT_RECEIVED,
                function (data) {
                    // Payment received
                    // Data:
                    // payment : Object - info about the payment
                    // payment.amount : Integer - Payment amount in GammaWei
                }
            );
            theta.addEventListener(Theta.Events.PAYMENT_SENT, function (data) {
                // Payment sent
                // Data:
                // payment : Object - info about the payment
                // payment.amount : Integer - Payment amount in GammaWei
            });
            theta.addEventListener(
                Theta.Events.ACCOUNT_UPDATED,
                function (data) {
                    // Account/waller updated
                    // Data:
                    // account : Object - info about the account/wallet
                }
            );
            theta.start();

            //If you are using the Theta widget, connect the widget so it can listen to events
            theta.connectWidget();

            console.log("new theta created", theta);

            return theta;
        },
    },

    async mounted() {
        // theta web widget
        if (process.browser) {
            console.log("connecting the theta widget");
            //console.log(window.Theta);
            //window.Theta.connectWidget();

            // const PEER_SERVER_HOST = "prod-theta-peerjs.thetatoken.org";
            // const PEER_SERVER_PORT = 8700;
            // const TRACKER_SERVER_HOST = "prod-testnet-grouping.thetatoken.org";
            // const TRACKER_SERVER_PORT = 8700;

            // const PLATFORM_THETA_WALLET_SERVICE_URL =
            //     "wss://api-wallet-service.thetatoken.org/theta/ws";

            // // TODO Fill these in with your data
            // const VIDEO_ID = "vid123";
            // //const VIDEO_URL = "https://video-dev.github.io/streams/x36xhzz/x36xhzz.m3u8";
            // const VIDEO_URL =
            //     "https://bitdash-a.akamaihd.net/content/MI201109210084_1/m3u8s/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.m3u8";
            // let theta = new Theta({
            //     //TODO adjust params as needed depending on your HLS settings
            //     fragmentSize: 5000,
            //     failoverFactor: 0.7,
            //     fragmentTimeout: 3000,
            //     probeTimeout: 600,
            //     statsReportInterval: 90000,
            //     peerReqInterval: 120000,

            //     videoId: VIDEO_ID,
            //     userId: "1234",
            //     wallet: null,

            //     peerServer: {
            //         host: PEER_SERVER_HOST,
            //         port: PEER_SERVER_PORT,
            //         secure: true,
            //     },
            //     trackerServer: {
            //         host: TRACKER_SERVER_HOST,
            //         port: TRACKER_SERVER_PORT,
            //         secure: true,
            //         path: "",
            //     },

            //     debug: true,
            // });

            // // Event handlers
            // theta.addEventListener(Theta.Events.PEERS_CHANGED, function (data) {
            //     // Connected peers changed
            //     // Data:
            //     // totalPeers : Integer
            // });
            // theta.addEventListener(Theta.Events.TRAFFIC, function (data) {
            //     // Bandwidth was used
            //     // Data:
            //     // type : String ('cdn', 'p2p_inbound', 'p2p_outbound')
            //     // stats : Object
            //     // stats.size : Integer - Total bytes
            // });
            // theta.addEventListener(
            //     Theta.Events.PAYMENT_RECEIVED,
            //     function (data) {
            //         // Payment received
            //         // Data:
            //         // payment : Object - info about the payment
            //         // payment.amount : Integer - Payment amount in GammaWei
            //     }
            // );
            // theta.addEventListener(Theta.Events.PAYMENT_SENT, function (data) {
            //     // Payment sent
            //     // Data:
            //     // payment : Object - info about the payment
            //     // payment.amount : Integer - Payment amount in GammaWei
            // });
            // theta.addEventListener(
            //     Theta.Events.ACCOUNT_UPDATED,
            //     function (data) {
            //         // Account/waller updated
            //         // Data:
            //         // account : Object - info about the account/wallet
            //     }
            // );
            // theta.start();

            // //If you are using the Theta widget, connect the widget so it can listen to events
            // theta.connectWidget();

            //console.log("i made a new theta", theta);
            this.createThetaObj("testman", "https://bitdash-a.akamaihd.net/content/MI201109210084_1/m3u8s/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.m3u8","12345")
            var widget = new ThetaWebWidgets.OverviewWithTrafficChartWidget();
            widget.setTheme(ThetaWebWidgets.Themes.Light);
            widget.setMainMessage("TEST TIME");
            widget.render("MY_THETA_WEB_WIDGET_ID");
        }
    },
};
</script>