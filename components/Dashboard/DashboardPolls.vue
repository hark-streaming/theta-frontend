<template>
    <v-flex xs12 sm10 md10 lg12>
        <v-card class="mb-4 pa-3">
            <v-container>
                <v-row no-gutters>
                    <v-flex class="mb-3">
                        <h2>Polls</h2>
                    </v-flex>
                </v-row>

                <v-row no-gutters>
                    <v-col class="pl-2">

                        <v-card 
                            v-for="(poll, index) in this.streamData.polls"
                            :key="index"
                            outlined
                            class="px-2 py-6"
                            >
                            <v-row>
                                <v-col cols="3">
                                    <!-- <client-only>
                                        <vue-poll v-bind="poll" />
                                    </client-only> -->
                                </v-col>

                                <v-col cols="9">
                                    <v-row no-gutters>
                                        <v-col class="flex-grow-1">
                                            <v-text-field 
                                                v-model="poll.question"
                                                label="Prompt"
                                                outlined
                                                hide-details
                                                dense
                                                @input="showSave = true"
                                            />
                                        </v-col>

                                        <v-col class="d-flex align-center justify-center pl-3" cols="2">
                                            <v-btn 
                                                rounded 
                                                small 
                                                color="red"
                                                @click="deletePoll(index)"
                                            >Delete<br>poll</v-btn>
                                        </v-col>
                                    </v-row>

                                    <v-row no-gutters v-for="(answer, aIndex) in poll.answers" :key="aIndex">
                                        <v-col cols="1" class="d-flex align-center justify-center">
                                            <v-btn fab x-small color="red" @click="deleteAnswer(index, aIndex)">X</v-btn>
                                        </v-col>

                                        <v-col class="flex-grow-1">
                                            <v-text-field 
                                                v-model="answer.text"
                                                label="Text"
                                                outlined
                                                hide-details
                                                dense
                                                @input="showSave = true"
                                            />
                                        </v-col>
                                    </v-row>

                                    <v-row v-if="poll.answers.length < 4" class="pl-16" no-gutters>
                                        <v-btn small @click="addAnswer(index)">+ Add answer</v-btn>
                                    </v-row>
                                </v-col>
                            </v-row>
                            
                        </v-card>

                        <v-row v-if="streamData.polls.length < 8" class="d-flex align-center justify-center pt-4" no-gutters>
                            <v-btn @click="addPoll">+ Add poll</v-btn>
                        </v-row>
                    </v-col>
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
// import VuePoll from "vue-poll";

export default {

    components: {
        // VuePoll
    },

    props: {
        username: { type: String, default: "" }
    }, 

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
                polls: []
            },

            streamDataLoading: true,
            showStreamInfo: true,
            showSave: false,
            saveLoading: false,

            old: {
                polls: []
            },
        }
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
                    this.showStreamInfo = doc.exists;
                    if (this.showStreamInfo) 
                        await this.streamDataChanged(doc.data());
                },
                () => (this.showStreamInfo = false)
            );
        },

        async streamDataChanged(data) {
            this.streamData.polls = [];
            data.polls.forEach(x => this.streamData.polls.push(x));

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

            const polls = [];
            this.streamData.polls.forEach(x => polls.push(x));

            const stream = this.username.toLowerCase();

            this.setOld();

            const streamRef = db.collection("streams").doc(stream); // MAKE SURE THE FIRESTORE HAS THE CORRECT SECURITY RULES HERE
            await streamRef.update({
                polls
            });
            this.saveLoading = false;
            this.showSave = false;
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

        setOld() {
            this.old.polls = [];
            // this.streamData.polls.forEach(x => this.old.polls.push(x));

            var options = {
                question: "", 
                answers: []
            };
            for (var p = 0; p < this.streamData.polls.length; p++) {
                options.question = this.streamData.polls[p].question;

                for (var a = 0; a < this.streamData.polls[p].answers.length; a++) {
                    options.answers.push(this.streamData.polls[p].answers[a]);
                }

                this.old.polls.push(options);
            }
        }, 

        resetData() {
            this.streamData.polls = [];
            // this.old.polls.forEach(x => this.streamData.polls.push(x));

            var options = {
                question: "", 
                answers: []
            };
            for (var p = 0; p < this.old.polls.length; p++) {
                options.question = this.old.polls[p].question;

                for (var a = 0; a < this.old.polls[p].answers.length; a++) {
                    options.answers.push(this.old.polls[p].answers[a]);
                }

                this.streamData.polls.push(options);
            }

            this.showSave = false;
        }, 

        addPoll() {
            const pollData = {
                question: "", 
                answers: [
                    { value: 1, text: "", votes: 0 }
                ]
            };
            this.streamData.polls.push(pollData);

            this.showSave = true;
        }, 

        deletePoll(index) {
            this.streamData.polls.splice(index, 1);

            this.showSave = true;
        }, 

        addAnswer(index) {
            const answerData = { value: this.streamData.polls[index].answers.length + 1, text: "", votes: 0 };
            this.streamData.polls[index].answers.push(answerData);

            this.showSave = true;
        }, 

        deleteAnswer(index, aIndex) {
            this.streamData.polls[index].answers.splice(aIndex, 1);

            for (var i = aIndex; i < this.streamData.polls[index].answers.length; i++) {
                this.streamData.polls[index].answers[i].value--;
            }

            this.showSave = true;
        }
    }, 

    computed: {
        ...mapGetters({
            uid: VStore.$getters.getUID
        })
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
    
}
</script>