<template>
    <div class="text-center">
        <v-btn
            small
            @click="displayWindow=true"
            color="secondary white--text"
            class="px-5 flex-grow"
        >
            Vote
        </v-btn>

        <v-dialog
            v-model="displayWindow"
            :max-width="$vuetify.breakpoint.mdAndDown ? '95%' : '68%'"
            @click:outside="close"
            persistent
            transition="fade-transition"
        >

            <!-- Voting Dialog -->
            <v-card color="accentwave">

                <!-- Title Bar -->
                <v-sheet 
                    tile
                    color="secondary" 
                    class="pa-2 d-flex justify-space-between align-center white--text"
                >
                    <h4 class="pl-1 body-1">
                        Vote
                    </h4>

                    <v-btn
                        color="white"
                        text
                        icon
                        small
                        @click="close"
                    >
                        <v-icon>close</v-icon>
                    </v-btn>
                </v-sheet>
                
                <!-- Content -->
                <div class="pa-3">
                    <v-row no-gutters>
                        <v-col 
                            v-for="poll in activePolls" 
                            :key="poll.customId"
                            cols="3"
                        >
                            <Poll 
                                :poll="poll" 
                                :skipVote="submittedPolls[poll.customId]" 
                                @voteAdded="addVote($event)"
                            />
                        </v-col>
                    </v-row>
                </div>
            </v-card>
        </v-dialog>
    </div>
</template>

<script>

import Poll from "@/components/Polls/Poll";
import { db } from "@/plugins/firebase.js"

export default {
    
    components: {
        Poll
    },

    props: {
        polls: [], 
        uid: ""
    },

    data() {
        return {
            displayWindow: false, 
            submittedPolls: []
        }
    }, 

    computed: {
        activePolls() {
            var activePolls = [];
            this.polls.forEach(x => {
                if (x.active) activePolls.push(x);
            });

            return activePolls;
        }
    },

    methods: {
        async updateStreamData() {
            this.$ga.event({
                eventCategory: "profile",
                eventAction: "update stream",
                eventLabel: this.uid,
            });

            const polls = [];
            this.polls.forEach(x => polls.push(x));

            const stream = this.uid;
            const streamRef = db.collection("polls").doc(stream); // MAKE SURE THE FIRESTORE HAS THE CORRECT SECURITY RULES HERE
            await streamRef.update({
                polls
            });

        },

        close() {
            this.displayWindow = false;
        }, 

        addVote(eventObj) {
            this.polls[eventObj.id].answers[eventObj.val].votes++;
            this.updateStreamData();

            this.submittedPolls[eventObj.id] = true;
        }, 
    }, 

    mounted() {
        for (var i = 0; i < this.polls.length; i++) {
            this.submittedPolls.push(false);
        }
    }
}
</script>