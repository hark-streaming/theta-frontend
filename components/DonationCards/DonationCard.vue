<template>
    <v-card color="neutral" style="height: 388px" class="d-flex flex-column">
        <v-img :src="bgimage" height="80" class="mb-n6"> </v-img>

        <div class="d-flex justify-start px-4 pb-1">
            <v-avatar size="80">
                <v-img
                    :src="mainimage"
                    :aspect-ratio="1"
                    :width="150"
                    :height="150"
                    contain
                />
            </v-avatar>

            <div class="mt-8 px-3">
                <h3>{{ title }}</h3>
                <TempTags :tags="tags" :shortenList="true" :maxNumTags="2" />
            </div>
        </div>

        <div class="px-4 my-2 overflow-y-auto" style="height: 150px">
            <p>{{ longdesc }}</p>
        </div>

        <div class="d-flex justify-end">
            <div class="pr-4 pb-3">
                <v-btn outlined color="primary" :href="link" to="/">
                    {{limitedShortDesc}}
                </v-btn>
            </div>
            <div class="pr-4 pb-3">
                <v-btn
                    color="primary"
                    :href="walletLink"
                    @click="isAuth ? (showDonate = true) : (showLogin = true)"
                    >DONATE</v-btn
                >
            </div>
        </div>

        <!-- tfuel donate dialog -->
        <v-dialog v-model="showDonate" width="500">
            <lazy-tfuel-dialog
                :avatar="mainimage"
                :streamer="title"
                :tokenName="tokenName"
                :streamerUid="owner"
                @close="showDonate = false"
            />
        </v-dialog>

        <!-- log in dialog for those not logged in -->
        <v-dialog v-model="showLogin" width="420">
            <lazy-login-dialog @close="showLogin = false" />
        </v-dialog>
    </v-card>
</template>

<script>
import TempTags from "@/components/Tags/TempTags";
import { mapGetters } from "vuex";
import { VStore } from "@/store";

export default {
    components: {
        TempTags,
    },

    props: {
        bgimage: { type: String, default: "" },
        link: { type: String, default: "" },
        longdesc: { type: String, default: "" },
        mainimage: { type: String, default: "" },
        shortdesc: { type: String, default: "" },
        title: { type: String, default: "" },
        tags: { type: Array },
        walletLink: { type: String, default: "" },
        owner: { type: String, default: "" },
        tokenName: { type: String, default: "" },
    },

    methods: {
        onClick: () => {},
    },

    data: () => {
        return {
            showDonate: false,
            showLogin: false,
        };
    },

    computed: {
        limitedShortDesc(){
            return this.shortdesc.slice(0,10);
        },
        ...mapGetters({
            isAuth: VStore.$getters.isAuth,
        }),
    },
};
</script>

<style scoped>
    h3 {
        color: black;
        font-size: 1.3em;
        font-weight: 500;
    }
</style>