/* TEMPORARY tag display (tag buttons don't have any functionality) */

<template>
    <div>
        <v-chip 
            v-for="(tag, index) in tags" 
            :key="index"
            small
            color="green"
            text-color="white"
            class="mr-2"
            label
            >
            {{ tag }}
        </v-chip>
    </div>
</template>

<script>
    export default {
        name: "TempTags", 

        props: {
            tags: {type: []}
        }
    }
</script>