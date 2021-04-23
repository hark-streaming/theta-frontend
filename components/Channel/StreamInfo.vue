<template>
  <div>
    <!-- Stream Title, Status -->
    <v-toolbar
      color="neutral"
      dense
      prominent
      flat
    >

      <v-container style="{height:'100%';}" align="stretch" class="ma-0 pa-0 pt-3">
        <v-row class="ma-0 pb-2">
          <!-- Live / Replay / Offline Indicator -->
          <v-chip
            class="flex-shrink-0"
            :class="{ blink: live }"
            :color="live ? 'red' : replay ? 'blue' : 'grey'"
            label
            outlined
            small
          >
            <v-icon
              v-show="live"
              left
              size="10"
              class="mr-2"
            >lens</v-icon>
            {{ live ? 'LIVE' : replay ? 'REPLAY' : 'offline' }}
          </v-chip>

          <!-- Stream Title -->
          <h3 class="mx-2 pl-3 flex-grow-1 subtitle-1 font-weight-medium text-truncate" :title="title">
            {{ title }}
          </h3>

          <share-stream :user="name" />

        </v-row>
    
        <!-- Tags -->
        <v-row class="ma-0 py-2">
          <!-- <vue-tags
            :active="tags"
            :all="tags"
            :element-count-for-start-arrow-scrolling="3"
            :tab-index="1"
            :tag-creation-enabled="false"
            :colors-enabled="false"
            :tag-color-default="'green'"
            :tag-list-label="'Stream Topics'"
            :placeholder="'Select a stream topic....'"
          /> -->

          <!-- <v-chip 
            v-for="(tag, index) in tags" 
            :key="index"
            small
            color="green"
            text-color="white"
            class="mr-2"
            label
            >
            {{ tag }}
          </v-chip> -->

          <TempTags :tags="tags" />
        </v-row>

      </v-container>

      <!-- Bottom Tabs -->
      <template #extension>
        <v-tabs
          v-model="tabData"
          background-color="transparent"
          color="secondary"
          class="no-focus"
          show-arrows
        >
          <v-tab :ripple="false" style="font-size:0.8em;">{{ replay ? 'Summary' : 'Description' }}</v-tab>
          <!-- <v-tab>Replays</v-tab> -->
          <v-tab :ripple="false" style="font-size:0.8em;">Theta</v-tab>

          <v-tab :ripple="false" style="font-size:0.8em;">Custom Token</v-tab>

          <!-- Removed the Stream Stats -->
          <!-- <v-tab v-if="!replay">Stream Stats</v-tab> -->
        </v-tabs>
      </template>

    </v-toolbar>

    <v-sheet style="height:100vh" color="#F2F2F2">

      <!-- Stream Actions -->
      <div class="d-flex flex-shrink-0 align-center flex-wrap px-3 py-2">
        <div
          class="caption grey--text my-2"
          :title="timestamp"
        >
          <v-icon
            v-show="replay"
            size="16"
            color="grey"
          >restore</v-icon>
          <div class="d-inline-block">
            {{ live
            ? 'Started Streaming: '
            : replay
            ? 'Streamed: '
            : 'Last Streamed: ' }}
          </div>
          <v-fade-transition mode="out-in">
            <div
              class="d-inline-block"
              :key="lastStreamed"
            >
              {{ lastStreamed }}
            </div>
          </v-fade-transition>
        </div>

        <v-spacer />

        <div class="d-flex">
          <!-- Edit Stream Info Dialog -->
          <edit-stream-data
            v-if="channelOwner"
            :username="username"
            :title="title"
            :description="description"
            :nsfw="nsfw"
          />

          <!-- Restream Dialog -->
          <!-- <restream-dialog
            v-if="channelOwner"
            :username="name"
            :owner="uid"
            :live="live"
          /> -->
        </div>

        <!-- Share Stream Dialog -->
      </div>

      <v-divider />

      <!-- Stream Data -->
      <v-tabs-items
        v-model="tabData"
        style="background:transparent;height:100%;"
        touchless
      >
        <!-- Description -->
        <v-tab-item style="height:100%;" color="#DCDCDC">
          <div
            id="description"
            ref="description"
            class="pa-3"
            style="height:100%;"
          >
            <!-- Stream Description -->
            <vue-markdown
              v-if="description && !replay"
              :source="description"
            />
          </div>
        </v-tab-item>

        <!-- Archives -->
        <!-- <v-tab-item>
          <div>
            <stream-archives
              style="min-height: 300px"
              :streamer="name"
            />
          </div>
        </v-tab-item> -->

        <!-- Theta -->
        <v-tab-item>
          <theta-tab />
        </v-tab-item>

        <!-- Custom Token -->
        <v-tab-item>
          <custom-token-tab :streamerId="streamerId" />
        </v-tab-item>

        <!-- Debug Stream -->
        <!--
        <v-tab-item
          v-if="!replay"
        >
          <div>
            <debug-stream
              style="min-height: 300px"
              :streamer="name"
            />
          </div>
        </v-tab-item>
        -->
      </v-tabs-items>
    
    </v-sheet>

    <!-- Footer -->
    <!-- <simple-footer :version="version" /> -->
  </div>
</template>

<script>
  import { mapGetters } from 'vuex';
  import { VStore } from '@/store';
  import TempTags from '@/components/TempTags';

  import { timeAgo } from '@/assets/js/time-ago';

  // Imported Components
  import VueMarkdown from '@/components/VueMarkdown';
  import ShareStream from '@/components/Channel/ShareStream';

  // Async Components - We don't expect these components to be required frequently
  const EditStreamData = async () => await import ( '@/components/Channel/EditStreamData' );
  const StreamArchives = async () => await import ( '@/components/Channel/StreamArchives' );
  // const RestreamDialog = async () => await import ( '@/components/Restream/RestreamDialog' );
  const DebugStream = async () => await import ( '@/components/Analytics/DebugStream' );

  export default {
    name: 'LiveStreamInfo',

    components: {
      VueMarkdown,
      ShareStream,
      EditStreamData,
      StreamArchives,
      // RestreamDialog,
      DebugStream,
      TempTags
    },

    props: {
      name:  { type: String },
      live:  { type: Boolean },
      title: { type: String },
      nsfw:  { type: Boolean },
      description: { type: String },
      timestamp: { type: Date },
      replay: { type: Boolean },
      tags: { type: Array },
      streamerId: { type: String }
    },

    data () {
      return {
        tabData: 0,
        lastStreamed: '• • •',
        updateInterval: null,
        tags: []
      };
    },

    methods: {
      updateLastStreamedAt () {
        if ( this.timestamp ) {
          try {
            this.lastStreamed = timeAgo( this.timestamp );
          } catch {
            this.lastStreamed = 'now';
          }
        } else {
          this.lastStreamed = '• • •';
        }
      },
    },

    computed: {
      ...mapGetters({
        username: VStore.$getters.getUsername,
        uid: VStore.$getters.getUID,
        isStreamer : VStore.$getters.isStreamer,
        isAdmin  : VStore.$getters.isAdmin,
        getFeatureFlag : VStore.$getters.getFeatureFlag,
      }),

      featureFlag () {
        const flags = this.getFeatureFlag( 'streamStats' );
        if ( flags._disabled ) return false;
        if ( flags._enabled ) return true;
        if ( flags.users && this.uid ) return true;
        if ( flags.streamers && this.isStreamer ) return true;
        if ( flags.owner && this.channelOwner ) return true;
        if ( flags.admin && this.isAdmin ) return true;
        return false;
      },

      channelOwner () {
        if ( !this.username || !this.name ) return false;
        return this.name.toLowerCase() === this.username.toLowerCase();
      },

      version () {
        return `v${process.env.version}`;
      },
    },

    watch: {
      timestamp: function ( val, oldVal ) {
        this.updateLastStreamedAt();
      }
    },

    created () {
      const tabQuery = this.$route.query[ 'tab' ];
      if ( !tabQuery ) return;
      if ( typeof tabQuery === 'string' ) {
        switch ( this.$utils.normalize( tabQuery ) ) {

          // Replays
          /* case 'replay':
          case 'replays':
          case 'archive':
          case 'archives':
            this.tabData = 1;
            console.log( `replay tab` );
            break; */

          // Stream Stats
          case 'stat':
          case 'stats':
          case 'stream-stats':
            this.tabData = 2;
            console.log( `stream stats tab` );
            break;

          // Failsafe
          default:
            this.tabData = 0;
            break;
        }
      }
    },

    mounted () {
      this.updateInterval = setInterval( this.updateLastStreamedAt, 60 * 1000 );
      this.updateLastStreamedAt();
    },

    beforeDestroy() {
      if ( this.updateInterval ) clearInterval( this.updateInterval );
    }
  };
</script>

<style lang="scss">
  .v-tabs.no-focus {
    .v-tab--active:hover::before,
    .v-tab--active::before {
      opacity: 0;
    }
  }

  .tn-overview-with-traffic-chart-widget {
    background: #000 !important;
  }
</style>
