<template>
  <div class="px-0">
    <transition-group tag="div" class="row flex-wrap" name="fade-transition">
      <!-- Loading placeholder -->
      <v-col v-if="loading">
        <v-card>
          <v-card-text>
            <v-row align-center>
              <v-col shrink>
                <v-progress-circular indeterminate color="primary" />
              </v-col>
              <v-flex>Loading...</v-flex>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Cards -->
      <v-col
        v-if="!loading"
        v-for="(stream, index) in streamerList"
        :key="index"
        :cols="cols"
        :sm="sm"
        :md="md"
        :lg="lg"
        :xl="xl"
      >
        <stream-card
          :to="stream.to"
          :image="stream.thumbnail"
          :nsfw="stream.nsfw"
          :title="stream.title"
          :name="stream.name"
          :viewers="stream.viewCount"
          :blur="blurNsfw"
          live
        />
      </v-col>
    </transition-group>
  </div>
</template>

<script>
import StreamCard from "@/components/StreamGrid/StreamCard";
import { db } from "@/plugins/firebase";
import { mapGetters } from "vuex";
import { VStore } from "@/store";

export default {
  name: "StreamGrid",

  serverCacheKey: () => Math.trunc(Date.now() / (1000 * 30)),

  props: {
    streamers: {},
    blurNsfw: { type: Boolean, default: true },
    cols: { type: Number, default: 12 },
    sm: { type: Number, default: 6 },
    md: { type: Number, default: 4 },
    lg: { type: Number, default: 3 },
    xl: { type: Number, default: 2 },
  },

  components: {
    StreamCard,
  },

  data() {
    return {
      streamDataListener: null,
      thumbnailInterval: null,
      streams: [],
      thumbnails: [],
      loading: true,
      imageIndex: 0,
    };
  },

  methods: {
    getData() {
      //console.log("im in getData");
      const streamRef = db
        .collection("streams")
        .where("live", "==", true)
        .limit(16);
      this.streamDataListener = streamRef.onSnapshot(
        async (res) => await this.dataChanged(res.docs),
        (error) => console.warn(error)
      );
      console.log("broooo");
    },

    async dataChanged(docs) {
      //console.log("in streamgrid data changed");
      //docs = await $axios.get("http://localhost:3000/v1/channels/live");
      //docs = await $axios.get("http://us-central1-hark-e2efe.cloudfunctions.net/api/utils/live");
      docs = await $axios.get(`${process.env.API_URL}/utils/live`);
      this.streams = docs.map( doc => {
          const stream = doc.data();
          const thumbnail = ( stream.live ? stream.thumbnail : stream.cover ) || stream.cover;
          return {
            title     : stream.title,
            live      : stream.live,
            nsfw      : stream.nsfw,
            owner     : stream.owner,
            thumbnail : thumbnail,
            name      : stream.user.name,
          }
        });
        this.thumbnails = this.streams.map( stream => stream.thumbnail );
        this.loading = false;
    },

    updateThumbnails() {
      console.log("streamgrid thumbnmail update");
      if (this.imageIndex < this.streams.length) this.imageIndex++;
      if (this.imageIndex === this.streams.length) this.imageIndex = 0;

      const coeff = 1000 * 60; // ms * sec
      const timestamp = Math.round(Date.now() / coeff);

      const _thumbnail =
        this.thumbnails[this.imageIndex] ||
        "https://cdn.discordapp.com/attachments/814278920168931382/823092021753413633/hark-title.png";

      this.streams[this.imageIndex].thumbnail = `${_thumbnail}?${timestamp}`;
    },
  },

  computed: {
    ...mapGetters({
      getChannelViews: VStore.$getters.getChannelViews,
    }),

    streamerList() {
      const streams = this.streams.map((stream) => {
        return { ...stream, viewCount: this.getChannelViews(stream.name) || 0 };
      });
      let streamlist = streams.sort((a, b) => b.viewCount - a.viewCount);
      this.$emit("getHighestViewCount", streamlist[0].viewCount);
      this.$emit("getHighestViews", streamlist[0]);
      return streamlist;
    },
  },

  created() {
    this.loading = !this.streamers;
    this.streams = this.streamers;
    console.log("streamgrid created");
    if (this.streams)
      this.thumbnails = this.streams.map((stream) => stream.thumbnail);
  },

  mounted() {
    console.log("streamgrid mnounted");
    // Wait 30 seconds before attaching DB listener
    /*if (this.streams && this.streams.length > 0) {
      setTimeout(() => this.getData(), 3 * 1000);
      console.log("lol 3 seconds");
    } else this.getData();
    this.thumbnailInterval = setInterval(
      () => this.updateThumbnails(),
      10 * 1000
    );*/
  },

  beforeDestroy() {
    if (this.streamDataListener) this.streamDataListener();
    if (this.thumbnailInterval) clearInterval(this.thumbnailInterval);
  },
};
</script>
