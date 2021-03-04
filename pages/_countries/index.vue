<template>

</template>

<script>
export default {
  name: "channel",

  async created() {
    // we're only based in the usa right now, and we're not heading towards national news yet
    // so for now, we're focusing on local areas (state & county/city)
    this.$router.replace("/");
  },
};
</script>