<template>
  <div>
    <v-card
      class="stream-card"
      :to="to"
      no-prefetch
      color="transparent"
      flat
    >
      <!-- Thumbnail -->
      <v-img
        :src="image"
        :key="image"
        :lazy-src="lazyImg"
        :aspect-ratio="16/9"
        class="stream-card-thumbnail"
        :class="{ 'blur': blurImage, 'no-blur': !blurImage }"
      />

      <!-- View Counter -->
      <div class="view-counter">
        <v-chip
          color="#DCDCDC"
          small
          tile
        >
          <div v-if="live" class="d-flex align-center">
            <div class="black--text">{{ viewers == 0 ? '0' : viewers }} viewers</div>
            <v-icon v-show="viewers > 1" color="secondary" class="ml-2" small>visibility</v-icon>
          </div>
          <div v-else class="d-flex align-center">
            <div class="grey--text mr-2">OFFLINE</div>
            <v-icon small>visibility_off</v-icon>
          </div>
        </v-chip>
      </div>

      <!-- Card Data -->
      <div class="pa-2">
        <!-- Stream Data -->
        <div class="body-1 text-truncate text-no-wrap mb-0 white--text">
          {{ title }}
        </div>
        <div class="caption d-flex align-center">

          <div class="d-block text-truncate white--text">{{ name }}</div>

          <!-- NSFW Indicator -->
          <template v-if="nsfw">
            <v-divider vertical class="mx-2"/>
            <div class="d-flex align-center">
              <div class="red--text font-weight-bold">NSFW</div>
            </div>
          </template>

        </div>
      </div>
    </v-card>
  </div>
</template>

<script>
  export default {
    name: 'StreamCard',

    props: {
      to      : { type: String },
      live    : { type: Boolean },
      image   : { type: String },
      nsfw    : { type: Boolean },
      title   : { type: String },
      name    : { type: String },
      viewers : { type: Number },
      blur    : { type: Boolean, default: true },
    },

    data () {
      return {
        lazyImg: "https://cdn.discordapp.com/attachments/814278920168931382/823092021753413633/hark-title.png",
      }
    },

    computed: {
      blurImage () {
        return this.blur && this.nsfw && this.live;
      },
    },

    watch: {
      image ( newValue, oldValue ) {
        this.lazyImg = oldValue;
      },
    },
  }
</script>

<style lang="scss">
  /*.blur > div.v-image__image {
    filter: blur(15px);
    -webkit-filter: blur(15px);
  }*/

  .stream-card-thumbnail {
    & > div.v-image__image {
      filter: blur(0);
      -webkit-filter: blur(0);
      transition: .5s;
    }

    &.blur > div.v-image__image {
      filter: blur(15px);
      -webkit-filter: blur(15px);
    }
  }

  .stream-card {

    .view-counter {
      position: absolute;
      top: 10px;
      right: 10px;
      opacity: .75;
      transition: .3s;
    }

    &:hover {
      .view-counter {
        opacity: 1;
      }
    }
  }

  .v-card--reveal {
    align-items: center;
    bottom: 0;
    justify-content: center;
    opacity: .5;
    position: absolute;
    width: 100%;
  }
</style>
