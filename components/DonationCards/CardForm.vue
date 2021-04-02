<template>
    <v-flex xs14 sm12 md10 lg8>
        <v-card class="mb-4 pa-3" :loading="cardDataLoading || saveLoading">
            <!-- add like a preview here of what the card looks like or soemthing -->

            <!-- title -->
            <v-flex class="mb-3">
                <h2>Donation Card</h2>
            </v-flex>

            <!-- main image form -->
            <div class="d-flex align-center">
                <v-file-input
                    @change="onMainPicked"
                    outlined
                    accept="image/png, image/jpeg, image/bmp"
                    show-size
                    :rules="sizeRules"
                    label="Add a new main image"
                />
                <v-btn
                    large
                    class="flex-shrink-1 ml-2 mb-7"
                    :loading="uploadingMain"
                    color="primary"
                    outlined
                    :disabled="!mainimage"
                    @click="uploadMain"
                    >SAVE</v-btn
                >
            </div>

            <!-- bg image form -->
            <div class="d-flex align-center">
                <v-file-input
                    @change="onBgPicked"
                    outlined
                    accept="image/png, image/jpeg, image/bmp"
                    show-size
                    :rules="sizeRules"
                    label="Add a new background image"
                />
                <v-btn
                    large
                    class="flex-shrink-1 ml-2 mb-7"
                    :loading="uploadingBg"
                    color="primary"
                    outlined
                    :disabled="!bgimage"
                    @click="uploadBg"
                    >SAVE</v-btn
                >
            </div>

            <v-divider></v-divider>

            <!-- title -->
            <v-text-field
                v-model="cardData.title"
                class="mt-4"
                outlined
                label="Donation Title"
                @input="enableSave"
            >
            </v-text-field>

            <!-- url -->
            <v-text-field
                v-model="cardData.link"
                outlined
                @input="enableSave"
                label="Donation URL"
            >
            </v-text-field>

            <!-- short desc -->
            <v-text-field
                v-model="cardData.shortdesc"
                outlined
                label="Quick Description"
                @input="enableSave"
            >
            </v-text-field>

            <!-- long desc -->
            <v-textarea
                v-model="cardData.longdesc"
                outlined
                color="secondary"
                label="Detailed Description"
                auto-grow
                @input="enableSave"
            />

            <!-- submission buttons -->
            <v-layout>
                <v-spacer />
                <v-btn
                    color="cyan"
                    outlined
                    class="mr-2"
                    :disabled="!showSave"
                    @click="resetData"
                >
                    reset
                </v-btn>
                <v-btn
                    :disabled="!showSave"
                    :loading="saveLoading"
                    color="primary"
                    outlined
                    @click="updateCardData"
                    >save</v-btn
                >
            </v-layout>
        </v-card>
    </v-flex>
</template>

<script>
import { auth, db, storage } from "@/plugins/firebase";
import { mapGetters, mapState } from "vuex";
import { VStore } from "@/store";

export default {
    data() {
        return {
            sizeRules: [
                (value) =>
                    !value ||
                    value.size < 2000000 ||
                    "Image size should be less than 2 MB!",
            ],

            mainimage: null, // a file object
            mainimageurl: "",
            bgimage: null, // a file object
            bgimageurl: "",
            uploadingMain: false,
            uploadingBg: false,

            showSave: false,
            saveLoading: false,
            cardDataLoading: false,

            cardData: {
                title: "My Foundation",
                link: "https://example.com",
                shortdesc: "A short summary",
                longdesc: "A longer summary",
            },
            old: {
                // for resetting the form
                title: "",
                link: "",
                shortdesc: "",
                longdesc: "",
            },
        };
    },
    methods: {
        onMainPicked(file) {
            this.mainimage = file;
        },
        onBgPicked(file) {
            this.bgimage = file;
        },
        async uploadMain() {
            if (!this.mainimage) return false;
            this.uploadingMain = true;

            // upload the image and save link
            let link = await this.uploadImage(
                this.mainimage,
                this.mainimageurl
            );
            this.mainimageurl = link;

            // image is done uploading, set file to null
            this.mainimage = null;

            //update firebase with the new link
            await db.collection("dcards").doc(this.uid).update({
                mainimage: this.mainimageurl,
            });

            // end loading animation
            this.uploadingMain = false;
        },
        async uploadBg() {
            if (!this.bgimage) return false;
            this.uploadingBg = true;

            // upload the image and save link
            let link = await this.uploadImage(this.bgimage, this.bgimageurl);
            this.bgimageurl = link;

            // image is done uploading, set file to null
            this.bgimage = null;

            //update firebase with the new link
            await db.collection("dcards").doc(this.uid).update({
                bgimage: this.bgimageurl,
            });

            // end loading animation
            this.uploadingBg = false;
        },
        async uploadImage(imageFile) {
            console.log("uploading", imageFile.name);
            // upload to firebase storage, under /uid/avatar/image.jpg
            var storageRef = storage
                .ref()
                .child(this.uid + "/dcard/" + imageFile.name);
            try {
                await storageRef.put(imageFile);

                let downloadUrl = await storageRef.getDownloadURL();
                return downloadUrl;
            } catch (err) {
                console.log(err);
            }
        },
        enableSave() {
            this.showSave = true;
            this.$emit("saveEnabled");
        },

        disableSave() {
            this.showSave = false;
            this.$emit("saveDisabled");
        },
        async getCardData() {
            this.cardDataLoading = true;

            let cardDoc = await db.collection("dcards").doc(this.uid).get();
            let data = cardDoc.data();

            // if they have previous data load it
            if (data != null) {     
                this.cardData.title = data.title;
                this.cardData.link = data.link;
                this.cardData.shortdesc = data.shortdesc;
                this.cardData.longdesc = data.longdesc;
            }

            // set the old data so we can use reset button
            this.setOld();

            this.cardDataLoading = false;
        },
        resetData() {
            this.cardData.title = this.old.title;
            this.cardData.link = this.old.link;
            this.cardData.shortdesc = this.old.shortdesc;
            this.cardData.longdesc = this.old.longdesc;
        },
        async updateCardData() {
            this.saveLoading = true;
            await db.collection("dcards").doc(this.uid).update({
                title: this.cardData.title,
                shortdesc: this.cardData.shortdesc,
                longdesc: this.cardData.longdesc,
                link: this.cardData.link,
            });

            this.saveLoading = false;
        },
        setOld() {
            this.old.title = this.cardData.title;
            this.old.link = this.cardData.link;
            this.old.shortdesc = this.cardData.shortdesc;
            this.old.longdesc = this.cardData.longdesc;
        },
    },
    computed: {
        ...mapGetters({
            uid: VStore.$getters.getUID,
            user: VStore.$getters.getUser,
            username: VStore.$getters.getUsername,
            isStreamer: VStore.$getters.isStreamer,
        }),
    },
    async mounted() {
        this.getCardData();
    },
};
</script>

<style>
</style>