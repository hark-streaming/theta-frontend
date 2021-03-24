<template>
    <v-card color="neutral">
        <v-img 
            :src="bgimage"
            height="80"
            class="mb-n6">
        </v-img>

        <div class="d-flex justify-start px-4 pb-3">
            <v-img 
                :src="mainimage"
                :aspect-ratio="1"
                :width="100"
                :height="100"
                contain>
            </v-img>

            <div class="mt-8 px-3">
                <h3>{{ title }}</h3>
                <p>[tags]</p>
            </div>

        </div>

        <div class="px-4 pb-1">
            <p>{{ longdesc }}</p>
        </div>

        <div class="d-flex justify-end px-4 pb-3">
            <v-btn 
                color="primary"
                :href="link">{{ shortdesc }}</v-btn>
        </div>
    </v-card>
</template>

<script>
export default {

    // name: DonationCard, 

    props: {
        bgimage: { type: String, default: "" }, 
        link: { type: String, default: "" }, 
        longdesc: {type: String, default: "" }, 
        mainimage: {type: String, default: "" }, 
        shortdesc: {type: String, default: "" }, 
        title: {type: String, default: "" }, 
        tags: []
    }

}
</script>