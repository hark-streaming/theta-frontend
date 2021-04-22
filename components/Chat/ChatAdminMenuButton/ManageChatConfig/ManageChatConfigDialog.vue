<template>
  <div>
    <v-btn
      class="d-flex mb-2"
      style="font-size:0.75em;text-transform:none;"
      block
      small
      text
      color="black"
      @click.prevent="showDialog = true"
    >
      Manage Chat Config
    </v-btn>


    <v-dialog
      v-model="showDialog"
      width="500"
    >
      <v-card
        color="grey darken-4"
      >
        <!-- Title Bar -->
        <v-sheet
          tile
          color="primary"
          class="pa-2 d-flex justify-space-between align-center"
        >
          <h4 class="white--text body-1">
            Manage Chat Config
          </h4>
          <v-btn
            color="black"
            text
            icon
            small
            @click="showDialog = false"
          >
            <v-icon>close</v-icon>
          </v-btn>
        </v-sheet>

        <lazy-manage-chat-config-content
          v-if="showDialog"
        />

      </v-card>
    </v-dialog>
  </div>
</template>

<script>
  export default {
    name: 'ManageChatConfigDialog',

    data() {
      return {
        showDialog: false,
      };
    },
  };
</script>
