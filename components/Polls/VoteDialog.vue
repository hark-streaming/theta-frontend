<template>
    <!-- Dialog window for voting in and viewing polls -->

    <div class="text-center">

        <!-- Button to display window -->
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
            @click:outside="displayWindow=false"
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
                        @click="displayWindow=false"
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

                            <!-- Poll visual -->
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
            submittedPolls: []      // array to track which polls user has already voted in
        }
    }, 

    computed: {

        // only display polls that are marked as "active"
        activePolls() {
            var activePolls = [];
            this.polls.forEach(x => {
                if (x.active) activePolls.push(x);
            });

            return activePolls;
        }
    },

    methods: {
        // Overwrite Firebase polls array with local array
        async updatePollData() {
            this.$ga.event({
                eventCategory: "profile",
                eventAction: "update stream",
                eventLabel: this.uid,
            });

            // create temp copy of local polls array
            // then replace polls array in Firebase with temp copy
            const polls = [];
            this.polls.forEach(x => polls.push(x));
            const streamRef = db.collection("polls").doc(this.uid); // use uid as key
            await streamRef.update({
                polls
            });
        },

        addVote(eventObj) {
            // increment votes field of corresponding answer in local polls array
            this.polls[eventObj.id].answers[eventObj.val].votes++;

            this.updatePollData();

            // update tracker
            this.submittedPolls[eventObj.id] = true;
        }, 
    }, 

    mounted() {
        // initialize submitted polls tracker as false
        for (var i = 0; i < this.polls.length; i++) {
            this.submittedPolls.push(false);
        }
    }
}
</script>