<template>
    <v-container class="px-16">
        <div class="mb-4 d-flex justify-space-around">POLITICIAN REGISTER PAGE</div>

        <!-- 3 card layout -->
        <v-row>
            <v-col cols="4">
                <v-card elevation="2">
                    <v-card-title> Steps </v-card-title>
                </v-card>
            </v-col>
            <v-col cols="8">
                <v-card elevation="2">
                    <v-card-title> Form </v-card-title>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
import { auth } from "@/plugins/firebase.js";

export default {
    name: "register",

    data() {
        return {};
    },

    methods: {},

    computed: {},

    mounted() {},

    beforeDestroy() {},
};
</script>