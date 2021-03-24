<!-- Page containing donation cards -->

<template>
    <v-container class="pt-8">
        <v-row 
            :justify="start"
            :align="start"
        >
            <template v-for="(card, index) in dcards">
                <v-col :key="index" cols="4">
                    <donation-card 
                        :bgimage="card.bgimage"
                        :mainimage="card.mainimage"
                        :title="card.title"
                        :longdesc="card.longdesc"
                        :shortdesc="card.shortdesc"
                        :link="card.link"/>
                </v-col>

                <v-responsive
                    v-if="index === 3"
                    :key="`width-${index}`"
                    width="100%">
                </v-responsive>
            </template>
        </v-row>
    </v-container>
</template>

<script>

import DonationCard from '../components/DonationCards/DonationCard.vue';

export default {

    components: {
        DonationCard
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

    const getDCards = async () => {
      try {

        const { data } = await $axios.getSSR(
          `${process.env.API_URL}/dcards/get/list`,
          {
            timeout,
          }
        );

        if (data && data.success) {
          return {
            dcards: data.cards
          };
        } else {
          console.log(`API Error:`, data);
        }

      } catch (error) {
        console.error(
          `Failed to get dcards from API server: ${error.message}`
        );
        return {
          dcards: []
        };
      }
      console.log(`Failed to get dcards from API server`);
      return {
        dcards: []
      };
    };

    const cards = await getDCards();

    return {
      dcards: cards.dcards,
    };
  },

    methods: {
        getNumRows() {
            return this.dcards.length / 3;
        }
    }
}
</script>
