<template>
  <v-card tile flat class="pt-10" color="secondary" style="margin:auto;height:100%;">
    <v-container grid-list-md>
        <h1 class="d-flex white--text">REGISTER AS A</h1>

        <!-- 3 card layout -->
        <v-row>
          <v-col>
            <!-- <v-sheet outlined color="white" rounded>
              <v-card outlined @click="showLogin = true" style="height:100%;" color="secondary">
                <v-card-title class="justify-center white--text"> Viewer </v-card-title>
                <v-card-subtitle class="text-center white--text">
                  We, the People.
                </v-card-subtitle>
                <v-divider light></v-divider>
                <br>
                <v-img
                  src="https://cdn.discordapp.com/attachments/814278920168931382/819051556384276531/viewer.png"
                  class="center-img"
                />
                <v-divider light></v-divider>
                <div class="pa-4 white--text">
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
            </v-sheet> -->
            <v-card outlined @click="showLogin = true" style="height:100%;">
              <v-sheet
                color="secondary"
                class="white--text"
              >
                <v-card-title class="justify-center white--text"> Viewer </v-card-title>
                <v-card-subtitle class="text-center white--text">
                  We, the People.
                </v-card-subtitle>
              </v-sheet>
              <v-divider light></v-divider>
              <br>
              <v-img
                src="https://cdn.discordapp.com/attachments/814278920168931382/819051556384276531/viewer.png"
                class="center-img"
              />
              <v-divider light></v-divider>
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
              <!-- <v-btn @click="showLogin = true" class="mb-3 center-img d-flex"
                >Register</v-btn
              > -->
            </v-card>
          </v-col>
          <v-col>
            <v-card outlined to="/register/commentator" style="height:100%;">
              <v-sheet
                color="secondary"
                class="white--text"
              >
                <v-card-title class="justify-center"> Voice </v-card-title>
                <v-card-subtitle class="text-center white--text">
                  Creators, Commentators, Activists
                </v-card-subtitle>
                </v-sheet>
              <v-divider></v-divider>
              <br>
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
              <!-- <v-btn to="/register/commentator" class="mb-3 d-flex">Register</v-btn> -->
            </v-card>
          </v-col>
          <v-col>
            <v-card outlined to="/register/politician" style="height:100%;">
              <v-sheet
                color="secondary"
                class="white--text"
              >
                <v-card-title class="justify-center"> Civic Servant </v-card-title>
                <v-card-subtitle class="text-center white--text">
                  Candidates & PACs
                </v-card-subtitle>
              </v-sheet>
              <v-divider></v-divider>
              <br>
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
  </v-card>
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

<style scoped>

.theme--light.v-divider {
    border-color:white;
}

h1 {
  font-size:3em;

}
.center-img {
  padding: 8px;
  margin: auto;
  width: 50%;
}
</style>