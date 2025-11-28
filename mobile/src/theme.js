// Default light theme (for backward compatibility)
export const lightTheme = {
  colors: {
    primary: '#6200ee',
    accent: '#03dac4',
    background: '#f5f5f5',
    surface: '#ffffff',
    text: '#000000',
    placeholder: '#757575',
    error: '#b00020',
    success: '#4caf50',
    border: '#e0e0e0',
    card: '#ffffff',
    // Elevation levels nested under colors as expected by React Native Paper
    elevation: {
      level0: 'transparent',
      level1: 'rgba(0,0,0,0.05)',
      level2: 'rgba(0,0,0,0.07)',
      level3: 'rgba(0,0,0,0.08)',
      level4: 'rgba(0,0,0,0.09)',
      level5: 'rgba(0,0,0,0.10)',
    },
  },
};

export const darkTheme = {
  colors: {
    primary: '#6200ee',
    accent: '#03dac4',
    background: '#121212',
    surface: '#1e1e1e',
    text: '#ffffff',
    placeholder: '#9e9e9e',
    error: '#cf6679',
    success: '#4caf50',
    border: '#333333',
    card: '#2c2c2c',
  },
};

// Default export for backward compatibility
export const theme = lightTheme;



