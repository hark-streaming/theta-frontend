<template>
    <v-app :class="{ ssr: ssr, systemAlert: !!showSystemAlert }" light>
        <!-- System Bar -->
        <v-slide-y-transition>
            <system-alert
                v-if="showSystemAlert"
                :id="systemAlert.id"
                :scroll="systemAlert.scroll"
                :message="systemAlert.message"
                :icon="systemAlert.icon"
                :color="systemAlert.color"
                :text-color="systemAlert.textColor"
                @hide="hideSystemAlert"
            />
        </v-slide-y-transition>

        <!--

        <cv-header-name href="javascript:void(0)" prefix="IBM">
            [Platform]
        </cv-header-name>

        <component :is="tagType" v-on="$listeners" v-bind="linkProps" :class="`cv-header-name bx--header__name`">
            <span v-if="prefix" :class="`bx--header__name--prefix`">{{ prefix }}&nbsp;</span>
            <slot />
        </component>

        <cv-header-nav aria-label="Carbon nav">
             active for current or active location
            <cv-header-menu-item href="javascript:void(0)" active>
            Link 1
            </cv-header-menu-item>
            <cv-header-menu-item href="javascript:void(0)">
            Link 2
            </cv-header-menu-item>
            <cv-header-menu-item href="javascript:void(0)">
            Link 3
            </cv-header-menu-item>
            <cv-header-menu aria-label="Link 4">
            <cv-header-menu-item href="javascript:void(0)">
                Submenu Link 1
            </cv-header-menu-item>
            <cv-header-menu-item href="javascript:void(0)">
                Submenu Link 2
            </cv-header-menu-item>
            <cv-header-menu-item href="javascript:void(0)">
                Submenu Link 3
            </cv-header-menu-item>
            </cv-header-menu>
        </cv-header-nav>
        -->

        <!-- Toolbar -->
        <v-app-bar app :clipped-left="true" dense fixed color="#E8E8E8">
            <!-- Logo Button -->
            <v-toolbar-title style="height:100%" pl-0>
                <v-btn
                    :v-if="!mobile"
                    :ripple="false"
                    href="/"
                    depressed
                    text
                    exact
                    id="logo_text"
                    exact-active-class="app-title-active"
                    class="logobtn text-none title px-2"
                    style="height:100%;"
                >
                    <v-img src="/images/hark-logo.png" max-width="60"></v-img>
                </v-btn>
            </v-toolbar-title>
            <v-divider
                class="pl-4"
                inset
                vertical
            ></v-divider>
            <location-drop-down style="padding-left:15px;height:100%;"></location-drop-down>
            <pages-drop-down style="height:100%;"></pages-drop-down>

            <v-spacer />

            <v-text-field
                v-if="showSearchBar"
                v-model="searchValue"
                background-color="#C8C8C8"
                clearable
                class="custom mb-n6"
                @keydown.enter="goToSearch"
                style="height:135%;"
                filled
                dense
                color="gray"
                solo
                flat
            >
                <template v-slot:prepend-inner>
                    <v-icon class="mr-3">mdi-magnify</v-icon>
                </template>
                <template v-slot:progress>
                    <v-progress-linear
                        v-if="custom"
                        :value="progress"
                        :color="secondary"
                        absolute
                        height="5"
                    ></v-progress-linear>
                </template>
            </v-text-field>

            <v-spacer />

            <!-- Notifications Button -->
            <!-- <notifications v-if="isAuth" /> -->
            <user-menu class="ml-2" />
        </v-app-bar>

        <!-- Content -->
        <v-main>
            <nuxt />
        </v-main>

        <!-- Footer -->
        <simple-footer :version="'V1.0.0'" />
    </v-app>
</template>

<script>
import UserMenu from "@/components/SubLayout/UserMenu";
import sidebar from "@/components/SubLayout/sidebar";
import Notifications from "@/components/Notifications";
import StreamHereBtn from "@/components/SubLayout/StreamHereBtn";
import SystemAlert from "@/components/Alerts/SystemAlert";
import PagesDropDown from "@/components/RoutingBar/PagesDropDown";
import LocationDropDown from "@/components/RoutingBar/LocationDropDown";

const Fireworks = async () => await import("@/components/effects/fireworks");

import { mapGetters, mapMutations } from "vuex";
import { VStore } from "@/store";

export default {
    components: {
        SystemAlert,
        UserMenu,
        sidebar,
        Notifications,
        StreamHereBtn,
        Fireworks,
        PagesDropDown,
        LocationDropDown,
    },

    data() {
        PagesDropDown;
        return {
            bwLogo: "/images/icon-2.png",
            title: "HARK",
            drawer: null,
            ssr: true,
            systemAlertHidden: null,

            searchValue: "",
            showSearchBar: true,
        };
    },

    methods: {
        ...mapMutations({
            setPwaPrompt: VStore.$mutations.setPwaPrompt,
        }),

        hideSystemAlert() {
            try {
                this.systemAlertHidden = this.systemAlert.id;
                localStorage.setItem("hide-system-alert", this.systemAlert.id);
            } catch (error) {
                console.warn(
                    `Failed to save 'hide-system-alert' to localStorage!`,
                    error
                );
            }
        },

        async newVersionAvailable(info) {
            console.log(`New service worker available`, info);
        },

        onBeforeInstallPrompt(prompt) {
            if (process.env.APP_DEBUG)
                console.log(`Listening for PWA prompt...`);
            console.debug(`PWA Prompt:`, prompt);
            prompt.preventDefault();
            this.setPwaPrompt(prompt);
        },

        goToSearch() {
            if (this.searchValue == null || this.searchValue == "") return;

            // this.setSearchValue(this.searchValue.toString());
            this.$store.commit("setSearchValue", this.searchValue);
            this.$router.push("/search");
        },
    },

    computed: {
        ...mapGetters({
            isUpdateAvailable: VStore.$getters.isUpdateAvailable,
            getAlerts: VStore.$getters.getAlerts,
            isAuth: VStore.$getters.isAuth,
        }),

        systemAlert() {
            return this.getAlerts.hasOwnProperty("systemAlert")
                ? this.getAlerts.systemAlert
                : false;
        },

        showSystemAlert() {
            return (
                this.systemAlert &&
                this.systemAlert.display &&
                this.systemAlertHidden !== this.systemAlert.id
            );
        },

        fireworks() {
            return this.getAlerts.hasOwnProperty("fireworks")
                ? this.getAlerts.fireworks
                : false;
        },

        showFireworks() {
            return this.fireworks && this.fireworks.display;
        },

        mobile() {
            return this.mounted
                ? this.$vuetify.breakpoint.smAndDown
                : !this.$device.isDesktopOrTablet;
        },
    },

    watch: {
        showFireworks(val) {
            if (val)
                this.$refs["fireworks"].start(
                    this.fireworks.message,
                    this.fireworks.subtext
                );
        },
    },

    async mounted() {
        this.ssr = false;

        try {
            this.systemAlertHidden = localStorage.getItem("hide-system-alert");
        } catch (error) {
            this.systemAlertHidden = false;
            console.warn(
                `Failed to read 'hide-system-alert from localStorage'`,
                error.message
            );
        }

        const workbox = await window.$workbox;
        if (workbox) {
            workbox.addEventListener("waiting", async (event) => {
                console.log(event);
                await this.newVersionAvailable({ version: "SW" });
            });
        }
    },

    created() {
        this.$nuxt.$on("searchLoaded", () => {
            this.showSearchBar = false;
        });

        this.$nuxt.$on("searchDestroyed", () => {
            this.showSearchBar = true;
        });
    },
};
</script>

<style lang="scss">
@import "~assets/style/bitwave-toast";

.custom.v-text-field input {
    font-size: 0.9em;
}
.custom.v-text-field label {
    font-size: 0.8em;
}

/*
.custom.v-text-field>.v-input__control>.v-input__slot:before {
    border-style: none;
}
.custom.v-text-field>.v-input__control>.v-input__slot:after {
    border-style: none;
}*/

#app .app-title-active {
    &:hover::before {
        opacity: 0.24;
    }
    &::before {
        opacity: 0;
    }
}

#app.ssr {
    .v-menu,
    .v-tooltip {
        display: block !important;
    }
}

.logobtn::before {
    color: transparent
}

.header {
    position: fixed;
    top: 0;
    right: 0;
    left: 0;
    z-index: z('header');
    display: flex;
    align-items: center;
    height: mini-units(6);
    background-color: black;
    border-bottom: 1px solid white;
}

#app {
    //background-image: linear-gradient(to top right, #54547c, #ebe8e8, #cc6464);
    background-image: linear-gradient(
        to top right,
        rgb(109, 109, 126) 0%,
        rgba(235, 232, 232, 1) 15%,
        rgba(235, 232, 232, 1) 85%,
        rgb(207, 169, 169) 100%
    );
}
</style>
