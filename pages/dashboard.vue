<template>
    <div>
        <!-- Chat Header -->
        <div class="ma-6" align="center">
            <h1 >Streamer Dashboard</h1>
        </div>

        <!-- Main Container -->
        <v-container>
            <!-- Main dashboard -->
            <v-row>
                <!-- Stream Preview? -->
                <v-col >
                    <v-sheet color="secondary" class="pl-3">
                        <h1 :style="{color: 'white'}">Stream Preview</h1>
                    </v-sheet>
                    <v-responsive height="calc( 100% )">
                        <iframe
                            :src="`/embed/${username}`"
                            frameborder="none"
                            scrolling="no"
                            width="100%"
                            height="100%"
                        ></iframe>
                    </v-responsive> 
                    
                </v-col>

                <!-- Chat -->
                <v-col cols=4> 

                    <!-- <div :style="{display:block}">
                        <!- Chat Alerts? -->
                        <!-- <dashboard-superchats /> -->
                    <!-- </div> -->

                    <v-sheet
                        v-if="displayChat"
                        class="d-flex flex-shrink-1"
                        :style="{
                            height: mobile ? '500px' : '555px',
                            display:block
                        }"
                        light
                    >
                        <chat :chat-channel="username" />
                    </v-sheet>
                </v-col>
            </v-row>

            <!-- Configuration -->

            <!-- Stream Info -->
            <v-layout justify-center class="pt-4">
                <!-- <v-flex v-if="showStreamInfo" xs12 sm10 md8 lg6>
                    <v-card class="mb-4 pa-3">
                        <v-layout column>
                            <v-flex class="mb-3">
                                <h2>Stream Info</h2>
                            </v-flex>
                            <v-flex class="mb-3">
                                <v-text-field
                                    v-model="streamData.title"
                                    label="Stream Title"
                                    color="primary"
                                    outlined
                                    hide-details
                                    :loading="streamDataLoading || saveLoading"
                                    @input="showSave = true"
                                />
                            </v-flex>
                            <v-flex>
                                <v-textarea
                                    v-model="description"
                                    name="input-7-1"
                                    outlined
                                    hide-details
                                    color="primary"
                                    label="Stream Description (markdown supported)"
                                    auto-grow
                                    @input="showSave = true"
                                />
                            </v-flex>
                            <v-flex class="mt-2">
                                <vue-tags
                                    :active="activeTags"
                                    :all="allTags"
                                    :element-count-for-start-arrow-scrolling="3"
                                    :tab-index="1"
                                    :tag-creation-enabled="true"
                                    :colors-enabled="false"
                                    :tag-color-default="'green'"
                                    :tag-list-label="'Stream Topics'"
                                    :placeholder="'Select a stream topic....'"
                                    @on-tag-added="onTagAdded"
                                    @on-tag-removed="onTagRemoved"
                                    @on-tag-created="onTagCreated"
                                />
                            </v-flex>
                            
                            <v-flex shrink>
                                <v-switch 
                                    v-model="streamData.donateOn"
                                    label="Donate Button"
                                    color = "primary"
                                    hide-details
                                    dense
                                    inset
                                    @change="showSave = true"
                                />
                                <v-text-field 
                                    v-model="streamData.donateMsg"
                                    label="Button Message"
                                    outlined
                                    color="primary"
                                    auto-grow
                                    dense
                                    class="mt-4"
                                    counter="50"
                                    :disabled="!streamData.donateOn"
                                    @input="showSave = true"
                                />
                            </v-flex>
                            <v-flex shrink>
                                <v-switch
                                    v-model="streamData.nsfw"
                                    label="NSFW"
                                    color="primary"
                                    hide-details
                                    dense
                                    inset
                                    @change="showSave = true"
                                />
                            </v-flex>
                            <v-flex shrink>
                                <v-switch
                                    v-model="streamData.archive"
                                    label="Stream Replays"
                                    color="primary"
                                    hide-details
                                    dense
                                    inset
                                    @change="showSave = true"
                                />
                            </v-flex>
                            <v-layout>
                                <v-spacer />
                                <v-btn
                                    :disabled="!showSave"
                                    :loading="saveLoading"
                                    color="primary"
                                    outlined
                                    @click="updateStreamData"
                                    >save</v-btn
                                >
                            </v-layout>
                        </v-layout>
                    </v-card>
                </v-flex> -->
            
                <StreamInfoDashboard :username="username"/>
            </v-layout>
        </v-container>
    </div>
</template>

<script>

import { auth, db } from "@/plugins/firebase.js";
import { mapGetters, mapState } from "vuex";
import { Chat as ChatStore } from "@/store/chat";
import { VStore } from "@/store";
import StreamInfoDashboard from "@/components/StreamInfoDashboard";

export default {
    name: "dashboard",

    middleware: "auth",

    components: {
        StreamInfoDashboard
    },

    data() {
        return {
            mounted: false,
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

            /* streamData: {
                archive: false,
                title: "",
                nsfw: false,
                url: "",
                key: "",
                donateMsg: "",
                donateOn: false,
            }, */

            // streamDataLoading: true,
            showStreamInfo: true,
            // showSave: false,
            // saveLoading: false,
            
            // description: "",


            // topic tags
            /* activeTags: [],
            allTags: [],
            tagColors: [
                'green',
                'red',
                'blue'
            ] */
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
            // this.streamDataLoading = true;

            const stream = this.username.toLowerCase();
            const streamRef = db.collection("streams").doc(stream);
            return streamRef.onSnapshot(
                async (doc) => {
                    // await this.getAllTags();
                    this.showStreamInfo = doc.exists;
                    // if (this.showStreamInfo) 
                        // await this.streamDataChanged(doc.data());
                },
                () => (this.showStreamInfo = false)
            );
        },

        /* async streamDataChanged(data) {
            // this.streamData.archive = !!data.archive;
            // this.streamData.title = data.title;
            // this.streamData.donateMsg = data.donateMsg;
            // this.streamData.donateOn = data.donateOn;
            // this.streamData.nsfw = data.nsfw;
            // this.description = data.description;
            // this.activeTags = this.parseTags(data.tags);
            // this.streamDataLoading = false;
        }, */

        /* async updateStreamData() {
            this.$ga.event({
                eventCategory: "profile",
                eventAction: "update stream",
                eventLabel: this.username.toLowerCase(),
            });
            // this.saveLoading = true;
            // const archive = this.streamData.archive;
            // const title = this.streamData.title;
            // const donateMsg = this.streamData.donateMsg;
            // const donateOn = this.streamData.donateOn;
            // const nsfw = this.streamData.nsfw;
            // const description = this.description;
            const stream = this.username.toLowerCase();
            // const tags = [];
            // this.activeTags.forEach(x => tags.push(x.name));

            const streamRef = db.collection("streams").doc(stream); // MAKE SURE THE FIRESTORE HAS THE CORRECT SECURITY RULES HERE
            await streamRef.update({
                archive,
                nsfw,
                title,
                donateMsg,
                donateOn,
                // description,
                tags
            });
            // this.saveLoading = false;
            // this.showSave = false;
        }, */

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

        // tags
        /* async getAllTags() {

            // get snapshot of all the tags
            const tgsSnapshot = await db.collection("tags").get();
            console.log("brogermy begins");
            console.log(tgsSnapshot);

            // shit dude now we're getting all their data
            let tagRef = tgsSnapshot.docs
                .map((doc => doc.data()));
            
            console.log("brogermy rises");
            console.log(tagRef);
            this.allTags = tagRef;
            return;
        }, */

        /* parseTags(tags) {
            try {
                let parsedTags = [];
                tags.forEach(x => {
                    for(let i = 0; i < this.allTags.length; i++) {
                        if(this.allTags[i].name === x) {
                            parsedTags.push(this.allTags[i]);
                            break;
                        }
                    }
                });
                return parsedTags;
            } catch {
                return [];
            }

            return [];
        },

        onTagAdded(tag) {
            this.activeTags.push(tag);
            this.showSave = true;
        },

        onTagRemoved(tag) {
            console.log(tag);
            this.activeTags = this.activeTags.filter(x => x != tag);
            this.showSave = true;
        },

        onTagCreated(tag) {
            tag.slug = tag.slug.toLowerCase().Replace(' ', '_');
            console.log(tag);
            this.allTags.push(tag);
            this.activeTags.push(tag);
            this.showSave = true;
        } */
    },

    computed: {
        ...mapGetters({
            username: VStore.$getters.getUsername,
            // uid: VStore.$getters.getUID,
            user: VStore.$getters.getUser,
        }),

        ...mapState(ChatStore.namespace, {
            displayChat: ChatStore.$states.displayChat,
        }),

        mobile() {
            return this.mounted
                ? this.$vuetify.breakpoint.smAndDown
                : !this.$device.isDesktopOrTablet;
        },
    },

    mounted() {
        this.mounted = true;
        this.unsubAuthChanged = auth.onAuthStateChanged((user) =>
            this.authenticated(user)
        );
        this.streamDocListener = this.getStreamData();
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
    },
};
</script>

<style>

/* .tags__shadow--tag-list-active{
    z-index: 5 !important;
} */

</style>