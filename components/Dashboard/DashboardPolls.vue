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
                            v-for="(poll, index) in this.pollData.polls"
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

                        <v-row v-if="pollData.polls.length < 8" class="d-flex align-center justify-center pt-4" no-gutters>
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
                    @click="updatePollData"
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

            pollDocListener: null,

            pollData: {
                polls: []
            },

            pollDataLoading: true,
            showPollInfo: true,
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

        getPollData() {
            
            this.pollDataLoading = true;

            const pollRef = db.collection("polls").doc(this.uid)

            return pollRef.onSnapshot(
                async (doc) => {
                    this.showPollInfo = doc.exists;
                    if (this.showPollInfo) 
                        await this.pollDataChanged(doc.data());
                },
                () => (this.showPollInfo = false)
            );
        },

        async pollDataChanged(data) {
            this.pollData.polls = [];
            data.polls.forEach(x => this.pollData.polls.push(x));

            this.pollDataLoading = false;

            this.setOld();
            this.idTracker = this.pollData.polls.length;
        },

        async updatePollData() {
            this.$ga.event({
                eventCategory: "profile",
                eventAction: "update poll",
                eventLabel: this.uid,
            });
            this.saveLoading = true;

            const polls = [];
            this.pollData.polls.forEach(x => polls.push(x));

            this.setOld();

            const pollRef = db.collection("polls").doc(this.uid);

            await pollRef.update({
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
            this.$copyText(this.pollData.key).then(
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
            // this.pollData.polls.forEach(x => this.old.polls.push(x));

            
            var options = null;
            var currPoll = null;
            for (var p = 0; p < this.pollData.polls.length; p++) {
                currPoll = null;
                currPoll = this.pollData.polls[p];

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
            this.pollData.polls = [];
            // this.old.polls.forEach(x => this.pollData.polls.push(x));

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

                this.pollData.polls.push(options);
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
            this.pollData.polls.push(pollData);

            this.idTracker++;
            this.showSave = true;
        }, 

        deletePoll(index) {
            this.pollData.polls.splice(index, 1);

            for (var i = index; i < this.pollData.polls.length; i++) {
                this.pollData.polls[i].customId--;
            }
            this.idTracker--;

            this.showSave = true;
        }, 

        addAnswer(index) {
            const answerData = { value: this.pollData.polls[index].answers.length, text: "", votes: 0 };
            this.pollData.polls[index].answers.push(answerData);

            this.showSave = true;
        }, 

        deleteAnswer(index, aIndex) {
            this.pollData.polls[index].answers.splice(aIndex, 1);

            for (var i = aIndex; i < this.pollData.polls[index].answers.length; i++) {
                this.pollData.polls[index].answers[i].value--;
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
        this.pollDocListener = this.getPollData();
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
        if (this.pollDocListener) this.pollDocListener();
    },
    
}
</script>