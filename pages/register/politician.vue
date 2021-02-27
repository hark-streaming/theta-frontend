<template>
    <v-container class="px-16">
        <div class="mb-4 d-flex justify-space-around">
            POLITICIAN REGISTER PAGE
        </div>

        <!-- 3 card layout -->
        <v-row>
            <v-col cols="4">
                <v-card elevation="2" class="pa-8 sticky-card">
                    <v-card-title class="mt-2"> Steps </v-card-title>
                    <v-timeline dense>
                        <v-timeline-item small>Info Section 1</v-timeline-item>
                        <v-timeline-item small>Info Section 2</v-timeline-item>
                        <v-timeline-item small>Info Section 3</v-timeline-item>
                        <v-timeline-item small>Info Section 4</v-timeline-item>
                        <v-timeline-item small>Info Section 5</v-timeline-item>
                        <v-timeline-item small>Info Section 6</v-timeline-item>
                    </v-timeline>
                </v-card>
            </v-col>
            <v-col cols="8">
                <v-form ref="form" v-model="valid" lazy-validation>
                    <v-card elevation="2" class="pa-8">
                        <v-card-title class="mt-2"> Form </v-card-title>
                        <v-card elevation="2" class="px-8 mt-6">
                            <v-card-title> Info Section 1 </v-card-title>
                            <v-text-field
                                v-model="name"
                                :counter="10"
                                :rules="nameRules"
                                label="Name"
                                required
                            ></v-text-field>

                            <v-text-field
                                v-model="email"
                                :rules="emailRules"
                                label="E-mail"
                                required
                            ></v-text-field>

                            <v-select
                                v-model="select"
                                :items="items"
                                :rules="[(v) => !!v || 'Item is required']"
                                label="Item"
                                required
                            ></v-select>
                        </v-card>
                        <v-card elevation="2" class="px-8 mt-6">
                            <v-card-title> Info Section 2 </v-card-title>
                            <v-text-field
                                v-model="name"
                                :counter="10"
                                :rules="nameRules"
                                label="Name"
                                required
                            ></v-text-field>

                            <v-text-field
                                v-model="email"
                                :rules="emailRules"
                                label="E-mail"
                                required
                            ></v-text-field>

                            <v-select
                                v-model="select"
                                :items="items"
                                :rules="[(v) => !!v || 'Item is required']"
                                label="Item"
                                required
                            ></v-select>
                        </v-card>
                        <v-card elevation="2" class="px-8 mt-6">
                            <v-card-title> Info Section 3 </v-card-title>
                            <v-text-field
                                v-model="name"
                                :counter="10"
                                :rules="nameRules"
                                label="Name"
                                required
                            ></v-text-field>

                            <v-text-field
                                v-model="email"
                                :rules="emailRules"
                                label="E-mail"
                                required
                            ></v-text-field>

                            <v-select
                                v-model="select"
                                :items="items"
                                :rules="[(v) => !!v || 'Item is required']"
                                label="Item"
                                required
                            ></v-select>
                        </v-card>
                        <v-card elevation="2" class="px-8 mt-6">
                            <v-card-title> Info Section 4 </v-card-title>
                            <v-text-field
                                v-model="name"
                                :counter="10"
                                :rules="nameRules"
                                label="Name"
                                required
                            ></v-text-field>

                            <v-text-field
                                v-model="email"
                                :rules="emailRules"
                                label="E-mail"
                                required
                            ></v-text-field>

                            <v-select
                                v-model="select"
                                :items="items"
                                :rules="[(v) => !!v || 'Item is required']"
                                label="Item"
                                required
                            ></v-select>
                        </v-card>
                        <v-card elevation="2" class="px-8 mt-6">
                            <v-card-title> Info Section 5 </v-card-title>
                            <v-text-field
                                v-model="name"
                                :counter="10"
                                :rules="nameRules"
                                label="Name"
                                required
                            ></v-text-field>

                            <v-text-field
                                v-model="email"
                                :rules="emailRules"
                                label="E-mail"
                                required
                            ></v-text-field>

                            <v-select
                                v-model="select"
                                :items="items"
                                :rules="[(v) => !!v || 'Item is required']"
                                label="Item"
                                required
                            ></v-select>
                        </v-card>
                        <v-card elevation="2" class="px-8 mt-6">
                            <v-card-title> Info Section 6 </v-card-title>
                            <v-text-field
                                v-model="name"
                                :counter="10"
                                :rules="nameRules"
                                label="Name"
                                required
                            ></v-text-field>

                            <v-text-field
                                v-model="email"
                                :rules="emailRules"
                                label="E-mail"
                                required
                            ></v-text-field>

                            <v-select
                                v-model="select"
                                :items="items"
                                :rules="[(v) => !!v || 'Item is required']"
                                label="Item"
                                required
                            ></v-select>
                        </v-card>
                    </v-card>
                </v-form>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
import { auth } from "@/plugins/firebase.js";

export default {
    name: "register",

    data() {
        return {
            valid: true,
            name: "",
            nameRules: [
                (v) => !!v || "Name is required",
                (v) =>
                    (v && v.length <= 10) ||
                    "Name must be less than 10 characters",
            ],
            email: "",
            emailRules: [
                (v) => !!v || "E-mail is required",
                (v) => /.+@.+\..+/.test(v) || "E-mail must be valid",
            ],
            select: null,
            items: ["Item 1", "Item 2", "Item 3", "Item 4"],
        };
    },

    methods: {
        validate() {
            this.$refs.form.validate();
        },
        reset() {
            this.$refs.form.reset();
        },
        resetValidation() {
            this.$refs.form.resetValidation();
        },
    },

    computed: {},

    mounted() {},

    beforeDestroy() {},
};
</script>

<style scoped>
.sticky-card {
    position: sticky;
    top: 0;
}
</style>