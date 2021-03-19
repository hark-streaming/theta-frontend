<template>
  <v-container>
    <v-row>
      <v-col cols="4">
        <v-card elevation="2" class="pa-6 sticky-card">
          <v-card-title class="mt-2 justify-center">
            Streamer Registration
          </v-card-title>
          <v-img
            src="https://cdn.discordapp.com/attachments/814278920168931382/819051567634317402/speaker.png"
            class="center-img"
          />
          <v-card-subtitle class="text-center"
            >Creators, Commentators, Activists</v-card-subtitle
          >
          <v-timeline dense>
            <v-timeline-item
              small
              :color="selectedEntityType != '' ? 'primary' : 'secondaryneutral'"
            >
              Entity Type
            </v-timeline-item>
            <v-timeline-item
              small
              :color="false ? 'primary' : 'secondaryneutral'"
              >Categorization</v-timeline-item
            >
            <v-timeline-item
              small
              :color="
                entityInformationFilled() ? 'primary' : 'secondaryneutral'
              "
              >Entity Information</v-timeline-item
            >
          </v-timeline>
        </v-card>
      </v-col>
      <v-col cols="8">
        <v-form ref="form" v-model="valid" lazy-validation>
          <v-card elevation="2" class="px-8 pb-4 mb-6">
            <v-card-title> Entity Selection </v-card-title>
            <v-card-subtitle>
              Select which type of entity you're signing up as. If unsure,
              select "Sole Proprietor".
            </v-card-subtitle>
            <v-select
              :items="entityTypes"
              :rules="[(v) => !!v || 'Item is required']"
              :disabled="loading"
              label="Entity Type"
              required
              @change="onEntityTypeChange"
            />
            <v-text-field
              v-if="selectedEntityType != 'Sole Proprietor / Partnership'"
              :rules="einRules"
              :disabled="loading"
              label="EIN (Not Required, Helpful for Validation)"
            />
          </v-card>
          <v-card elevation="2" class="px-8 pb-4 mb-6">
            <v-card-title> Categorization </v-card-title>
            <v-card-subtitle>
              Categories for your channel. Can be changed later.
            </v-card-subtitle>
            <vue-tags
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
          <v-card elevation="2" class="px-8 pb-4 mb-6">
            <v-card-title> Entity Information </v-card-title>
            <v-card-subtitle>
              Information in regards to your account and your entity.
            </v-card-subtitle>
            <v-text-field
              v-model="name"
              :counter="100"
              :rules="nameRules"
              :disabled="loading"
              label="Entity Name"
              required
            />
            <v-text-field
              v-model="username"
              :counter="100"
              :rules="nameRules"
              :disabled="loading"
              label="Account Username"
              required
            />
            <v-text-field
              v-model="email"
              :rules="emailRules"
              :disabled="loading"
              label="E-mail"
              required
            />
            <v-text-field
              v-model="phone"
              :rules="phoneRules"
              :disabled="loading"
              label="US Phone Number"
            />
            <!-- Password Field -->
            <v-text-field
              id="password"
              key="password"
              v-model="password"
              :append-icon="showPassword ? 'visibility' : 'visibility_off'"
              :rules="passwordRules"
              :type="showPassword ? 'text' : 'password'"
              name="input-10-1"
              label="Password"
              hint="At least 8 characters"
              autocomplete="password"
              validate-on-blur
              solo
              light
              :disabled="loading"
              @click:append="showPassword = !showPassword"
              tabindex="3"
              :persistent-hint="signUp"
            />
          </v-card>
          <v-card elevation="2" class="px-8 pb-4 mb-6">
            <v-card-title> Submission </v-card-title>
            <v-card-subtitle>
              Solve the h-captcha and submit to finish registering!
            </v-card-subtitle>
            <v-hcaptcha
              tabindex="5"
              :key="attempts"
              @verify="onCaptchaVerify"
              @expired=""
              @error="onCaptchaError"
            />
            <v-btn
              color="primary"
              class="black--text"
              small
              @click="createHcaptchaUser"
              :loading="loading"
            >
              Submit
            </v-btn>
          </v-card>
        </v-form>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { auth, db } from "@/plugins/firebase.js";

export default {
  name: "register",

  data() {
    return {
      valid: true,

      // form submit
      selectedEntityType: "",
      ein: null,
      name: "",
      username: "",
      email: "",
      phone: "",
      password: "",
      captchaToken: null,

      // form logic
      usernameError: "",
      usernameSuccess: "",
      showPassword: false,
      loading: false,

      // rules
      nameRules: [(v) => !!v || "Name is required"],
      einRules: [(v) => /(^[1-9]\d?-\d{7}$)|^$/.test(v) || "EIN must be valid"],
      phoneRules: [
        (v) =>
          /(^(1?(-?\d{3})-?)?(\d{3})(-?\d{4})$)|^$/.test(v) ||
          "Phone number must be valid",
      ],
      emailRules: [
        (v) => !!v || "E-mail is required",
        (v) => /.+@.+\..+/.test(v) || "E-mail must be valid",
      ],
      passwordRules: [
        (value) => (value && value.length >= 8) || "Min 8 characters",
        (v) => !!v || "Password is required",
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
        const endpoint =
          "https://us-central1-hark-e2efe.cloudfunctions.net/api/users/register";
        const payload = {
          username: this.username,
          email: this.email,
          password: this.password,
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
        await auth.signInWithEmailAndPassword(this.email, this.password);
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
        this.name != "" &&
        this.username != "" &&
        this.email != "" &&
        this.phone != "" &&
        this.password != ""
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
      // Validate username & form
      const validUsername = await this.checkUsername(this.username);
      const validForm = await this.$refs.form.validate();

      console.log(`Valid username: ${validUsername}, validForm: ${validForm}`);

      // Validate Inputs
      if (!(validUsername && validForm)) {
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
      if (user) {
        if (process.client) {
          this.$router.replace("/");
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
    },

    // Check Username
    async checkUsername(username) {
      // default state
      this.usernameError = "";
      this.usernameSuccess = "";

      // Don't check unless we have a username
      if (!username) {
        this.usernameError = "Name is required";
        return false;
      }

      try {
        // Verify Username is valid & not taken
        // TODO: update to hark endpoint
        const endpoint = "https://api.bitwave.tv/api/check-username";
        const payload = { username: username };
        const config = { progress: false };
        const checkUsername = await this.$axios.$post(
          endpoint,
          payload,
          config
        );

        // Validate API response
        if (checkUsername.valid) {
          this.usernameSuccess = "Username Available";
          return true;
        } else {
          this.usernameError = checkUsername.error;
          return false;
        }
        // Failed to check username
      } catch {
        error;
      }
      {
        console.error(error);
        this.usernameError = error.message;
        return false;
      }
    },

    // tags
    async getAllTags() {
      // get snapshot of all the tags
      const tgsSnapshot = await db.collection("tags").get();
      console.log("brogermy begins");
      console.log(tgsSnapshot);

      // shit dude now we're getting all their data
      let tagRef = tgsSnapshot.docs.map((doc) => doc.data());

      console.log("brogermy rises");
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

  computed: {},

  async mounted() {
    auth.onAuthStateChanged(async (user) => await this.authenticated(user));
    await this.getAllTags();
  },

  beforeDestroy() {},
};
</script>

<style scoped>
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