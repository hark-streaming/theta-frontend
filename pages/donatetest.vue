<template>
    <div>
        <v-btn
        color="primary"
        class="white--text"
        small
        @click="showDonate = true"
      >
        Donate
      </v-btn>

        <!-- make sure this is wrapped this in a v-dialog to do the popup thing -->
        <v-dialog v-model="showDonate" width="500">
            <lazy-tfuel-dialog 
            :avatar="avatar"
            :name="name"
            :balance="balance"
            :tokenName="tokenName"
            :streamerContract="streamerContract"
            :senderUid="senderUid"
            @close="showDonate = false"
            />
        </v-dialog>
    </div>
</template>

<script>
export default {
    data() {
        return {
            showDonate: false,
            avatar: "https://firebasestorage.googleapis.com/v0/b/hark-e2efe.appspot.com/o/WgPFRIKY7WNdADUeOURxuqlLCeT2%2Favatar%2Foutput1.jpg?alt=media&token=49517c31-c936-4c56-8998-fcaafe516856",
            name: "testman",
            balance: "100",
            tokenName: "TEST-HARK",
            streamerContract: "11",
            senderUid: "11"
        };
    },
};
</script>

<style>
</style>