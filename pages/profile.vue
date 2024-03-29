<template>
    <v-container class="d-flex" style="height:100%;">
        <v-row class="d-flex justify-center" style="height:100%;" no-gutters>
            <v-col class="d-flex" style="flex-direction:column;" xl="2" lg="3" md="10" sm="10">
                <h1 class="mr-3 mt-12 white--text">YOUR ACCOUNT</h1>
                <v-divider class="mt-1 mr-13 mb-n5" style="border-color:white;"></v-divider>
            </v-col>
            <v-col d-flex class="mt-5" style="background-color:white;flex-direction:column;justify-content:flex-start;" xl="6" lg="9" md="10" sm="10">
                <v-tabs
                    v-model="currentTab"
                    background-color="transparent"
                    class="no-focus"
                    color="secondary"
                    style="min-height:100vh"
                >
                    <v-tab>Account</v-tab>
                    <v-tab>Donations</v-tab>
                    <v-tab>Streaming</v-tab>
                    <v-tab :disabled="!showStreamInfo">Token</v-tab>

                    <!-- ACCOUNT TAB -->
                    <v-tab-item eager>
                        <account-details-2 />
                    </v-tab-item>

                    <!-- DONATIONS TAB -->
                    <v-tab-item eager>
                        <v-layout justify-center>
                            <donation-history-card/>
                        </v-layout>
                        <v-layout v-show="showStreamInfo" justify-center>
                            <card-form :v-show="false" />
                        </v-layout>
                        <v-layout v-show="showStreamInfo" justify-center>
                            <cash-out-card />
                        </v-layout>
                    </v-tab-item>

                    <!-- STREAM TAB -->
                    <v-tab-item eager>
                        <!-- Upgrade Account -->
                        <v-layout justify-center>
                            <v-flex v-if="!showStreamInfo">
                                <v-card tile flat class="mb-4 pa-3">
                                    <h2>Upgrade to a Streaming Account</h2>
                                    <div class="mb-2">
                                        We get it. You want to stream on Hark! I mean,
                                        who doesn't? You're going to have to fill out
                                        the form below to get a streamkey.
                                    </div>
                                    <upgrade-account-form />
                                </v-card>
                            </v-flex>
                        </v-layout>

                        <!-- Stream Key -->
                        <v-layout justify-center>
                            <v-flex v-if="showStreamInfo">
                                <v-card tile flat class="mb-4">
                                    <v-layout column>
                                        <v-flex class="mb-3">
                                            <h2 class="pa-3">Stream Server Configuration</h2>
                                            <v-divider></v-divider>

                                            <div class="my-3 mx-3">
                                                <v-btn
                                                    color="primary"
                                                    outlined
                                                    small
                                                    @click="
                                                        showStreamkeyHelp = !showStreamkeyHelp
                                                    "
                                                >
                                                    {{
                                                        showStreamkeyHelp
                                                            ? "Hide"
                                                            : "Show"
                                                    }}
                                                    Help
                                                </v-btn>

                                                <v-expand-transition>
                                                    <div
                                                        v-show="showStreamkeyHelp"
                                                        class="my-2 body-2"
                                                    >
                                                        <div class="mb-4">
                                                            <div
                                                                class="title primary--text"
                                                            >
                                                                Getting Started
                                                            </div>
                                                            Copy and paste a
                                                            <strong>Server URL</strong>
                                                            and your
                                                            <strong>Stream Key</strong>
                                                            from below into your
                                                            livestreaming software (such
                                                            as OBS).*

                                                            <p class="extraInfo">
                                                                *You may need to choose
                                                                "Custom RTMP Server" in
                                                                your software in order
                                                                to do this.
                                                            </p>
                                                        </div>
                                                        <!-- To get started, first copy and paste a <strong>Server URL</strong> and your <strong>Stream Key</strong> from below into your livestreaming software (such as OBS).<br>
                            You may need to choose "Custom RTMP Server" in your software in order to do this.<br>
                            We currently offer 2 stream ingestion servers that you may connect to: <br>
                            US West ( Primary ), and US East ( Backup / Auxillary capacity ).<br>
                            A European server is planned dependant on finances & demand.<br>
                            It is suggested you try connecting to both servers in order to determine which server provides a more stable connection. -->

                                                        <div class="mb-2">
                                                            <div
                                                                class="title primary--text"
                                                            >
                                                                Choose a Bitrate
                                                            </div>
                                                            We recommend a bitrate of
                                                            2,500kb/s (2.5mb/s) CBR for
                                                            most streamsers (if their
                                                            net supports it). Do not
                                                            exceed 8,000kb/s (8.0mb/s).*

                                                            <p class="extraInfo">
                                                                *It is unlikely that all
                                                                viewers will be able to
                                                                smoothly watch a stream
                                                                at rates above 8.0mb/s.
                                                            </p>
                                                        </div>
                                                        <!-- We recommend a bitrate of 2,500kb/s (2.5mb/s) CBR for most streamsers (if their net supports it).<br>
                            Please do not exceed 8,000kb/s (8.0mb/s). While our servers <i>are</i> capable of managing numerous high bitrate
                            streams with ease, it is unlikely that all viewers will be able to smoothly watch a stream at rates above 8.0mb/s. -->

                                                        <div class="mb-2">
                                                            <div
                                                                class="title primary--text"
                                                            >
                                                                Set Your Keyframes
                                                            </div>
                                                            <strong
                                                                >Ensure that your
                                                                keyframes are set to
                                                                either 1 or 2 in your
                                                                streaming
                                                                software.*</strong
                                                            >

                                                            <p class="extraInfo">
                                                                *Using other rates may
                                                                result in unstable
                                                                streams, loss of
                                                                connection, increased
                                                                stream delays, frequent
                                                                buffering, and can even
                                                                cause your stream's
                                                                video to freeze
                                                                entirely.
                                                            </p>
                                                        </div>
                                                        <!-- Lastly, ensure your keyframes are set to either 1 or 2 in your streaming software.<br>
                            <strong>DO NOT FORGET THIS.</strong><br>
                            Using other rates may result in unstable streams, loss of connection, increased stream delays, frequent buffering, and can even cause your stream's video to freeze entirely. -->

                                                        <!-- <div class="mb-2">
                            <div class="title secondary--text">Asking For Help</div>
                            If you are having issues setting up or connecting your stream, try asking for help in chat. There are many knowledgeable users with streaming experience who will likely
                            offer to help resolve any issues. There are also links on the homepage in case you need to get in touch with a developer.
                            </div> -->
                                                    </div>
                                                </v-expand-transition>
                                            </div>
                                        </v-flex>
                                        <v-flex class="pa-3">
                                            <v-text-field
                                                class="mb-3"
                                                value="rtmp://13.59.151.129:1935/live"
                                                label="Server URL"
                                                color="secondary"
                                                readonly
                                                outlined
                                                hide-details
                                                :loading="streamDataLoading"
                                            />
                                        </v-flex>
                                        <v-flex class="pa-3">
                                            <v-text-field
                                                v-model="streamData.key"
                                                ref="streamkeyinput"
                                                label="Stream Key"
                                                color="secondary"
                                                readonly
                                                outlined
                                                :messages="keyMessage"
                                                :loading="
                                                    streamDataLoading || keyLoading
                                                "
                                                :type="showKey ? 'text' : 'password'"
                                                :append-icon="
                                                    showKey
                                                        ? 'visibility'
                                                        : 'visibility_off'
                                                "
                                                @click:append="showKey = !showKey"
                                                @click="showKey = !showKey"
                                                @focus="showKey = !showKey"
                                            />
                                        </v-flex>
                                        <v-layout class="pa-3">
                                            <v-spacer />
                                            <v-btn
                                                color="primary"
                                                outlined
                                                :loading="keyLoading"
                                                @click="resetStreamKey"
                                                class="mr-2"
                                                >Reset</v-btn
                                            >
                                            <v-btn
                                                color="primary"
                                                class="white--text"
                                                :loading="keyLoading"
                                                @click="copyToClipboard"
                                                >Copy</v-btn
                                            >
                                        </v-layout>
                                    </v-layout>
                                </v-card>
                            </v-flex>
                        </v-layout>

                        <!-- Stream Info -->
                        <v-layout justify-center>
                            <v-flex v-if="showStreamInfo">
                                <stream-info-dashboard
                                    :username="username.toLowerCase()"
                                />
                            </v-flex>
                        </v-layout>
                    </v-tab-item>

                    <!-- TOKEN TAB -->
                    <v-tab-item eager>
                        <v-layout justify-center>
                            <governance-token-form />
                        </v-layout>
                        <v-layout v-show="showStreamInfo" justify-center>
                            <relay-card />
                        </v-layout>
                    </v-tab-item>
                </v-tabs>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
import { auth, db } from "@/plugins/firebase.js";

import { mapGetters } from "vuex";
import { VStore } from "@/store";

//import AccountDetails from '@/components/profile/AccountDetails';
import AccountDetails2 from "@/components/profile/AccountDetails2";
import ManageWebhooks from "@/components/profile/ManageWebhooks";
import CardForm from "@/components/DonationCards/CardForm";

export default {
    name: "profile",

    components: {
        ManageWebhooks,
        AccountDetails2,
        CardForm,
    },

    middleware: "auth",

    data() {
        return {

            unsubAuthChanged: null,
            currentTab: 0,

            allowEdit: false,

            showError: false,
            error: {
                message: "",
            },

            showSuccess: false,
            success: {
                message: "",
            },

            streamDocListener: null,

            streamData: {
                archive: false,
                title: "",
                nsfw: false,
                url: "",
                key: "",
            },

            streamDataLoading: true,
            profileDataLoading: true,
            showStreamInfo: false,
            showKey: false,
            showSave: false,
            saveLoading: false,
            keyLoading: false,
            keyMessage: "Click to reveal key",

            description: "",

            showStreamkeyHelp: false,
        };
    },

    methods: {
        async authenticated(user) {
            if (user) {
                console.log(`[profile] User:`, user);
            } else {
                await this.$router.push("/login");
            }
        },

        getStreamData() {
            this.streamDataLoading = true;

            const stream = this.username.toLowerCase();
            const streamRef = db.collection("streams").doc(stream);
            this.showStreamInfo =
                this.user.hasOwnProperty("streamkey") &&
                this.user.streamkey != "";
            return streamRef.onSnapshot(
                async (doc) => {
                    //this.showStreamInfo = doc.exists;
                    if (this.showStreamInfo)
                        await this.streamDataChanged(doc.data());
                },
                () => (this.showStreamInfo = false)
            );
        },

        getProfileData() {
            this.profileDataLoading = true;
            const userId = this.uid;
            const profileRef = db.collection("users").doc(userId);
            return profileRef.onSnapshot(
                async (doc) => {
                    await this.profileDataChanged(doc.data());
                },
                (error) => console.log(error)
            );
        },

        async profileDataChanged(data) {
            this.streamkey = data.streamkey;
            this.streamData.key = `${this.username}?key=${this.streamkey}`;
            this.profileDataLoading = false;
        },

        async streamDataChanged(data) {
            this.streamData.archive = !!data.archive;
            this.streamData.title = data.title;
            this.streamData.nsfw = data.nsfw;
            this.description = data.description;
            this.streamDataLoading = false;
        },

        async updateStreamData() {
            this.$ga.event({
                eventCategory: "profile",
                eventAction: "update stream",
                eventLabel: this.username.toLowerCase(),
            });
            this.saveLoading = true;
            const archive = this.streamData.archive;
            const title = this.streamData.title;
            const nsfw = this.streamData.nsfw;
            const description = this.description;
            const stream = this.username.toLowerCase();
            const streamRef = db.collection("streams").doc(stream);
            await streamRef.update({
                archive,
                nsfw,
                title,
                description,
            });
            this.saveLoading = false;
            this.showSave = false;
        },

        async resetStreamKey() {
            this.$ga.event({
                eventCategory: "profile",
                eventAction: "reset key",
                eventLabel: this.username.toLowerCase(),
            });
            this.keyLoading = true;
            const key = Math.random().toString(16).substr(2, 9);
            const userId = this.uid;
            const docRef = db.collection("users").doc(userId);
            await docRef.update({
                streamkey: key,
            });
            this.keyLoading = false;
            await this.kickStream();
        },

        async kickStream() {
            const token = await auth.currentUser.getIdToken(true);
            const user = this.username;
            const server = "api.bitwave.tv";
            const apiVer = "v1";
            const endpoint = "/streamer/stream/kick";
            const url = `https://${server}/${apiVer}${endpoint}?token=${token}&reset=${false}`;
            await this.$axios.$post(url, { streamer: user });
        },

        copyToClipboard() {
            const initialState = this.showKey;
            this.$copyText(this.streamData.key).then(
                () => {
                    this.keyMessage = ["Copied to clipboard"];
                    this.$toast.success("Copied to clipboard", {
                        icon: "done",
                        duration: 5000,
                    });
                    this.$refs["streamkeyinput"].focus();
                },
                (error) => {
                    console.log(error);
                    this.keyMessage = "Failed to copy to clipboard";
                    this.$toast.error("Failed to copy to clipboard", {
                        icon: "error",
                        duration: 5000,
                    });
                }
            );

            setTimeout(() => {
                this.showKey = initialState;
                this.keyMessage = "Click to reveal key";
                this.$refs["streamkeyinput"].blur();
            }, 3000);
        },
    },

    computed: {
        ...mapGetters({
            uid: VStore.$getters.getUID,
            user: VStore.$getters.getUser,
            username: VStore.$getters.getUsername,
        }),
    },

    async mounted() {
        this.unsubAuthChanged = auth.onAuthStateChanged((user) =>
            this.authenticated(user)
        );
        this.streamDocListener = this.getStreamData();
        this.profileDocListener = this.getProfileData();
    },

    beforeDestroy() {
        if (this.unsubAuthChanged) {
            this.unsubAuthChanged();
            console.log(
                `%cProfile.vue:%c Unsubscribed!`,
                "background: #2196f3; color: #fff; border-radius: 3px; padding: .2rem .5rem;",
                ""
            );
        }
        if (this.streamDocListener) this.streamDocListener();
        if (this.profileDocListener) this.profileDocListener();
    },
};
</script>

<style>
    h1 {
        font-weight:500;
        font-size:3em;
    }
    .extraInfo {
        font-size: 12px;
        margin-top: 8px;
        padding-left: 20px;
        padding-right: 20px;
    }

    .theme--light.v-tabs-items {
        background: transparent !important;
    }
</style>