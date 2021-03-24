<template>
    <v-flex xs12 sm10 md8 lg6>
        <v-card>
            <!-- Header Bar -->
            <v-sheet
                tile
                color="secondary"
                class="d-flex align-center pa-2 black--text"
            >
                <!-- replace this with the avatar or something later -->
                <v-icon class="mr-3" color="orange">mdi-arrow-up-bold-box-outline</v-icon>

                <h2 class="title"> PROFILE NAME </h2>
            </v-sheet>

            <!-- Tfuel balance -->
            <v-icon class="mr-3" color="orange"
                >circle
            </v-icon>
            <span> 0 TFUEL </span>

            <!-- 1,5,10 tfuel buttons-->

            <!-- custom amount field -->

            <!-- governance token info -->

            <!-- donate button -->
        </v-card>
    </v-flex>
</template>

<script>
export default {
    // name export allows it to be usable everywhere
    name: "TfuelDialog",

    // components: {

    // }
};
</script>

<style>
.title {
    color: white;
}
</style>