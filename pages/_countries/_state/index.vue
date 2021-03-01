<template>
  <v-container>
    <h1 class="mb-4 d-flex justify-space-around">{{ nameCapitalized }}</h1>

    <v-row>
      <!-- News & Stats -->
      <v-col cols="3" clipped left>
        <img :src="image" class="d-flex state-img" />
        <v-card elevation="2" class="pa-4 my-3 sticky-card">
          <v-card-title class="mt-2">{{ name }} Articles</v-card-title>
          <div :key="index" v-for="(a, index) in articles">
            <news :article="a" />
          </div>
        </v-card>
      </v-col>

      <!-- Streams & Videos -->
      <v-col cols="9">
        <v-card elevation="2" class="pa-4">
          <!--
            <stream-grid >

            </stream-grid>
          -->
          <div class="brogermy">AHHH</div>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: "state",

  data() {
    return {
      mounted: false,
      loading: true,

      // Hydrated data defaults
      name: "",
      nameCapitalized: "",
      abbreviation: "NA",
      image: "/images/minnalouisfornia.png",
      articles: [],
    };
  },

  async mounted() {},

  async asyncData({ $axios, params, error }) {
    const state = params.state;

    // Timeout to prevent SSR from locking up
    const timeout = process.server ? process.env.SSR_TIMEOUT : 0;

    const getStateHydration = async () => {
      let stateData = null;

      // Attempt to load state data via API server
      try {
        // TODO: add our own endpoint to get a channel
        const {
          data,
        } = await $axios.getSSR(
          `https://us-central1-hark-e2efe.cloudfunctions.net/api/location/usa/${state}`,
          { timeout }
        );
        // Simple response validation
        if (data && data.hasOwnProperty("name")) {
          stateData = data;
        }
      } catch (error) {
        // API server failed
        console.error(error.message);

        // API failed with 404, but server did not fail with 5xx
        if (error.response && error.response.status === 404) {
          console.error(`API server reponded with 404`);
          return {
            success: false,
            error: {
              statusCode: 404,
              message: `API SERVER FAIL Could not find state '${state}'.`,
            },
          };
        }
      }

      try {
        const data = stateData;

        // Streamer user properties
        const abbreviation = data.abbreviation;
        const articles = data.articles;
        const image = data.image;
        const name = data.name;
        const nameCapitalized = data.name.toUpperCase();

        console.log("here are articles: " + articles);

        return {
          success: true,
          loading: false,
          data: {
            name,
            articles,
            abbreviation,
            image,
            nameCapitalized
          },
        };
      } catch (error) {
        // Unknown error, unlikely to occur
        console.error(`Unknown API Error: ${error.message}`);
        return {
          success: false,
          error: {
            statusCode: 500,
            message: `Unknown API Error!\n${error.message}`,
          },
        };
      }

      // This should be unreachable
      return {
        success: false,
        error: { statusCode: 500, message: `This should never occur. Oof.` },
      };
    };

    // Get State data for page
    const stateData = await getStateHydration();
    if (stateData.success === false) {
      console.error(`State Data API failed.`, stateData.error);
      if (stateData && !stateData.success) {
        error({ ...stateData.error });
        return;
      }
    }

    return {
      ...stateData.data,
    };
  },
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