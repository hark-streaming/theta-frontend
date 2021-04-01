<template>
  <v-flex xs14 sm12 md10 lg8>
    <v-card class="mb-4 pa-3">
      <!-- title -->
      <v-flex class="mb-3">
        <h2>TFuel Cash Out</h2>
      </v-flex>

      <img
        class="custom-token-image mr-4"
        src="https://cdn.discordapp.com/attachments/814278920168931382/826681628491120650/hark_governance_token.png"
      />
      <div>
        <div>Convert your TFuel earnings into cash to fuel your cause.</div>
        <div>Please Note: Hark is currently in a test phase, which will effect the worth of TFuel</div>

        <!-- submission buttons -->
        <v-row class="mt-2 pa-3">
          <v-spacer />
          <v-btn
            :disabled="tokenExists"
            :loading="tokenGenerating"
            color="primary"
            outlined
            @click="generateCustomToken"
            >Generate Custom Token</v-btn
          >
        </v-row>
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
      tokenExists: false,
      tokenGenerating: false,

      showSave: false,
      saveLoading: false,
      cardDataLoading: false,

      tokenData: {
        name: "Hark Governance Token",
        symbol: "HARK-HARK",
      },
      tokenHolders: 100,
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
      this.cardDataLoading = true;

      let cardDoc = await db.collection("dcards").doc(this.uid).get();
      let data = cardDoc.data();

      // if they have previous data load it
      if (data != null) {
        this.cardData.title = data.title;
        this.cardData.link = data.link;
        this.cardData.shortdesc = data.shortdesc;
        this.cardData.longdesc = data.longdesc;
      }

      this.cardDataLoading = false;
    },
    resetData() {
      this.cardData.title = this.old.title;
      this.cardData.link = this.old.link;
      this.cardData.shortdesc = this.old.shortdesc;
      this.cardData.longdesc = this.old.longdesc;
    },
    async updateCardData() {
      this.saveLoading = true;

      /*
      await db.collection("dcards").doc(this.uid).update({
        title: this.cardData.title,
        shortdesc: this.cardData.shortdesc,
        longdesc: this.cardData.longdesc,
        link: this.cardData.link,
      });
      */

      this.saveLoading = false;
    },
    async generateCustomToken() {
      alert("boogily boogily boo");
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
    this.getCardData();
  },
};
</script>

<style>
.custom-token-image {
  width: 275px;
  height: 200px;
}
</style>