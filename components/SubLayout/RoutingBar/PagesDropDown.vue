<!-- Component for drop-down menu attached to button on routing bar, contains links to other pages -->

<template>
    <div class="dropdown">
        <!-- 
        <button class="dropbtn">Pages  <img id="drop-arrow" src="/images/dropdown-arrow.png" /></button>
        <div class="dropdown-content">
            <nuxt-link v-for="(page, index) in pages" :key="index" :to="page.path">{{ page.name }}</nuxt-link>
        </div>
        -->
        <v-menu offset-y bottom open-on-hover tile transition="fade-transition">
            <template v-slot:activator="{ on, attrs }">
                <v-btn
                v-bind="attrs"
                v-on="on"
                :ripple="false"
                text
                exact
                style="height:100%;"
                depressed
                plain
                >
                Pages
                </v-btn>
            </template>
            <v-list dark nav tile dense rounded flat>
                <v-list-item
                v-for="(page, index) in pages"
                :key="index"
                :to="page.path"
                :ripple="false"
                >
                <v-list-item-title>{{ page.name }}</v-list-item-title>
                </v-list-item>
            </v-list>
        </v-menu>
        
    </div>
</template>

<script>
export default {
    data: function() {
        return {
            // pages to be listed in drop down menu
            // links not working?? "Unknown API Error! Cannot read property 'abbreviation' of null"
            pages: [
                /* { 
                    name: "Admin", 
                    path: "/admin" 
                }, 
                {
                    name: "Privacy", 
                    path: "/privacy"
                }, */
                {
                    name: "Donations", 
                    path: "/donations"
                }
            ], 
            text_color: "primary"
        }
    }
}
</script>

<style scoped>
    .dropbtn {
        color: #65547c;
        padding: 16px 6px 16px 16px;
        font-size: 16px;
        border: none;
    }

    .dropdown {
        position: relative;
        display: inline-block;
    }

    .dropdown-content {
        display: none;
        position: absolute;
        background-color: #f1f1f1;
        min-width: 160px;
        box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
        z-index: 1;
    }

    .dropdown-content a {
        color: black;
        padding: 12px 16px;
        text-decoration: none;
        display: block;
    }

    .dropdown-content a:hover {background-color: #ddd;}

    .dropdown:hover .dropdown-content {display: block;}

    #drop-arrow {
        width: 8px;
        height: 6px;
        margin-left: 4px;
        margin-bottom: 3px;
    }

    /* .dropdown:hover .dropbtn {background-color: #3e8e41;} */
</style>