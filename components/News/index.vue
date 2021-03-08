<template>
  <v-col cols="5" v-if="article != null" class="ma-4">
    <v-img :src="article.image" />
    <div class="mt-3">
      <a :href="article.url">
        {{ article.name }}
      </a>
    </div>
  </v-col>
</template>

<script>
export default {
  name: "NewsArticle",

  props: ["article"],
};
</script>

<style lang='scss'>
</style>
