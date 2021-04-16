<template>
    <v-sheet
        id="sidechat"
        class="d-flex flex-grow-1 flex-column"
        style="position: relative; display: inline"
        v-resize.quiet="onResize"
        color="neutral"
    >
        <!-- Chat Header -->
        <chat-header
            :page="page"
            :is-channel-owner="isChannelOwner"
            :donateOn="donateOn"
            :donateMsg="donateMsg"
            :donateUrl="donateUrl"
            :loggedIn="isAuth"
            :avatar="streamerAvatar"
            :tokenName="streamerTokenName"
            :streamerUid="streamerUid"
            @add-channel-tag="addUserTag(page)"
        />

        <!-- TODO: move structure and logic to subcomponent -->
        <!-- <add-ons style="position: relative"> -->
        <!-- Chat Banner -->
        <!-- <div
                :style="{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    zIndex: 1,
                }"
            >
                <v-slide-x-reverse-transition>
                    <v-sheet
                        v-if="connecting"
                        color="error"
                        elevation="0"
                        tile
                        class="flex-grow-1"
                    >
                        <div class="px-3 py-2">connecting...</div>
                        <v-progress-linear
                            color="error darken-4"
                            indeterminate
                        />
                    </v-sheet>
                </v-slide-x-reverse-transition>
            </div> -->
        <!-- </add-ons> -->

        <!-- Chat Stat Graph -->
        <!-- <v-slide-y-transition mode="out-in">
            <chat-graph
                v-if="showGraph"
                :values="graphValues"
                :period="getStatTickRate"
                :statName="graphStat.stat"
            />
        </v-slide-y-transition> -->

        <!-- Chat Messages -->
        <chat-messages
            ref="chatmessages"
            :messages="messages"
            :show-timestamps="showTimestamps"
            :global="global"
            :channel="page"
            :is-channel-owner="isChannelOwner"
            @reply="addUserTag"
            @whisper="addWhisper"
            @ignore="ignoreUser"
            @unignore="unignoreUser"
        />

        <!-- Chat Input -->
        <chat-input
            ref="chat-input"
            :username="username"
            :loading="loading"
            @send="sendMessage"
        />

        <chat-ignore-list v-model="showIgnoreList" />

        <!-- Fireworks overlay -->
        <fireworks :absolute="true" ref="fireworks" />
    </v-sheet>
</template>

<script>
import { auth, db } from "@/plugins/firebase.js";

import ChatHeader from "@/components/Chat/ChatHeader";
import ChatMessages from "@/components/Chat/ChatMessages";
import ChatInput from "@/components/Chat/ChatInput";

import { mapState, mapGetters, mapMutations, mapActions } from "vuex";
import { Chat } from "@/store/chat";
import { VStore } from "@/store";

import { UserStats } from "@/assets/js/Stats/UserStats";

import { io } from "socket.io-client";

export default {
    name: "Chat",

    props: {
        chatChannel: { type: String },
        // forceGlobal: { type: Boolean },

        // for the donate bar (probably move to vuex store)
        donateOn: { type: Boolean, default: false },
        donateMsg: { type: String, default: "" },
        donateUrl: { type: String, default: "" },

        // for the tfuel donate dialog (probably move to vuex store)
        streamerAvatar: { type: String, default: "" },
        streamerTokenName: { type: String, default: "" },
        streamerUid: { type: String, default: "" },
    },

    components: {
        // ChatIgnoreList,
        // AddOns,
        ChatHeader,
        ChatInput,
        ChatMessages,
        // ChatGraph,
    },

    data() {
        return {
            socket: null,
            messages: [],

            loading: true,
            connecting: true,
            chatLimit: 150,

            newMessageCount: 0,
            showGraph: false,
            graphStat: { stat: "messageCount", user: "all" },
            graphValues: [0],

            viewCount: 0,
            showViewStats: false,
            viewValues: [0],

            userStats: new UserStats(this.getStatTickRate),

            requestResize: false,

            showIgnoreList: false,
        };
    },

    sockets: {
        connect: function () {
            console.log("I HAVE CONNECTED");
        }
    },

    methods: {
        sendMessage(msg) {
            //this.socket.emit("chatMessage", msg);
        },

        connect() {
            const chatUrl =
                "http://produ-publi-1umq15gpn246p-1858097073.us-east-2.elb.amazonaws.com/";
            const devUrl = "http://localhost:4000";

            
        },
    },

    computed: {
        ...mapGetters({
            isAuth: VStore.$getters.isAuth,
            user: VStore.$getters.getUser,
            _username: VStore.$getters.getUsername,
            getChannelViews: VStore.$getters.getChannelViews,
        }),

        ...mapState({
            channelsViewers: VStore.$states.channelsViewers,
        }),

        ...mapState(Chat.namespace, {
            global: Chat.$states.global,
            showTimestamps: Chat.$states.timestamps,
            getUseTts: Chat.$states.useTts,
            getUseTtsAlerts: Chat.$states.useTtsAlerts,
            useIgnore: Chat.$states.useIgnore,
            getRecursiveIgnore: Chat.$states.recursiveIgnore,
            getHideTrolls: Chat.$states.hideTrolls,
            getTrollTts: Chat.$states.trollTts,
            getCleanTts: Chat.$states.cleanTts,
            getTtsRate: Chat.$states.ttsRate,
            getTtsReadUsername: Chat.$states.ttsReadUsername,
            getTtsTimeout: Chat.$states.ttsTimeout,
            getTtsVolume: Chat.$states.ttsVolume,
            getTtsVoice: Chat.$states.ttsVoice,
            notify: Chat.$states.notify,
            getMessage: Chat.$states.message,
            getIgnoreList: Chat.$states.ignoreList,
            getIgnoreChannelList: Chat.$states.ignoreChannelList,
            getReceiveMentionsInLocal: Chat.$states.receiveMentionsInLocal,

            getStatTickRate: Chat.$states.statTickRate,
            getStatHistogramSize: Chat.$states.statHistogramSize,

            getTrackMetrics: Chat.$states.trackMetrics,
            getTrackMetricsPerUser: Chat.$states.trackMetricsPerUser,

            getChatToken: Chat.$states.chatToken,
            displayName: Chat.$states.displayName,

            chatBadge: Chat.$states.showBadge,
            inputRateLimit: Chat.$states.inputRateLimit,
        }),

        username() {
            return this.displayName || this._username || "user";
        },

        isChannelOwner() {
            return this.$utils.normalizedCompare(this.page, this.username);
        },

        page() {
            let channel = this.chatChannel;
            if (channel) {
                return channel.match(/^[a-zA-Z0-9._-]+$/) ? channel : "404";
            } else {
                return "Global";
            }
        },
    },

    watch: {},

    async mounted() {
        console.log("CHAT MOUNTED")
        //this.connect();
    },

    beforeDestroy() {
        // disconnect
    },

    destroyed() {
        // disconnect
    },
};
</script>

<style lang='scss'>
#sidechat {
    border-top: 3px $hk-blue;
    //background-color: #000;
    max-width: 100%;

    p {
        margin-bottom: 0;
    }

    a {
        text-decoration: none;
        font-weight: bold;
        color: #2196f3;
    }

    .highlight {
        font-weight: bold;
        color: yellow;
    }

    code .highlight {
        background-color: yellow;
        padding: 0 4px;
        color: inherit;
    }
}

#chat-scroll {
    height: 100%;
    margin-right: 1px;
    overscroll-behavior: contain;

    &::-webkit-scrollbar-track {
        box-shadow: inset 0 0 4px rgba(0, 0, 0, 0.25);
        border-radius: 0;
        background-color: #0a0a0a;
    }

    &::-webkit-scrollbar {
        width: 6px;
        background-color: #0a0a0a;
    }

    &::-webkit-scrollbar-thumb {
        border-radius: 0;
        box-shadow: inset 0 0 4px rgba(0, 0, 0, 0.25);
        background-color: #333;
    }
}

.systemAlert .chat-desktop {
    $offset: 24px + 48px;
    top: $offset;
    height: calc(100vh - #{$offset});
}

.chat-desktop {
    position: fixed;
    top: 48px;
    right: 0;
    height: calc(100vh - 48px);
    width: 450px;
}

.v-skeleton-loader__avatar {
    margin-right: 16px;
}
</style>