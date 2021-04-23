<template>
    <!-- Dialog window for selecting a nonprofit/streamer to relay to -->

    <div class="text-center">

        <!-- Button to display window -->
        <v-btn
            small
            @click="displayWindow=true"
            color="secondary white--text"
            class="px-5 flex-grow"
        >
            Add Nonprofit/Streamer
        </v-btn>

        <v-dialog
            v-model="displayWindow"
            :max-width="'50%'"
            @click:outside="displayWindow=false"
            persistent
            transition="fade-transition"
        >

            <!-- Dialog -->
            <v-card color="accentwave">

                <!-- Title Bar -->
                <v-sheet 
                    tile
                    color="secondary" 
                    class="pa-2 d-flex justify-space-between align-center white--text"
                >
                    <h4 class="pl-1 body-1">
                        Select Nonprofit or Streamer
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
                    <v-text-field
                        label="Username"
                        v-model="destUsername"
                        @keydown.enter="submit"
                    ></v-text-field>
                    <v-btn @click="submit">Submit</v-btn>
                    <p v-if="displayError" class="mt-4 red--text">Invalid username</p>
                </div>
            </v-card>
        </v-dialog>
    </div>
</template>

<script>

import { db } from "@/plugins/firebase.js"

export default {

    data() {
        return {
            displayWindow: false, 
            displayError: false,

            destUsername: "", 

            destUid: ""
        }
    }, 

    computed: {
    },

    methods: {
        // retrieves stream from Firebase using username as key
        getStreamData() {
            const streamRef = db.collection("streams").doc(this.destUsername.trim());

            return streamRef.onSnapshot(
                async (doc) => {
                    if (doc.exists) {
                        await this.streamDataChanged(doc.data());
                    } else {
                        this.displayError = true;
                    }
                }
            );
        },

        // copy uid from data object
        async streamDataChanged(data) {
            this.destUid = data.owner;
        },

        // fetch uid from stream in Firebase, emit event with username and uid
        submit() {
            this.getStreamData();

            if (this.destUid != "") {
                this.$emit("userFound", {username: this.destUsername, uid: this.destUid});
                this.displayWindow = false;
            }
        }
    }
}
</script>