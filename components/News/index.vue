<template>
  <div v-if="article != null" class="my-4">
    <v-img :src="article.image" />
    <div class="mt-3">
      <a :href="article.url">
        {{ article.name }}
      </a>
    </div>
  </div>
</template>

<script>
export default {
  name: "NewsArticle",

  props: ["article"],
};
</script>

<style lang='scss'>
</style>
