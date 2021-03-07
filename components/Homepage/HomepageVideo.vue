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
// temporarily removed
//import videojs from "video.js";

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

export default {
    name: "theta-video-player",

    head() {
        return {
            script: [
                {
                    hid: "sequenceload",
                    src: "/js/seqLoadTheta.js",
                    defer: true,
                    callback: () => {
                        console.log("sequential scripts loaded");

                        // The sequence script being loaded doesnt ensure it has been executed
                        // As a temporary workaround, wait 1 second so the scripts load
                        // Yes this is very dumb but i want to move on
                        setTimeout(() => {
                            console.log("initializing the videojs player");
                            this.playerInitialize();
                        }, 1000);
                    },
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
            //scriptsLoaded: false,
            initialized: false,

            player: null,
            url: null,
            type: null,

            // stat logging
            watchTimer: null,
            watchDuration: 0,
            watchInterval: 60,
            lastVPQ: null,

            // Video data
            live: false, 
            autoplay: false, 
            docked: false, 
            streamer: "testman",

            mounted: true, 
        };
    },

    methods: {
        playerInitialize() {
            console.log("HELLO I AM IN PLAYER INIT");
            console.log(
                `URL: ${this.source.url}, TYPE: ${this.source.type}, POSTER: ${this.poster}, AUTOPLAY: ${this.autoplay}, POSTER: ${this.poster}`
            );

            this.initialized = false;

            // Create video.js player
            this.player = window.player = videojs("streamplayer", {
                //#region Theta stuff
                techOrder: ["theta_hlsjs" /*, "html5"*/], // disable html5 fallback so we know when theta broken
                theta_hlsjs: {
                    videoId: this.streamer,
                    //im just going to put the id token here, don't know if thats what it wants
                    userId: this.getAuthUserIdToken, 
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

            //Check if a user is logged in...
            if (idToken == null) {
                //No user is logged in, no wallet will be used
                return null;
            }

            //This API should check the user's auth
            //let body = await yourAPIRequestToGenerateThetaWalletAccessTokenForAuthedUser();

            //Return the access token from the request body
            //return body.access_token;
            return null;
        },

        // returns the user's id auth token if they are logged in, otherwise, null
        async getAuthUserIdToken() {
            // not logged in, return null
            if (auth.currentUser == null) {
                return null;
            } 
            
            // logged in, return auth token
            else {
                const token = await auth.currentUser.getIdToken(true);

                return token;
            }
        },

        ...mapMutations(Player.namespace, {
            setPiP: Player.$mutations.setPiP,
            setDetach: Player.$mutations.setDetach,
        }),

        getStreamData() {
            const channel = this.$route.params.watch;
            const streamer = (this.streamer || channel).toLowerCase();
            this.streamDataListener = db
                .collection("streams")
                .doc(streamer)
                .onSnapshot(
                    async (doc) => await this.streamDataChanged(doc.data()),
                    (error) => {
                        this.$sentry.captureException(error);
                    }
                );
        },

        // We dont want it to load from local cause it fricks up
        // ...mapActions(Player.namespace, {
        //     loadPlayerSettings: Player.$actions.loadSettings,
        // }),
    },

    async asyncData({ $axios, params, error }) {
        const channel = params.watch;

        // Timeout to prevent SSR from locking up
        const timeout = process.server ? process.env.SSR_TIMEOUT : 0;

        const getChannelHydration = async () => {
            let channelData = null;

            // Attempt to load via API server
            try {
                const { data } = await $axios.getSSR(
                    //`https://api.bitwave.tv/api/channel/${channel}`,
                    //`http://localhost:5001/hark-e2efe/us-central1/api/channel/${channel}`,
                    `https://us-central1-hark-e2efe.cloudfunctions.net/api/channel/${channel}`,
                    { timeout }
                );
                // Simple response validation
                if (data && data.hasOwnProperty("name")) {
                    channelData = data;
                }
            } catch (error) {
                // API server failed
                console.error(error.message);

                // API failed with 404, but server did not fail with 5xx
                if (error.response && error.response.status === 404) {
                    console.error(`API server reponded with 404`);
                    return {
                        success: false,
                        error: {
                            statusCode: 404,
                            message: `API SERVER FAIL Could not find channel '${channel}'.`,
                        },
                    };
                }
            }

            // API server failed unexpectedly 5xx - Attempt to load from database
            if (!channelData) {
                // API server failed, query database directly
                try {
                    console.log(`API server failed! Attempting to bypass.`);

                    const streamer = channel.toLowerCase();

                    const streamDoc = await db
                        .collection("streams")
                        .doc(streamer)
                        .get();

                    // Channel does not exist in database (404)
                    if (!streamDoc.exists) {
                        console.error(
                            `Database query did not find streamer!`,
                            channel
                        );
                        return {
                            success: false,
                            error: {
                                statusCode: 404,
                                message: `DATABASE CALL FAIL Could not find channel '${channel}'.`,
                            },
                        };
                    }

                    const data = streamDoc.data();

                    // Re-map channel data
                    channelData = {
                        name: data.user.name,
                        avatar: data.user.avatar,
                        to: `/${data.user.name}`,
                        title: data.title,
                        description: data.description,
                        poster: data.cover,
                        thumbnail: data.thumbnail,
                        live: data.live,
                        nsfw: data.nsfw,
                        url: data.url,
                        owner: data.owner,
                        scheduled: data.scheduled,
                        banned: data.banned || false,
                        tags: data.tags,
                    };

                    console.log(`Bypass should be successfull...`);
                } catch (error) {
                    // API & Database query failure
                    console.error(`Database query failed!`);
                    console.error(error.message);
                    return {
                        success: false,
                        error: {
                            statusCode: 500,
                            message: `Bitwave API cache failed & Bitwave Database API failed!<br>${error.message}`,
                        },
                    };
                }
            }

            try { // THIS IS WHERE THE API DATA IS MAPPED TO THE VUE
                const data = channelData;

                // Ban flag
                const banned = data.banned || false;

                // Streamer user properties
                this.streamer = data.name;
                const avatar = data.avatar;
                const owner = data.owner;

                // Stream data
                const title = data.title;
                const description = data.description;

                // Stream properties
                const nsfw = data.nsfw;
                this.autoplay = data.live || !disableBumps;
                this.docked = "smartDetach"

                // Stream tags
                const tags = data.tags;

                // Stream media
                let type = data.type || `application/x-mpegURL`; // DASH -> application/dash+xml
                let url = data.url;

                // Process timestamp
                const timestamp = data.timestamp
                    ? new Date(data.timestamp)
                    : null;

                // Process scheduled date
                const scheduled = data.scheduled
                    ? new Date(data.scheduled)
                    : null;

                // Process cover image
                const poster = live ? data.thumbnail : data.poster;

                // Fallback to bump if offline
                if (live === false) {
                    try {
                        const { data } = await $axios.getSSR(
                            "https://api.bitwave.tv/api/bump",
                            {
                                timeout,
                            }
                        );
                        url = data.url;
                        type = "video/mp4";
                    } catch (error) {
                        console.error(error.message);
                        url = "https://cdn.bitwave.tv/static/bumps/2a3un.mp4";
                        type = "video/mp4";
                    }
                }

                return {
                    success: true,
                    data: {
                        name,
                        avatar,
                        title,
                        description,
                        poster,
                        live,
                        nsfw,
                        owner,
                        url,
                        type,
                        timestamp,
                        scheduled,
                        banned,
                        tags,
                    },
                };
            } catch (error) {
                // Unknown error, unlikely to occur
                console.error(`Unknown API Error: ${error.message}`);
                return {
                    success: false,
                    error: {
                        statusCode: 500,
                        message: `Unknown API Error!\n${error.message}`,
                    },
                };
            }

            // This should be unreachable
            return {
                success: false,
                error: { statusCode: 500, message: `This should never occur.` },
            };
        };

        // Get Channel data for page
        const channelData = await getChannelHydration();
        if (channelData.success === false) {
            console.error(`Channel Data API failed.`, channelData.error);
            if (channelData && !channelData.success) {
                error({ ...channelData.error });
                return;
            }
        }

        // Intercept for banned
        if (channelData.banned) {
            console.log(`Channel is banned`);
            error({ statusCode: 401, message: banMessage });
            return;
        }

        return {
            ...channelData.data,
        };
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

        smartDetach() {
            return this.detach && !this.mobile && !this.inPiP;
        }, 

        mobile() {
            return this.mounted
                ? this.$vuetify.breakpoint.smAndDown
                : !this.$device.isDesktopOrTablet;
        },
    },

    watch: {
        pinToLive(pin) {
            if (this.player && this.live && pin) {
                this.player.liveTracker.trigger("liveedgechange");
            }
        },

        source(newSource) {

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
</style>
