<template>
    <v-container grid-list-md>
        <h1 class="mb-4 d-flex justify-space-around"> Registration </h1>

        <!-- 3 card layout -->
        <v-row>
            <v-col>
                <v-card elevation="2" @click="showLogin = true">
                    <v-card-title class="justify-center"> Viewers </v-card-title>
                    <v-card-subtitle class="text-center"> 
                        We, the People. 
                    </v-card-subtitle>
                </v-card>
            </v-col>
            <v-col>
                <v-card elevation="2" to="/register/commentator">
                    <v-card-title class="justify-center"> Voices </v-card-title>
                    <v-card-subtitle class="text-center">
                        Creators, Commentators, Activists
                    </v-card-subtitle>
                </v-card>
            </v-col>
            <v-col>
                <v-card elevation="2" to="/register/politician">
                    <v-card-title class="justify-center"> Civic Servants </v-card-title>
                    <v-card-subtitle class="text-center">
                        Candidates & PACs
                    </v-card-subtitle>
                </v-card>
            </v-col>
        </v-row>
        <v-dialog v-model="showLogin" width="420">
            <lazy-login-dialog @close="showLogin = false" initialSignUp />
        </v-dialog>
    </v-container>
</template>

<script>
import { auth } from "@/plugins/firebase.js";

export default {
    name: "register",

    data() {
        return {
            showLogin: false,
        };
    },

    methods: {},

    computed: {},

    mounted() {},

    beforeDestroy() {},
};
</script>
