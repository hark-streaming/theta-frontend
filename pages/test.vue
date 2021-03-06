<template>
    <div>
        <v-btn
        icon
            @click="playerInitialize"
        >
        me button
      </v-btn>
        <video
            id="my_video_1"
            class="video-js vjs-default-skin"
            controls  
        ></video>
    </div>
</template>

<script>
//import videojs from "video.js";

// But what the heck is a theta video player?
// Through some big digging I have unearthed it
// It is an advanced video js plugin
// (https://docs.videojs.com/tutorial-plugins.html)
// (https://blog.videojs.com/feature-spotlight-advanced-plugins/)
// (https://docs.videojs.com/docs/guides/plugins.html)
// that uses hls.js and 20,000 lines of theta tech code
// After that, it just registers itself as a videojs plugin that we can just use
//
// The problem is that it doesn't seem to be registerign as a videojs plugin or tech

export default {
    name: "theta-video-player",

    head() {
        return {
            title: "cool test",
            script: [
                // video js
                // doesn't work with imported videojs
                {
                    hid: "cdnvideojs",
                    src:"https://vjs.zencdn.net/7.10.2/video.min.js",
                    //async: true,
                    callback: () => {
                        console.log("vjs loaded");
                    },
                },
                
                // hls.js
                {
                    hid: "hls",
                    src: "https://cdn.jsdelivr.net/npm/hls.js@latest",
                    //async: true,
                    callback: () => {
                        console.log("hls loaded");
                    },
                },

                // 20,000 lines of theta code
                {
                    hid: "theta",
                    src:
                        //"https://d1ktbyo67sh8fw.cloudfront.net/js/theta.umd.min.js",
                        "/js/theta.js",
                    //async: true,
                    callback: () => {
                        console.log("theta loaded");
                    },
                },

                // an HLS.js plugin made with the theta code (that is also used within the videojs plugin?)
                {
                    hid: "hls-plugin",
                    src:
                        //"https://d1ktbyo67sh8fw.cloudfront.net/js/theta-hls-plugin.umd.min.js",
                        "/js/theta-hls-plugin.js",
                    //async: true,
                    callback: () => {
                        console.log("hls plugin loaded");
                    },
                },

                // the videojs plugin that gets registered that we actually use
                // this has to load last or it doesnt work?
                {
                    hid: "videohlsjs",
                    src:
                        //"https://d1ktbyo67sh8fw.cloudfront.net/js/videojs-theta-plugin.min.js",
                        "/js/videojs-theta-plugin.js",
                    //defer: true,
                    callback: () => {
                        this.scriptsLoaded = true;
                        console.log("theta videojs loaded");
                        this.playerInitialize();    
                    },
                },
            ],
        };
    },

    props: {
        live: { type: Boolean },
        autoplay: { type: Boolean },
        docked: { type: Boolean },
    },

    components: {},

    data() {
        return {
            scriptsLoaded: false,
            initialized: false,

            player: null,
            url:
                "https://bitdash-a.akamaihd.net/content/MI201109210084_1/m3u8s/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.m3u8",
            type: null,

            // stat logging
            watchTimer: null,
            watchDuration: 0,
            watchInterval: 60,
            lastVPQ: null,
        };
    },

    methods: {
        playerInitialize() {
            console.log("scripts loaded variable", this.scriptsLoaded);
            console.log("bro im initializing");
            const optionalHlsOpts = null;
            const player = videojs("my_video_1", {
                techOrder: ["theta_hlsjs"/*, "html5"*/],
                sources: [
                    {
                        src:
                            "https://bitdash-a.akamaihd.net/content/MI201109210084_1/m3u8s/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.m3u8",
                        type: "application/vnd.apple.mpegurl",
                        label: "1080p",
                    },
                ],
                theta_hlsjs: {
                    videoId: "YOUR_INTERNAL_VIDEO_ID",
                    userId: "YOUR_AUTHED_USER_ID",
                    walletUrl:
                        "wss://api-wallet-service.thetatoken.org/theta/ws",
                    onWalletAccessToken: null,
                    hlsOpts: optionalHlsOpts,
                },
                preload: "auto",
            });
            console.log("i am the player", player);  
        },
    },

    async mounted() {
        //this.scriptsLoaded ? console.log("SCRIPTS LOADED"): console.log("SCRIPTS NOT LOADED");

        //this.playerInitialize();

        this.mounted = true;
    },

    beforeDestroy() {},
};
</script>
