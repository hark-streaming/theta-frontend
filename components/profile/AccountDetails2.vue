<template>

<!-- <v-layout justify-center>
      <v-flex xs14 sm12 md10 lg8>
        <v-card class="mb-4 pa-3"> -->
        <v-sheet style="width:100%;" class="mb-4 pa-3">
          <v-card class="bigbackground">
            <div class="container">
              <div style="flex-direction:column;" class="d-flex justify-space-around align-center mb-5">
                <v-avatar color="grey darken-4" size="200" class="justify-space-around ma-3">
                  <img
                    :src="imageUrl || `https://cdn.discordapp.com/attachments/778040889359466546/834964837922635796/defaultviewer.jpg`"
                    alt="avatar"
                  />
                </v-avatar>
                <h2 class="mt-2 white--text">{{ username }}</h2>
                <!-- <div class="flex-shrink-1 text-xs-center my-1">
                  <h3>My Profile</h3> -->
                  <!-- <p>send in complaints for $5 / issue.</p> -->
                  <!-- <v-btn
                    color="red"
                    href="https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=JAN2HKQ9CTYZY&source=url"
                    target="_blank"
                  >COMPLAINTS</v-btn> -->
                <!-- </div> -->
              </div>
              <!-- <div class="d-flex align-center">
                <v-file-input
                  ref="image"
                  accept="image/png, image/jpeg, image/bmp"
                  show-size
                  :rules="sizeRules"
                  color="primary"
                  label="Upload a new profile photo."
                  solo
                  light
                  filled
                  prepend-icon=""
                  prepend-inner-icon="$file"
                  background-color="white"
                  truncate-length="30"
                  @change="onFilePicked"
                  dense
                />
                <v-btn
                  medium
                  class="flex-shrink-1 ml-2 mb-7"
                  :loading="uploadingAvatar"
                  color="white white--text"
                  outlined
                  :disabled="!imageFile"
                  @click="uploadFile"
                >UPDATE</v-btn>
              </div> -->
            </div>
          </v-card>

          <!-- <h2 style="padding-top:10px;font-weight:500;" class="container2">Profile Information</h2>

          <v-divider class="mt-2 mb-7"></v-divider> -->

          <div v-if="user" class="my-4">

            <div class="d-flex align-center">
              <v-file-input
                ref="image"
                accept="image/png, image/jpeg, image/bmp"
                show-size
                :rules="sizeRules"
                color="primary"
                label="Upload a new profile photo."
                solo
                light
                filled
                prepend-icon=""
                prepend-inner-icon="$file"
                background-color="white"
                truncate-length="30"
                @change="onFilePicked"
                dense
              />
              <v-btn
                medium
                class="flex-shrink-1 ml-2 mb-7"
                :loading="uploadingAvatar"
                color="primary"
                outlined
                :disabled="!imageFile"
                @click="uploadFile"
              >UPDATE</v-btn>
            </div>

            <!-- username -->
            <v-text-field
              v-model="username"
              messages="You cannot change your username."
              class="mb-2"
              label="Username"
              readonly
              outlined
            />

            <!-- email and password -->
            <v-form
              ref="updatepw"
              @submit.prevent="updateProfile"
            >
              <v-text-field
                v-model="email"
                label="Email"
                autocomplete="email username"
                id="username"
                name="username"
                outlined
                :class="{ 'mb-2': email !== user.email }"
                :hint="email === user.email ? '' : 'This will change your login email'"
                persistent-hint
                :clearable="editProfile"
                :readonly="!editProfile"
                :error-messages="emailError"
                :loading="savingProfile && email !== user.email"
              />

              <v-text-field
                v-model="currPassword"
                :label="editProfile ? 'Current Password' : 'Password'"
                type="password"
                autocomplete="current-password"
                value="************"
                :disabled="!editProfile"
                :clearable="editProfile"
                outlined
                required
                validate-on-blur
                :error-messages="pwError"
                :loading="savingProfile"
              />

              <v-slide-y-transition>
                <div v-if="editProfile">

                  <v-text-field
                    v-model="newPassword"
                    label="New Password"
                    hint="optional - only if you wish to change your password"
                    persistent-hint
                    type="password"
                    autocomplete="new-password"
                    :clearable="editProfile"
                    outlined
                    :error="!!newPwError"
                    :error-messages="newPwError"
                    :loading="savingProfile && !!newPassword"
                  />

                  <!--<v-text-field
                    v-model="confPassword"
                    label="confirm new password"
                    type="password"
                    autocomplete="new-password"
                    outlined
                    required
                    validate-on-blur
                  />-->

                  <div class="d-flex mb-3">
                    <v-spacer />
                    <v-btn
                      color="primary"
                      class="mr-2 primary--text"
                      :loading="savingProfile"
                      type="submit"
                      outlined
                    >Save</v-btn>
                  </div>

                  <v-alert
                    :value="!!newPwError || !!pwError"
                    class="mb-4"
                    dismissible
                    type="error"
                    transition="slide-y-transition"
                  >
                    {{ newPwError || pwError }}
                  </v-alert>

                </div>
              </v-slide-y-transition>

            </v-form>

            <!-- logout button -->
            <div class="d-flex">
              <v-spacer />
              <v-btn
                :color="editProfile ? 'error' : 'primary'"
                :class="{ 'primary--text': !editProfile }"
                class="mr-2"
                @click="toggleEdit"
                outlined
              >{{ editProfile ? 'Cancel' : 'Edit Password' }}</v-btn>
              <v-btn
                color="primary"
                @click="logout"
                class="white--text"
              >Logout</v-btn>
            </div>

          </div>
        </v-sheet>
</template>

<script>
  import { mapGetters, mapActions } from 'vuex'
  import { VStore } from '@/store';
  import { auth, db, EmailAuthProvider, storage } from '@/plugins/firebase';

  export default {
    name: 'AccountDetails',

    data () {
      return {
        imageUrl: null,
        uploadingAvatar: false,
        imageFile: null,
        imageName: null,

        sizeRules:[value => !value || value.size < 1000000 || 'Avatar size must be less than 1 MB.'],

        editProfile: false,

        email: '',
        emailError: null,

        currPassword: '************',
        newPassword: '',
        confPassword: '',

        savingProfile: false,
        pwError: null,
        newPwError: null,
      };
    },

    methods: {
      ...mapActions({
        logoutStore: VStore.$actions.logout,
      }),

      async logout () {
        await this.logoutStore();
      },

      onFilePicked ( file ) {
        if ( file ) {
          this.imageName = file.name;
          //if( this.imageName.lastIndexOf('.') <= 0 ) return;

          const fr = new FileReader ();
          fr.readAsDataURL( file );
          if(file.size > 1000000) { // don't do anything if the file is too big
                console.log("file too big");
                return;
          }
          fr.addEventListener('load', () => {
            this.imageUrl  = fr.result;
            this.imageFile = file; // this is an image file that can be sent to server...
          });
        } else {
          this.imageName =   '';
          this.imageFile = null;
          this.imageUrl  = this.user.avatar || '';
        }
      },

      async uploadFile () {
        if ( !this.imageFile ) return false;
        this.uploadingAvatar = true;

        // upload to firebase storage, under /uid/avatar/image.jpg
        var storageRef = storage.ref().child(this.uid + "/avatar/" + this.imageName);
        try {
            await storageRef.put(this.imageFile);
            //console.log("uploaded", this.imageName);
            let downloadUrl = await storageRef.getDownloadURL();
            //console.log("image url", downloadUrl);
            this.imageUrl = downloadUrl;
            
            // save the link to the firestore
            this.saveUserAvatar(this.imageUrl);
        }
        catch(err) {
            console.log("uploadFile error", err);
        }
        
        this.uploadingAvatar = false;
      },

      async saveUserAvatar ( url ) {
        const userId = this.uid;
        const docRef = db.collection( 'users' ).doc( userId );
        await docRef.update({
          avatar: url,
        });

        if ( this.isStreamer ) {
          const stream = this.username.toLowerCase();
          const streamRef = db.collection( 'streams' ).doc( stream );
          await streamRef.update({
            avatar: url,
          });
        }

        this.imageFile = null;
        this.imageName = '';

        this.$ga.event({
          eventCategory : 'profile',
          eventAction   : 'update avatar',
          eventLabel    : this.username.toLowerCase(),
        });
      },

      toggleEdit () {
        this.editProfile = !this.editProfile;

        if ( this.editProfile ) {
          this.currPassword = this.newPassword = this.confPassword = '';
        } else {
          this.newPwError = this.pwError = this.emailError = null;
          this.currPassword = '************';
          this.email = this.user.email;
        }
      },

      async updateProfile () {
        this.newPwError = this.pwError = this.emailError = null;
        this.savingProfile = true;

        const _user = auth.currentUser;

        // re-authenticate user
        try {
          const credential = await EmailAuthProvider.credential( this.user.email, this.currPassword );
          await _user.reauthenticateWithCredential( credential );
        } catch ( error ) {
          this.savingProfile = false;
          this.pwError = error.message;
          console.log( error );
          return false;
        }

        // update email
        try {
          // only update email changed
          if ( this.email !== this.user.email ) {
            await _user.updateEmail( this.email );
            await db.collection('users').doc(this.uid).update({
              email: this.email
            });
            this.$toast.success( 'Email address updated.', { icon: 'done', duration: 5000 } );
          }
        } catch ( error ) {
          this.savingProfile = false;
          this.emailError = error.message;
          console.log( error );
          return false;
        }

        // update password
        try {
          if ( this.newPassword ) {
            await _user.updatePassword( this.newPassword );
            this.$toast.success( 'Password updated.', { icon: 'done', duration: 5000 } );
          }
        } catch ( error ) {
          this.savingProfile = false;
          this.newPwError = error.message;
          console.log( error );
          return false;
        }
        this.editProfile = false;
        this.savingProfile = false;
        return true;
      },

    },

    watch: {
      user ( newVal ) {
        if ( !newVal ) return;
        this.imageUrl = newVal.avatar;
        this.email    = newVal.email;
      },
    },

    computed: {
      ...mapGetters({
        uid      : VStore.$getters.getUID,
        user     : VStore.$getters.getUser,
        username : VStore.$getters.getUsername,
        isStreamer : VStore.$getters.isStreamer,
      }),
    },

    mounted () {
      this.imageUrl = this.user.avatar;
      this.email    = this.user.email;
    },
  };
</script>

<style scoped lang='scss'>

.bigbackground {
  background: rgb(40, 40, 87);
  background: linear-gradient(
      45deg,
      rgba(40, 40, 87, 1) 0%,
      rgba(177, 87, 87, 1) 100%
  );
}

.glass {
  background: rgba(255, 255, 255, 0.8);
}

.container {
  justify-content: center;
}

</style>
