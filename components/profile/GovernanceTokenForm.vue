<template>
    <v-flex xs14 sm12 md10 lg8>
        <!-- Token Info -->
        <v-card class="mb-4 pa-3">
            <!-- title -->
            <v-flex class="mb-3"><h2>Custom Token Management</h2></v-flex>

            <div v-if="tokenExists">
                <v-flex class="d-flex">
                    <img
                        class="custom-token-image mr-4"
                        src="https://cdn.discordapp.com/attachments/814278920168931382/827009394113642496/custom_token.png"
                    />
                    <div>
                        <div class="mb-4">
                            There are about {{ tokenHolders }} registered donors
                            holding
                            <v-tooltip top>
                                <template v-slot:activator="{ on, attrs }">
                                    <a
                                        href="tokens"
                                        v-bind="attrs"
                                        v-on="on"
                                        class="mx-1"
                                    >
                                        {{ tokenData.symbol }} tokens.
                                    </a>
                                </template>
                                <span>
                                    Custom tokens represent loyalty to your
                                    organization. For every 1 TFuel donated,
                                    they gain 100 of your custom tokens.</span
                                >
                            </v-tooltip>
                        </div>
                        <v-text-field
                            v-model="formData.topDonors"
                            outlined
                            label="Your top donors should be called:"
                            @input="enableSave"
                        />
                        <v-text-field
                            v-model="formData.loyalDonors"
                            outlined
                            label="Donors of over 100 TFuel should be called:"
                            @input="enableSave"
                        />
                    </div>
                </v-flex>

                <!-- submission buttons -->
                <v-layout>
                    <v-spacer />
                    <v-btn
                        :disabled="!showSave"
                        :loading="saveLoading"
                        color="primary"
                        outlined
                        @click="updateCardData"
                        >save</v-btn
                    >
                </v-layout>
            </div>
            <div v-else-if="!tokenExists" class="d-flex">
                <img
                    class="custom-token-image mr-4"
                    src="https://cdn.discordapp.com/attachments/814278920168931382/827009394113642496/custom_token.png"
                />
                <div>
                    After generating a
                    <v-tooltip top>
                        <template v-slot:activator="{ on, attrs }">
                            <a
                                href="tokens"
                                v-bind="attrs"
                                v-on="on"
                                class="mx-1"
                            >
                                custom token,
                            </a>
                        </template>
                        <span>
                            Governance tokens are common in the blockchain
                            space, which is what makes Hark special!</span
                        >
                    </v-tooltip>
                    users will gain 100 tokens for every 1 tfuel that they
                    donate. With these custom tokens, you will gain the
                    following extra functionality:
                    <ul class="mt-1">
                        <li>
                            The users with the greatest amount of your
                            governance tokens will gain special titles in your
                            chat.
                        </li>
                        <li>
                            Hold votes on your channel and sort by either number
                            or token count.
                        </li>
                        <li>
                            Engage in future interaction with your viewers as
                            the blockchain technology develops!
                        </li>
                    </ul>
                    <div>
                        Please note, after requesting, token generation may take
                        a few minutes.
                    </div>

                    <!-- submission buttons -->
                    <v-row class="mt-2 pa-3 d-flex">
                        <v-spacer />
                        <v-btn
                            :disabled="tokenRequested"
                            :loading="requestButtonLoading"
                            color="primary"
                            outlined
                            @click="requestCustomToken"
                            >{{ requestButtonMsg }}</v-btn
                        >
                    </v-row>
                </div>
            </div>
            <v-progress-linear
                v-show="tokenRequested"
                indeterminate
                color="primary"
                class="mt-3"
            >
            </v-progress-linear>
        </v-card>

        <!-- Polls -->
        <GovPollForm v-if="tokenExists" />
    </v-flex>
</template>

<script>
import { auth, db, storage } from "@/plugins/firebase";
import { mapGetters, mapState } from "vuex";
import { VStore } from "@/store";
import GovPollForm from "../DonationCards/GovPollForm.vue";

export default {
    components: { GovPollForm },
    data() {
        return {
            // token generation
            tokenExists: false,
            tokenRequested: false,
            requestButtonLoading: true,
            //requestButtonMsg: "Request Custom Token",

            dataLoading: true,

            // token data
            tokenData: {
                name: "Hark Governance Token",
                symbol: "HARK-HARK",
            },
            tokenHolders: 100,

            // form
            formData: {
                topDonors: "Top Donor",
                loyalDonors: "Loyal Donor",
            },

            // form control
            showSave: false,
        };
    },
    methods: {
        enableSave() {
            this.showSave = true;
            this.$emit("saveEnabled");
        },

        disableSave() {
            this.showSave = false;
            this.$emit("saveDisabled");
        },

        async getCardData() {
            this.dataLoading = true;

            let cardDoc = await db.collection("chats").doc(this.uid).get();
            let data = cardDoc.data();

            // if they have previous data load it
            if (data != null) {
                this.formData.topDonors = data.topDonors;
                this.formData.loyalDonors = data.loyalDonors;
            }

            this.dataLoading = false;
        },
        async updateCardData() {
            this.saveLoading = true;
            await db.collection("chats").doc(this.uid).update({
                topDonors: this.formData.topDonors,
                loyalDonors: this.formData.loyalDonors,
            });

            this.saveLoading = false;
        },

        async getTokenData() {
            this.requestButtonLoading = true;

            // check if the token has been requested
            const reqRef = await db.collection("requests").doc(this.uid);
            if (reqRef.exists) {
                this.tokenRequested = true;
            } else {
                this.tokenRequested = false;
                this.requestButtonLoading = false;
                return;
            }

            // check if the token exists and save the name
            const userDoc = await db.collection("users").doc(this.uid).get();
            const userData = await userDoc.data();
            const tokenName = userData?.tokenName;
            if (tokenName) {
                this.tokenData.name = "Governance Token";
                this.tokenData.symbol = tokenName;
            }

            // TODO: get the token holders

            this.requestButtonLoading = false;
        },
        async requestCustomToken() {
            this.requestButtonLoading = true;

            // call api to drop a request for a token
            const token = await auth.currentUser.getIdToken(true);
            let res = await this.$axios.$post(
                `${process.env.API_URL}/theta/request-governance-contract`,
                {
                    idToken: token,
                }
            );
            if (res.success) this.tokenRequested = true;

            this.requestButtonLoading = false;

            // call api to generate the token
            // this call requires admin approval
            // res = await this.$axios.$post(
            //     `${process.env.API_URL}/deploy-governance-contract/${this.uid}`,
            //     {
            //         headers: {
            //             auth: process.env.HARK_ADMIN_KEY,
            //         },
            //     }
            // );
            // if (res.success) {
            //     this.tokenRequested = false;
            //     this.tokenExists = true;
            // }
        },
    },
    computed: {
        ...mapGetters({
            uid: VStore.$getters.getUID,
            user: VStore.$getters.getUser,
            username: VStore.$getters.getUsername,
            isStreamer: VStore.$getters.isStreamer,
        }),

        requestButtonMsg: function () {
            return this.tokenRequested
                ? "Token Generating..."
                : "Request Custom Token";
        },
    },
    async mounted() {
        //await this.getCardData();
        await this.getTokenData();
    },
};
</script>

<style>
.custom-token-image {
    width: 275px;
    height: 200px;
}
</style>