<template>
    <div>
        <div v-if="isAuth">
            <v-row class="d-flex mr-1" style="flex-wrap: nowrap">
                <!-- Tfuel amount -->
                <!--
                <v-tooltip bottom>
                    <template v-slot:activator="{ on, attrs }">
                        <v-progress-circular
                            indeterminate
                            color="primary"
                            class="mt-2 mr-6"
                            :size="20"
                            :width="4"
                            v-show="balanceLoading"
                        ></v-progress-circular>
                        <v-row
                            class="mt-2 mr-6"
                            v-bind="attrs"
                            v-on="on"
                            v-show="!balanceLoading"
                        >
                            <img
                                src="https://cdn.discordapp.com/attachments/814278920168931382/826294941768482876/tfuel.png"
                                width="24px"
                                height="24px"
                            />
                            <span class="ml-1 primary--text" v-html="balance">
                            </span>
                        </v-row>
                    </template>
                    <span> Earn TFUEL by watching streams. </span>
                </v-tooltip> -->
                <v-progress-circular
                    indeterminate
                    color="primary"
                    class="mt-3 mr-4"
                    :size="20"
                    :width="1.5"
                    v-show="balanceLoading"
                ></v-progress-circular>                    
                <v-row
                    class="mt-3 mr-4"
                    style="flex-wrap: nowrap; cursor: pointer;"
                    @click="setTfuelBalance(true)"
                    v-show="!balanceLoading"
                >
                    <img
                        src="https://cdn.discordapp.com/attachments/814278920168931382/826294941768482876/tfuel.png"
                        width="24px"
                        height="24px"
                    />
                    <span class="ml-1 primary--text" v-html="balance"> </span>
                </v-row>

                <!-- profile icon -->
                <v-menu
                    v-model="profileMenu"
                    :close-on-content-click="true"
                    bottom
                    offset-y
                    left
                    transition="fade-transition"
                    nudge-bottom="1"
                >
                    <template #activator="{ on }">
                        <v-btn
                            v-on="on"
                            color="transparent"
                            class="black--text"
                            rounded
                            icon
                            flat
                        >
                            <!-- Avatar with webp support -->
                            <picture
                                v-if="avatar"
                                class="v-avatar"
                                style="
                                    height: 40px;
                                    min-width: 40px;
                                    width: 40px;
                                    background: #212121;
                                "
                            >
                                <source
                                    v-if="avatars"
                                    :srcset="avatars.webp"
                                    type="image/webp"
                                />
                                <img :src="avatar" :alt="username" />
                            </picture>
                            <v-avatar
                                v-else
                                class="mr-4"
                                size="40"
                                color="grey darken-4"
                                >
                                <img
                                    src="https://cdn.discordapp.com/attachments/778040889359466546/834964837922635796/defaultviewer.jpg"
                                    alt="hark user"
                                >
                                <!--<v-icon v-else>person</v-icon>-->
                            </v-avatar>
                        </v-btn>
                    </template>

                    <lazy-user-menu-content />
                </v-menu>
            </v-row>
        </div>

        <div v-else>
            <v-btn
                color="primary"
                outlined
                class="primary--text"
                small
                :to="registerTo"
            >
                Register
            </v-btn>

            <v-btn
                color="primary"
                outlined
                class="primary--text"
                small
                @click="showLogin = true"
            >
                Login
            </v-btn>

            <v-dialog v-model="showLogin" width="420" transition="fade-transition">
                <lazy-login-dialog @close="showLogin = false" />
            </v-dialog>
        </div>
    </div>
</template>

<script>
import { mapGetters } from "vuex";
import { VStore } from "@/store";
import { auth } from "@/plugins/firebase.js";

export default {
    name: "UserMenuButton",

    data() {
        return {
            profileMenu: false,
            showLogin: false,
            registerTo: "/register",
            defaultProfilePic:
                "https://cdn.discordapp.com/attachments/778040889359466546/834964837922635796/defaultviewer.jpg",

            balance: 0,
            balanceLoading: false,
        };
    },

    methods: {
        async setTfuelBalance(force) {
            // call api for the vault wallet balance
            this.balanceLoading = true;
            try {
                let result = await this.$axios.$get(
                    `${process.env.API_URL}/theta/address/${this.uid}/?force_update=${force}`
                );
                this.balance =
                    result.vaultBalance == null
                        ? 0
                        : parseFloat(result.vaultBalance).toFixed(2);
            } catch (err) {
                this.balance = 0;
            }
            this.$store.commit("setTfuelBalance", this.balance);
            this.balanceLoading = false;
        },
    },

    async mounted() {
        // Temporary until someone thinks of a smarter way
        // this.balanceLoading = true;
        // setTimeout(async () => {
        //     if (this.isAuth) {
        //         await this.setTfuelBalance();
        //         this.balanceLoading = false;
        //     }
        // }, 2000);

        // this seems to be more consistent?
        auth.onAuthStateChanged((user) => {
            if (user) {
                // if logged in show tfuel
                setTimeout(async () => {
                    this.balanceLoading = true;
                    await this.setTfuelBalance(false);
                    this.balanceLoading = false;
                }, 1000);
            } else {
                // don't otherwise
            }
        });
    },

    computed: {
        ...mapGetters({
            uid: VStore.$getters.getUID,
            isAuth: VStore.$getters.isAuth,
            username: VStore.$getters.getUsername,
            auth: VStore.$getters.getAuth,
            getAvatar: VStore.$getters.getAvatar,
        }),

        avatar() {
            if (
                this.auth &&
                this.auth.hasOwnProperty("avatar") &&
                this.auth.avatar
            ) {
                return this.auth.avatar;
            } else return this.defaultProfilePic;
        },

        avatars() {
            if (
                this.user &&
                this.user.hasOwnProperty("avatars") &&
                this.user.avatars.length > 0
            ) {
                return this.user.avatars;
            } else return false;
        },
    },
};
</script>
