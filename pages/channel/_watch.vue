<template>
    <div
        :style="{
            marginRight: pageMarginRight,
            borderTight: 'solid 1px #212121',
        }"
    >
        <!-- Streamer Top Bar -->
        <stream-top-bar
            :avatar="avatar"
            :name="name"
            :nsfw="nsfw"
            :streamer-id="owner"
        />

        <!-- Video JS -->
        <div class="d-flex justify-space-around" style="background-color:black;">
            <v-responsive :aspect-ratio="16 / 9" max-width="calc(150vh - 98px)">
                <v-sheet
                    color="grey darken-4"
                    class="fill-height"
                    v-intersect="{
                        handler: onIntersect,
                        options: {
                            threshold: [0, 0.5, 1.0],
                        },
                    }"
                >
                    <div v-if="showCountdown" style="position: absolute">
                        <div
                            style="
                                position: relative;
                                top: 1rem;
                                left: 1rem;
                                z-index: 10;
                                opacity: 75%;
                            "
                        >
                            <countdown
                                :timestamp="scheduled"
                                :key="scheduled"
                            />
                        </div>
                    </div>

                    <!-- Bitwave Stream Player -->
                    <!-- <bitwave-video-player
                        :live="live"
                        :autoplay="live || !disableBumps"
                        :docked="smartDetach"
                        @ended="onEnded"
                        @stats="trackWatchTime"
                    >
                        <template #title>
                            <h5 class="white--text body-2 ml-2">{{ name }}</h5>
                        </template>
                    </bitwave-video-player> -->

                    <!-- Theta Stream Player -->
                    <theta-video-player
                        :live="live"
                        :autoplay="live || !disableBumps"
                        :docked="smartDetach"
                        :streamer="name"
                        @ended="onEnded"
                        @stats="trackWatchTime"
                    >
                        <template #title>
                            <h5 class="white--text body-2 ml-2">{{ name }}</h5>
                        </template>
                    </theta-video-player>

                    <div v-if="smartDetach" style="height: 100%; width: 100%">
                        <div
                            id="bw-player-thumbnail"
                            :style="`background-image: url('${posterCacheBusted}\');`"
                        ></div>
                    </div>
                </v-sheet>

                <!-- Video Overlay -->
                <!-- <stickers /> -->
            </v-responsive>

            <!-- Theta Web Widget -->
            <!-- <div id="MY_THETA_WEB_WIDGET_ID"></div> -->
        </div>

        <!-- Chat -->
        <!-- maxHeight: mobile && !landscape ? '390px' : '90%', -->
        <div
            v-if="displayChat"
            :key="1"
            
            :class="{ 'chat-desktop': !mobile || (mobile && landscape) }"
            :style="{
                maxHeight: mobile && !landscape ? '390px' : '100%',
                width: mobile && landscape ? '50%' : null,
            }"
        >
            <!-- <chat -->
            <hark-chat
                :chat-channel="name"
                
                :donateOn="donateOn"
                :donateMsg="donateMsg"
                :donateUrl="donateUrl"

                :streamerAvatar="avatar"
                :streamerTokenName="streamerTokenName"
                :streamerUid="streamerUid"

                :polls="polls"
            />
        </div>

        <!-- Restore chat FAB -->
        <v-fab-transition>
            <v-btn
                v-show="!displayChat"
                color="primary"
                fixed
                fab
                bottom
                right
                class="v-btn--example"
                @click="showChat"
            >
                <v-icon color="white">question_answer</v-icon>
            </v-btn>
        </v-fab-transition>

        <v-divider />

        <!-- Banned Alert -->
        <v-alert v-if="banned" class="ma-4" type="error" outlined dense>
            {{ banMessage }}
        </v-alert>

        <!-- Stream Info -->
        <stream-info
            :name="name"
            :live="live"
            :title="title"
            :nsfw="nsfw"
            :description="description"
            :timestamp="timestamp"
            :tags="tags"
            :streamerId="owner"
        />
    </div>
</template>

<script>
import { mapState, mapGetters, mapMutations } from "vuex";

import { Chat as ChatStore } from "@/store/chat";
import { VStore } from "@/store";
import { Player } from "@/store/player";

import { db } from "@/plugins/firebase.js";

//import Chat from "@/components/Chat/Chat";
import StreamTopBar from "@/components/Channel/StreamTopBar";
import StreamInfo from "@/components/Channel/StreamInfo";
import ThetaVideoPlayer from "@/components/ThetaPlayer/ThetaVideoPlayer";

const Stickers = async () => await import("@/components/effects/Stickers");

export default {
    name: "watch",

    scrollToTop: true,

    head() {
        return {
            title: `${this.name} - hark.tv`,
            link: [
                { rel: "canonical", href: `https://bitwave.tv/${this.name}` },
            ],
            meta: [
                {
                    property: "og:title",
                    hid: "og:title",
                    content: `${this.title} - hark.tv`,
                },
                {
                    property: "og:url",
                    hid: "og:url",
                    content: `https://bitwave.tv/${this.name}`,
                },
                {
                    property: "og:description",
                    hid: "og:description",
                    content: (this.description || "").substring(0, 200),
                },
                { property: "og:image", hid: "og:image", content: this.poster },
                {
                    property: "description",
                    hid: "description",
                    content: (this.name || "").substring(0, 200),
                },
                { property: "author", content: this.name },
                { property: "profile:username", content: this.name },
                { property: "twitter:card", content: "summary_large_image" },
                { property: "twitter:site", content: "@BitwaveTV" },
                {
                    property: "twitter:title",
                    content: (this.title || "").substring(0, 70),
                },
                {
                    property: "twitter:description",
                    content: (this.description || "").substring(0, 200),
                },
                { property: "twitter:image", content: this.poster },
            ],
            // script: [
            //     { src: "https://d1ktbyo67sh8fw.cloudfront.net/js/theta.umd.min.js" },
            //     { src: "https://d1ktbyo67sh8fw.cloudfront.net/js/theta-hls-plugin.umd.min.js" },
            //     { src: "https://d1ktbyo67sh8fw.cloudfront.net/js/videojs-theta-plugin.min.js" },
            // ],
        };
    },

    components: {
        Stickers,
        StreamTopBar,
        StreamInfo,
        //Chat,
        ThetaVideoPlayer,
    },

    data() {
        return {
            mounted: false,
            landscape: false,
            showStreamStats: false,
            streamDataListener: null,
            recentBumps: [],

            // Hydrated data defaults
            name: "",
            avatar: null,
            title: "",
            description: "",
            poster:
                "https://cdn.discordapp.com/attachments/814278920168931382/823092021753413633/hark-title.png",
            live: false,
            nsfw: false,
            owner: null,
            url: null,
            type: null,
            timestamp: null,
            scheduled: null,
            banned: false,
            tags: [],

            donateOn: false,
            donateMsg: "Donate",
            donateUrl: "",

            streamerTokenName: "",
            streamerUid: "",

            polls: [],

            banMessage:
                "This channel has been banned for breaching our Terms of Service.",

            docExists: false
        };
    },

    methods: {
        async onEnded() {
            console.log(`Player source ended`);
            // this.setSource({
            //     url: await this.getRandomBump(),
            //     type: "video/mp4",
            // });
        },

        trackWatchTime(stats) {
            this.$ga.event({
                eventCategory: "stream",
                eventAction: "watch-time",
                eventLabel: this.name,
                eventValue: stats.duration,
            });
            this.$ga.event({
                eventCategory: "stream",
                eventAction: "watch-interval",
                eventLabel: this.name,
                eventValue: stats.interval,
            });
        },

        // This guy is the 15-30sec meme video bitwave slaps on before a stream loads
        // let's just take it out for now
        async getRandomBump() {

            // const { data } = await this.$axios.get(
            //     `https://api.bitwave.tv/api/bump`
            // );
            // // limit to checking 15 most recent bumps
            // if (this.recentBumps.length >= 15)
            //     this.recentBumps = this.recentBumps.splice(-15);
            // // Recurse until we get a fresh bump
            // if (this.recentBumps.includes(data.url)) {
            //     console.log(`Recently seen ${data.url}, getting a new bump`);
            //     return await this.getRandomBump();
            // }
            // this.recentBumps.push(data.url);
            // return data.url;
        },

        getStreamData() {
            const channel = this.$route.params.watch;
            const streamer = (this.name || channel).toLowerCase();
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

        async streamDataChanged(data) {
            console.log("stream data changed data", data);
            // Ban flag
            const banned = data.banned || false;
            this.banned = banned;

            // Streamer user properties
            this.name = data.name;
            this.avatar = data.avatar;
            this.streamerUid = this.owner;
            // we'll just calculate the streamer token name for now
            this.streamerTokenName = this.name.slice(0,4).toUpperCase() + "-HARK";

            this.owner = data.owner;

            // Grab Stream Data
            this.title = data.title;
            this.description = data.description;

            // Stream properties
            this.nsfw = data.nsfw;
            const live = data.live;

            this.donateOn = data.donateOn;
            this.donateMsg = data.donateMsg;
            this.donateUrl = data.donateUrl;

            this.tags = data.tags;

            // Process timestamp
            this.timestamp = data.timestamp ? data.timestamp.toDate() : null;

            // Process scheduled date
            this.scheduled = data.scheduled ? data.scheduled.toDate() : null;

            // Stream media
            //const url = "http://127.0.0.1:8080/hls/test1.m3u8"; //"https://cdn.stream.bitrave.tv/hls/doomtube/index.m3u8"; //data.url;
            const url = data.url;
            const type = data.type || `application/x-mpegURL`; // DASH -> application/dash+xml

            // Cover image
            if (live) {
                this.poster = data.thumbnail;
                this.setPoster(data.thumbnail);
            }

            // Detect offline stream
            if (!this.live && !live) console.debug("User is offline");
            // Detect user going LIVE
            else if (!this.live && live) {
                // immediately set to LIVE state
                this.live = live;

                console.log("Livestream starting");
                if (this.offlineResetInterval)
                    clearInterval(this.offlineResetInterval);

                // Load and Play stream
                this.setSource({ url, type });
            }

            // Detect user going OFFLINE
            else if (this.live && !live) {
                // immediately set to OFFLINE state
                this.live = live;

                console.log("Livestream ending");

                // Experimental feature to prevent constant retries when player empties
                // This should reduce erroneous 404's on the ingestion servers

                const CHECK_INTERVAL = 5;
                const MAX_TIME = 90;

                // Try to prevent resetting while watching stale data
                const canReset = () => {
                    const atLiveEdge =
                        $bw.player.liveTracker &&
                        $bw.player.liveTracker.atLiveEdge();
                    const isPaused = $bw.player.paused();
                    return atLiveEdge && !isPaused;
                };

                // Attempt to end stream and reset player
                let TIME = 0;
                const endStream = async () => {
                    // Abort if stream goes live
                    if (this.live) {
                        clearInterval(this.offlineResetInterval);
                        return;
                    }

                    // Always increment time
                    TIME += CHECK_INTERVAL;

                    // Check if satisfy requirements or have exceeded our max time
                    if (!canReset() && TIME <= MAX_TIME) return;

                    // Remove our interval
                    if (this.offlineResetInterval)
                        clearInterval(this.offlineResetInterval);

                    // Reset basic player properties
                    this.poster = data.cover;

                    this.setPoster(data.thumbnail);
                    // this.setSource({
                    //     url: await this.getRandomBump(),
                    //     type: "video/mp4",
                    // });
                };

                // Keep timer ID so we can cancel early if stream recovers
                this.offlineResetInterval = setInterval(
                    async () => await endStream(),
                    CHECK_INTERVAL * 1000
                );
            }

            // Detect source change
            else if (this.source.url !== url || this.source.type !== type) {
                this.setSource({ url, type });
            }

            this.live = live;
        },

        getPollData() {
            // const stream = this.streamerUid;
            const streamRef = db.collection("polls").doc(this.owner);

            return streamRef.onSnapshot(
                async (doc) => {
                    this.docExists = doc.exists;
                    if (this.docExists) 
                        await this.pollDataChanged(doc.data());
                },
                () => (this.docExists = false)
            );
        },

        async pollDataChanged(data) {
            this.polls = [];
            data.polls.forEach(x => this.polls.push(x));
        },

        onIntersect(entries, observer) {
            this.setDetach(entries[0].intersectionRatio <= 0.5);
        },

        onOrientationChange() {
            const orientation = (screen.orientation || {}).type;
            if (orientation) {
                this.landscape = orientation.startsWith("landscape");
            } else {
                this.landscape = false;
            }
        },

        showChat() {
            this.setDisplayChat(true);
            this.$analytics.logEvent("show_chat");
        },

        ...mapMutations(Player.namespace, {
            setSource: Player.$mutations.setSource,
            setPoster: Player.$mutations.setPoster,
            setDetach: Player.$mutations.setDetach,
        }),

        ...mapMutations(ChatStore.namespace, {
            setDisplayChat: ChatStore.$mutations.setDisplayChat,
        }),
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
                    //`https://us-central1-hark-e2efe.cloudfunctions.net/api/channel/${channel}`,
                    `${process.env.API_URL}/channel/${channel}`,
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
                        donateOn: data.donateOn,
                        donateMsg: data.donateMsg,
                        donateUrl: data.donateUrl,
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

            try {
                // THIS IS WHERE THE API DATA IS MAPPED TO THE VUE
                const data = channelData;

                // Ban flag
                const banned = data.banned || false;

                // Streamer user properties
                const name = data.name;
                const avatar = data.avatar;
                const owner = data.owner;

                // Stream data
                const title = data.title;
                const description = data.description;

                // Stream properties
                const nsfw = data.nsfw;
                const live = data.live;

                const donateOn = data.donateOn;
                const donateMsg = data.donateMsg;
                const donateUrl = data.donateUrl;

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
                // if (live === false) {
                //     try {
                //         const { data } = await $axios.getSSR(
                //             "https://api.bitwave.tv/api/bump",
                //             {
                //                 timeout,
                //             }
                //         );
                //         url = data.url;
                //         type = "video/mp4";
                //     } catch (error) {
                //         console.error(error.message);
                //         url = "https://cdn.bitwave.tv/static/bumps/2a3un.mp4";
                //         type = "video/mp4";
                //     }
                // }

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
                        donateOn,
                        donateMsg,
                        donateUrl,
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
        ...mapGetters({
            username: VStore.$getters.getUsername,
            user: VStore.$getters.getUser,
        }),

        ...mapState(Player.namespace, {
            source: Player.$states.source,
            inPiP: Player.$states.inPiP,
            pinToLive: Player.$states.keepLive,
            disableBumps: Player.$states.disableBumps,
            detach: Player.$states.detach,
        }),

        ...mapState(ChatStore.namespace, {
            displayChat: ChatStore.$states.displayChat,
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

        mobile() {
            return this.mounted
                ? this.$vuetify.breakpoint.smAndDown
                : !this.$device.isDesktopOrTablet;
        },

        smartDetach() {
            return this.detach && !this.mobile && !this.inPiP;
        },

        pageMarginRight() {
            if (!this.displayChat) return "0";
            return this.mobile ? (this.landscape ? "50%" : "0") : "450px";
        },

        showCountdown() {
            if (this.live) return false;
            if (!this.scheduled) return false;
            if (!this.timestamp) return false;

            // Do not show countdown if last streamed timestamp is after scheduled
            if (this.timestamp > this.scheduled) return false;

            return true;
        },
    },

    validate({ params }) {
        // Verify username is valid
        const user = params.watch;
        const validator = /^[a-zA-Z0-9._-]+$/;
        return validator.test(user);
    },

    async created() {
        this.setPoster(this.poster);
        this.setSource({ url: this.url, type: this.type });
    },

    async mounted() {
        // this.setSource({ url: this.url, type: this.type });
        this.getStreamData(); // Get stream data
        this.getPollData();

        // theta web widget
        //var widget = new ThetaWebWidgets.OverviewWithTrafficChartWidget(null);
        //widget.setTheme(ThetaWebWidgets.Themes.Light);
        //widget.render("MY_THETA_WEB_WIDGET_ID");

        const orientation = (screen.orientation || {}).type;
        if (orientation) {
            this.landscape = orientation.startsWith("landscape");
        } else {
            this.landscape = false;
        }
        window.addEventListener("orientationchange", this.onOrientationChange);

        this.mounted = true;
    },

    beforeDestroy() {
        window.removeEventListener(
            "orientationchange",
            this.onOrientationChange
        );
        if (this.streamDataListener) this.streamDataListener();
        if (this.offlineResetInterval) clearInterval(this.offlineResetInterval);
    },
};
</script>

<style lang='scss'>
@import "~assets/style/stream-player.scss";

.detach-player {
    position: fixed;
    right: 0;
    top: 48px;
    margin: 1rem;
    width: 20rem;
    height: 11.25rem;
    z-index: 10;
    overflow: hidden;

    &:hover .detach-overlay {
        transform: translateY(0);
    }
}

.detach-overlay {
    width: 100%;
    position: absolute;
    top: 0;
    transform: translateY(-100%);
    transition: 0.1s;
    background-color: rgba(0, 0, 0, 0.75);
}

#bw-player-thumbnail {
    position: relative;
    filter: grayscale(80%);
    background-size: cover;
    height: 100%;
    width: 100%;

    &::after {
        content: " ";
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-image: radial-gradient(transparent 50%, black);
    }
}
</style>
