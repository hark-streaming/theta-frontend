<template>
  <v-container>
    <h1 class="mb-4 d-flex justify-space-around">MINELOUISIFORNIA</h1>

    <v-row>
      <!-- News & Stats -->
      <v-col cols="3" clipped left>
        <img src="/images/minnalouisfornia.png" class="d-flex state-img" />
        <v-card elevation="2" class="pa-4 my-3 sticky-card">
          <v-card-title class="mt-2">Minelouisifornia Articles</v-card-title>
          <news />
          <news />
          <news />
        </v-card>
      </v-col>

      <!-- Streams & Videos -->
      <v-col cols="9">
        <v-card elevation="2" class="pa-4">
          <!--
                <stream-grid >

                </stream-grid>
                -->
          <div class="brogermy" >AHHH</div>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: "channel",

  async mounted() {},
};
</script>

<style>
.state-img {
  max-width: 100%;
  max-height: 300px;
  /*width: 50%;*/
  margin-left: auto;
  margin-right: auto;
  height: auto;
}

.sticky-card {
    position: sticky;
    top: 60px;
}

.brogermy {
  min-height: 2000px;
}
</style>