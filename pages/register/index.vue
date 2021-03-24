<template>
  <v-container grid-list-md>
    <h1 class="mb-4 d-flex justify-space-around">Registration</h1>

    <!-- 3 card layout -->
    <v-row>
      <v-col>
        <v-card elevation="2" @click="showLogin = true">
          <v-card-title class="justify-center"> Viewers </v-card-title>
          <v-card-subtitle class="text-center">
            We, the People.
          </v-card-subtitle>
          <v-img
            src="https://cdn.discordapp.com/attachments/814278920168931382/819051556384276531/viewer.png"
            class="center-img"
          />
          <div class="pa-4">
            <p>You should sign up as a viewer if you plan on:</p>
            <ul>
              <li>Watching streams for entertainment and learning.</li>
              <li>
                Earning and donating cryptocurrency by watching content
                creators.
              </li>
              <li>Supporting the creators you love.</li>
            </ul>
          </div>
          <v-btn @click="showLogin = true" class="mb-3 center-img d-flex"
            >Register</v-btn
          >
        </v-card>
      </v-col>
      <v-col>
        <v-card elevation="2" to="/register/commentator">
          <v-card-title class="justify-center"> Voices </v-card-title>
          <v-card-subtitle class="text-center">
            Creators, Commentators, Activists
          </v-card-subtitle>
          <v-img
            src="https://cdn.discordapp.com/attachments/814278920168931382/819051567634317402/speaker.png"
            class="center-img"
          />
          <div class="pa-4">
            <p>You should sign up as a voice if you plan on:</p>
            <ul>
              <li>Streaming videos on Hark!</li>
              <li>
                Earning cryptocurrency and ad revenue for profit or as a
                nonprofit.
              </li>
              <li>Growing an audience that is ready to make a difference.</li>
            </ul>
          </div>
          <v-btn to="/register/commentator" class="mb-3 d-flex">Register</v-btn>
        </v-card>
      </v-col>
      <v-col>
        <v-card elevation="2" to="/register/politician">
          <v-card-title class="justify-center"> Civic Servants </v-card-title>
          <v-card-subtitle class="text-center">
            Candidates & PACs
          </v-card-subtitle>
          <v-img
            src="https://cdn.discordapp.com/attachments/814278920168931382/819051565079593030/politician.png"
            class="center-img"
          />
          <div class="pa-4">
            <p>You should sign up as a voice if you plan on:</p>
            <ul>
              <li>Streaming videos on Hark!</li>
              <li>
                Soliciting campaign donations either directly or through
                cryptocurrency contributions.
              </li>
              <li>
                Intend to influence the outcome of a US election by connecting
                to viewers.
              </li>
            </ul>
          </div>
        </v-card>
      </v-col>
    </v-row>
    <v-dialog v-model="showLogin" width="420">
      <lazy-login-dialog @close="showLogin = false" initialSignUp />
    </v-dialog>
  </v-container>
</template>

<script>
import { auth } from "@/plugins/firebase.js";

export default {
  name: "register",

  data() {
    return {
      showLogin: false,
    };
  },

  methods: {
  },

  computed: {},

  mounted() {
  },

  beforeDestroy() {},
};
</script>

<style>
.center-img {
  padding: 8px;
  margin: auto;
  width: 50%;
}
</style>