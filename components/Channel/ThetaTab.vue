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
export default {
    
    methods: {
        
    },

    async mounted() {
        // theta web widget
        if (process.browser) {
            console.log("connecting the theta widget");
            var widget = new ThetaWebWidgets.OverviewWithTrafficChartWidget();
            widget.setTheme(ThetaWebWidgets.Themes.Light);
            widget.setMainMessage(" ");
            widget.setUserAvatarURL(`https://cdn.discordapp.com/attachments/814278920168931382/821993879842062366/viewer.png`);
            widget.render("MY_THETA_WEB_WIDGET_ID");

        }
    },
};
</script>
<style scoped>
    h2 {
        font-size:1.5em;
        color:white;
        font-weight:300;
    }
</style>