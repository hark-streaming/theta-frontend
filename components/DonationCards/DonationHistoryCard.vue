<template>
  <v-card class="d-flex flex-column outside mb-4">
    <v-card class="secondary--text">
      <v-card-actions>
        <v-card-title><h2>DONATION HISTORY</h2></v-card-title>
        <v-spacer></v-spacer>
        <v-btn
          icon
          @click="show = !show"
        >
          <v-icon>{{ show ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
        </v-btn>
      </v-card-actions>

      <v-expand-transition>
        <div v-show="show">
          <v-divider></v-divider>

          <v-card-text>
            This is a summary of all the donations that you have given out in the past.
            See which causes you donate to the most, and in the future, earn badge
            NFTs for the communities that you engage in.
          </v-card-text>
        </div>
      </v-expand-transition>
    </v-card>

    <!-- <v-card class="d-flex">
      <v-card tile color="secondary" class="d-flex pa-3 white--text">
              //<v-icon class="mr-3" color="white">person</v-icon>
        <h2>DONATION HISTORY</h2>
      </v-card>
      // title
      <div class="d-flex pa-3">
        <p>
          This is a summary of all the donations that you have given out in the past.
          See which causes you donate to the most, and in the future, earn badge
          NFTs for the communities that you engage in.</p>
      </div>
    </v-card>-->
    <v-flex class="d-flex flex-wrap wrap pa-3">
      <div class="space">
        <v-card class="d-flex flex-column mb-4 pa-3">
            <h3>CAUSES</h3>
            <div class="d-flex">
              <div class="container">
                <DoughnutChart :chartdata="chartdata" :options="options" class="small-graph" />
              </div>
            </div>
        </v-card>
      </div>
      <div class="space">
        <v-card class="d-flex flex-column mb-4 pa-3">
            <h3>STREAMER COMMUNITIES</h3>
            <div class="d-flex">
              <div class="container">
                <DoughnutChart :chartdata="chartdata2" :options="options" class="small-graph" />
              </div>
            </div>
        </v-card>
      </div>
      <div class="space">
        <v-card class="d-flex flex-column mb-4 pa-3">
            <h3>DONATIONS OVER TIME</h3>
            <div class="d-flex">
              <div class="container">
                <DoughnutChart :chartdata="chartdata2" :options="options" class="small-graph" />
              </div>
            </div>
        </v-card>
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
  props: {
    //
    yourTags: [
      { "name": {type: String},
        "amount": {type: Number}
      }
    ],
    //numLabelsL: [{ type: Number }],
    yourTokens: [
      { "name": {type: String},
        "amount": {type: Number}
      }
    ],
    //numLabelsS: [{ type: Number }],
  },
  data() {
    return {
      chartdata: {
        //labels: yourLabels,
        labels: ['Oil', 'Animal Cruelty', 'Global Warming', 'Education'],
        datasets: [
          {
            label: "Data One",
            backgroundColor: ["green", "blue", "purple", "pink"," orange"],
            data: [345, 200, 742, 400, 532],
          },
          /*{
            label: "Data Two",
            backgroundColor: "red",
            data: [100],
          },*/
        ],
      },
      chartdata2: {
        labels: ['Fuelman', 'Gorgot', 'Ben Shapeero', 'Joe mama'],
        datasets: [
          {
            label: "Data One",
            backgroundColor: ["green", "blue", "purple", "pink"," orange"],
            data: [120, 600, 310, 250, 500],
          },
        ]
      },
      options: null,
      show: false,
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

<style scoped>

@import url('https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,300;0,400;1,300&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,300;0,400;1,300&family=Raleway:ital,wght@0,100;0,200;0,300;0,400;1,100;1,200;1,300&display=swap');
@import url('https://fonts.googleapis.com/css2?family=PT+Sans&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&family=PT+Sans&display=swap');

.space {
  padding-right: 15px;
}
.outside {
  background: rgba(255, 255, 255, 0.3);
}

h2 {
  font-weight: 400;
  font-family: 'Inter', sans-serif;
  font-size: 20px;
}

h3 {
  font-weight: 400;
  font-family: 'Inter', sans-serif;
  color: #54547c;
  font-size: 15px;
}
p {
  font-family: 'Inter', sans-serif;
  font-size: 14px;
}

.custom-token-image {
  width: 275px;
  height: 200px;
}

.small-graph {
  width: 250px;
}

</style>