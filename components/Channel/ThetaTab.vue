<template>
    <div>
        <!-- Theta Web Widget -->
        <v-banner class="barground"><h2>Theta Network Statistics</h2></v-banner>
        <div
            id="theta-section"
            ref="theta-section"
            style="min-height: 300px"
        >
            <div id="MY_THETA_WEB_WIDGET_ID"></div>
        </div>
    </div>
</template>

<script>
import { mapGetters } from "vuex";
import { VStore } from "@/store";

export default {
  methods: {},

  async mounted() {
    let defaultAvatar = `https://cdn.discordapp.com/attachments/778040889359466546/834964837922635796/defaultviewer.jpg`; 
    // theta web widget
    if (process.browser) {
      console.log("connecting the theta widget");
      var widget = new ThetaWebWidgets.OverviewWithTrafficChartWidget();
      widget.setTheme(ThetaWebWidgets.Themes.Light);
      widget.setMainMessage(" ");
      widget.setUserAvatarURL(
        this.user != null
          ? this.user.avatar || defaultAvatar
          : defaultAvatar
      );
      widget.render("MY_THETA_WEB_WIDGET_ID");
    }
  },

  computed: {
    ...mapGetters({
      user: VStore.$getters.getUser,
    }),
  },
};
</script>
<style scoped>
  .barground {
    background: rgb(40,38,80);
    background: linear-gradient(60deg, rgba(40,38,80,1) 0%, rgba(94,59,87,1) 100%); 
  }
    h2 {
        font-size:1.5em;
        color:white;
        font-weight:400;
    }
</style>