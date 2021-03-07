<template>
  <div>
    <div >
      <!-- Goal Progress -->
      <goal-progress v-if="false" />

      <v-container fluid>
        <!-- Site Banner -->
        <message-of-the-day />

        <v-row class="justify-center">
          <v-col cols="12" md="10" xl="8">
            <!-- Banner Stream -->
            <!--
            <banner-video
              v-if="live[0]"
              :src="live[0].src"
              :type="live[0].type"
              :poster="poster"
              :name="live[0].name"
              :mobile="mobile"
              :offline="offline"
            /> 
            -->
            <test-theta />
          </v-col>
        </v-row>

        <!-- Live Now Header -->
        <v-sheet class="my-4" color="neutral">
          <v-sheet class="d-flex justify-space-between align-end pa-2" color="accentwave">
            <div class="headline font-weight-light black--text">
              Top Politicians
            </div>
            <!-- v-switch
              v-model="blurNSFW"
              label="Blur NSFW thumbnails"
              color="primary"
              hide-details
              dense
              inset
            />-->
          </v-sheet>

          <!-- Livestream Grid -->
          <stream-grid
            :streamers="streamers"
            :blur-nsfw="blurNSFW"
            :cols="12"
            :sm="6"
            :md="4"
            :lg="3"
            :xl="2"
          />
        </v-sheet>

        <!-- fuckin index.vue.txt -->
      </v-container>
    </div>

    <!-- Footer -->
    <simple-footer :version="version" />
  </div>
</template>

<script>
import { mapState, mapMutations, mapActions } from "vuex";
import { VStore } from "@/store";

export default {
  scrollToTop: true,

  head() {
    return {
      title: `Homepage - hark.tv`,
      link: [{ rel: "canonical", href: `https://hark.tv` }],
      meta: [
        {
          property: "og:title",
          hid: "og:title",
          content: `Homepage - hark.tv`,
        },
        { property: "og:url", hid: "og:url", content: `https://hark.tv` },
        {
          property: "og:description",
          hid: "og:description",
          content: `A video streaming platform for activists, commentators, & civil servants.`,
        },
        { property: "og:image", hid: "og:image", content: this.poster },
        {
          property: "description",
          hid: "description",
          content:
            "A video streaming platform for activists, commentators, & civil servants.",
        },
        /*
        { property: "twitter:card", content: "summary_large_image" },
        { property: "twitter:site", content: "@BitwaveTV" },
        {
          property: "twitter:title",
          content: "Livestream Homepage - [bitwave.tv]",
        },
        {
          property: "twitter:description",
          content:
            "An open platform live streaming service for creators to freely express themselves.",
        },
        { property: "twitter:image", content: this.poster },
        */
      ],
    };
  },

  data() {
    return {
      mounted: false,
      player: null,
      poster: "https://cdn.bitwave.tv/static/img/Bitwave_Banner.jpg",
      chatMessages: null,
      offline: true,
    };
  },

  methods: {
    ...mapMutations({
      setBlurNsfw: VStore.$mutations.setBlurNsfw,
    }),

    ...mapActions({
      loadSettings: VStore.$actions.loadSettings,
    }),
  },

  async asyncData({ $axios }) {
    const defaultLive = [
      {
        src: "https://cdn.bitwave.tv/static/bumps/2a3un.mp4",
        name: "offline",
        type: "video/mp4",
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
        /*const { data } = await $axios.getSSR(
          "https://api.bitwave.tv/v1/channels/live",
          {
            timeout,
          }
        );*/

        const { data } = await $axios.getSSR(
          "https://us-central1-hark-e2efe.cloudfunctions.net/api/channel/functions/live",
          
          {
            timeout,
          }
        );
        

        if (data && data.success) {
          console.log("help");
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
