<template>
    <v-flex xs12 sm10 md10 lg12>
        <v-card class="mb-4">
            <v-container class="ma-0 pa-0">
                <v-row no-gutters>
                    <v-flex class="my-3 ml-3">
                        <h2>Polls</h2>
                    </v-flex>
                </v-row>
                <v-divider class="mb-3"></v-divider>
                <v-row no-gutters>
                    <v-col>
                        <v-sheet
                            v-for="(poll, index) in this.streamData.polls"
                            :key="index"
                            >
                            <v-row>
                                <v-col cols="5">
                                    <!-- Display poll visual -->
                                    <Poll 
                                        :poll="poll" 
                                        :skipVote="true" 
                                        @voteAdded="addVote($event)"
                                    />
                                </v-col>

                                <v-col cols="7">
                                    <!-- Poll prompt -->
                                    <v-row no-gutters class="mt-3">
                                        <v-col cols="8" class="flex-grow-1">
                                            <v-text-field 
                                                v-model="poll.question"
                                                label="Prompt"
                                                outlined
                                                hide-details
                                                dense
                                                @input="showSave = true"
                                            />
                                        </v-col>

                                        <v-col class="d-flex justify-end mt-1 ml-0 pr-4">
                                            <v-btn 
                                                rounded
                                                flat
                                                depressed
                                                small 
                                                color="primary white--text"
                                                @click="deletePoll(index)"
                                            >Delete Poll</v-btn>
                                        </v-col>
                                    </v-row>

                                    <!-- Poll answer options -->
                                    <v-row no-gutters v-for="(answer, aIndex) in poll.answers" :key="aIndex">
                                        <v-col cols="1" class="d-flex align-center justify-center mr-1">
                                            <v-btn depressed fab x-small color="primary white--text" @click="deleteAnswer(index, aIndex)">X</v-btn>
                                        </v-col>

                                        <v-col class="flex-grow-1 mr-3">
                                            <v-text-field 
                                                v-model="answer.text"
                                                :label="answerLabel(answer.value)"
                                                outlined
                                                hide-details
                                                dense
                                                @input="showSave = true"
                                            />
                                        </v-col>
                                    </v-row>

                                    <v-row v-if="poll.answers.length < 4" class="pl-10" no-gutters>
                                        <v-btn small @click="addAnswer(index)">+ Add answer</v-btn>
                                    </v-row>

                                    <!-- Control switches -->
                                    <v-row no-gutters>
                                        <v-switch
                                            label="Enable multiple-answer votes"
                                            v-model="poll.multiple"
                                            class="mb-n4 mt-0"
                                            color="secondary"
                                            @click="showSave=true">
                                        </v-switch>
                                    </v-row>
                                    <v-row no-gutters class="mt-0">
                                        <v-switch
                                            label="Show results (close voting)"
                                            v-model="poll.showResults"
                                            class="mb-n4 mt-0"
                                            color="secondary"
                                            @click="showSave=true">
                                        </v-switch>
                                    </v-row>
                                    <v-row no-gutters class="mt-0">
                                        <v-switch
                                            label="Active"
                                            v-model="poll.active"
                                            class="mb-n4 mt-0"
                                            color="primary"
                                            @click="showSave=true">
                                        </v-switch>
                                    </v-row>
                                </v-col>
                            </v-row>
                            <v-row class="mb-3" no-gutters><v-divider></v-divider></v-row>
                            
                        </v-sheet>

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
import Poll from "@/components/Polls/Poll";

export default {

    components: {
        // VuePoll
        Poll
    },

    props: {
        // username: { type: String, default: "" }, 
        uid: ""
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

            idTracker: 0, 
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

            // const stream = this.username.toLowerCase();
            // const streamRef = db.collection("streams").doc(stream);

            const stream = this.uid;
            const streamRef = db.collection("polls").doc(stream)

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
            this.idTracker = this.streamData.polls.length;
        },

        async updateStreamData() {
            this.$ga.event({
                eventCategory: "profile",
                eventAction: "update stream",
                eventLabel: this.uid,
            });
            this.saveLoading = true;

            const polls = [];
            this.streamData.polls.forEach(x => polls.push(x));

            this.setOld();

            // const stream = this.username.toLowerCase();
            // const streamRef = db.collection("streams").doc(stream); // MAKE SURE THE FIRESTORE HAS THE CORRECT SECURITY RULES HERE

            const stream = this.uid;
            const streamRef = db.collection("polls").doc(stream);

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

            
            var options = null;
            var currPoll = null;
            for (var p = 0; p < this.streamData.polls.length; p++) {
                currPoll = null;
                currPoll = this.streamData.polls[p];

                options = {
                    question: "", 
                    answers: [], 
                    showResults: false, 
                    multiple: false, 
                    submitButtonText: "Submit", 
                    customId: 0, 
                    active: false
                };

                options.question = currPoll.question;

                options.answers = [];
                for (var a = 0; a < currPoll.answers.length; a++) {
                    options.answers.push(currPoll.answers[a]);
                }

                options.showResults = currPoll.showResults;
                options.multiple = currPoll.multiple;
                options.submitButtonText = currPoll.submitButtonText;
                options.customId = currPoll.customId;
                options.active = currPoll.active;

                this.old.polls.push(options);
            }
        }, 

        resetData() {
            this.streamData.polls = [];
            // this.old.polls.forEach(x => this.streamData.polls.push(x));

            var options = null;
            var currPoll = null;
            for (var p = 0; p < this.old.polls.length; p++) {
                currPoll = null;
                currPoll = this.old.polls[p];

                options = {
                    question: "", 
                    answers: [], 
                    showResults: false, 
                    multiple: false, 
                    submitButtonText: "Submit", 
                    customId: 0, 
                    active: false
                };

                options.question = currPoll.question;

                options.answers = [];
                for (var a = 0; a < currPoll.answers.length; a++) {
                    options.answers.push(currPoll.answers[a]);
                }

                options.showResults = currPoll.showResults;
                options.multiple = currPoll.multiple;
                options.submitButtonText = currPoll.submitButtonText;
                options.customId = currPoll.customId;
                options.active = currPoll.active;

                this.streamData.polls.push(options);
            }

            this.showSave = false;
        }, 

        addPoll() {
            const pollData = {
                question: "", 
                answers: [
                    { value: 0, text: "", votes: 0 }
                ], 
                showResults: false, 
                multiple: false, 
                submitButtonText: "Submit", 
                customId: this.idTracker, 
                active: false                           // TEMPORARY
            };
            this.streamData.polls.push(pollData);

            this.idTracker++;
            this.showSave = true;
        }, 

        deletePoll(index) {
            this.streamData.polls.splice(index, 1);

            for (var i = index; i < this.streamData.polls.length; i++) {
                this.streamData.polls[i].customId--;
            }
            this.idTracker--;

            this.showSave = true;
        }, 

        addAnswer(index) {
            const answerData = { value: this.streamData.polls[index].answers.length, text: "", votes: 0 };
            this.streamData.polls[index].answers.push(answerData);

            this.showSave = true;
        }, 

        deleteAnswer(index, aIndex) {
            this.streamData.polls[index].answers.splice(aIndex, 1);

            for (var i = aIndex; i < this.streamData.polls[index].answers.length; i++) {
                this.streamData.polls[index].answers[i].value--;
            }

            this.showSave = true;
        }, 
        
        answerLabel(value) {
            return "Answer " + (value + 1);
        }, 

    }, 

    computed: {
        ...mapGetters({
            uid: VStore.$getters.getUID
        }), 
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