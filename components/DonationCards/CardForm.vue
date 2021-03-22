<template>
    <v-flex xs12 sm10 md8 lg6>
        <v-card>
            <v-flex class="mb-3">
                    <h2>Donation Card</h2>
                </v-flex>
            <v-form>
                <v-text-field label="Donation Title"> </v-text-field>
            </v-form>
        </v-card>
    </v-flex>
</template>

<script>
import { auth, db } from "@/plugins/firebase.js";
import { mapGetters, mapState } from "vuex";
import { VStore } from "@/store";

export default {};
</script>

<style>
</style>