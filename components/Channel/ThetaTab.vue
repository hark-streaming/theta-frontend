<template>
    <!-- Theta Web Widget -->
    <div
        id="theta-section"
        ref="theta-section"
        class="pa-3"
        style="min-height: 300px"
    >
        <div id="MY_THETA_WEB_WIDGET_ID"></div>
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
            widget.setMainMessage("Theta Network Stats");
            widget.setUserAvatarURL(`https://cdn.discordapp.com/attachments/814278920168931382/821993879842062366/viewer.png`);
            widget.render("MY_THETA_WEB_WIDGET_ID");

        }
    },
};
</script>