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
    // head() {
    //     return {
    //         script: [
    //             {
    //                 hid: "ThetaWebWidget",
    //                 type: "application/javascript",
    //                 src: "https://theta-web-widgets.thetatoken.org/js/ThetaWebWidgets.js"
    //             }
    //         ]
    //     }

    // },

    async mounted() {
        // theta web widget
        var widget = new ThetaWebWidgets.OverviewWithTrafficChartWidget();
        widget.setTheme(ThetaWebWidgets.Themes.Light);
        widget.setMainMessage("TEST TIME");
        widget.render("MY_THETA_WEB_WIDGET_ID");
    },
};
</script>