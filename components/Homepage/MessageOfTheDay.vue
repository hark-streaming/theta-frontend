<template>
  <v-row class="justify-center">
    <div class="d-flex align-center">
      <div class="title text-center mx-3 d-flex flex-column">
        <span class="font-weight-light white--text"
          >The Future of Campaigning</span
        >
        <div>
          <span
            class="overline font-weight-black rgb-text"
          >
            {{ bottomText }}
          </span>
        </div>
      </div>
    </div>
  </v-row>
</template>

<script>
export default {
  name: "MessageOfTheDay",

  serverCacheKey: () => "MOTD",

  data() {
    return {
      bottomText:
        process.env.BITWAVE_ENV === "development"
          ? "development build"
          : "viewer discretion is advised",
    };
  },

  methods: {
    markComplete() {
      console.log("bro time");
    },
  },
};
</script>
