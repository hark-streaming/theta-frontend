<template>
    <v-sheet
        id="sidechat"
        class="d-flex flex-grow-1 flex-column"
        style="position: relative; display: inline"
        color="white"
    >

        <!-- Chat Header -->
        <chat-header
            color="white"
            :page="page"
            :is-channel-owner="isChannelOwner"
            :donateOn="donateOn"
            :donateMsg="donateMsg"
            :donateUrl="donateUrl"
            :loggedIn="isAuth"
            :avatar="streamerAvatar"
            :tokenName="streamerTokenName"
            :streamerUid="streamerUid"
            :polls="polls"
            :username="username"
            @add-channel-tag="addUserTag(page)"
            @voteAdded="$emit('voteAdded', $event)"
        />
        <!-- <v-btn v-if="!connected" @click="isAuth ? connect : showLogin=true" color="primary" class="mt-3">
            {{isAuth ? "Join chat!" : "Log in to chat!"}}
        </v-btn> -->
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
        />

        <!-- Chat Input -->
        <chat-input
            ref="chat-input"
            :username="username"
            :loading="loading"
            @send="sendMessage"
        />

        <!-- <chat-ignore-list v-model="showIgnoreList" /> -->

        <!-- Fireworks overlay -->
        <!-- <fireworks :absolute="true" ref="fireworks" /> -->

        <!-- log in dialog for those not logged in -->
        <!-- <v-dialog v-model="showLogin" width="420">
            <lazy-login-dialog @close="showLogin = false" />
        </v-dialog> -->
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


//import { io } from "socket.io-client";

export default {
    name: "Chat",

    props: {
        chatChannel: { type: String },
        // forceGlobal: { type: Boolean },

        // for the donate bar (probably move to vuex store)
        donateOn: { type: Boolean, default: false },
        donateMsg: { type: String, default: "Donate" },
        donateUrl: { type: String, default: "" },

        // for the tfuel donate dialog (probably move to vuex store)
        streamerAvatar: { type: String, default: "" },
        streamerTokenName: { type: String, default: "" },
        streamerUid: { type: String, default: "" },

        polls: { type: [], default: [] }

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
            messages: null,
            //connected: false,
            showLogin: false,

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

    methods: {
        sendMessage() {
            this.socket.emit("chatMessage", this.getMessage);
        },

        connect() {
            this.loading = true;
            //if (!this.isAuth) return;
            this.messages = [];

            this.socket = this.$nuxtSocket({
                name: "test",
                //name: "main",
                useCredentials: true,
                // this is how we pass in auth
                // as per https://github.com/richardeschloss/nuxt-socket-io/issues/96#issuecomment-613187607
                transportOptions: {
                    polling: {
                        extraHeaders: {
                            // this is just temporary mild deterrent for unwanted connections
                            // TODO: make this a signed jwt token
                            auth: "coolsecret",
                        },
                    },
                },
            });

            // join the correct room after connection
            this.socket.on("connect", () => {
                this.socket.emit("joinRoom", this._username, this.chatChannel);
                this.loading = false;
                this.connected = true;
                //this.updateViewers;
            });

            // add message when message happens
            this.socket.on("chatMessage", (msg) => {
                this.messages.push({
                    message: msg,
                    channel: this.chatChannel,
                    username: this.username,
                    showBadge: false,
                });
            });

            this.socket.on("disconnect", () => {
                console.log("Disconnected from chat");
                this.connected = false;
            });
        },

        addUserTag(x) {
            console.log("Not yet implemented");
        }
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

        ...mapActions({
            updateViewers: VStore.$actions.updateViewers,
        }),

        ...mapMutations(Chat.namespace, {
            setRoom: Chat.$mutations.setRoom,
            setGlobal: Chat.$mutations.setGlobal,
            setIgnoreList: Chat.$mutations.setIgnoreList,
            addIgnoreList: Chat.$mutations.addIgnoreList,
            removeIgnoreList: Chat.$mutations.removeIgnoreList,
            setMessage: Chat.$mutations.setMessage,
            setHideTrolls: Chat.$mutations.setHideTrolls,
            setCleanTts: Chat.$mutations.setCleanTts,
            appendChatMessage: Chat.$mutations.appendMessage,
            setPinnedMessage: Chat.$mutations.setPinnedMessage,
            setChatBadge: Chat.$mutations.setShowBadge,
            setIgnoreChannelList: Chat.$mutations.setIgnoreChannelList,
            addIgnoreChannelList: Chat.$mutations.addIgnoreChannelList,
            removeIgnoreChannelList: Chat.$mutations.removeIgnoreChannelList,
            setInputRateLimit: Chat.$mutations.setInputRateLimit,
            setInputRateLimitMs: Chat.$mutations.setInputRateLimitMs,
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

        showPoll(active) {

        }
    },

    watch: {
        // isAuth: () => {
        //     console.log("i auth have changed");
        //     //if(isAuth == true){
        //         this.connect();
        //     //}
        // }
    },

    async mounted() {
        auth.onAuthStateChanged((user) => {
            if (user) {
                // connect to chat if user logged in
                setTimeout(() => {
                    this.connect();
                }, 1000);
            } else {
                // don't otherwise
                //console.log("not logged in");
                this.socket.disconnect();
                //this.messages = null;
                this.loading = true;
            }
        });
    },

    beforeDestroy() {
        // disconnect
        if (this.socket) {
            this.socket.disconnect();
        }
    },

    destroyed() {
        // disconnect
        if (this.socket) {
            this.socket.disconnect();
        }
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
        background-color: #ffffff;
    }

    &::-webkit-scrollbar {
        width: 6px;
        background-color: #dfdfdf;
    }

    &::-webkit-scrollbar-thumb {
        border-radius: 0;
        box-shadow: inset 0 0 4px rgba(0, 0, 0, 0.25);
        background-color: rgb(177, 177, 177);
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