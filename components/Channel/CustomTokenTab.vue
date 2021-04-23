<template>
    <div>
        <governance-token-stats :uid="streamerId"/>
        <!-- <div v-if="streamerHasToken">
            <governance-token-stats />
        </div>
        <div v-else-if="!streamerHasToken">
            <div
                style="text-align: center; text-justify: center"
                class="no-token"
            >
                <h3 class="no-token">No Custom Token Yet</h3>
            </div>
        </div> -->
    </div>
</template>

<script>
import { mapGetters } from "vuex";
import { VStore } from "@/store";

export default {
    props: {
        streamerId: { type: String }
    },

    data: {
        streamerHasToken: true,
    },

    async mounted() {
        // check if streamer has token
    },

    methods: {},

    computed: {},
};
</script>

<style scoped>
.no-token {
    height: 350px;
    width: 100%;
}
</style>