<template>
    <v-sheet style="height:100%;">
        <div v-if="hasCustom">
            <!-- title -->
            <v-sheet class="background1">
                <v-banner color="transparent">
                    <v-flex>
                        <h2 style="font-size:1.5em;font-weight:400;color:white;">Custom Token Statistics</h2>
                    </v-flex>
                </v-banner>
                <v-divider class="mb-3" style="border-color:white;"></v-divider>
                <v-flex class="d-flex pa-2 pb-5">
                    <img
                        class="custom-token-image mx-4"
                        src="https://cdn.discordapp.com/attachments/814278920168931382/827009394113642496/custom_token.png"
                    />
                    <div>
                        <h3 style="font-size:1.2em;font-weight:500;color:white;">{{ contractData.symbol }}</h3>
                        <v-divider class="mt-3 mb-2" style="border-color:white;"></v-divider>
                        <div class="pb-2 white--text">
                            CONTRACT: {{ contractData.address }}
                            <a
                                :href="`https://beta-explorer.thetatoken.org/account/${contractData.address}`"
                                target="_blank"
                            >
                                <v-icon small> mdi-link </v-icon>
                            </a>
                        </div>
                        <div class="mb-7 white--text">
                            OWNER: {{ contractData.owner }}
                            <a
                                :href="`https://beta-explorer.thetatoken.org/account/${contractData.owner}`"
                                target="_blank"
                            >
                                <v-icon small> mdi-link </v-icon>
                            </a>
                        </div>
                        <div class="white--text">
                            TFUEL REDISTRIBUTED:
                            {{ contractData.tfuelReleased }}
                        </div>
                    </div>
                </v-flex>
                <v-divider class="my-2" style="border-color:white"></v-divider>
                <v-flex class="d-flex justify-space-around flex-warp wrap pa-3">
                    <v-sheet color="transparent" class="d-flex flex-column mb-4 pa-3">
                        <h3 style="font-size:1.2em;font-weight:500;color:white;">SUPPORTERS</h3>
                        <v-divider class="mt-1" style="border-color:white"></v-divider>
                        <div class="d-flex" style="max-width:700px;">
                            <div class="container">
                                <DoughnutChart
                                    v-if="holderChartLoaded"
                                    :chartdata="holderChartData"
                                    :options="options"
                                    class="small-graph"
                                    style="color:white;"
                                />
                            </div>
                        </div>
                    </v-sheet>
                    <v-sheet color="transparent" class="d-flex flex-column mb-4 pa-3">
                        <h3 style="font-size:1.2em;font-weight:500;color:white;">SHAREHOLDERS</h3>
                        <v-divider class="mt-1" style="border-color:white"></v-divider>
                        <div class="d-flex" style="max-width:700px;">
                            <div class="container">
                                <DoughnutChart
                                    v-if="payeeChartLoaded"
                                    :chartdata="payeeChartData"
                                    :options="options"
                                    class="small-graph"
                                />
                            </div>
                        </div>
                    </v-sheet>
                </v-flex>
            </v-sheet>
        </div>
        <v-banner v-else class="barground">
            <v-flex>
                <h2 style="font-size:1.5em;font-weight:400;color:white;">No Custom Token Yet</h2>
            </v-flex>
        </v-banner>
    </v-sheet>
</template>

<script>
import { mapGetters, mapState } from "vuex";
import { VStore } from "@/store";
import DoughnutChart from "../Chart/DoughnutChart.vue";
export default {
    components: { DoughnutChart },
    props: {
      uid: { type: String }
    },
    data() {
        return {
            holderChartLoaded: false,
            holderChartData: null,
            payeeChartLoaded: false,
            payeeChartData: null,
            
            hasCustom: false,
            
            contractData: {
                address: "",
                owner: "",
                symbol: "",
                holders: {},
                totalSupply: 0,
                shares: [],
                payees: [],
                tfuelReleased: 0,
            },
            options: {
                legend: {
                    labels: {
                        fontColor: "white"
                    }
                }
            },
        };
    },
    methods: {
        async getContractData() {
            const { data } = await this.$axios.get(
                `${process.env.API_URL}/theta/gov-contract/${this.uid}`
                //`http://localhost:5001/hark-e2efe/us-central1/api/theta/gov-contract/testuid2`
            );
            if (data.success) {
                this.hasCustom = true;
                this.contractData = data.data;

                await this.genChartData();
            }
            else {
                this.hasCustom = false;
            }
        },
        async genChartData() {
            let holders = Object.keys(this.contractData.holders);
            let amounts = Object.values(this.contractData.holders);
            if(holders.length == 0){
                holders = [`No one owns any ${this.contractData.symbol} :(`];
                amounts = [100];
            } 
            this.holderChartData = {
                labels: holders,
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

            this.holderChartLoaded = true;

            this.payeeChartData = {
                labels: this.contractData.payees,
                datasets: [
                    {
                        label: "Shares",
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
                        data: this.contractData.shares,
                    },
                ],
            };

            this.payeeChartLoaded = true;
        },
    },
    computed: {
        // ...mapGetters({
        //     uid: VStore.$getters.getUID,
        // }),
    },
    async mounted() {
        await this.getContractData();
    },
};
</script>

<style>

    .background1 {
        background: rgb(40, 40, 87);
        background: linear-gradient(
            45deg,
            rgba(40, 40, 87, 1) 0%,
            rgba(177, 87, 87, 1) 100%
        );
    }

    .barground {
        background: rgb(40,38,80);
        background: linear-gradient(60deg, rgba(40,38,80,1) 0%, rgba(94,59,87,1) 100%); 
    }

</style>