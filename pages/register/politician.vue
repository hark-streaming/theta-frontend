<template>
  <v-container class="px-16">
    <!-- 3 card layout -->
    <v-row>
      <v-col cols="4">
        <v-card elevation="2" class="pa-8 sticky-card">
          <v-card-title class="mt-2"> Steps </v-card-title>
          <v-timeline dense>
            <v-timeline-item small>Coming Soon</v-timeline-item>
          </v-timeline>
        </v-card>
      </v-col>
      <v-col cols="8">
        <v-form ref="form" v-model="valid" lazy-validation>
          <v-card elevation="2" class="pa-8">
            <v-card-title class="mt-2"> Coming Soon </v-card-title>
            <p>
              The legal framework for streaming as a civic servant on Hark is
              still in the works. There are a lot of states and a lot of laws!
              In the meantime, try making a viewer account.
            </p>
          </v-card>
        </v-form>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { auth } from "@/plugins/firebase.js";

export default {
  name: "register",

  data() {
    return {
      valid: true,
      name: "",
      nameRules: [
        (v) => !!v || "Name is required",
        (v) => (v && v.length <= 10) || "Name must be less than 10 characters",
      ],
      email: "",
      emailRules: [
        (v) => !!v || "E-mail is required",
        (v) => /.+@.+\..+/.test(v) || "E-mail must be valid",
      ],
      select: null,
      items: ["Item 1", "Item 2", "Item 3", "Item 4"],
    };
  },

  methods: {
    validate() {
      this.$refs.form.validate();
    },
    reset() {
      this.$refs.form.reset();
    },
    resetValidation() {
      this.$refs.form.resetValidation();
    },
  },

  computed: {},

  mounted() {},

  beforeDestroy() {},
};
</script>

<style scoped>
.sticky-card {
  position: sticky;
  top: 0;
}
</style>