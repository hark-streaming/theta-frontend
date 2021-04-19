<template>
    <div>
        <!-- Chat Header -->
        <v-sheet
            id="chat-header"
            class="d-flex align-center justify-space-between pa-2"
            color="accentwave"
        >
            <!-- Viewer List -->
            <div style="height: 32px">
                <ViewerList :page="page"/>
            </div>

            <!-- Chat Label -->
            <h4
                @click="addChannelTag"
                class="mx-2 text-truncate"
                style="cursor: pointer"
            >
                {{ page }}
            </h4>

            <div class="d-flex">
                <!-- TODO: Move this to it's own component during poll refactor -->
                <!-- Create Poll Button -->
                <div v-if="isChannelOwner">
                    <v-menu
                        v-model="showPoll"
                        :close-on-content-click="false"
                        :close-on-click="false"
                        bottom
                        offset-y
                        left
                    >
                        <template #activator="{ on: menu }">
                            <v-tooltip
                                left
                                color="error"
                                transition="slide-x-reverse-transition"
                            >
                                <template #activator="{ on: tooltip }">
                                    <v-btn
                                        v-on="{
                                            ...tooltip /*focus: () => true, ...menu,*/,
                                        }"
                                        small
                                        color="primary darken-4 black--text"
                                        class="mr-2"
                                        >POLL</v-btn
                                    >
                                </template>
                                <span>
                                    <v-icon>warning</v-icon>
                                    Temporarily Disabled Due to a Bug
                                </span>
                            </v-tooltip>
                        </template>

                        <!-- Create Poll Dialog -->
                        <chat-poll
                            id="chat-poll"
                            @close="showPoll = false"
                            @create="createPoll"
                        />
                    </v-menu>
                </div>

                <!-- Chat Admin Menu -->
                <lazy-chat-admin-menu-button
                    v-if="isChannelOwner || isAdmin"
                    class="mr-2"
                />

                <!-- Chat Overflow Menu -->
                <chat-overflow-menu :page="page" />
            </div>
        </v-sheet>
        <v-divider></v-divider>
        <!-- Donate Button row -->
        <v-sheet
            color="accentwave"
            class="d-flex align-center justify-space-around pa-2"
        >
            <!-- Donate TFUEL Button -->
            <v-btn
                color="secondary"
                class="white--text"
                small
                @click="loggedIn ? showDonate = true : showLogin = true"
            >
                <img
                    src="https://cdn.discordapp.com/attachments/814278920168931382/826294941768482876/tfuel.png"
                    width="20px"
                    height="20px"
                    class="mr-1"
                />
                Donate TFUEL
            </v-btn>

            <!-- Custom Donate Button -->
            <v-btn
                v-if="donateOn"
                color="primary"
                class="black--text"
                target="_blank"
                :href="donateUrl"
                small
            >
                {{ donateMsg }}
            </v-btn>
        </v-sheet>

        <!-- tfuel donate dialog -->
        <v-dialog v-model="showDonate" width="500">
            <lazy-tfuel-dialog
                :avatar="avatar"
                :streamer="page"
                :tokenName="tokenName"
                :streamerUid="streamerUid"
                @close="showDonate = false"
            />
        </v-dialog>

        <!-- log in dialog for those not logged in -->
        <v-dialog v-model="showLogin" width="420">
            <lazy-login-dialog @close="showLogin = false" />
        </v-dialog>
    </div>
</template>

<script>
import ViewerList from "@/components/Chat/ViewerList";
import ChatOverflowMenu from "@/components/Chat/ChatOverflowMenu";
import { mapGetters } from "vuex";
import { VStore } from "@/store";

const ChatPoll = async () => await import("@/components/Chat/ChatPoll");

export default {
    name: "ChatHeader",

    components: {
        ViewerList,
        ChatOverflowMenu,
        ChatPoll,
    },

    props: {
        page: { type: String }, // this is the streamer's name pretty much
        isChannelOwner: { type: Boolean },

        donateOn: { type: Boolean, default: false },
        donateMsg: { type: String, default: "" },
        donateUrl: { type: String, default: "" },

        // props for the tfuel button
        // TODO: pass these puppies in
        // if the user is not logged in donate TFUEL button will prompt log in
        loggedIn: { type: Boolean, default: false },
        avatar: { type: String },
        tokenName: { type: String },
        streamerUid: { type: String },
    },

    data() {
        return {
            showDonate: false,
            showPoll: false,
            showLogin: false,
        };
    },

    methods: {
        addChannelTag() {
            this.$emit("add-channel-tag");
        },

        createPoll(poll) {
            this.$emit("create-poll", poll);
        },
    },

    computed: {
        ...mapGetters({
            isAdmin: VStore.$getters.isAdmin,
        }),
    },
};
</script>
