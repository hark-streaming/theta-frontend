<template>
    <v-card tile flat color="#F5F5F5" style="width:100%;" class="d-flex flex-column outside">
        <v-card tile>
            <v-card-actions>
                <h2 class="pl-1">Donation History</h2>
                <v-spacer></v-spacer>
                <v-btn icon @click="show = !show">
                    <v-icon>{{
                        show ? "mdi-chevron-up" : "mdi-chevron-down"
                    }}</v-icon>
                </v-btn>
            </v-card-actions>

            <v-expand-transition>
                <div v-show="show">
                    <v-divider></v-divider>

                    <v-card-text>
                        This is a summary of all the donations that you have
                        given out in the past. See which causes you donate to
                        the most, and in the future, earn badge NFTs for the
                        communities that you engage in.
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
                    <h3>TOKENS</h3>
                    <div class="d-flex">
                        <div class="container">
                            <DoughnutChart
                                v-if="loaded"
                                :chartdata="chartdata"
                                :options="options"
                                class="small-graph"
                            />
                        </div>
                    </div>
                </v-card>
            </div>
            <div class="space">
                <v-card class="d-flex flex-column mb-4 pa-3">
                    <h3>RECENT TFUEL DONATED</h3>
                    <div v-if="!hasDonations"> No recent donations.</div>
                    <div
                        class="d-flex"
                        v-for="(transaction, index) in transactions"
                        :key="index"
                    >             
                        <div class="my-1">
                            <span> {{ transactions[index].tfuelPaid }} TFUEL </span>
                            <span>
                                to {{ transactions[index].recipient }}
                            </span>
                            <a
                                :href="`https://beta-explorer.thetatoken.org/txs/${transactions[index].hash}`"
                                target="_blank"
                            >
                                <v-icon small> mdi-link </v-icon>
                            </a>
                        </div>
                    </div>
                </v-card>
            </div>
            <!-- <div class="space">
                <v-card class="d-flex flex-column mb-4 pa-3">
                    <h3>STREAMER COMMUNITIES</h3>
                    <div class="d-flex">
                        <div class="container">
                            <DoughnutChart
                                :chartdata="chartdata2"
                                :options="options"
                                class="small-graph"
                            />
                        </div>
                    </div>
                </v-card>
            </div> -->
        </v-flex>
    </v-card>
</template>

<script>
import { auth, db, storage } from "@/plugins/firebase";
import { mapGetters, mapState } from "vuex";
import { VStore } from "@/store";
import DoughnutChart from "../Chart/DoughnutChart.vue";

export default {
    components: { DoughnutChart },
    props: {},
    data() {
        return {
            transactions: [],
            hasDonations: false,
            loaded: false,
            chartdata: null,
            chartdata2: {
                labels: [
                    "Fuelman",
                    "Gorgot",
                    "Davidson",
                    "Pollit",
                    "Demographica",
                ],
                datasets: [
                    {
                        label: "Data One",
                        backgroundColor: [
                            "green",
                            "blue",
                            "purple",
                            "pink",
                            " orange",
                        ],
                        data: [120, 600, 310, 250, 500],
                    },
                ],
            },
            options: null,
            show: false,
        };
    },

    methods: {
        async getChartData() {
            this.loaded = false;
            const { data } = await this.$axios.get(
                `${process.env.API_URL}/theta/tokens/${this.uid}`
                //`${process.env.API_URL}/theta/tokens/WbQpVz9J6FYSUFgtvn8XPQvyeD03`
            );
            if (data.success) {
                const tokens = Object.keys(data.tokens);
                const amounts = Object.values(data.tokens);
                this.chartdata = {
                    labels: tokens,
                    datasets: [
                        {
                            label: "Tokens",
                            backgroundColor: [
                                "#DAF7A6",
                                "#FFC300",
                                "#FF5733",
                                "#C70039",
                                "#900C3F",
                                "#581845",
                                "#33b5ff",
                                "#ff3399",
                            ],
                            data: amounts,
                        },
                    ],
                };
                this.hasTokens = true;
            } else {
                this.hasTokens = false;
                this.chartdata = {
                    labels: ["No custom tokens owned :("],
                    datasets: [
                        {
                            label: "Tokens",
                            backgroundColor: [],
                            data: [1],
                        },
                    ],
                };
            }

            this.loaded = true;
        },
        async getDonationData() {
            const { data } = await this.$axios.get(
                `${process.env.API_URL}/theta/recent-donations/${this.uid}`
            );
            if (data.success) {
                const timestamps = Object.keys(data.transactions);
                console.log(timestamps);

                timestamps.forEach((ts) => {
                    this.transactions.push(data.transactions[ts]);
                });
                this.hasDonations = true;
            }
            else {
                this.hasDonations = false;
            }

        },
    },
    computed: {
        ...mapGetters({
            uid: VStore.$getters.getUID,
            user: VStore.$getters.getUser,
            username: VStore.$getters.getUsername,
            isStreamer: VStore.$getters.isStreamer,
        }),
    },
    async mounted() {
        await this.getChartData();
        await this.getDonationData();
    },
};
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,300;0,400;1,300&display=swap");
@import url("https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,300;0,400;1,300&family=Raleway:ital,wght@0,100;0,200;0,300;0,400;1,100;1,200;1,300&display=swap");
@import url("https://fonts.googleapis.com/css2?family=PT+Sans&display=swap");
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&family=PT+Sans&display=swap");

.space {
    padding-right: 15px;
}
.outside {
    background: rgba(255, 255, 255, 0.3);
}

h2 {
    font-weight: 600;
    font-size: 20px;
}

h3 {
    font-weight: 400;
    font-family: "Inter", sans-serif;
    color: #65547c;
    font-size: 15px;
}
p {
    font-family: "Inter", sans-serif;
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