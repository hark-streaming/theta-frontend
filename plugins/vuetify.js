import Vue from 'vue'
import Vuetify from 'vuetify/lib'
import colors from 'vuetify/es5/util/colors'

Vue.use(Vuetify)

const vuetify = new Vuetify({
  theme: {
    dark: false, 
    themes: {
      light: {
        primary: colors.yellow,
        accent: colors.grey.darken3,
        secondary: colors.amber.darken3,
        info: colors.teal.lighten1,
        warning: colors.amber.base,
        error: colors.deepOrange.accent4,
        success: colors.green.accent3,
        background: colors.red
      },
    },
  }
})

export default vuetify
