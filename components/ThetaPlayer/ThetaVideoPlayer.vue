<template>
    <div>
        <div
            :class="{
                'detach-player': docked,
                'elevation-6': docked,
            }"
        >
            <video
                id="streamplayer"
                class="video-js vjs-custom-skin vjs-big-play-centered vjs-16-9"
                controls
                playsinline
                preload="auto"
                :autoplay="autoplay"
                :poster="posterCacheBusted"
                :style="{ width: '100%' }"
            ></video>
            <!-- <div id="MY_THETA_WEB_WIDGET_ID"></div> -->
            <!-- Detached player topbar overlay -->
            <slot name="minioverlay">
                <div v-if="docked" class="d-flex align-center detach-overlay">
                    <!-- Title Slot -->
                    <slot name="title">
                        <h5 class="white--text body-2 ml-2">Default Title</h5>
                    </slot>

                    <v-spacer />

                    <!-- option addon slot button -->
                    <slot name="addon"></slot>

                    <!-- Close Button -->
                    <v-btn
                        color="white"
                        text
                        icon
                        pa-0
                        @click="setDetach(false)"
                    >
                        <v-icon color="white">close</v-icon>
                    </v-btn>
                </div>
            </slot>
        </div>
    </div>
</template>

<script>
import videojs from "video.js";
import hls from "hls.js";

// if(process.brower){
//     import Theta from "../../static/js/theta.js"
// }

//import "@videojs/http-streaming";
//import "videojs-contrib-quality-levels";
//import "videojs-hls-quality-selector";
//import "@/assets/js/VideoPlayer/TriSpinner";

import "@/assets/js/VideoPlayer/ThetaHls";
import { auth } from "@/plugins/firebase.js";

import { mapState, mapGetters, mapMutations, mapActions } from "vuex";

import { Player } from "@/store/player";

// But what the heck is a theta video player?
// Through some big digging I have unearthed it
// It is an advanced video js plugin
// (https://docs.videojs.com/tutorial-plugins.html)
// (https://blog.videojs.com/feature-spotlight-advanced-plugins/)
// (https://docs.videojs.com/docs/guides/plugins.html)
// that uses hls.js and 20,000 lines of theta tech code
// the purpose of the plugin is to register the "theta_hlsjs" tech that we use
//
// The problem is that it doesn't seem to be registerign as a videojs plugin or tech
// Ok here's why it wasn't: the theta script that registers the plugin must be called after all other scripts
// and also it doesn't like the libraries for some reason

// UPDATE: I made a plugin to handle the tech registering, and now you only need
// to load the one theta script. Thank god.

export default {
    name: "theta-video-player",

    head() {
        return {
            script: [
                {
                    hid: "Thetacode",
                    //src: "https://d1ktbyo67sh8fw.cloudfront.net/js/theta.umd.min.js",
                    src: "/js/theta.js",
                    callback: () => {
                        console.log("theta cdn script loaded");
                        //this.isAuthed = auth.onAuthStateChanged( async user => await this.authenticated( user ) );
                        // im just going to put a settimeout here bc I don't want to set up the wait for firebase auth
                        // TODO: Set up firebase auth waiter
                        setTimeout(() => this.playerInitialize(), 500 );
                        //this.playerInitialize();
                    },
                },
                {  
                    // hid: "thetawebwidget",
                    // src: "https://theta-web-widgets.thetatoken.org/js/ThetaWebWidgets.js",
                    // callback: () => {
                    //     if (process.browser) {
                    //         console.log("connecting the theta widget");

                    //         //console.log("i made a new theta", theta);
                    //         //this.createThetaObj("testman", "https://bitdash-a.akamaihd.net/content/MI201109210084_1/m3u8s/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.m3u8","12345")
                    //         var widget = new ThetaWebWidgets.OverviewWithTrafficChartWidget();
                    //         widget.setTheme(ThetaWebWidgets.Themes.Light);
                    //         widget.setMainMessage("TEST TIME");
                    //         widget.render("MY_THETA_WEB_WIDGET_ID");

                    //         //console.log("the window event listeners", getEventListeners(window));
                    //     }
                    // },
                },
            ],
        };
    },

    props: {
        live: { type: Boolean },
        autoplay: { type: Boolean },
        docked: { type: Boolean },
        streamer: { type: String },
    },

    components: {},

    data() {
        return {
            initialized: false,
            isAuthed: false,

            player: null,
            url: null,
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
            // This plugin call registers the stuff needed for the Theta videojs player
            console.log("CALLING ThetaPlayerSetup function");
            // this.$ThetaPlayerSetup(this.createThetaObj("testman", "https://bitdash-a.akamaihd.net/content/MI201109210084_1/m3u8s/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.m3u8","12345")
            // , hls, videojs);
            
            this.$ThetaPlayerSetup(window.Theta, hls, videojs);

            //turn theta debugging on
            window.Theta.setDebug(true);
            console.log("this is the wallet", window.Theta.Wallet);
            console.log("this is the P2P", window.Theta.P2P);
            console.log("this is the default config before player", window.Theta.DefaultConfig);

            //console.log("this is window theta", window.Theta);

            console.log("INITIALIZING PLAYER");
            console.log(
                `URL: ${this.source.url}, TYPE: ${this.source.type}, POSTER: ${this.poster}, AUTOPLAY: ${this.autoplay}, POSTER: ${this.poster}`
            );

            this.initialized = false;

            // Create video.js player
            this.player = videojs("streamplayer", {
                //#region Theta stuff
                techOrder: ["theta_hlsjs" /*, "html5"*/], // disable html5 fallback so we know when theta broken
                theta_hlsjs: {
                    videoId: this.streamer,
                    // TODO: make sure firebase auth is loaded by this point
                    //       so there is no accidental userId/guestId mismatch
                    userId: this.getUserId(),
                    walletUrl:
                        "wss://api-wallet-service.thetatoken.org/theta/ws",
                    onWalletAccessToken: this.getWalletAccessToken,
                    hlsOpts: {
                        overrideNative: !videojs.browser.IS_SAFARI,
                        allowSeeksWithinUnsafeLiveWindow: true,
                        enableLowInitialPlaylist: false,
                        handlePartialData: true,
                        smoothQualityChange: true,
                    },
                },
                //#endregion theta stuff

                sources: [{ src: this.source.url, type: this.source.type }],
                poster: this.poster,
                //sources: [{ src: this.source.url, type: this.source.type }],
                autoplay: this.autoplay,

                // UI Options
                liveui: true,
                fluid: true,
                fill: false,
                // aspectRation: '16:9',
                suppressNotSupportedError: true,

                playbackRates: [0.25, 0.5, 1, 1.25, 1.5, 2],
                plugins: {
                    //qualityLevels: {},
                    /*bitwaveTriSpinner: {
                        size: 58,
                    },*/
                    //examplePlugin: {},
                },
                inactivityTimeout: 2000,
                controlBar: {
                    currentTimeDisplay: false,
                    timeDivider: false,
                    durationDisplay: false,
                    remainingTimeDisplay: false,
                },
                userActions: {
                    hotkeys: true,
                },
                html5: {
                    hls: {
                        overrideNative: !videojs.browser.IS_SAFARI,
                        allowSeeksWithinUnsafeLiveWindow: true,
                        enableLowInitialPlaylist: false,
                        handlePartialData: true,
                        smoothQualityChange: true,
                    },
                },
                liveTracker: {
                    trackingThreshold: 0,
                    liveTolerance: 10,
                },
            });

            window.$bw = {
                player: this.player,
                getVideoLogs: this.player.log.history,
                hls: null,
                vhs: null,
            };

            // --- Video.js plugin functions

            // Add reloadSourceOnError plugin
            //this.player.reloadSourceOnError({ errorInterval: 10 });

            // Load all qualities
            // this.qualityLevels = this.player.qualityLevels();
            // this.player.hlsQualitySelector({
            //     displayCurrentQuality: true,
            // });

            // Autoplay detection magic
            /*const autoPlayEvents = [ 'loadedmetadata', 'durationchange' ];
        const autoPlayListener = event => {
          // Attempt Autoplay
          const attemptAutoplay = () => {
            this.player.play()
              .then(() => {
                if ( process.env.APP_DEBUG ) console.log( `Autoplayed` )
              })
              .catch ( error => {
                if ( process.env.APP_DEBUG ) console.log( `Autoplay prevented, Attempting to autoplay muted.`, error );
                this.player.muted( true );
                this.player.play();
              });
          };
          if (event.type === 'durationchange' && this.player.duration() === Infinity) {
            attemptAutoplay();
            this.player.off( autoPlayEvents, autoPlayListener );
          }
          if (event.type === 'loadedmetadata') {
            attemptAutoplay();
            this.player.off( autoPlayEvents, autoPlayListener );
          }
        };
        this.player.on( autoPlayEvents, autoPlayListener ); //*/

            // Video Player Ready
            this.player.ready(async () => {
                // Restore Volume & mute
                try {
                    console.debug(
                        `Volume: ${this.player.volume()}, Muted: ${this.player.muted()}`
                    );
                    let muted = JSON.parse(localStorage.getItem("muted"));
                    if (muted !== null) this.player.muted(muted);
                    let volume = localStorage.getItem("volume");
                    if (volume !== null) this.player.volume(volume);
                } catch (error) {
                    console.warn(
                        `Failed to read 'volume' or 'muted' from localStorage`,
                        error
                    );
                }

                // const playerTech = this.player.tech({
                //     IWillNotUseThisInPlugins: true,
                // });

                // playerTech.on("retryplaylist", (event) => {
                //     console.log(`retryplaylist:`, event);
                //     if (!this.live) console.log(`livestream is offline.`);
                // });

                // playerTech.on("usage", (event) => {
                //     console.log(`${event.name}:`, event);
                // });

                // "Keep Live" Feature
                this.player.liveTracker.on("liveedgechange", async () => {
                    // Only respond to when we fall behind
                    if (this.player.liveTracker.atLiveEdge()) {
                        // Set to 1x playback rate once we catch up
                        this.player.playbackRate(1);
                        return;
                    }

                    // This is currently an opt-in feature
                    if (!this.pinToLive) return;

                    // Don't respond to when user has paused the player
                    if (this.player.paused()) return;

                    console.log("We have fallen behind live!");

                    setTimeout(() => {
                        // Do not jump ahead if user has paused the player
                        if (this.player.paused()) return;

                        console.log("Attempting to catch back up to live.");
                        this.player.liveTracker.seekToLiveEdge();
                    }, 5 * 1000);
                });

                console.log(`Player ready`);

                this.initialized = true;
            });

            // Scroll to adjust volume
            // player.controlBar.volumePanel.volumeControl
            const volumeControlElement = this.player.controlBar.volumePanel.volumeControl.el();

            const handleVolumeScroll = (event) => {
                event.preventDefault();
                if (this.player.muted()) return;
                const vol = this.player.volume();
                // Scroll 'up'
                if (event.deltaY < 0)
                    this.player.volume(Math.min(1.0, vol + 0.05));
                // Scroll 'down'
                if (event.deltaY > 0)
                    this.player.volume(Math.max(0.0, vol - 0.05));
            };

            // Player is active (mouseover)
            /*this.player.on( 'useractive', () => {
          volumeControlElement.addEventListener( 'wheel', handleVolumeScroll );
        });

        // Player is inactive
        this.player.on( 'userinactive', () => {
          volumeControlElement.removeEventListener( 'wheel', handleVolumeScroll );
        });*/

            // Add event listener by default in case user loads with cursor over stream
            volumeControlElement.addEventListener(
                "wheel",
                handleVolumeScroll,
                true
            );

            //---------------------------
            // UX Tweaks & Enhancements
            //---------------------------

            // Prevent volume bar from pushing around the live button
            const controlBar = this.player.controlBar;
            const removeHover = (el) => el.removeClass("vjs-hover");
            const removeVolumePanelHover = () =>
                removeHover(controlBar.volumePanel);
            // disable default behavior
            controlBar.volumePanel.off("mouseout");
            // reset on control bar mouse out
            controlBar.on("mouseleave", removeVolumePanelHover);
            // reset when mouseover spacer
            controlBar.customControlSpacer.on(
                "mouseenter",
                removeVolumePanelHover
            );

            // remove UI instantly when mouse leaves player
            this.player.on("mouseleave", () =>
                this.$nextTick(() => this.player.userActive(false))
            );
            //--------------------------------------------------------------------

            // Save volume on change
            this.player.on("volumechange", () => {
                if (!this.initialized) return;
                const volume = this.player.volume();
                const muted = this.player.muted();
                if (
                    typeof volume === "undefined" ||
                    typeof muted === "undefined"
                )
                    return;
                try {
                    localStorage.setItem("volume", volume);
                    localStorage.setItem("muted", muted);
                } catch (error) {
                    console.warn(
                        `Failed to save 'volume' and 'muted' to localStorage`,
                        error
                    );
                }
            });

            // PiP events
            this.player.on("enterpictureinpicture", () => {
                this.setPiP(true);
                this.setDetach(false);
            });

            this.player.on("leavepictureinpicture", () => {
                this.setPiP(false);
            });

            // Begin playing when new media is loaded
            this.player.on("loadeddata", () => {
                if (!window.$bw.vhs && this.live)
                    window.$bw.vhs = this.player.tech({
                        IWillNotUseThisInPlugins: true,
                    }).vhs;
            });

            this.player.on("ended", async () => {
                this.$emit("ended");
            });

            this.player.on("error", (error) => {
                // Brush player errors under the rug
                if (!this.live)
                    console.log("streamer offline and got an error");
                console.warn(`Player error:`, error);
            });
        },

        // createThetaObj(vid_id, vid_url, userId){
        //     const PEER_SERVER_HOST = "prod-theta-peerjs.thetatoken.org";
        //     const PEER_SERVER_PORT = 8700;
        //     const TRACKER_SERVER_HOST = "prod-testnet-grouping.thetatoken.org";
        //     const TRACKER_SERVER_PORT = 8700;

        //     const PLATFORM_THETA_WALLET_SERVICE_URL =
        //         "wss://api-wallet-service.thetatoken.org/theta/ws";

        //     // TODO Fill these in with your data
        //     const VIDEO_ID = vid_id;
        //     //const VIDEO_URL = "https://video-dev.github.io/streams/x36xhzz/x36xhzz.m3u8";
        //     const VIDEO_URL = vid_url
        //         "https://bitdash-a.akamaihd.net/content/MI201109210084_1/m3u8s/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.m3u8";
        //     let theta = new Theta({
        //         //TODO adjust params as needed depending on your HLS settings
        //         fragmentSize: 5000,
        //         failoverFactor: 0.7,
        //         fragmentTimeout: 3000,
        //         probeTimeout: 600,
        //         statsReportInterval: 90000,
        //         peerReqInterval: 120000,

        //         videoId: VIDEO_ID,
        //         userId: userId,
        //         wallet: null,

        //         peerServer: {
        //             host: PEER_SERVER_HOST,
        //             port: PEER_SERVER_PORT,
        //             secure: true,
        //         },
        //         trackerServer: {
        //             host: TRACKER_SERVER_HOST,
        //             port: TRACKER_SERVER_PORT,
        //             secure: true,
        //             path: "",
        //         },

        //         debug: true,
        //     });

        //     // Event handlers
        //     theta.addEventListener(Theta.Events.PEERS_CHANGED, function (data) {
        //         // Connected peers changed
        //         // Data:
        //         // totalPeers : Integer
        //     });
        //     theta.addEventListener(Theta.Events.TRAFFIC, function (data) {
        //         // Bandwidth was used
        //         // Data:
        //         // type : String ('cdn', 'p2p_inbound', 'p2p_outbound')
        //         // stats : Object
        //         // stats.size : Integer - Total bytes
        //     });
        //     theta.addEventListener(
        //         Theta.Events.PAYMENT_RECEIVED,
        //         function (data) {
        //             // Payment received
        //             // Data:
        //             // payment : Object - info about the payment
        //             // payment.amount : Integer - Payment amount in GammaWei
        //         }
        //     );
        //     theta.addEventListener(Theta.Events.PAYMENT_SENT, function (data) {
        //         // Payment sent
        //         // Data:
        //         // payment : Object - info about the payment
        //         // payment.amount : Integer - Payment amount in GammaWei
        //     });
        //     theta.addEventListener(
        //         Theta.Events.ACCOUNT_UPDATED,
        //         function (data) {
        //             // Account/waller updated
        //             // Data:
        //             // account : Object - info about the account/wallet
        //         }
        //     );
        //     theta.start();

        //     //If you are using the Theta widget, connect the widget so it can listen to events
        //     theta.connectWidget();

        //     console.log("new theta created", theta);

        //     return theta;
        // },

        trackWatchTime() {
            if (this.player.paused() || !this.live) {
                return;
            }

            this.watchDuration += this.watchInterval;

            this.$emit("stats", {
                duration: this.watchDuration / 60,
                interval: this.watchInterval / 60,
            });

            this.checkDroppedFrames();
        },

        playerDispose() {
            if (this.player) this.player.dispose();
        },

        reloadPlayer() {
            // this.player.reset(); this.player.load();
            if (!this.initialized) {
                console.log(
                    `reloadPlayer() called but player is not initialized yet!`
                );
                return;
            }
            console.log(
                `Reloading player with source: ${this.url} / ${this.type}`
            );
            this.player.poster = this.poster;

            this.player.poster = () => this.poster;

            this.player.src({ src: this.url, type: this.type });
        },

        // Logs & reports dropped frames
        checkDroppedFrames() {
            // disable reporting when stream is offline
            if (!this.live) return;

            // Ensure we have access to HLS tech & stats
            if (!$bw || !$bw.vhs || !$bw.vhs.stats) return;

            if (!this.lastVPQ) {
                this.lastVPQ = { ...$bw.vhs.stats.videoPlaybackQuality };
                return;
            }

            const playbackQuality = { ...$bw.vhs.stats.videoPlaybackQuality };

            // Ensure we have enough data to prevent false positives
            if (!playbackQuality.totalVideoFrames > 600) return;

            // Detect how many frames we have dropped since our last check
            const percentDroppedFrames =
                ((playbackQuality.droppedVideoFrames -
                    this.lastVPQ.droppedVideoFrames) /
                    (playbackQuality.totalVideoFrames -
                        this.lastVPQ.totalVideoFrames)) *
                100;

            // Log dropped frames at various levels
            if (percentDroppedFrames >= 5)
                console.warn(
                    `We have dropped more than 20% of frames!\n${percentDroppedFrames.toFixed(
                        1
                    )}% of frames (${
                        playbackQuality.droppedVideoFrames -
                        this.lastVPQ.droppedVideoFrames
                    }) dropped since our last check.`
                );
            else if (percentDroppedFrames >= 1)
                console.log(
                    `We have dropped more than 5% of frames!\n${percentDroppedFrames.toFixed(
                        1
                    )}% of frames (${
                        playbackQuality.droppedVideoFrames -
                        this.lastVPQ.droppedVideoFrames
                    }) dropped since our last check.`
                );
            else if (percentDroppedFrames > 0)
                console.debug(
                    `Good news, we have dropped very few (if any) frames.\nOnly ${percentDroppedFrames.toFixed(
                        1
                    )}% of frames (${
                        playbackQuality.droppedVideoFrames -
                        this.lastVPQ.droppedVideoFrames
                    }) dropped since our last check.`
                );

            // Log dropped frames for analyzing and finding bottlenecked regions
            const label =
                (this.$route.params.watch || "").toLowerCase() || "unknown";
            this.$ga.event({
                eventCategory: "playback-errors",
                eventAction: "dropped-frames",
                eventLabel: label,
                eventValue: percentDroppedFrames,
            });

            if (percentDroppedFrames && percentDroppedFrames > 0.05)
                this.$analytics.logEvent("dropped_frames", {
                    value: percentDroppedFrames,
                });

            // Update for next loop
            this.lastVPQ = { ...$bw.vhs.stats.videoPlaybackQuality };
        },

        // From https://docs.thetatoken.org/docs/theta-p2p-javascript-sdk
        async getWalletAccessToken() {
            // Get the user id token, if it exits
            const idToken = await this.getAuthUserIdToken();
            //const idToken = "123";

            //Check if a user is logged in...
            if (idToken == null) {
                //No user is logged in, no wallet will be used
                return null;
            }

            //This API should check the user's auth
            let body = await this.$axios.post(
                `https://us-central1-hark-e2efe.cloudfunctions.net/api/utils/jwtauth`,
                { idToken: idToken }
            );

            //Return the access token from the request body
            console.log("wallet access token return", body.data.access_token);
            return body.data.access_token;
        },

        // returns the user's id auth token if they are logged in, otherwise, null
        async getAuthUserIdToken() {
            // not logged in, return null
            if (auth.currentUser == null) {
                //console.log("USER NOT LOGGED IN");
                return null;
            }

            // logged in, return auth token
            else {
                const token = await auth.currentUser.getIdToken(true);
                console.log("USER LOGGED IN, TOKEN: ", token);
                return token;
            }
        },

        getUserId() {
            if (auth.currentUser == null) {
                console.log("not logged in, using guest id for theta");
                return "" + new Date().getTime();
            } else {
                console.log("logged in, using uid for theta");
                return auth.currentUser.uid;
            }
        },

        ...mapMutations(Player.namespace, {
            setPiP: Player.$mutations.setPiP,
            setDetach: Player.$mutations.setDetach,
        }),

        // We dont want it to load from local cause it fricks up
        // ...mapActions(Player.namespace, {
        //     loadPlayerSettings: Player.$actions.loadSettings,
        // }),
    },

    computed: {
        ...mapState(Player.namespace, {
            source: Player.$states.source,
            poster: Player.$states.poster,
            pinToLive: Player.$states.keepLive,
            disableBumps: Player.$states.disableBumps,
            detach: Player.$states.detach,
        }),

        posterCacheBusted() {
            if (this.live) {
                const coeff = 1000 * 60; // Cache bust poster every minute
                const timestamp = Math.round(Date.now() / coeff) * coeff;
                return `${this.poster}?${timestamp}`;
            } else {
                return this.poster;
            }
        },
    },

    watch: {
        pinToLive(pin) {
            if (this.player && this.live && pin) {
                this.player.liveTracker.trigger("liveedgechange");
            }
        },

        source(newSource) {
            /*if ( this.url  !== newSource.url || this.type !== newSource.type ) {
          this.url  = newSource.url;
          this.type = newSource.type;
          this.reloadPlayer();
        }*/

            // Always reload when source is changed
            // Ensures that a stream will restart after brief drop out.
            console.log(`old URL: ${this.url}, NEW: ${newSource.url}`);
            this.url = newSource.url;
            this.type = newSource.type;
            this.reloadPlayer();
        },
    },

    async mounted() {
        console.log("MOUNTED CALLED");
        
        setTimeout(() => {
            //console.log("--wallet settings after 3 secoonds---");
            console.log("3sec theta", window.Theta);
            console.log("3sec wibndow", window);
            console.log("3sec theta wallet provider", window.Theta.WalletWebSocketProvider);
            console.log("3sec theta wallet", window.Theta.Wallet);
            console.log("3sec theta wallet ready?", window.Theta.Wallet.isReady);
            console.log("3sec theta hlsjs frag loader", window.Theta.HlsJsFragmentLoader);
            console.log("3sec is peering enabled", window.Theta.isPeeringEnabled);
            console.log("3sec is peering enabled but from the P2P", window.Theta.P2P.isPeeringEnabled);
            //console.log(wallet);
        }, 3000);

        this.watchTimer = setInterval(
            () => this.trackWatchTime(),
            1000 * this.watchInterval
        );

        this.mounted = true;
    },

    beforeDestroy() {
        window.removeEventListener(
            "orientationchange",
            this.onOrientationChange
        );
        if (this.watchTimer) clearInterval(this.watchTimer);
        this.playerDispose();
    },
};
</script>

<style lang='scss'>
/*  @import "~assets/style/stream-player.scss";

  .detach-player {
    position: fixed;
    left: 80px;
    top: 48px;
    margin: 1rem;
    width: 20rem;
    height: 11.25rem;
    z-index: 10;
    overflow: hidden;

    &:hover .detach-overlay {
      transform: translateY( 0 );
    }
  }

  .detach-overlay {
    width: 100%;
    position: absolute;
    top: 0;
    transform: translateY( -100% );
    transition: .1s;
    background-color: rgba(0,0,0,.75);
  }*/
</style>
