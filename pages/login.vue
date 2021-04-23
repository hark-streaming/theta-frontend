<template>
  <v-sheet style="height:100%;" color="transparent">
    <v-container
      grid-list-md
      class="d-flex justify-center"
      style="flex-direction:column;"
    >
      <div
        class="mb-4 d-flex"
        style="flex-direction:column;"
      >
        <h2 class="mb-0 pb-0" style="font-size:8.5em;color:white;align-self:center;">HARK</h2>
      </div>

      <!-- Add Pre-built Login Form  -->
      <v-layout
        row
        justify-space-around
      >
        <lazy-login-dialog />
      </v-layout>

    </v-container>
  </v-sheet>
</template>

<script>
  import { auth } from '@/plugins/firebase.js'

  export default {

    name: 'login',

    middleware: 'not-auth',

    data() {
      return {
        unsubAuthChanged: null,
      }
    },

    methods: {
      async authenticated ( user ) {
        if ( user ) {
          if ( process.client )
            console.log(`%cLogin.vue:%c Logged in! %o`, 'background: #2196f3; color: #fff; border-radius: 3px; padding: .2rem .5rem;', '', user);

          setTimeout( () => this.$router.push( this.redirect ), 750 );
        } else {
          if ( process.client )
            console.log(`%cLogin.vue:%c Not logged in!`, 'background: #2196f3; color: #fff; border-radius: 3px; padding: .2rem .5rem;', '');
        }
      },
    },

    computed: {
      redirect () {
        return this.$route.query.redirect
          ? this.$route.query.redirect
          : '/profile';
      },
    },

    mounted () {
      this.unsubAuthChanged = auth.onAuthStateChanged( async user => await this.authenticated( user ) );
    },

    beforeDestroy () {
      if ( this.unsubAuthChanged ) {
        this.unsubAuthChanged();
        console.log(`%cLogin.vue:%c Unsubscribed!`, 'background: #2196f3; color: #fff; border-radius: 3px; padding: .2rem .5rem;', '');
      }
    },
  }
</script>
