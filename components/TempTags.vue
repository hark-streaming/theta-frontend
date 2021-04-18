/* TEMPORARY tag display (tag buttons don't have any functionality) */

<template>
    <div>
        <div v-if="!shortenList">
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

        <div v-if="shortenList">
            <v-chip
                v-for="(tag, index) in shortenedTags()"
                :key="index"
                small
                color="green"
                text-color="white"
                class="mr-2"
                label>
                {{ tag }}
            </v-chip>

            <v-btn 
                v-if="showButton()" 
                class="drop-btn pa-0" 
                color="grey"
                text
                x-small
                @click="buttonClick()"
                >
                ...
            </v-btn>
            <div class="drop-content">
                <v-chip 
                    v-for="(tag, index) in leftoverTags()" 
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
        </div>
    </div>
</template>

<script>
    export default {
        name: "TempTags", 

        props: {
            tags: {type: []},
            shortenList: {default: false}, 
            maxNumTags: {default: 0}
        }, 

        data: {
            showDropdown: false
        },

        methods: {
            shortenedTags() {
                var newTags = [];
                for (var i = 0; i < this.maxNumTags && i < this.tags.length; i++) {
                    newTags.push(this.tags[i]);
                }
                
                return newTags;
            }, 

            leftoverTags() {
                var leftoverTags = [];
                for (var i = this.maxNumTags; i < this.tags.length; i++) {
                    leftoverTags.push(this.tags[i]);
                }

                return leftoverTags;
            },

            showButton() {
                return this.maxNumTags < this.tags.length;
            }, 

            buttonClick() {
                if (!this.showDropdown) {
                    document.getElementsByClassName("drop-content")[0].style.display = "block";
                } else {
                    document.getElementsByClassName("drop-content")[0].style.display = "none";
                }

                this.showDropdown = !this.showDropdown;
            }
        }
    }
</script>

<style scoped>
    .drop-btn {
        color: grey;
        font-size: 16px;
        border: none;
    }

    .drop-content {
        display: none;
        position: absolute;
        background-color: #f1f1f1;
        /* min-width: 160px; */
        box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
        z-index: 1;
    }

    .drop-btn:hover .drop-content {display: block;}
</style>