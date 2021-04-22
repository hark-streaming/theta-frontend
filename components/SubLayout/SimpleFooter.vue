<template functional>
  <!-- Footer -->
  <v-sheet
    class="pa-2 d-flex justify-space-between align-center flex-wrap"
  >
    <div class="overline footfont">
      Hark.tv
      <span>{{ props.version }}</span>
    </div>
    <div class="d-flex overline">
      <a href="tokens" target="_blank" class="footfont">Token</a>
      <v-divider inline vertical class="mx-2" color="#282130"/>
      <a href="grassroots" target="_blank" class="footfont">Grassroots</a>
      <v-divider inline vertical class="mx-2" color="#282130"/>
      <a href="privacy" target="_blank" class="footfont">Privacy</a>
      <v-divider inline vertical class="mx-2" color="#282130"/>
      <a href="tos" target="_blank" class="footfont">Terms of Service</a>
      <v-divider inline vertical class="mx-2" color="#282130"/>
      <a href="http://hark.tv/" target="_blank" class="footfont">Contact Us</a>
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

<style>
  .footfont {
    text-decoration: none;
  }
</style>
