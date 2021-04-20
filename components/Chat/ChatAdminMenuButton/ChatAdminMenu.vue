<template>
    <div>
      <v-card width="200px">
        <!-- Title Bar -->
        <v-sheet
          class="justify-space-between"
          style="height:100%"
        >

          <div
            class="d-flex align-center justify-space-between pl-2"
          >
            <h2 class="ml-1">Chat Settings</h2>
            <v-btn
              text
              icon
              @click="closeMenu"
              depressed
              :ripple="false"
              class="closebtn"
            >
              <v-icon>close</v-icon>
            </v-btn>

          </div>

          <v-divider></v-divider>

          <div class="px-2 py-1">

            <!-- View Muted Users -->
            <lazy-view-muted-users-dialog />

            <!-- Modify Chat Configuration -->
            <lazy-manage-chat-config-dialog />

          </div>
        </v-sheet>
      </v-card>
    </div>
</template>

<script>
  export default {
    name: 'ChatAdminMenu',

    data() {
      return {
        showMutedUsers: false,
      };
    },

    methods: {
      closeMenu () {
        this.$emit( 'close' );
      },
    },
  };
</script>

<style>

  .closebtn::before {
      color: transparent
  }
  h2 {
    font-weight:500;
    color: black;
    font-size:0.9em;
  }
</style>