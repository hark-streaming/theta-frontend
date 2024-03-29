<template>
    <div>
      <!-- Push Notification Bell -->
      <v-btn
        v-if="isAuth"
        class="ml-2"
        :disabled="!following"
        icon
        @click="verifyPushNotifications"
      >
        <v-icon color="white" v-if="following">
          {{ pushNotifications
          ? 'notifications_active'
          : 'notifications' }}
        </v-icon>
        <v-icon v-else>mdi-bell-off</v-icon>
      </v-btn>

      <!-- Push Notification Confirmation Dialog -->
      <v-dialog
        transition="fade-transition"
        v-model="showConfirmNotifications"
        width="20%"
        @click:outside="confirm( false )"
      >
        <v-card class="justify-space-between align-center">
          <div class="d-flex align-center py-2 px-3"
          >
            <v-icon color="black">notifications_active</v-icon>
            <h4 class="pl-3 pt-1 body-1">
              Enable Push Notifications?
            </h4>
          </div>

          <v-divider></v-divider>

          <div class="pa-3">
            <!--
            <div class="subtitle-1 my-2 black--text">
              Notifications will still be sent to this device if bitwave is closed.
            </div> -->
            <div class="pl-1 mb-3" style="font-size:0.9em;">
              You can always disable notifications by clicking the bell again.
            </div>

            <div
              v-if="isBraveBrowser"
              class="mb-3"
            >
              <v-alert
                dense
                outlined
                text
                border="left"
                color="yellow"
                class="my-2"
              >
                Push notifications in Brave have to be manually enabled first by enabling:<br>
                Use Google Services for Push Messaging
              </v-alert>
              <v-img src="/images/brave-push_notifications.png"/>
            </div>
          </div>

          <v-card-actions class="justify-end pa-3">
            <v-btn
              class="mr-2"
              color="secondary"
              outlined
              small
              @click="confirm( false )"
            >
              Cancel
            </v-btn>
            <v-btn
              color="secondary"
              small
              @click="confirm( true )"
              class="white--text"
            >
              Enable
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>
</template>

<script>
  import { mapActions, mapGetters } from 'vuex';
  import { VNotifications } from '@/store/notifications';
  import { auth, db } from '@/plugins/firebase';
  import { VStore } from '@/store';

  export default {
    name: 'NotificationBell',

    props: {
      streamerId: { type: String },
      following: { type: Boolean },
      pushNotifications: { type: Boolean },
    },

    data() {
      return {
        isBraveBrowser: false,
        confirmNotifications: null,
        showConfirmNotifications: false,
      };
    },

    methods: {
      confirm ( confirm ) {
        this.showConfirmNotifications = false;
        this.confirmNotifications( confirm );
      },

      async verifyPushNotifications () {
        this.showConfirmNotifications = true;

        // Verify when enabling push notifications
        // if ( !this.pushNotifications || !this.getTokenFCM ) {

        if ( !this.getTokenFCM ) {
          const enable = await new Promise( res => this.confirmNotifications = res );
          if ( !enable ) return;
        }

        console.log( `CHeck for FCM key or show request` );
        await this.requestTokenFCM();

        console.log( `Enable & Subscribe to channel` );
        await this.togglePushNotifications();
      },

      async togglePushNotifications () {
        const followerDoc = await db
          .collection( 'followers' )
          .doc( `${this.user.uid}_${this.streamerId}` )
          .get();

        if ( !followerDoc.exists ) {
          console.error( `Failed to get follower documeent to update!` );
          return;
        }

        const data = followerDoc.data();
        const notifications = data.hasOwnProperty( 'notifications' )
          ? data.notifications
          : false;

        if ( !notifications ) {
          await this.subscribeToUser( this.streamerId );
          this.pushNotifications = true;

          this.$analytics.logEvent( 'enable_push_notifications' );
          this.$ga.event({
            eventCategory : 'notifications',
            eventAction   : 'enable push notifications',
          });
        } else {
          await this.unsubscribeFrom( this.streamerId );
          this.pushNotifications = false;

          this.$analytics.logEvent( 'disable_push_notifications' );
          this.$ga.event({
            eventCategory : 'notifications',
            eventAction   : 'disable push notifications',
          });
        }

        await followerDoc.ref.update({
          notifications: this.pushNotifications,
        });
      },
    },

    computed: {
      ...mapGetters({
        isAuth : VStore.$getters.isAuth,
        user   : VStore.$getters.getUser,
      }),

      ...mapGetters( VNotifications.namespace, {
        getTokenFCM : VNotifications.getTokenFCM,
      }),

      ...mapActions( VNotifications.namespace, {
        requestTokenFCM : VNotifications.$actions.requestTokenFCM,
        subscribeToUser : VNotifications.$actions.subscribeToUser,
        unsubscribeFrom : VNotifications.$actions.unsubscribeFrom,
      }),
    },

    async mounted () {
      // Brave browser detection to improve documentation
      // see: https://github.com/bitwave-tv/bitwave/issues/209
      this.isBraveBrowser = ( navigator.brave && await navigator.brave.isBrave() ) || false;
    },
  };
</script>

<style lang='scss'>

</style>
