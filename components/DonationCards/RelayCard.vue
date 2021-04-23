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

          <!-- List destinations and percentages -->
          <div class="d-flex">
            <div class="ma-3">

              <v-row no-gutters>
                <v-col cols="8">
                  <h4>Platform Pool:</h4>
                </v-col>
                <v-col cols="4">
                  <h4>1%</h4>
                </v-col>
              </v-row>
              
              <!-- Display all relay targets -->
              <template v-for="(username, index) in destUsernames">

                <!-- User (self) -->
                <v-row 
                  :key="index" 
                  v-if="index == 0"
                  no-gutters
                >
                  <v-col cols="8">
                    <h4>{{ username }} (You):</h4>
                  </v-col>

                  <v-col cols="4">
                    <h4>{{ dispPercents[0] }}%</h4>
                  </v-col>
                </v-row>

                <!-- All other targets -->
                <v-row
                  :key="index"
                  v-if="index != 0"
                  no-gutters
                >
                  <v-col cols="8">
                    <h4>{{ username }}:</h4>
                  </v-col>

                  <v-col cols="4">
                    <!-- Text field for entering percentage -->
                    <v-text-field
                      label="Relay %"
                      small
                      solo
                      v-model="dispPercents[index]"
                      class="mb-n4"
                      @input="addPercentage(index)"
                    ></v-text-field>

                    <p v-if="dispErrMsg" class="red--text">{{ errMsg }}</p>
                  </v-col>
                </v-row>
              </template>

              <v-row v-if="showDialog" no-gutters>
                <RelaySelectDialog @userFound="addRelay($event)" />
              </v-row>
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
import RelaySelectDialog from "@/components/DonationCards/RelaySelectDialog";

export default {

  components: {
    RelaySelectDialog
  },

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

      showDialog: true, 

      // destination usernames and uids for donation relay
      destUsernames: [],
      destUids: [],         // contains uids of relay targets (self at 0)
      destPercents: [],     // contains relay percentages for targerts (self at 0)

      dispPercents: [],     // percentages as strings to be displayed

      dispErrMsg: false, 
      errMsg: "", 

    };
  },
  methods: {
    // retrieve user from Firebase with uid as key
    getUserData() {
      const userRef = db.collection("users").doc(this.uid);

      return userRef.onSnapshot(
        async (doc) => {
          if (doc.exists) {
            await this.userDataChanged(doc.data());
          } else {
            this.displayError = true;
          }
        }
      );
    },

    // copy uids from data object
    async userDataChanged(data) {
      data.governanceShares.payeeUids.forEach(x => this.destUids.push(x));
      data.governanceShares.shares.forEach(x => this.destPercents.push(x / 9900));
    },

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

    // add relay destination; eventObj contains username and uid
    addRelay(eventObj) {
      this.destUsernames.push(eventObj.username);
      this.destUids.push(eventObj.uid);
      this.destPercents.push(0);

      this.dispPercents.push("");

      this.showDialog = false;    // disable dialog
    },

    // convert user's input string into a number
    addPercentage(index) {
      this.destPercents[index] = 0;

      // no err msg for empty str
      if (this.dispPercents[index] == "") {             
        this.dispErrMsg = false;
        this.calcSelfPercent();
        return;
      }

      var input = parseFloat(this.dispPercents[index]);

      // check that str can be converted into int
      if (isNaN(input)) {                             
        this.errMsg = "Must be a number";
        this.dispErrMsg = true;
        return;
      } 

      input = this.convertTo9900(input / 100);   
      this.destPercents[index] = input;
      this.calcSelfPercent();
      var sum = 0;
      this.destPercents.forEach(x => sum += x);

      // total percents must be <= 100
      if (sum > 1){                              
        this.errMsg = "Total must not exceed 100%";
        this.dispErrMsg = true;

        return;
      }

      this.dispErrMsg = false;
      
    },

    // calculate leftover relay % for user after adjusting for other relays
    calcSelfPercent() {
      var temp = this.convertTo9900(0.99);
      for (var i = 1; i < this.destPercents.length; i++) {
        temp -= this.destPercents[i];
      }

      this.destPercents[0] = temp;

      temp = this.convertTo10000(temp) * 100;
      this.dispPercents[0] = Math.round(temp * 100) / 100;    // round display % to nearest 0.01
    }, 

    // converts percentage from 10000 scale to 9900 scale
    // (client interacts using 10000 scale, need 9900 scale for backend)
    convertTo9900(oldPercent) {
      var shares = oldPercent * 10000;
      return shares / 9900;
    }, 

    // converts percentage from 9900 scale to 10000 scale
    convertTo10000(oldPercent) {
      var shares = oldPercent * 9900;
      return shares / 10000;
    }
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
    // add self to arrays
    this.destUsernames.push(this.username);
    this.destUids.push(this.uid);
    this.destPercents.push(this.convertTo9900(0.99));
    this.dispPercents.push("99");

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