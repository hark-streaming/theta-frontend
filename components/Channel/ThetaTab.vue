<template>
    <div>
        <!-- Theta Web Widget -->
        <v-banner color="secondary"><h2>Theta Network Statistics</h2></v-banner>
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
    let defaultAvatar = `https://cdn.discordapp.com/attachments/814278920168931382/821993879842062366/viewer.png`; 
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
<<<<<<< HEAD
h2 {
  font-size: 1.5em;
}
=======
    h2 {
        font-size:1.5em;
        color:white;
        font-weight:300;
    }
>>>>>>> f764b07f1b5b9d7ee3354f82f802e55efec66f46
</style>