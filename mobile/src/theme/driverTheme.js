// Driver Theme Configuration
// Centralized color scheme for all driver screens

export const driverTheme = {
    colors: {
        // Primary Colors
        primary: '#00B4D8',        // Electric Blue - Main brand color
        primaryDark: '#0077B6',    // Deep Blue - Darker variant
        primaryLight: '#90E0EF',   // Light Blue - Lighter variant

        // Background Colors
        background: '#121212',     // Main background
        surface: '#1E1E1E',        // Card/surface background
        surfaceVariant: '#2C2C2C', // Alternative surface

        // Text Colors
        text: '#FFFFFF',           // Primary text
        textSecondary: '#CCCCCC',  // Secondary text
        textTertiary: '#AAAAAA',   // Tertiary/muted text
        textDisabled: '#666666',   // Disabled text

        // Status Colors
        success: '#4CAF50',        // Green - Success states
        error: '#F44336',          // Red - Error states
        warning: '#FF9800',        // Orange - Warning states
        info: '#2196F3',           // Blue - Info states

        // UI Elements
        border: '#333333',         // Border color
        borderLight: '#444444',    // Lighter border
        divider: '#444444',        // Divider lines

        // Interactive Elements
        buttonPrimary: '#00B4D8',  // Primary button background
        buttonSecondary: '#0077B6', // Secondary button background

        // Overlays & Shadows
        overlay: 'rgba(30,30,30,0.95)',
        overlayLight: 'rgba(30,30,30,0.8)',
        shadow: 'rgba(0,0,0,0.8)',

        // Icon Backgrounds
        iconPrimary: '#00B4D8',
        iconSuccess: '#4CAF50',
        iconError: '#F44336',
        iconNeutral: '#333333',
    },

    // Spacing
    spacing: {
        xs: 4,
        sm: 8,
        md: 12,
        lg: 16,
        xl: 20,
        xxl: 24,
    },

    // Border Radius
    borderRadius: {
        sm: 8,
        md: 12,
        lg: 16,
        xl: 20,
        round: 999,
    },

    // Typography
    typography: {
        fontWeightRegular: '400',
        fontWeightMedium: '500',
        fontWeightBold: 'bold',
    },

    // Elevation/Shadow
    elevation: {
        low: 2,
        medium: 4,
        high: 6,
        highest: 10,
    },
};

// Helper function to get rgba color with opacity
export const withOpacity = (color, opacity) => {
    // Simple implementation for hex colors
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

export default driverTheme;
