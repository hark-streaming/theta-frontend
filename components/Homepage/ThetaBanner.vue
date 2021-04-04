<template>
    <v-card
        v-if="live"
        color="black"
        class="d-flex flex-wrap justify-end elevation-8"
    >
        <!-- Stream Player -->
        <div class="flex-grow-1 align-self-center" style="min-width: 40%">
            <video
                playsinline
                id="theta-banner-player"
                class="video-js vjs-default-skin vjs-fluid"
                controls
                autoplay
                muted
                preload="auto"
                data-setup='{ "aspectRatio":"16:9" }'
                :poster="poster"
            >
                <source :src="prerollVideo.source" :type="prerollVideo.type" />
            </video>
        </div>
        <div id="SAMPLE_THETA_WEB_WIDGET_PLACEHOLDER"></div>
    </v-card>
</template>

<script>
import videojs from "video.js";
import hls from "hls.js";

import { mapState, mapMutations } from "vuex";
import { Chat as ChatStore } from "@/store/chat";

import Chat from "@/components/Chat/Chat";

const preroll = "https://cdn.bitwave.tv/static/REWIND.mp4";

export default {
    name: "ThetaBanner",

    head() {
        return {
            script: [
                {
                    hid: "Thetamin",
                    src: "https://d1ktbyo67sh8fw.cloudfront.net/js/theta.umd.min.js",
                    //src: "/js/theta.js",
                    callback: () => {
                        this.playerInitialize();
                    },
                },
            ],
        };
    },

    props: {
        src: { type: String },
        type: { type: String },
        poster: { type: String },
        name: { type: String },
        mobile: { type: Boolean, default: false },
        offline: { type: Boolean, default: false },
    },

    components: {
        Chat,
    },

    data() {
        return {
            live: true,
            initialized: false,
            showPreroll: false,
            player: null,
        };
    },

    methods: {
        ...mapMutations(ChatStore.namespace, {
            setDisplayChat: ChatStore.$mutations.setDisplayChat,
        }),

        playerInitialize() {
            this.$ThetaPlayerSetup(window.Theta, hls, videojs);

            //turn theta debugging on
            //window.Theta.setDebug(true);

            this.initialized = false;

            try {
                this.player = videojs("theta-banner-player", {
                    //#region Theta stuff
                    techOrder: ["theta_hlsjs", "html5"], // has html5 fallback
                    theta_hlsjs: {
                        videoId: this.name,
                        // always uses a guest id here
                        userId: "" + new Date().getTime(),
                        walletUrl:
                            "wss://beta-api-wallet-service.thetatoken.org/theta/ws",
                        onWalletAccessToken: null,
                    },
                    sources: [{ src: this.src, type: this.type }],
                });
                

                // Video Player Ready
                this.player.ready(async () => {
                    // Restore Volume
                    try {
                        let volume = localStorage.getItem("volume");
                        if (volume !== null) this.player.volume(volume);
                    } catch (error) {
                        console.warn("Failed to find prior volume level"); // No volume value in memory
                    }
                });

                this.player.on("ended", async () => {
                    this.reloadPlayer();
                    this.player.play();
                });

                this.initialized = true;
            } catch (error) {
                console.error(error);
                this.initialized = false;
            }

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
                        "Failed to access localStorage to save volume level"
                    );
                }
            });
        },

        playerDispose() {
            if (this.player) this.player.dispose();
        },

        reloadPlayer() {
            if (!this.initialized) return;
            this.player.poster = this.poster;
            this.player.src({ src: this.src, type: this.type });
        },

        showChat() {
            this.setDisplayChat(true);
            this.$analytics.logEvent("show_chat");
        },
    },

    computed: {
        ...mapState(ChatStore.namespace, {
            displayChat: ChatStore.$states.displayChat,
        }),

        prerollVideo() {
            return {
                // do not show pre-roll if offline
                source: this.offline || !this.showPreroll ? this.src : preroll,
                type:
                    this.offline || !this.showPreroll ? this.type : "video/mp4",
            };
        },
    },

    mounted() {
        //this.playerInitialize();
    },

    beforeDestroy() {
        this.playerDispose();
    },
};
</script>

<style lang='scss'>
@import "~assets/style/stream-player.scss";
</style>
