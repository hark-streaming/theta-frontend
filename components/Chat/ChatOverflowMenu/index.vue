<template>
  <!-- Overflow menu -->
  <v-menu
    :close-on-content-click="true"
    bottom
    left
    offset-y
    transition="fade-transition"
    flat
  >
    <template #activator="{ on }">
      <v-btn
        v-on="on"
        class="px-0"
        :ripple="false"
        text
        small
        icon
        depressed
        color="secondary"
      >
        <v-icon>more_vert</v-icon>
      </v-btn>
    </template>

    <!-- Chat Overflow Menu -->
    <lazy-chat-overflow-menu-content :channel="page"/>
  </v-menu>
</template>

<script>
  export default {
    name: 'ChatOverflowMenuButton',

    props: {
      page: { type: String },
    },
  };
</script>
