<template>
  <v-flex xs14 sm12 md10 lg8>
    <v-card class="mb-4 pa-3">
      <!-- title -->
      <v-flex class="mb-3">
        <h2>TFuel Donation Redistribution</h2>
      </v-flex>

      <div class="d-flex">
        <img
          class="custom-token-image mr-4"
          src="https://cdn.discordapp.com/attachments/814278920168931382/833263878115819580/relay_custom_token.png"
        />
        <div>
          <div>
            Relay a portion of the TFuel donations that you get to a different
            nonprofit or streamer. This is good if you want to support a cause,
            and let your fanbase know that you are!
          </div>
          <div class="d-flex">
            <div class="ma-3">
                <h4>Platform Pool</h4>
                <v-input value="4%" />
            </div>
          </div>

          <!-- submission buttons -->
          <v-row class="mt-2 pa-3">
            <v-spacer />
            <v-btn
              :disabled="tfuelAmount < 100 || alreadyRequested"
              :loading="requestLoading"
              color="primary"
              outlined
              @click="requestPayout"
              >Bro</v-btn
            >
          </v-row>
        </div>
      </div>
    </v-card>
  </v-flex>
</template>

<script>
import { auth, db, storage } from "@/plugins/firebase";
import { mapGetters, mapState } from "vuex";
import { VStore } from "@/store";

export default {
  data() {
    return {
      // token generation
      tfuelAmount: 0,

      // alert
      alert: false,
      alertMessage: "",
      alertType: "info",

      alreadyRequested: false,
      requestLoading: false,
    };
  },
  methods: {
    async requestPayout() {
      this.requestLoading = true;

      let endpoint;
      let result;
      try {
        const token = await auth.currentUser.getIdToken(true);
        endpoint = `${process.env.API_URL}/theta/cashout`;
        result = await this.$axios.$put(endpoint, {
          idToken: token,
        });
      } catch {
        this.alert = true;
        this.alertMessage = "There was an error, try again in a bit.";
        this.alertType = "error";

        this.requestLoading = false;
        this.alreadyRequested = false;
        return;
      }

      this.alreadyRequested = result.success;

      this.requestLoading = false;
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
    const endpoint = `${process.env.API_URL}/theta/address/${this.uid}`;
    const result = await this.$axios.$get(endpoint);
    console.log(result);

    this.tfuelAmount = result.vaultBalance;

    const cashoutDoc = await db.collection("cashout").doc(this.uid).get();
    this.alreadyRequested = cashoutDoc.exists;
  },
};
</script>

<style>
.custom-token-image {
  width: 275px;
  height: 200px;
}
</style>