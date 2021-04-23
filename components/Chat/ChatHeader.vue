<template>
    <div>
        <!-- Chat Header -->
        <v-sheet
            id="chat-header"
            class="d-flex justify-start pa-2 py-3"
            color="#F2F2F2"
        >
            <!-- Viewer List -->
            <div style="height: 32px">
                <ViewerList :page="page"/>
            </div>

            <!-- Chat Label -->
            <div class="d-flex" style="justify-content:center;width:70%;">
                <h4
                    class="pl-2 mx-2 text-truncate secondary--text"
                    style="font-weight:500;font-size:1em;align-self:center;"
                >
                    {{ page }}
                </h4>
            </div>
        </v-sheet>
        <v-divider></v-divider>
        <!-- Donate Button row -->
        <v-sheet
            color="#E8E8E8"
            class="d-flex align-center justify-space-around pa-2"
        >
            <!-- Donate TFUEL Button -->
            <v-btn
                color="white primary--text"
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
                color="white secondary--text"
                target="_blank"
                :href="donateUrl"
                small
                style="font-weight:500;"
            >
                {{ donateMsg }}
            </v-btn>

            <!-- <v-divider v-if="showPolls" vertical></v-divider> -->

            <!-- Poll voting dialog; display only if there is at least one active poll -->
            <!-- <VoteDialog 
                v-if="showPolls" 
                :polls="polls" 
                :uid="streamerUid"
            /> -->
        </v-sheet>

        <!-- tfuel donate dialog -->
        <v-dialog v-model="showDonate" width="500" transition="fade-transition">
            <lazy-tfuel-dialog
                :avatar="avatar"
                :streamer="page"
                :tokenName="tokenName"
                :streamerUid="streamerUid"
                @close="showDonate = false"
            />
        </v-dialog>

        <!-- log in dialog for those not logged in -->
        <v-dialog v-model="showLogin" width="420" transition="fade-transition">
            <lazy-login-dialog @close="showLogin = false" />
        </v-dialog>
    </div>
</template>

<script>
import ViewerList from "@/components/Chat/ViewerList";
//import ChatOverflowMenu from "@/components/Chat/ChatOverflowMenu";
import { mapGetters } from "vuex";
import { VStore } from "@/store";
import VoteDialog from "@/components/Polls/VoteDialog";

const ChatPoll = async () => await import("@/components/Chat/ChatPoll");

export default {
    name: "ChatHeader",

    components: {
        ViewerList,
        //ChatOverflowMenu,
        ChatPoll,
        VoteDialog
    },

    props: {
        page: { type: String }, // this is the streamer's name pretty much
        isChannelOwner: { type: Boolean },

        username: "",

        donateOn: { type: Boolean, default: false },
        donateMsg: { type: String, default: "Donate" },
        donateUrl: { type: String, default: "" },

        // props for the tfuel button
        // TODO: probably put these values in the store
        // if the user is not logged in donate TFUEL button will prompt log in
        loggedIn: { type: Boolean, default: false },
        avatar: { type: String },
        tokenName: { type: String },
        streamerUid: { type: String },

        polls: []
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

        showPolls() {
            var bool = false;
            this.polls.forEach(x => bool = bool || x.active);

            return bool;
        }
    },
};
</script>
