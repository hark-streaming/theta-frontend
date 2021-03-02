<!-- Component for drop-down menu attached to button on routing bar, contains links to other pages -->

<template>
    <div>
        <p v-for="page in pages" :key="page.name">
            <nuxt-link to="../pages/_countries/index.vue">{{ page.name }}</nuxt-link>
        </p>
    </div>
</template>

<script>
export default {
    data: function() {
        return {
            // pages to be listed in drop down menu
            pages: [
                { name: "Countries", path: "../pages/_countries/index.vue" }, 
                { name: "Admin", path: "../pages/admin.vue" }
            ]
        }
    }
}
</script>