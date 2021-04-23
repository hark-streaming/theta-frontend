<template>
  <v-container>
    <v-form ref="form" v-model="valid" lazy-validation>
      <v-card flat style="height: 100%" class="px-8 pb-4 mb-6" color="#E0DAE7">
        <h2 class="pt-4">Entity Selection</h2>
        <p>
          Select which type of entity you're signing up as. If unsure, select
          "Sole Proprietor".
        </p>
        <v-select
          :items="entityTypes"
          :rules="[(v) => !!v || 'Item is required']"
          :disabled="loading"
          label="Entity Type"
          required
          solo
          flat
          @change="onEntityTypeChange"
        />
        <v-text-field
          v-if="selectedEntityType != 'Sole Proprietor / Partnership'"
          :rules="einRules"
          :disabled="loading"
          value=""
          label="EIN (Not Required, Helpful for Validation)"
          solo
          flat
        />
      </v-card>
      <v-card flat style="height: 100%" class="px-8 pb-4 mb-6" color="#E0DAE7">
        <h2 class="pt-4">Categorization</h2>
        <p>Categories for your channel. Can be changed later.</p>
        <vue-tags
          color="secondary"
          :active="activeTags"
          :all="allTags"
          :element-count-for-start-arrow-scrolling="4"
          :tab-index="1"
          :tag-creation-enabled="false"
          :colors-enabled="false"
          :tag-color-default="'green'"
          :tag-list-label="'Channel Topics'"
          :placeholder="'Select some channel topics....'"
          @on-tag-added="onTagAdded"
          @on-tag-removed="onTagRemoved"
        />
      </v-card>
      <v-card flat style="height: 100%" class="px-8 pb-4 mb-6" color="#E0DAE7">
        <h2 class="pt-4">Entity Information</h2>
        <p>Information in regards to your account and your entity.</p>
        <v-text-field
          v-model="name"
          :counter="100"
          :rules="nameRules"
          :disabled="loading"
          label="Entity Name"
          required
          solo
          flat
        />
        <v-text-field
          v-model="phone"
          :rules="phoneRules"
          :disabled="loading"
          label="US Phone Number"
          value=""
          solo
          flat
        />
      </v-card>
      <v-card outlined style="height: 100%" class="mb-6">
        <v-sheet
          color="secondary"
          class="px-8 pb-4 white--text"
          style="width: 100%"
        >
          <h2 class="pt-4">Submission</h2>
          <p>Please solve the h-captcha and submit to finish registering.</p>
          <v-hcaptcha
            tabindex="5"
            :key="attempts"
            @verify="onCaptchaVerify"
            @expired=""
            @error="onCaptchaError"
          />
          <br />
          <v-btn
            outlined
            class="white--text"
            @click="createHcaptchaUser"
            :loading="loading"
          >
            Submit
          </v-btn>
        </v-sheet>
      </v-card>
    </v-form>
  </v-container>
</template>

<script>
import { auth, db } from "@/plugins/firebase.js";
import { mapGetters } from "vuex";
import { VStore } from "@/store";

export default {
  name: "register",

  data() {
    return {
      valid: true,

      // form submit
      selectedEntityType: "",
      ein: null,
      name: "",
      phone: "",
      captchaToken: null,

      // form logic
      loading: false,

      // rules
      nameRules: [(v) => !!v || "Name is required"],
      einRules: [(v) => /(^[1-9]\d?-\d{7}$)|^$/.test(v) || "EIN must be valid"],
      phoneRules: [
        (v) =>
          /(^(1?(-?\d{3})-?)?(\d{3})(-?\d{4})$)|^$/.test(v) ||
          "Phone number must be valid",
      ],

      // selects
      entityTypes: [
        "Sole Proprietor / Partnership",
        "Nonprofit 501(c)(3)",
        "Corporation / LLC",
      ],

      // topic tags
      activeTags: [],
      allTags: [],
      tagColors: ["green", "red", "blue"],
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

    // Create hCaptcha User
    // CALLED ON REGISTER BUTTON
    // WE NEED AN HCAPTCHA SITE KEY FOR CAPTCHA TO WORK
    // FOR LOCALHOST TESTING, use 127.0.0.1 instead of localhost
    async createHcaptchaUser() {
      // Put form in loading state
      this.loading = true;

      // Validate inputs and captcha solution
      // TODO: make captcha work
      // Dont validate right now because testing
      const valid = true; //await this.validate();
      console.log(valid);
      if (!valid) {
        this.loading = false;
        return false;
      }

      // Log analytics
      this.$ga.event({
        eventCategory: "login",
        eventAction: "register",
      });

      // Send off our data!
      try {
        const userId = this._uid;
        const endpoint = `${process.env.API_URL}/users/upgrade/${userId}`;
        const payload = {
          captcha: this.captchaToken,
          ein: this.ein,
          entity: this.selectedEntityType,
          name: this.name,
          phone: this.phone,
          tags: this.activeTags,
          role: "streamer",
        };

        // Submit to API server
        const result = await this.$axios.$post(endpoint, payload);

        if (result.success) {
          this.showSuccess(result.message + "\nSigning in to new account...");
        } else {
          this.showError(result.message);
          this.captchaToken = null;
          this.attempts += 1;
          this.loading = false;
          return false;
        }
      } catch (error) {
        console.error(error);
        alert(error.message);
        //this.showError(error.message);
        this.captchaToken = null;
        this.attempts += 1;
        this.loading = false;
        return false;
      }

      // Now finally (attempt to) login to our newly created user.
      // In theory this should never fail cuz we just registered
      // our account with the exact same credentials...
      try {
        // Set firebase.auth.Auth.Persistence.SESSION
        await auth.setPersistence("local");
        this.$router.replace("/");
      } catch (error) {
        this.showError(error.message);
        console.log(error.message);
      }

      // Disable loading animation
      this.loading = false;
    },

    // callbacks
    onEntityTypeChange(v) {
      this.selectedEntityType = v;
    },
    entityInformationFilled() {
      return (
        this.name != ""
      );
    },
    async onCaptchaVerify(token) {
      this.captchaToken = token;
      await this.validate();
    },
    async onCpatchaExpired(data) {
      this.captchaToken = null;
      await this.validate();
    },
    async onCaptchaError(data) {
      this.captchaToken = null;
      await this.validate();
    },

    // Validate Data
    async validate() {
      // Validate form
      const validForm = await this.$refs.form.validate();

      console.log(`validForm: ${validForm}`);

      // Validate Inputs
      if (!validForm) {
        this.showError("Please fix errors in red");
        return false;
      }

      // Check for captcha
      if (!this.captchaToken) {
        this.showError("Please train an AI with the captcha");
        return false;
      }

      // All good
      return true;
    },
    showError(error) {
      alert(error);
    },
    showSuccess(success) {
      //alert(success);
      console.log(success);
    },
    // onAuth handlers
    async authenticated(user) {
      /*
      if (user) {
        if (process.client) {
          //this.$router.replace("/");
          console.log(
            `%cLoginDialog.vue:%c Logged in! %o`,
            "background: #2196f3; color: #fff; border-radius: 3px; padding: .2rem .5rem;",
            "",
            user
          );

        }
      } else {
        if (process.client)
          console.log(
            `%cLoginDialog.vue:%c Not logged in!`,
            "background: #2196f3; color: #fff; border-radius: 3px; padding: .2rem .5rem;",
            ""
          );
      }
      */
    },

    // tags
    async getAllTags() {
      // get snapshot of all the tags
      const tgsSnapshot = await db.collection("tags").get();
      console.log(tgsSnapshot);

      // shit dude now we're getting all their data
      let tagRef = tgsSnapshot.docs.map((doc) => doc.data());

      console.log(tagRef);
      this.allTags = tagRef;
      return;
    },
    parseTags(tags) {
      try {
        let parsedTags = [];
        tags.forEach((x) => {
          for (let i = 0; i < this.allTags.length; i++) {
            if (this.allTags[i].name === x) {
              parsedTags.push(this.allTags[i]);
              break;
            }
          }
        });
        return parsedTags;
      } catch {
        return [];
      }

      return [];
    },
    onTagAdded(tag) {
      this.activeTags.push(tag);
    },
    onTagRemoved(tag) {
      console.log(tag);
      this.activeTags = this.activeTags.filter((x) => x != tag);
    },
  },

  computed: {
    ...mapGetters({
      _uid: VStore.$getters.getUID,
    }),
  },

  async mounted() {
    auth.onAuthStateChanged(async (user) => await this.authenticated(user));
    await this.getAllTags();
  },

  beforeDestroy() {},
};
</script>

<style scoped>
.theme--light.v-timeline:before {
  background: "secondary";
}

.theme--light.v-divider {
  border-color: secondary;
}

h2 {
  font-size: 1.2em;
  font-weight: 400;
}

p {
  font-size: 0.9em;
}
.sticky-card {
  position: sticky;
  top: 60px;
}

.center-img {
  padding: 8px;
  margin: auto;
  width: 50%;
}

.tags__shadow {
  z-index: 5 !important;
}

.tags__shadow--tag-list-active {
  z-index: 5 !important;
}
</style>