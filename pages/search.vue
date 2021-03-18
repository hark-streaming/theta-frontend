<template>
    <v-container color="neutral">
        <v-card color="secondary" class="px-4 pt-6">
            <v-text-field
                label="Search"
                background-color="neutral"
                class="mb-n2"
                clearable
                v-model="searchValue"
                solo
                @keydown.enter="search"
            ></v-text-field>
        </v-card>
    </v-container>
</template>

<script>
import Fuse from "fuse.js";

export default {
    data() {
        return {
            streamers: [], 
            searchValue: ""
        }
    }, 

    methods: {
        search() {
            const options = {
                keys: ["name"], 
                includeScore: true
            }
            const fuse = new Fuse(this.streamers, options);
            console.log( fuse.search(this.searchValue));
        }
    }, 

    async asyncData({ $axios }) {
        const defaultLive = [
        {
            src: "https://cdn.bitwave.tv/static/bumps/2a3un.mp4",
            name: "offline",
            type: "video/mp4",
        },
        ];

        // Timeout to prevent SSR from locking up
        const timeout = process.server ? process.env.SSR_TIMEOUT : 0;

        const getStreams = async () => {
        try {

            const { data } = await $axios.getSSR(
            "https://us-central1-hark-e2efe.cloudfunctions.net/api/utils/live",
            
            {
                timeout,
            }
            );

            if (data && data.success) {
            console.log("help");
            return {
                streamers: data.streamers,
            };
            } else {
            console.log(`API Error:`, data);
            }
        } catch (error) {
            console.error(
            `Failed to get live channels from API server: ${error.message}`
            );
            return {
            streamers: [],
            };
        }
        console.log(`Failed to get live channels from API server`);
        return {
            streamers: [],
        };
        };

        const streams = await getStreams();

        return {
            streamers: streams.streamers,
            offline: false,
        };
    },
}
</script>