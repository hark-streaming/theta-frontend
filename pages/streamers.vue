<template>
  <div class="gradient-background fill-height">
    <v-container>
      <v-autocomplete
        v-model="model"
        :label="`Search ${streamers.length} streamers...`"
        no-data-text="No streamers found"
        prepend-inner-icon="search"
        hide-details
        single-line
        solo-inverted
        :items="streamerNames"
        :search-input.sync="search"
        class="mt-4"
        @update:search-input="filterStreamers"

        clearable
        return-object
      >
        <template v-slot:item="data">
          <v-list-item-avatar>
            <img
              :src="`${data.item.avatar}?_bw`"
              :alt="data.item.name"
              crossorigin
            >
          </v-list-item-avatar>
          <v-list-item-title>
            {{ data.item.text }}
          </v-list-item-title>
        </template>
      </v-autocomplete>


      <div class="title font-weight-light mt-4">Search Results: {{ filteredStreamers.length }}</div>


      <v-row>
        <v-col
          cols="12"
          sm="6"
          md="4"
          lg="2"
          v-for="(streamer, index) in filteredStreamers"
          :key="streamer.name"
        >
          <v-lazy
            min-height="150px"
            :options="{ threshold: 0.5 }"
          >
            <stream-card
              :key="streamer.name"
              :to="streamer.to.toString()"
              :image="`${streamer.live ? streamer.thumbnail : streamer.avatar}`"
              :live="streamer.live"
              :nsfw="streamer.nsfw"
              :title="streamer.title"
              :name="streamer.name"
              :viewers="getChannelViews( streamer.name )"
            />
          </v-lazy>
        </v-col>
      </v-row>

      <!--<div>Literally every streamer:</div>
      <v-row>
        <v-col
          cols="12"
          sm="6"
          md="4"
          lg="2"
          v-for="(streamer, index) in streamers"
          :key="streamer.name"
        >
          <v-lazy
            min-height="150px"
            :options="{ threshold: 0.5 }"
          >
            <stream-card
              :key="streamer.name"
              :to="streamer.to.toString()"
              :image="`${streamer.live ? streamer.thumbnail : streamer.avatar}`"
              :live="streamer.live"
              :nsfw="streamer.nsfw"
              :title="streamer.title"
              :name="streamer.name"
              :viewers="getChannelViews( streamer.name )"
            />
          </v-lazy>
        </v-col>
      </v-row>-->

    </v-container>
  </div>
</template>

<script>
  import StreamCard from '@/components/StreamGrid/StreamCard';

  import { mapGetters } from 'vuex';
  import { VStore } from '@/store';

  export default {
    name: 'streamers',

    scrollToTop: true,

    components: {
      StreamCard,
    },

    async asyncData ({ $axios }) {
      // Timeout to prevent SSR from locking up
      const timeout = process.server ? process.env.SSR_TIMEOUT : 0;

      try {
        let { data } = await $axios.getSSR( 'https://api.bitwave.tv/api/channels/list', { timeout } );

        return {
          streamers: data.users,
          filteredStreamers: [],
        }
      } catch ( error ) {
        console.log( `ERROR: Failed to hydrate page:\n`, error );
        error( { statusCode: 500, message: 'Server under heavy load.<br>lease try again later.' } );
      }
    },

    data () {
      return {
        model: null,
        search: '',
        streamers: [],
        filteredStreamers: [],
      }
    },

    methods: {
      filterStreamers () {
        if ( this.model && this.search ) {
          this.filteredStreamers = this.streamers.filter( s => {
            return s.name.toLowerCase().indexOf( this.search.toLowerCase() ) > -1;
          })
            .slice( 0, 100 );
        } else {
          this.filteredStreamers = [];
        }
      },
    },

    computed: {
      ...mapGetters({
        getChannelViews: VStore.$getters.getChannelViews,
      }),

      streamerNames () {
        return this.streamers.map( s => {
          return {
            text   : s.name,
            value  : s.name,
            avatar : s.avatar,
          }
        });
      },

      results () {
        if ( this.model ) {
          this.filteredStreamers = [ this.model ];
        } else {
          this.filteredStreamers = this.streamers;
        }
      },
    },
  }
</script>
