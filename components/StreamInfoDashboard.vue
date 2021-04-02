<template>
    <v-flex v-if="showStreamInfo" xs14 sm12 md10 lg8>
        <v-card class="mb-4 pa-3">
            <v-container>
                <v-row no-gutters>
                    <v-flex class="mb-3">
                        <h2>Stream Info</h2>
                    </v-flex>
                </v-row>

                <v-row no-gutters>
                    <v-col class="pr-2">
                    <!-- <v-layout column> -->
                        
                        <v-flex class="mb-3">
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
                        <v-flex>
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
                        
                        <v-flex shrink class="mt-4">
                            <v-switch 
                                v-model="streamData.donateOn"
                                label="Donate Button"
                                color = "secondary"
                                hide-details
                                dense
                                inset
                                @change="enableSave"
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
                    </v-col>

                    <!-- <v-col cols="4" class="pl-2">
                        <h3>Polls</h3>

                        <v-card 
                            v-for="(poll, index) in this.streamData.polls"
                            :key="index"
                            outlined
                            class="pa-2"
                            >
                            <v-row no-gutters>
                                <v-col cols="9">
                                    <v-text-field 
                                        v-model="poll.question"
                                        label="Prompt"
                                        solo
                                        hide-details
                                        dense
                                        @input="enableSave"
                                    />
                                </v-col>

                                <v-col class="d-flex align-center pl-3" cols="3">
                                    <v-btn 
                                        rounded 
                                        small 
                                        color="primary"
                                    >Delete<br>poll</v-btn>
                                </v-col>
                            </v-row>
                            
                        </v-card>

                        <v-btn @click="addPoll">Add poll</v-btn>
                    </v-col> -->
                </v-row>
            </v-container>

            <v-layout>
                <v-spacer />
                <v-btn
                    color="cyan"
                    outlined
                    class="mr-2"
                    :disabled="!showSave"
                    @click="resetData"
                    >
                    reset
                </v-btn>
                <v-btn
                    :disabled="!showSave"
                    :loading="saveLoading"
                    color="primary"
                    outlined
                    @click="updateStreamData"
                    >save</v-btn
                >
            </v-layout>
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
                // polls: []
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
                // polls: []
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

            const stream = this.username.toLowerCase();
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

            // this.streamData.polls = [];
            // data.polls.forEach(x => this.streamData.polls.push(x));

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

            // const polls = [];
            // this.streamData.polls.forEach(x => polls.push(x));

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
                // polls
            });
            this.saveLoading = false;
            this.disableSave();
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

        // tags
        async getAllTags() {

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
            
            // this.old.polls = [];
            // this.streamData.polls.forEach(x => this.old.polls.push(x));

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
            
            // this.streamData.polls = [];
            // this.old.polls.forEach(x => this.activeTags.push(x));

            this.activeTags = [];
            this.old.activeTags.forEach(x => this.activeTags.push(x));

            this.disableSave();
        }, 

        /* addPoll() {
            const pollData = {
                question: "", 
                answers: [
                    { value: 1, text: "", votes: 0 }
                ]
            };
            this.streamData.polls.push(pollData);

            this.enableSave();
        } */
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