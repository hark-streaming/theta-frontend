<template>
    <v-container color="neutral" fluid class="pa-4">
        <!-- <v-card color="secondary" class="px-4 pt-6"> -->
            <v-text-field
                label="Search"
                background-color="neutral"
                clearable
                v-model="searchValue"
                solo
                @keydown.enter="search"
            ></v-text-field>
        <!-- </v-card> -->

        <v-row v-if="showContent">

            <!-- Streamers -->
            <!-- <v-col>
                <v-list>
                    <v-subheader>Streamers</v-subheader>
                    
                    <template v-for="(streamer, index) in this.streamersResults">
                        <v-list-item :key="streamer.name">
                            <v-list-item-avatar>
                                <v-img :src="streamer.avatar"></v-img>
                            </v-list-item-avatar>
                            <v-list-item-content>
                                <v-list-item-title>{{ streamer.name }}</v-list-item-title>
                            </v-list-item-content>
                        </v-list-item>

                        <v-divider :key="index"></v-divider>
                    </template>
                </v-list>
            </v-col> -->

            <!-- Streams -->
            <v-col>
                <v-list three-line>
                    <v-subheader>Streams</v-subheader>

                    <!-- Error message if no results are found -->
                    <p v-if="this.streamsResults.length == 0" class="ml-10">
                        No results found.
                    </p>

                    <!-- List of streams -->
                    <template v-for="(stream, index) in this.streamsResults">
                        <v-list-item :key="stream.title" :to="stream.to">
                            <v-list-item-avatar>
                                <v-img :src="stream.avatar"></v-img>
                            </v-list-item-avatar>

                            <v-list-item-content>
                                <v-list-item-title>
                                    <strong>{{ stream.name }}: </strong>
                                    {{ stream.title }}
                                </v-list-item-title>

                                <v-list-item-subtitle>
                                    {{ stream.description }}
                                </v-list-item-subtitle>
                                <v-list-item-subtitle>
                                    <span v-for="(tag, index) in stream.tags" :key="index">
                                        {{ tag }}<span v-if="index < stream.tags.length - 1">,</span>
                                    </span>
                                </v-list-item-subtitle>
                            </v-list-item-content>
                        </v-list-item>

                        <v-divider :key="index"></v-divider>
                    </template>
                </v-list>
            </v-col>
        </v-row>

    </v-container>
</template>

<script>
import Fuse from "fuse.js";
import { VStore } from "@/store";

export default {
    data() {
        return {
            searchValue: "",

            streamers: ["uninitialized"], 
            
            streamsResults: [], 
            // streamersResults: [],

            showContent: false
        }
    }, 

    methods: {
        search() {
            if (this.searchValue == null || this.searchValue == "") {
                return;
            }

            this.searchStreams();
            // this.searchStreamers();
            this.showContent = true;
        },

        searchStreams() {          
            this.streamsResults = [];

            const options = {
                keys: [
                    "title", 
                    "name",
                    "tags",
                    { name: "description", weight: 0.5 }
                ],
            };
            const fuse = new Fuse(this.streamers, options);
            let results = fuse.search(this.searchValue);
            results.forEach(x => this.streamsResults.push(x.item));
            return;
        }, 

        searchStreamers() {
            this.streamersResults = [];

            const options = {
                keys: ["name"],
            };
            const fuse = new Fuse(this.streamers, options);
            let results = fuse.search(this.searchValue);
            results.forEach(x => this.streamersResults.push(x.item));
            return;
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

    mounted() {
        this.searchValue = this.$store.getters.getSearchValue;
        this.search();
    }
}
</script>