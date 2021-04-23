<template>
    <v-card class="mb-4 pa-3">
        <!-- title -->
        <v-flex class="mb-3">
            <h2>Custom Token Stats</h2>
        </v-flex>
        <v-flex class="d-flex">
            <img
                class="custom-token-image mr-4"
                src="https://cdn.discordapp.com/attachments/814278920168931382/827009394113642496/custom_token.png"
            />
            <div>
                <div class="mb-4">
                    <h3>{{ contractData.symbol }}</h3>
                    <div>
                        Contract: {{ contractData.address }}
                        <a
                            :href="`https://beta-explorer.thetatoken.org/account/${contractData.address}`"
                            target="_blank"
                        >
                            <v-icon small> mdi-link </v-icon>
                        </a>
                    </div>
                    <div>
                        Owner: {{ contractData.owner }}
                        <a
                            :href="`https://beta-explorer.thetatoken.org/account/${contractData.owner}`"
                            target="_blank"
                        >
                            <v-icon small> mdi-link </v-icon>
                        </a>
                    </div>
                    <div>
                        TFUEL Redistributed: {{ contractData.tfuelReleased }}
                    </div>
                    <div></div>
                    <div></div>
                </div>
            </div>
        </v-flex>
        <div class="space">
            <v-card class="d-flex flex-column mb-4 pa-3">
                <h3>SUPPORTERS</h3>
                <div class="d-flex">
                    <div class="container">
                        <DoughnutChart
                            v-if="holderChartLoaded"
                            :chartdata="holderChartData"
                            :options="options"
                            class="small-graph"
                        />
                    </div>
                </div>
            </v-card>
        </div>
        <div class="space">
            <v-card class="d-flex flex-column mb-4 pa-3">
                <h3>SHAREHOLDERS</h3>
                <div class="d-flex">
                    <div class="container">
                        <DoughnutChart
                            v-if="payeeChartLoaded"
                            :chartdata="payeeChartData"
                            :options="options"
                            class="small-graph"
                        />
                    </div>
                </div>
            </v-card>
        </div>
    </v-card>
</template>

<script>
export default {
    data() {
        return {
            holderChartLoaded: false,
            holderChartData: null,
            payeeChartLoaded: false,
            payeeChartData: null,

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
        };
    },
    methods: {
        async getContractData() {
            const { data } = await this.$axios.get(
                `${process.env.API_URL}/theta/gov-contract/${this.uid}`
                //`http://localhost:5001/hark-e2efe/us-central1/api/theta/gov-contract/testuid2`
            );
            if (data.success) {
                this.contractData = data.data;

                await this.genChartData();
            }
        },
        async genChartData() {
            const holders = Object.keys(this.contractData.holders);
            const amounts = Object.values(this.contractData.holders);
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
    async mounted() {
        await this.getContractData();
    },
};
</script>

<style>
</style>