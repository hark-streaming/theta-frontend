<template>
  <v-row class="justify-center">
    <div class="d-flex align-center">
      <div class="title text-center mx-3 d-flex flex-column">
        <v-img src="/images/hark-logo.png" height="79px" width="289" class="my-4" />
        <span class="font-weight-light"> DEMOCRACY SPEAKS </span>
      </div>
    </div>
  </v-row>
</template>

<script>
export default {
  name: "MessageOfTheDay",

  serverCacheKey: () => "MOTD",

  methods: {
    markComplete() {
      console.log("bro time");
    },
  },
};
</script>
