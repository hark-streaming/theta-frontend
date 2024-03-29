<template>
  <div class="text-center">
    <v-btn
      v-on="on"
      small
      color="primary"
      outlined
      @click="openShare"
    >
      share
      <v-icon small class="ml-1">share</v-icon>
    </v-btn>

    <v-dialog
      v-model="showShare"
      bottom
      offset-y
      left
      :close-on-content-click="false"
      width="450px"
      transition="fade-transition"
    >
      <!-- Share stream dialog -->
      <v-card class="justify-space-between align-center">
        <div class="d-flex align-center justify-space-between py-2 px-3">
          <h4 class="pl-1 body-1 black--text">
            Share this Stream
          </h4>
          <v-btn
            color="black"
            text
            icon
            small
            @click="showShare = !showShare"
          >
            <v-icon>close</v-icon>
          </v-btn>
        </div>
        <v-divider></v-divider>
        <div class="pa-3">
          <div class="pl-1 mb-3" style="font-size:0.9em;">
            Share a link directly to this stream on Twitter below.<br>
            <span class="caption grey--text">(You will be able to edit the tweet before posting.)</span>
          </div>

          <!-- Display canonical link -->
          <v-text-field
            class="mb-3"
            :value="streamlink"
            solo
            readonly
            hide-details
            light
            style="font-size: 14px;"
          >
            <template #append v-if="!$vuetify.breakpoint.xsOnly">
              <v-btn
                color="secondary"
                depressed
                small
                @click="copyShareLink"
              >Copy Link</v-btn>
            </template>
          </v-text-field>

          <div class="d-flex">
            <!-- Share to twitter -->
            <v-btn
              color="secondary"
              outlined
              :href="twitterLink"
              target="_blank"
              @click="shareToTwitter"
            >twitter</v-btn>

            <!-- Copy button for phones -->
            <template v-if="$vuetify.breakpoint.xsOnly">
              <v-spacer />
              <v-btn
                color="secondary"
                @click="copyShareLink"
              >Copy</v-btn>
            </template>
          </div>
        </div>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
  import { shortUUID } from '@/assets/js/short-uuid';

  export default {
    name: 'ShareStream',

    props: {
      user: {
        type: String
      },
    },

    data() {
      return {
        showShare: false,
        shareId: null,
      };
    },

    methods: {
      openShare () {
        this.showShare = true;

        this.$ga.event({
          eventCategory : 'share',
          eventAction   : 'show share stream',
          eventLabel    : this.user,
        });
      },

      shareToTwitter () {
        this.$ga.event({
          eventCategory : 'share',
          eventAction   : 'share to twitter',
          eventLabel    : this.user,
        });
      },

      async copyShareLink () {
        await this.copyToClipboard( this.shareLink );
      },

      async copyToClipboard ( text ) {
        try {
          await navigator.clipboard.writeText( text );
          // await this.$copyText( text );
          this.$toast.success( 'Copied to clipboard', { icon: 'done', duration: 5000 } );
        } catch ( error ) {
          console.log( error );
          this.$toast.error( `Copy Failed: ${error}`, { icon: 'error', duration: 5000 } );
        }

        this.$ga.event({
          eventCategory : 'share',
          eventAction   : 'copy link',
          eventLabel    : this.user,
        });
      },
    },

    computed: {
      cacheBust () {
        return `?sid=${this.shareId}`;
      },

      streamlink () {
        return `https://alpha.hark.tv/channel/${this.user}`;
      },

      shareLink () {
        return `${this.streamlink}${this.cacheBust}`;
      },

      twitterLink () {
        const text = `Come watch ${this.user}'s stream!\n`;
        const url = this.shareLink;
        const hashtags = 'hark';
        const via = 'harktv';
        const related = 'harktv';
        const base = 'https://twitter.com/intent/tweet';

        return `${base}?text=${encodeURI(text)}&url=${url}&hashtags=${hashtags}&via=${via}&related=${related}`;
      },
    },

    mounted() {
      this.shareId = shortUUID()
    }
  };
</script>
