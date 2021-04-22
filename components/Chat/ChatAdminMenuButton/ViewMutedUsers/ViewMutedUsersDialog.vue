<template>
    <div>
      <v-btn
        class="d-flex my-3"
        style="font-size:0.75em;text-transform:none;"
        block
        small
        text
        @click.prevent="showDialog = true"
      >
        View Muted Users
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
            class="pa-2 d-flex justify-space-between align-center"
          >
            <h4 class="black--text body-1">
              Muted Users
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

          <lazy-view-muted-users-content
            v-if="showDialog"
          />

        </v-card>
      </v-dialog>
    </div>
</template>

<script>
  export default {
    name: 'ViewMutedUsersDialog',

    data() {
      return {
        showDialog: false,
      };
    },
  };
</script>
