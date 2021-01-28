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
        id="theta-test-player"
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
import "videojs-contrib-quality-levels";
import "@/assets/js/VideoPlayer/TriSpinner";

// import 'videojs-contrib-dash';

import { mapState, mapMutations } from "vuex";
import { Chat as ChatStore } from "@/store/chat";

import Chat from "@/components/Chat/Chat";

const preroll = "https://cdn.bitwave.tv/static/REWIND.mp4";

export default {
  name: "TestTheta",

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
      try {
        const VIDEO_ID = "booglie-dooglie-belle";

        const optionalHlsOpts = null;
        this.player = videojs("theta-test-player", {
          techOrder: ["theta_hlsjs", "html5"],
          sources: [
            {
              src:
                "https://bitdash-a.akamaihd.net/content/MI201109210084_1/m3u8s/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.m3u8",
              type: "application/vnd.apple.mpegurl",
              label: "1080p",
            },
          ],
          theta_hlsjs: {
            videoId: VIDEO_ID,
            //userId: "YOUR_AUTHED_USER_ID",
            //walletUrl: "brogermy",
            //onWalletAccessToken: getWalletAccessToken,
            hlsOpts: optionalHlsOpts,
          },
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
        if (typeof volume === "undefined" || typeof muted === "undefined")
          return;
        try {
          localStorage.setItem("volume", volume);
          localStorage.setItem("muted", muted);
        } catch (error) {
          console.warn("Failed to access localStorage to save volume level");
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

    /*
    updatePlayerSrc() {
      this.player.src({
        type: "video/mp4",
        src: "https://cdn.bitwave.tv/static/bumps/Bump33-sm.mp4",
      });
    }, 
    */
  },

  computed: {
    ...mapState(ChatStore.namespace, {
      displayChat: ChatStore.$states.displayChat,
    }),

    prerollVideo() {
      return {
        // do not show pre-roll if offline
        source: this.offline || !this.showPreroll ? this.src : preroll,
        type: this.offline || !this.showPreroll ? this.type : "video/mp4",
      };
    },
  },

  mounted() {
    /*
      let umdScript = document.createElement('script');
      umdScript.setAttribute('src', "https://d1ktbyo67sh8fw.cloudfront.net/js/theta.umd.min.js");
      let hlsScript = document.createElement('script');
      hlsScript.setAttribute('src', "https://d1ktbyo67sh8fw.cloudfront.net/js/theta-hls-plugin.umd.min.js")
      let
      */

    // theta web widget
    var widget = new ThetaWebWidgets.OverviewWithTrafficChartWidget(null);
    widget.setTheme(ThetaWebWidgets.Themes.Light);
    widget.render("SAMPLE_THETA_WEB_WIDGET_PLACEHOLDER");

    this.playerInitialize();
  },

  beforeDestroy() {
    this.playerDispose();
  },
};
</script>

<style lang='scss'>
@import "~assets/style/stream-player.scss";
</style>
