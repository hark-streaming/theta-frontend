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
  async mounted() {

    // theta web widget
    var widget = new ThetaWebWidgets.OverviewWithTrafficChartWidget(null);
    widget.setTheme(ThetaWebWidgets.Themes.Light);
    widget.render("MY_THETA_WEB_WIDGET_ID");
  },
};
</script>