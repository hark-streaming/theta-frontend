<template>
    <v-container grid-list-md>
        <div class="mb-4 d-flex justify-space-around">REGISTER PAGE</div>

        <!-- 3 card layout -->

        <v-row no-gutters>
            <v-col>
                <v-card elevation="2" @click="showLogin = true">
                    <v-card-title> Viewer </v-card-title>
                    <v-card-subtitle> average shumuck </v-card-subtitle>
                </v-card>
            </v-col>
            <v-col>
                <v-card elevation="2" to="/register/commentator">
                    <v-card-title> Commentator </v-card-title>
                    <v-card-subtitle>
                        Creators, Commentators, Activists
                    </v-card-subtitle>
                </v-card>
            </v-col>
            <v-col>
                <v-card elevation="2" to="/register/politician">
                    <v-card-title> Politician </v-card-title>
                    <v-card-subtitle>
                        Candidates, PACs, Organizations
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
