<template>
  <v-flex xs14 sm12 md10 lg8>
    <v-card class="mb-4 pa-3">
      <!-- title -->
      <v-flex class="mb-3">
        <h2>TFuel Cash Out</h2>
      </v-flex>

      <div class="d-flex">
        <img
          class="custom-token-image mr-4"
          src="https://cdn.discordapp.com/attachments/814278920168931382/827006562585149460/tfuel_to_money.png"
        />
        <div>
          <div>
            Convert your TFuel earnings into cash. Once you reach 100 TFuel, you
            will be able to press the button below. We will then reach out to
            your account email andD communicate next steps in our direct
            correspondance.
          </div>
          <div class="my-4">
            <b>PLEASE NOTE:</b> Hark.tv is currently in a test phase, which will
            affect the worth of TFuel and its permanence.
            <a href="/test-phase">Click here</a> to learn more.
          </div>

          <v-progress-linear
            :value="tfuelAmount"
            color="primary"
            height="40"
            rounded
            in
          >
            <template :default="{ tfuelAmount }">
              <div>
                {{ tfuelAmount }} TFuel (~ ${{
                  (tfuelAmount * 0.3).toPrecision(3)
                }})
              </div>
            </template>
          </v-progress-linear>

          <!-- submission buttons -->
          <v-row class="mt-2 pa-3">
            <v-spacer />
            <v-btn
              :disabled="tfuelAmount < 100 || alreadyRequested"
              :loading="requestLoading"
              color="primary"
              outlined
              @click="requestPayout"
              >{{alreadyRequested ? "Request in Review" : "Request Cash Out"}}</v-btn
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

      alreadyRequested: false,
      requestLoading: false,
    };
  },
  methods: {
    async requestPayout() {
      this.requestLoading = true;
      const endpoint = `${process.env.API_URL}/theta/cashout/${this.uid}`;

      // Submit to API server
      const result = await this.$axios.$post(endpoint, {});

      alreadyRequested = result.success;

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

      this.tfuelAmount = result.p2pBalance;

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