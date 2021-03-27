<template>
  <v-card color="neutral">
    <v-img :src="bgimage" height="80" class="mb-n6"> </v-img>

    <div class="d-flex justify-start px-4 pb-1">
      <v-avatar size="80">
        <v-img
          :src="mainimage"
          :aspect-ratio="1"
          :width="150"
          :height="150"
          contain
        />
      </v-avatar>

      <div class="mt-8 px-3">
        <h3>{{ title }}</h3>
        <TempTags :tags="tags" />
      </div>
    </div>

    <div class="px-4 py-1">
      <p>{{ longdesc }}</p>
    </div>

    <div class="d-flex justify-end">
      <div class="pr-4 pb-3">
        <v-btn color="primary" :href="link">{{ shortdesc }}</v-btn>
      </div>
      <div class="pr-4 pb-3">
        <v-btn color="primary" :href="link">DONATE</v-btn>
      </div>
    </div>
  </v-card>
</template>

<script>
import TempTags from '@/components/TempTags';

export default {
  // name: DonationCard,
  components: {
      TempTags
  },

  props: {
    bgimage: { type: String, default: "" },
    link: { type: String, default: "" },
    longdesc: { type: String, default: "" },
    mainimage: { type: String, default: "" },
    shortdesc: { type: String, default: "" },
    title: { type: String, default: "" },
    tags: { type: Array },
  },
};
</script>