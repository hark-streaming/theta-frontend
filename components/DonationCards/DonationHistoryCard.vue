<template>
  <v-card class="mb-4 pa-3">
    <!-- title -->
    <v-flex class="mb-3">
      <h2>Donation History</h2>
      <div>
        This is a summary of the donations that you have given out in the past.
        See which causes you donate to the most, and in the future, earn badge
        NFTs for the communities that you engage in!
      </div>
      <div class="d-flex">
        <div class="container">
          <DoughnutChart :chartdata="chartdata" :options="options" class="small-graph" />
        </div>
      </div>
    </v-flex>
  </v-card>
</template>

<script>
import { auth, db, storage } from "@/plugins/firebase";
import { mapGetters, mapState } from "vuex";
import { VStore } from "@/store";
import DoughnutChart from "../Chart/DoughnutChart.vue";

export default {
  data() {
    return {
      chartdata: {
        labels: [123, 456],
        datasets: [
          {
            label: "Data One",
            backgroundColor: "#f87979",
            data: [345, 123],
          },
          {
            label: "Date Two",
            backgroundColor: "#fe5563",
            data: [100, 566],
          },
        ],
      },
      options: null,
    };
  },
  components: { DoughnutChart },
  methods: {},
  computed: {
    ...mapGetters({
      uid: VStore.$getters.getUID,
      user: VStore.$getters.getUser,
      username: VStore.$getters.getUsername,
      isStreamer: VStore.$getters.isStreamer,
    }),
  },
  async mounted() {},
};
</script>

<style>
.custom-token-image {
  width: 275px;
  height: 200px;
}

.small-graph {
  width: 250px;
}

</style>