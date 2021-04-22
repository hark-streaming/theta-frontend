<template>
  <div v-if="streamerHasToken">
    
  </div>
  <div v-else>
    <div style="text-align: center; text-justify: center;" class="no-token">
      <h3 class="no-token">No Custom Token Yet</h3>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import { VStore } from "@/store";

export default {
  props: {
    streamerId: { type: String },
  },

  data: {
    streamerHasToken: false
  },

  async mounted() {
    const endpoint = `${process.env.API_URL}/theta/tokens/${this.streamerId}`;
    const result = await this.$axios.$get(endpoint);

    this.streamerHasToken = result.success;
    if(this.streamerHasToken) {
      // do stuff with the data
    }

    console.log(result);
  },

  methods: {},

  computed: {
    ...mapGetters({
      user: VStore.$getters.getUser,
    }),
  },
};
</script>

<style scoped>

.no-token {
  height: 350px;
  width: 100%;
}

</style>