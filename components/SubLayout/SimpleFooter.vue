<template functional>
  <!-- Footer -->
  <v-sheet
    class="pa-2 d-flex justify-space-between align-center flex-wrap"
    color="accentwave"
    tile
  >
    <div class="overline">
      Hark: Democracy Speaks
      <span class="grey--text">{{ props.version }}</span>
    </div>
    <div class="d-flex overline">
      <a href="tokens" target="_blank">Token</a>
      <v-divider vertical class="mx-2" color="white"/>
      <a href="grassroots" target="_blank">Grassroots</a>
      <v-divider vertical class="mx-2" color="white"/>
      <a href="privacy" target="_blank">Privacy</a>
      <v-divider vertical class="mx-2" color="white"/>
      <a href="tos" target="_blank">ToS</a>
      <v-divider vertical class="mx-2" color="white"/>
      <a href="http://hark.tv/" target="_blank">Contact Us</a>
    </div>
  </v-sheet>
</template>

<script>
  export default {
    name: 'SimpleFooter',
    serverCacheKey: () => 'SimpleFooter',

    props: {
      version: { type: String, },
    },

  };
</script>
