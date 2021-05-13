<template>

    <!-- Section to edit stream title, description, tags, and donation button -->

    <v-flex v-if="showStreamInfo" xs14 sm12 md10 lg12>
        <v-card>
            <v-container class="ma-0 pa-0">
                <v-row no-gutters>
                    <v-flex class="my-3 ml-3">
                        <h2 style="font-weight:500;font-size:1.1em;">Stream Info</h2>
                    </v-flex>
                </v-row>
                <v-divider class="mb-4"></v-divider>
                <v-row no-gutters>
                    <v-col class="">
                    <!-- <v-layout column> -->
                        
                        <v-flex class="mb-5 ma-3">
                            <v-text-field
                                v-model="streamData.title"
                                label="Stream Title"
                                color="secondary"
                                outlined
                                hide-details
                                :loading="streamDataLoading || saveLoading"
                                @input="enableSave"
                            />
                        </v-flex>
                        <v-flex class="mb-5 ma-3">
                            <v-textarea
                                v-model="description"
                                name="input-7-1"
                                outlined
                                hide-details
                                color="secondary"
                                label="Stream Description (markdown supported)"
                                auto-grow
                                @input="enableSave"
                            />
                        </v-flex>
                        <v-flex class="mb-14 ma-3">
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

                        <v-divider></v-divider>
                        
                        <v-flex class="mt-3 mx-3">
                            <v-switch 
                                v-model="streamData.donateOn"
                                label="Donate Button"
                                color = "secondary"
                                hide-details
                                dense
                                inset
                                @change="enableSave"
                                class="pb-3"
                            />
                            <v-text-field 
                                v-model="streamData.donateMsg"
                                label="Button Message"
                                outlined
                                color="secondary"
                                auto-grow
                                dense
                                class="mt-4"
                                counter="50"
                                :disabled="!streamData.donateOn"
                                @input="enableSave"
                            />
                            <v-text-field
                                v-model="streamData.donateUrl"
                                label="Donation URL"
                                outlined
                                color="secondary"
                                auto-grow
                                dense
                                :disabled="!streamData.donateOn"
                                @input="enableSave"
                            />
                        </v-flex>
                        <!-- <v-flex shrink>
                            <v-switch
                                v-model="streamData.nsfw"
                                label="NSFW"
                                color="primary"
                                hide-details
                                dense
                                inset
                                @change="showSave = true"
                            />
                        </v-flex> -->
                        <!-- <v-flex shrink>
                            <v-switch
                                v-model="streamData.archive"
                                label="Stream Replays"
                                color="primary"
                                hide-details
                                dense
                                inset
                                @change="showSave = true"
                            />
                        </v-flex> -->
                        
                    <!-- </v-layout> -->
                        <v-flex class="d-flex mx-3 mb-3" style="flex-direction:row-reverse">
                            <v-btn
                                class="ml-2"
                                :disabled="!showSave"
                                :loading="saveLoading"
                                color="primary white--text"
                                @click="updateStreamData"
                                small
                                >save
                                </v-btn>
                            <v-btn
                                color="primary"
                                outlined
                                :disabled="!showSave"
                                @click="resetData"
                                small
                                >reset
                            </v-btn>
                        </v-flex>
                    </v-col>
                </v-row>
            </v-container>

        </v-card>
    </v-flex>
</template>

<script>

import { auth, db } from "@/plugins/firebase.js";
import { mapGetters, mapState } from "vuex";
import { VStore } from "@/store";

export default {

    props: {
        username: { type: String, default: "" }
    },

    data() {
        return {
            // mounted: false,
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
                // nsfw: false,
                url: "",
                key: "",
                donateMsg: "",
                donateOn: false,
                donateUrl: "", 
            },

            streamDataLoading: true,
            showStreamInfo: true,
            showSave: false,
            saveLoading: false,
            
            description: "",

            // topic tags
            activeTags: [],
            allTags: [],
            tagColors: [
                'green',
                'red',
                'blue'
            ], 

            old: {
                archive: false, 
                title: "", 
                donateMsg: "", 
                donateOn: false, 
                donateUrl: "",
                description: "", 
                activeTags: [], 
            },
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

            const stream = this.username;
            const streamRef = db.collection("streams").doc(stream);
            return streamRef.onSnapshot(
                async (doc) => {
                    await this.getAllTags();
                    this.showStreamInfo = doc.exists;
                    if (this.showStreamInfo) 
                        await this.streamDataChanged(doc.data());
                },
                () => (this.showStreamInfo = false)
            );
        },

        async streamDataChanged(data) {
            this.streamData.archive = !!data.archive;
            this.streamData.title = data.title;
            this.streamData.donateMsg = data.donateMsg;
            this.streamData.donateOn = data.donateOn;
            this.streamData.donateUrl = data.donateUrl;
            // this.streamData.nsfw = data.nsfw;
            this.description = data.description;
            this.activeTags = this.parseTags(data.tags);

            this.streamDataLoading = false;

            this.setOld();
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
            const donateMsg = this.streamData.donateMsg;
            const donateOn = this.streamData.donateOn;
            const donateUrl = this.streamData.donateUrl;
            // const nsfw = this.streamData.nsfw;
            const description = this.description;
            const stream = this.username.toLowerCase();

            const tags = [];
            this.activeTags.forEach(x => tags.push(x.name));

            this.setOld();

            const streamRef = db.collection("streams").doc(stream); // MAKE SURE THE FIRESTORE HAS THE CORRECT SECURITY RULES HERE
            await streamRef.update({
                archive,
                title,
                donateMsg,
                donateOn,
                donateUrl,
                description,
                tags, 
            });
            this.saveLoading = false;
            this.disableSave();
        },

        async kickStream() {
            const token = await auth.currentUser.getIdToken(true);
            const user = this.username;
            const server = "api.hark.tv";
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
        async getAllTags() {

            // get snapshot of all the tags
            const tgsSnapshot = await db.collection("tags").get();
            console.log(tgsSnapshot);

            // shit dude now we're getting all their data
            let tagRef = tgsSnapshot.docs
                .map((doc => doc.data()));
            
            console.log(tagRef);
            this.allTags = tagRef;
            return;
        },

        parseTags(tags) {
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
        },

        onTagAdded(tag) {
            this.activeTags.push(tag);
            this.enableSave();
        },

        onTagRemoved(tag) {
            console.log(tag);
            this.activeTags = this.activeTags.filter(x => x != tag);
            this.enableSave();
        },

        onTagCreated(tag) {
            tag.slug = tag.slug.toLowerCase().Replace(' ', '_');
            console.log(tag);
            this.allTags.push(tag);
            this.activeTags.push(tag);
            this.enableSave();
        }, 

        enableSave() {
            this.showSave= true;
            this.$emit("saveEnabled");
        }, 

        disableSave() {
            this.showSave = false;
            this.$emit("saveDisabled");
        }, 

        setOld() {
            this.old.title = this.streamData.title;
            this.old.description = this.description;
            this.old.donateOn = this.streamData.donateOn;
            this.old.donateMsg = this.streamData.donateMsg;
            this.old.donateUrl = this.streamData.donateUrl;
            this.old.archive = this.streamData.archive;

            this.old.activeTags = [];
            this.activeTags.forEach(x => this.old.activeTags.push(x));
        }, 

        resetData() {
            this.streamData.title = this.old.title;
            this.description = this.old.description;
            this.streamData.donateOn = this.old.donateOn;
            this.streamData.donateMsg = this.old.donateMsg;
            this.streamData.donateUrl = this.old.donateUrl;
            this.streamData.archive = this.old.archive;

            this.activeTags = [];
            this.old.activeTags.forEach(x => this.activeTags.push(x));

            this.disableSave();
        }, 
    },

    computed: {
        ...mapGetters({
            // username: VStore.$getters.getUsername,
            uid: VStore.$getters.getUID,
            // user: VStore.$getters.getUser,
        }),

        /* ...mapState(ChatStore.namespace, {
            displayChat: ChatStore.$states.displayChat,
        }), */

        /* mobile() {
            return this.mounted
                ? this.$vuetify.breakpoint.smAndDown
                : !this.$device.isDesktopOrTablet;
        }, */
    },

    mounted() {
        // this.mounted = true;
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

.tags__shadow--tag-list-active{
    z-index: 5 !important;
}

</style>