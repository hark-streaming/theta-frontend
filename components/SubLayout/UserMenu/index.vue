<template>
    <div>
        <div v-if="isAuth">
            <v-row class="mr-1">
                <!-- Tfuel amount -->
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
                </v-tooltip>

                <!-- profile icon -->
                <v-menu
                    v-model="profileMenu"
                    :close-on-content-click="true"
                    bottom
                    offset-y
                    left
                    transition="slide-y-transition"
                >
                    <template #activator="{ on }">
                        <v-btn
                            v-on="on"
                            color="transparent"
                            class="black--text"
                            rounded
                            small
                            fab
                        >
                            <!-- Avatar with webp support -->
                            <picture
                                class="v-avatar ml-0"
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
                        </v-btn>
                    </template>

                    <lazy-user-menu-content />
                </v-menu>
            </v-row>
        </div>

        <div v-else>
            <v-btn color="primary" outlined class="primary--text" small :to="registerTo">
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

            <v-dialog v-model="showLogin" width="420">
                <lazy-login-dialog @close="showLogin = false" />
            </v-dialog>
        </div>
    </div>
</template>

<script>
import { mapGetters } from "vuex";
import { VStore } from "@/store";

export default {
    name: "UserMenuButton",

    data() {
        return {
            profileMenu: false,
            showLogin: false,
            registerTo: "/register",
            defaultProfilePic:
                "https://cdn.discordapp.com/attachments/814278920168931382/821993879842062366/viewer.png",

            balance: 0,
            balanceLoading: false,
        };
    },

    methods: {
        async setTfuelBalance() {
            // call api for the vault wallet balance
            try {
                let result = await this.$axios.$get(
                    `${process.env.API_URL}/theta/address/${this.uid}`
                );

                this.balance = result.vaultBalance == null ? 0 : result.vaultBalance;
            } catch (err) {
                this.balance = 0;
            }
        },
    },

    mounted() {
        // Temporary until someone thinks of a smarter way
        this.balanceLoading = true;
        setTimeout(async () => {
            if (this.auth) {
                await this.setTfuelBalance();
                this.balanceLoading = false;
            }
        }, 2000);
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
