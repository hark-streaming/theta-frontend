<template>
    <div>
        <!-- Goal Progress -->
        <!-- <goal-progress v-if="false" /> -->
        <div v-if="streamers.length > 0">
            <!-- Site Banner -->
            <!-- <message-of-the-day /> -->

            <!-- <v-row class="pt-8">
            <v-text-field
                v-model="searchValue"
                label="Search"
                background-color="neutral"
                clearable
                solo
                @keydown.enter="goToSearch"
            ></v-text-field>
            </v-row> -->
            <v-sheet tile class="background9">
                <v-container class="d-flex pt-8 pb-7">
                    <v-row
                        no-gutters
                        class="d-flex justify-center"
                        style="max-height: 600px"
                    >
                        <v-col xl="6" lg="9" md="10" sm="10" class="d-flex">
                            <v-responsive
                                :aspect-ratio="16 / 9"
                                min-width="413px"
                                max-width="calc(100vh - 98px)"
                                style="max-height: 550px"
                            >
                                <theta-banner
                                    v-if="mostViewed"
                                    :src="mostViewed.url"
                                    :type="mostViewed.type"
                                    :poster="poster"
                                    :name="mostViewed.name"
                                    :mobile="mobile"
                                    :offline="offline"
                                />
                            </v-responsive>
                        </v-col>
                        <v-col
                            xl="2"
                            lg="3"
                            md="10"
                            sm="10"
                            class="d-flex elevation-5"
                            style="flex-direction: column; flex-wrap: wrap"
                        >
                            <v-sheet class="background9 pb-3" height="100%">
                                <h2 class="px-3 pt-2">{{ mostViewed.name }}</h2>
                                <h4 class="pl-3 pt-2 pb-1">
                                    {{ mostViewed.viewCount }} WATCHING
                                </h4>
                                <v-divider
                                    class="my-2 mb-4"
                                    style="border-color: white"
                                ></v-divider>
                                <TempTags
                                    :tags="mostViewed.tags"
                                    class="my-3 px-3"
                                />
                                <p class="d-flex px-3">
                                    {{ mostViewed.description }}
                                </p>
                            </v-sheet>
                        </v-col>
                    </v-row>
                </v-container>
                <h3
                    style="font-size: 0.9em; font-weight: 500"
                    class="white--text pl-3 pb-1"
                >
                    CURRENTLY LIVE
                </h3>
                <v-divider class="pb-3" style="border-color: white"></v-divider>
                <stream-grid
                    v-if="streamers.length > 0"
                    :streamers="streamers"
                    :blur-nsfw="blurNSFW"
                    :cols="12"
                    :sm="6"
                    :md="4"
                    :lg="3"
                    :xl="2"
                    @getHighestViews="mostViewedStream($event)"
                    @getHighestViewCount="highestViewCount($event)"
                    class="ml-3"
                />
            </v-sheet>

            <!-- Live Now Header -->
            <!-- Livestream Grid -->
            <v-card tile class="pa-3 mt-5" color="white">
                <h2
                    style="font-size: 0.9em; font-weight: 500"
                    class="black--text"
                >
                    TRENDING
                </h2>
            </v-card>
            <v-sheet class="py-3" color="#F0F0F0">
                <stream-grid
                    v-if="streamers.length > 0"
                    :streamers="streamers"
                    :blur-nsfw="blurNSFW"
                    :cols="12"
                    :sm="6"
                    :md="4"
                    :lg="3"
                    :xl="2"
                    @getHighestViews="mostViewedStream($event)"
                    @getHighestViewCount="highestViewCount($event)"
                    class="ml-3"
                />
            </v-sheet>

            <!-- fuckin index.vue.txt -->
        </div>
        <div v-else>no streams here :(</div>

        <!-- Footer -->
        <!-- <simple-footer :version="version" /> -->
    </div>
</template>

<script>
import { mapState, mapMutations, mapActions } from "vuex";
import { VStore } from "@/store";
import TempTags from "../components/TempTags";

export default {
    scrollToTop: true,

    components: {
        TempTags,
    },

    head() {},

    data() {
        return {
            mounted: false,
            player: null,
            poster: "/bitwave_cover.png",
            chatMessages: null,
            offline: true,

            mostViewed: {},

            searchValue: "",
        };
    },

    methods: {
        mostViewedStream(stream) {
            // console.log(this);
            this.mostViewed = stream;
        },

        highestViewCount(viewCount) {
            this.viewCount = viewCount;
        },

        ...mapMutations({
            setBlurNsfw: VStore.$mutations.setBlurNsfw,
            setSearchValue: VStore.$mutations.setSearchValue,
        }),

        ...mapActions({
            loadSettings: VStore.$actions.loadSettings,
        }),

        goToSearch() {
            if (this.searchValue == null || this.searchValue == "") return;

            // this.setSearchValue(this.searchValue.toString());
            this.$store.commit("setSearchValue", this.searchValue);
            this.$router.push("/search");
        },
    },

    async asyncData({ $axios }) {
        const defaultLive = [
            {
                //src: "https://cdn.bitwave.tv/static/bumps/2a3un.mp4",
                //name: "offline",
                //type: "video/mp4",
            },
        ];

        // Timeout to prevent SSR from locking up
        const timeout = process.server ? process.env.SSR_TIMEOUT : 0;

        // This is where the stream data is retrieved
        // MODIFY THIS API CALL FOR HARK
        /* FORMAT
    {
    "success": true,
        "live": [
            {
            "viewCount": 209,
            "src": "https://cdn.stream.bitwave.tv/hls/britbong/index.m3u8",
            "name": "britbong",
            "type": "application/x-mpegURL",
            "nsfw": false
            },
            {
            "viewCount": 65,
            "src": "https://cdn.stream.bitwave.tv/hls/owo/index.m3u8",
            "name": "owo",
            "type": "application/x-mpegURL",
            "nsfw": false
            },
        ],
        "streamers": [
            {
            "viewCount": 215,
            "title": " 🔴Britbong.com: Britbong never dies",
            "name": "britbong",
            "avatar": "https://cdn.bitwave.tv/uploads/v2/avatar/8c663568-f407-4f13-b427-3e035cfb3484-128.jpg",
            "poster": "https://bitwave.s3.us-west.stackpathstorage.com/img/cover/b71bc591-2f6f-4638-8638-757cbe22d71b-1280x720.png",
            "thumbnail": "https://cdn.stream.bitwave.tv/preview/britbong.jpg",
            "to": "/britbong",
            "live": true,
            "nsfw": false,
            "url": "https://cdn.stream.bitwave.tv/hls/britbong/index.m3u8",
            "owner": "ARbj6Q32wMVsbulZq2N1Mbe6j8A3",
            "banned": false
            },
            {
            "viewCount": 68,
            "title": "Martinez el Matador - read description",
            "name": "owo",
            "avatar": "https://cdn.bitwave.tv/uploads/v2/avatar/ec3cdfdd-0742-4f1f-ad1e-01e5c91c0cd1-128.jpg",
            "poster": "https://cdn.bitwave.tv/static/img/Bitwave_Banner.jpg",
            "thumbnail": "https://cdn.stream.bitwave.tv/preview/owo.jpg",
            "to": "/owo",
            "live": true,
            "nsfw": false,
            "url": "https://cdn.stream.bitwave.tv/hls/owo/index.m3u8",
            "owner": "kugo115AbIaeslg0NeF61IA74UE3",
            "banned": false
            },
        ]
    }
    */
        const getStreams = async () => {
            try {
                const { data } = await $axios.getSSR(
                    `${process.env.API_URL}/utils/live`,
                    {
                        timeout,
                    }
                );

                if (data && data.success) {
                    //console.log("live data good", data);
                    return {
                        live: data.live,
                        streamers: data.streamers,

                        // just make it display britbong only as a test
                        /*live: [
              {
                viewCount: 209,
                src: "https://cdn.stream.bitwave.tv/hls/britbong/index.m3u8",
                name: "britbong",
                type: "application/x-mpegURL",
                nsfw: false,
              },
            ],
            streamers: [
              {
                viewCount: 215,
                title: " 🔴Britbong.com: Britbong never dies",
                name: "britbong",
                avatar:
                  "https://cdn.bitwave.tv/uploads/v2/avatar/8c663568-f407-4f13-b427-3e035cfb3484-128.jpg",
                poster:
                  "https://bitwave.s3.us-west.stackpathstorage.com/img/cover/b71bc591-2f6f-4638-8638-757cbe22d71b-1280x720.png",
                thumbnail: "https://cdn.stream.bitwave.tv/preview/britbong.jpg",
                to: "/britbong",
                live: true,
                nsfw: false,
                url: "https://cdn.stream.bitwave.tv/hls/britbong/index.m3u8",
                owner: "ARbj6Q32wMVsbulZq2N1Mbe6j8A3",
                banned: false,
              },
            ],*/
                    };
                } else {
                    console.log(`API Error:`, data);
                }
            } catch (error) {
                console.error(
                    `Failed to get live channels from API server: ${error.message}`
                );
                return {
                    live: defaultLive,
                    streamers: [],
                };
            }
            console.log(`Failed to get live channels from API server`);
            return {
                live: defaultLive,
                streamers: [],
            };
        };

        const streams = await getStreams();

        return {
            live: streams.live,
            streamers: streams.streamers,
            offline: false,
        };
    },

    computed: {
        ...mapState({
            getBlurNsfw: VStore.$states.blurNsfw,
        }),

        ...mapActions({
            updateViewers: VStore.$actions.updateViewers,
        }),

        blurNSFW: {
            get() {
                return this.getBlurNsfw;
            },
            set(data) {
                this.setBlurNsfw(data);
            },
        },

        mobile() {
            return this.mounted
                ? this.$vuetify.breakpoint.smAndDown
                : !this.$device.isDesktopOrTablet;
        },

        version() {
            return `v${process.env.version}`;
        },
    },

    mounted() {
        this.mounted = true;
        if (this.offline)
            this.$toast.error("API Error: SSR Hydration failed", {
                duration: 5000,
                icon: "error",
                position: "top-center",
            });
        this.loadSettings();
    },
};
</script>

<style scoped>
h2 {
    font-size: 1.5em;
    font-weight:500;
    color: white;
}

h4 {
    font-size: 0.85em;
    font-weight: 500;
    color: whitesmoke;
}
p {
    font-weight: 400;
    font-size: 0.8em;
    color: white;
}

.background9 {
    background: rgb(40, 40, 87);
    background: linear-gradient(
        45deg,
        rgba(40, 40, 87, 1) 0%,
        rgba(177, 87, 87, 1) 100%
    );
}

.videoback {
    color: linear-gradient(
        to top right,
        rgb(109, 109, 126) 0%,
        rgba(235, 232, 232, 1) 15%,
        rgba(235, 232, 232, 1) 85%,
        rgb(207, 169, 169) 100%
    );
}
banner-video {
    max-width: 200px;
}
</style>