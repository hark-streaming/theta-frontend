<template>
    <v-card class="mb-4 pa-3">
      <!-- title -->
      <v-flex class="mb-3">
        <h2>Polls</h2>
        <div>Create polls to find out what you want the government to be.</div>
      </v-flex>
    </v-card>
</template>

<script>
import { auth, db, storage } from "@/plugins/firebase";
import { mapGetters, mapState } from "vuex";
import { VStore } from "@/store";

export default {
  data() {
    return {
        
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
        loyalDonors: this.formData.loyalDonors
      });

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