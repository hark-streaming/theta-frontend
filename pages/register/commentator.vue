<template>
  <v-container class="px-16">
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
              >Entity Information</v-timeline-item
            >
            <v-timeline-item
              small
              :color="false ? 'primary' : 'secondaryneutral'"
              >Categorization</v-timeline-item
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
              v-model="select"
              :items="entityTypes"
              :rules="[(v) => !!v || 'Item is required']"
              label="Entity Type"
              required
              @change="onEntityTypeChange"
            />
            <v-text-field
              v-if="selectedEntityType != 'Sole Proprietor / Partnership'"
              :rules="einRules"
              label="EIN (Not Required, Helpful for Validation)"
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
              label="Entity Name"
              required
            />
            <v-text-field
              v-model="name"
              :counter="100"
              :rules="nameRules"
              label="Account Username"
              required
            />
            <v-text-field
              v-model="email"
              :rules="emailRules"
              label="E-mail"
              required
            />
            <v-text-field
              v-model="phone"
              :rules="phoneRules"
              label="US Phone Number"
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
              @on-tag-created="onTagCreated"
            />
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
      select: null,
      name: "",
      email: "",
      selectedEntityType: "",
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
    onEntityTypeChange(v) {
      this.selectedEntityType = v;
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
    onTagCreated(tag) {
      tag.slug = tag.slug.toLowerCase().Replace(" ", "_");
      console.log(tag);
      this.allTags.push(tag);
      this.activeTags.push(tag);
    },
  },

  computed: {},

  async mounted() {
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
</style>