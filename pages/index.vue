<template>
  <div>
    <div>
      <!-- Goal Progress -->
      <goal-progress v-if="false" />

      <v-container>
        <!-- Site Banner -->
        <!-- <message-of-the-day /> -->

        <v-row class="pt-8">
          <v-text-field
            v-model="searchValue"
            label="Search"
            background-color="neutral"
            clearable
            solo
            @keydown.enter="goToSearch"
          ></v-text-field>
        </v-row>

        <v-row class="justify-center mb-8">
          <v-col cols="12" md="8" xl="8" class="pr-0">
            <!-- Banner Stream -->
            <!-- <banner-video
              v-if="mostViewed"
              :src="mostViewed.url"
              :type="mostViewed.type"
              :poster="poster"
              :name="mostViewed.name"
              :mobile="mobile"
              :offline="offline"
            />  -->
            <test-theta
              v-if="mostViewed"
              :src="mostViewed.url"
              :type="mostViewed.type"
              :poster="poster"
              :name="mostViewed.name"
              :mobile="mobile"
              :offline="offline"
            />

            <!-- <test-theta /> -->
            <!-- <homepage-video /> -->
          </v-col>

          <v-col class="grow pl-0">
            <v-sheet color="neutral" class="fill-height pa-5">
              <h2>{{ mostViewed.name }}</h2>
              <h4>Viewers: {{ mostViewed.viewCount }}</h4>
              <TempTags :tags="mostViewed.tags" class="my-2" />
              <p>{{ mostViewed.description }}</p>
            </v-sheet>
          </v-col>
        </v-row>

        <!-- Live Now Header -->
        <!-- Livestream Grid -->
        <stream-grid
          :streamers="streamers"
          :blur-nsfw="blurNSFW"
          :cols="12"
          :sm="6"
          :md="4"
          :lg="3"
          :xl="2"
          @getHighestViews="mostViewedStream($event)"
          @getHighestViewCount="highestViewCount($event)"
        />

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
          //"https://us-central1-hark-e2efe.cloudfunctions.net/api/utils/live",
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
banner-video {
  max-width: 200px;
}
</style>