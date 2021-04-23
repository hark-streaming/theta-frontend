<template>
    <!-- Section of Dashboard for displaying and editing polls -->


    <v-flex xs12 sm10 md10 lg12>
        <v-card class="mb-4">
            <v-container class="ma-0 pa-0">

                <!-- Title -->
                <v-row no-gutters>
                    <v-flex class="my-3 ml-3">
                        <h2 style="font-weight:500;font-size:1.1em;">Polls</h2>
                    </v-flex>
                </v-row>

                <v-divider class="mb-3"></v-divider>

                <v-row no-gutters>
                    <v-col>

                        <!-- Display/edit interface for each poll -->
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
                                    <v-row no-gutters class="mt-3">

                                        <v-col cols="8" class="flex-grow-1">
                                            <!-- Poll prompt text field -->
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
                                            <!-- Delete Poll button -->
                                            <v-btn 
                                                rounded
                                                flat
                                                small 
                                                color="primary white--text"
                                                @click="deletePoll(index)"
                                            >Delete Poll</v-btn>
                                        </v-col>
                                    </v-row>

                                    <!-- Poll answer options -->
                                    <v-row no-gutters v-for="(answer, aIndex) in poll.answers" :key="aIndex">
                                        
                                        <v-col cols="1" class="d-flex align-center justify-center mr-1">
                                            <!-- Delete Answer button -->
                                            <v-btn  
                                                fab 
                                                x-small 
                                                color="primary white--text" 
                                                @click="deleteAnswer(index, aIndex)"
                                            ><v-icon>close</v-icon></v-btn>
                                        </v-col>

                                        <v-col class="flex-grow-1 mr-3">
                                            <!-- Answer text field -->
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

                                    <!-- Add Answer button (if max of 4 hasn't been reached yet) -->
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

                        <!-- Add Poll button (if max of 8 hasn't been reached yet) -->
                        <v-row v-if="pollData.polls.length < 8" class="d-flex align-center justify-center pt-4" no-gutters>
                            <v-btn @click="addPoll">+ Add poll</v-btn>
                        </v-row>
                    </v-col>
                </v-row>
            </v-container>

            <v-layout>
                <v-spacer />

                <!-- Reset and Save buttons -->
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
import Poll from "@/components/Polls/Poll";

export default {

    components: {
        Poll
    },

    props: {
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

            // data pulled from Firebase, edited by user interface, and 
            // re-uploaded to Firebase
            pollData: {
                polls: []
            },

            /*  poll data format:
                    question: "",                           
                    answers: [                              // array containing answer options
                        {                                   // object containing data fields for each answer
                            value: 0,                           // answer "value" that doubles as index in array
                            text: "",                           
                            votes: 0                            // total accumulated votes
                        }        
                    ], 
                    showResults: false,                     // if true, automatically skip voting and display results
                    multiple: false,                        // enables multiple-choice selection
                    submitButtonText: "Submit",             
                    customId: 0,                            // poll "id" that doubles as index in array
                    active: false                           // if true, poll displayed to public 
            */

            pollDataLoading: true,
            showPollInfo: true,
            showSave: false,
            saveLoading: false,

            // instance of data from most recent save/Firebase pull
            // used to reset data to state before any edits
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

        // Retrieve data from "polls" in Firebase using uid as the key
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

        // Copy polls array in Firebase to local array
        async pollDataChanged(data) {
            this.pollData.polls = [];
            data.polls.forEach(x => this.pollData.polls.push(x));

            this.pollDataLoading = false;

            // Update local trackers
            this.setOld();
        },

        // Overwrite Firebase polls array with local array
        async updatePollData() {
            this.$ga.event({
                eventCategory: "profile",
                eventAction: "update poll",
                eventLabel: this.uid,
            });
            this.saveLoading = true;

            this.setOld();

            // create temp copy of local polls array
            // then update polls array in Firebase with temp copy
            const polls = [];
            this.pollData.polls.forEach(x => polls.push(x));
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

        // save unedited instance of data
        setOld() {
            this.old.polls = [];
            
            // iterate through local data, copy and push fields
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

        // reset current data to instance before any edits were made
        resetData() {
            this.pollData.polls = [];

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
            // create blank/default poll and push to local array
            const pollData = {
                question: "", 
                answers: [
                    { value: 0, text: "", votes: 0 }
                ], 
                showResults: false, 
                multiple: false, 
                submitButtonText: "Submit", 
                customId: this.pollData.polls.length, 
                active: false                           
            };
            this.pollData.polls.push(pollData);

            // update trackers
            this.showSave = true;
        }, 

        deletePoll(index) {
            this.pollData.polls.splice(index, 1);

            // update trackers
            for (var i = index; i < this.pollData.polls.length; i++) {
                this.pollData.polls[i].customId--;
            }

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