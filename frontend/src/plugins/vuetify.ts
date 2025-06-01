/**
 * Optimized Vuetify configuration for Omniy Instagram Scheduler
 * Uses on-demand imports and minimal component loading
 */

import { createVuetify } from 'vuetify';
import { aliases, mdi } from 'vuetify/iconsets/mdi';

// Optimized Vuetify styles import
import 'vuetify/styles';

// Only import MDI icons that are actually used
import '@mdi/font/css/materialdesignicons.css';

// Theme configuration
const lightTheme = {
  dark: false,
  colors: {
    primary: '#E91E63',
    secondary: '#9C27B0',
    accent: '#FF5722',
    error: '#F44336',
    warning: '#FF9800',
    info: '#2196F3',
    success: '#4CAF50',
    background: '#FFFFFF',
    surface: '#FFFFFF',
    'primary-darken-1': '#C2185B',
    'secondary-darken-1': '#7B1FA2',
  },
};

const darkTheme = {
  dark: true,
  colors: {
    primary: '#E91E63',
    secondary: '#9C27B0',
    accent: '#FF5722',
    error: '#CF6679',
    warning: '#FF9800',
    info: '#2196F3',
    success: '#4CAF50',
    background: '#121212',
    surface: '#1E1E1E',
    'primary-darken-1': '#C2185B',
    'secondary-darken-1': '#7B1FA2',
  },
};

// Optimized Vuetify configuration
const vuetify = createVuetify({
  theme: {
    defaultTheme: 'light',
    themes: {
      light: lightTheme,
      dark: darkTheme,
    },
    variations: {
      colors: ['primary', 'secondary'],
      lighten: 1,
      darken: 1,
    },
  },

  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: {
      mdi,
    },
  },

  // Optimized defaults to reduce bundle size
  defaults: {
    VCard: {
      elevation: 2,
      rounded: 'lg',
    },
    VBtn: {
      variant: 'elevated',
      rounded: 'lg',
    },
    VTextField: {
      variant: 'outlined',
      density: 'comfortable',
    },
    VSelect: {
      variant: 'outlined',
      density: 'comfortable',
    },
    VTextarea: {
      variant: 'outlined',
      density: 'comfortable',
    },
    VCheckbox: {
      density: 'comfortable',
    },
    VRadio: {
      density: 'comfortable',
    },
    VDataTable: {
      density: 'comfortable',
    },
    VAppBar: {
      elevation: 1,
    },
    VNavigationDrawer: {
      elevation: 1,
    },
  },

  // Display configuration for responsive design
  display: {
    mobileBreakpoint: 'sm',
    thresholds: {
      xs: 0,
      sm: 600,
      md: 960,
      lg: 1280,
      xl: 1920,
    },
  },
});

export default vuetify;
