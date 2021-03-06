import colors from 'vuetify/es5/util/colors'
import * as colorVars from 'assets/vars/colors.scss'

// vuetify.options.js
export default {
  breakpoint: {},
  defaultAssets: false,
  icons: {},
  lang: {},
  rtl: false,
  // MAIN COLOR THEME
  theme: {
    dark: false,
    themes: {
      // MAIN COLOR THEME
      light: {
        primary: colorVars.hkprimary,
        secondary: colorVars.hksecondary,
        secondaryneutral: colorVars.hksecondaryneutral,
        accentwave: colorVars.hkaccentwave, 
        neutral: colorVars.hkneutral
      },
      dark: { // swap primary to #13a9fe
        primary:   '#A36167',             // colors.yellow.base  // #ffeb3b
        anchor:    '#13a9fe',
        secondary: '#000052',             // colors.grey.darken3 // #424242
        accent:    '#ac4efe',             // colors.yellow.accent1, // #82B1FF
        // accent:    '#ffeb3b',             // colors.yellow.accent1, // #82B1FF
        error:     colors.red.accent2,    // #FF5252
        info:      colors.blue.base,      // #2196F3
        success:   colors.green.base,     // #4CAF50
        warning:   colors.amber.base,     // #FFC107
        darkwave:  '#0a0a19',
        // accentwave: '#262639',
      },
    },
  },
}
