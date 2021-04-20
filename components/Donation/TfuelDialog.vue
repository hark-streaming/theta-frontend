<template>
    <v-card>
        <!-- Header Bar -->
        <v-sheet
            tile
            color="secondary"
            class="d-flex align-center pa-2 black--text"
        >
            <!-- avatar and name -->
            <v-avatar color="primary" size="48" class="mr-3">
                <img :src="avatar" :alt="streamer" />
            </v-avatar>

            <h2 class="white--text">{{ streamer }}</h2>
        </v-sheet>

        <!-- Donate header -->
        <h3 class="mt-3 text-center">Support {{ streamer }} with TFUEL!</h3>

        <!-- Tfuel balance -->
        <v-card-subtitle class="my-2">
            <div>Your Balance:</div>
            <v-row class="mt-2">
                <img
                    src="https://cdn.discordapp.com/attachments/814278920168931382/826294941768482876/tfuel.png"
                    width="24px"
                    height="24px"
                />
                <span class="ml-1">{{ balance }} TFUEL </span>
            </v-row>
        </v-card-subtitle>

        <!-- 1,5,10 tfuel buttons-->
        <v-layout justify-center>
            <v-btn-toggle class="mb-3" v-model="donateAmount" borderless>
                <v-btn value="1" outlined @click="resetCustom">
                    <v-col>
                        <!-- <v-icon color="orange" class="mb-1"
                            >mdi-arrow-up-bold-box-outline</v-icon
                        > -->
                        <img
                            src="https://cdn.discordapp.com/attachments/814278920168931382/826294941768482876/tfuel.png"
                            width="24px"
                            height="24px"
                        />
                        <div>1 TFUEL</div>
                    </v-col>
                </v-btn>

                <v-btn value="5" outlined @click="resetCustom">
                    <v-col>
                        <!-- <v-icon color="orange" class="mb-1"
                            >mdi-arrow-up-bold-box-outline</v-icon
                        > -->
                        <img
                            src="https://cdn.discordapp.com/attachments/814278920168931382/826294941768482876/tfuel.png"
                            width="24px"
                            height="24px"
                        />
                        <div>5 TFUEL</div>
                    </v-col>
                </v-btn>

                <v-btn value="10" outlined @click="resetCustom">
                    <v-col>
                        <!-- <v-icon color="orange" class="mb-1"
                            >mdi-arrow-up-bold-box-outline</v-icon
                        > -->
                        <img
                            src="https://cdn.discordapp.com/attachments/814278920168931382/826294941768482876/tfuel.png"
                            width="24px"
                            height="24px"
                        />
                        <div>10 TFUEL</div>
                    </v-col>
                </v-btn>
            </v-btn-toggle>
        </v-layout>

        <!-- custom amount field -->
        <v-text-field
            type="number"
            class="mx-auto mt-2"
            outlined
            v-model="customAmount"
            label="Custom Amount"
            @input="setDonateAmount"
        >
        </v-text-field>

        <!-- governance token info -->
        <!-- will not show if tokenname is not provided -->
        <v-layout v-show="tokenName" justify-center class="my-5">
            <span> You will receive </span>
            <v-tooltip top>
                <template v-slot:activator="{ on, attrs }">
                    <a href="tokens" v-bind="attrs" v-on="on" class="mx-1">
                        {{ tokenAmount }} {{ tokenName }}
                    </a>
                </template>
                <span>
                    This is {{ streamer }}'s custom token! It is rewarded for
                    donating TFUEL.</span
                >
            </v-tooltip>
            <span> for this donation. </span>
        </v-layout>

        <!-- General Success / Error Alert -->
        <v-alert
            v-model="alert"
            class="mt-4 mb-4"
            :type="alertType"
            transition="expand-transition"
            dense
        >
            {{ alertMessage }}
        </v-alert>

        <!-- donate button -->
        <v-layout justify-center>
            <v-btn
                color="secondary"
                class="white--text mb-3"
                large
                :disabled="donateAmount == 0"
                :loading="donateLoading"
                @click="onDonate"
            >
                Donate
            </v-btn>
            <v-btn color="grey" plain large @click="closeForm"> Cancel </v-btn>
        </v-layout>

        <!-- loader line for extra visual -->
        <v-progress-linear v-show="lineLoading" indeterminate color="primary">
        </v-progress-linear>
    </v-card>
</template>

<script>
import { auth } from "@/plugins/firebase.js";
export default {
    // name export allows it to be usable everywhere
    name: "TfuelDialog",

    props: {
        avatar: { type: String },
        streamer: { type: String },
        //balance: { type: String },
        tokenName: { type: String },

        // uid props needed for donate api call
        streamerUid: { type: String },
        //senderUid: { type: String },
    },

    data() {
        return {
            donateAmount: 0,
            customAmount: 0,

            donateLoading: false,
            lineLoading: false,

            balance: 0,

            alert: false,
            alertMessage: "Something went wrong!",
            alertType: "error",
        };
    },
    methods: {
        // called when donate button is pressed
        async onDonate() {
            this.donateLoading = true;
            this.lineLoading = true;

            // do the api stuff here
            // throw an error if error
            try {
                const token = await auth.currentUser.getIdToken(true);
                let result = await this.$axios.post(
                    `${process.env.API_URL}/theta/donate/${this.streamerUid}`,
                    {
                        idToken: token,
                        amount: this.donateAmount,
                    }
                );
                // if the api is good
                if (result.data.success) {
                    // Success!
                    this.alert = true;
                    this.alertMessage = "Thank you!";
                    this.alertType = "success";
                } else {
                    // some api error
                    this.alert = true;
                    this.alertMessage = "Transaction failed.";
                    this.alertType = "error";
                }
            } catch (err) {
                this.alert = true;
                this.alertMessage = err;
                this.alertType = "error";
            }

            // stop loading
            this.donateLoading = false;

            // close the dialog after a little bit
            setTimeout(() => {
                this.lineLoading = false;
                this.closeForm();
            }, 1000);
        },

        // reset the form and close it
        closeForm() {
            this.donateAmount = 0;
            this.customAmount = 0;
            this.alert = false;
            this.$emit("close");
        },

        // mirror custom amount to donate amount
        setDonateAmount(value) {
            if (isNaN(parseFloat(value))) {
                this.customAmount = 0;
            } else {
                this.customAmount = parseFloat(value);
            }
            this.donateAmount = this.customAmount;
        },

        // reset field of custom amount to 0
        resetCustom() {
            this.customAmount = 0;
        },
    },
    computed: {
        // governance tokens based on amount of tfuel you donate
        tokenAmount: function () {
            return this.donateAmount * 100;
        },
    },

    // get the balance of the current user
    async mounted() {
        const uid = await auth.currentUser.uid;

        // call api for the vault wallet balance
        let result = await this.$axios.get(`${process.env.API_URL}/theta/address/${uid}`);

        //return balance
        this.balance = result.data.vaultBalance == null ? 0 : result.data.vaultBalance;
    },
};
</script>

<style scoped>
.v-text-field {
    max-width: 50%;
}
</style>