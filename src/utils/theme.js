// src/utils/theme.js

const DSKTheme = {
    colors: {
        white: "#FFFFFF",
        black: "#000000",

        // ✅ Grayscale Palette (from uploaded image)
        gray100: "#F9F9F9",
        gray200: "#E0E0E0",
        gray300: "#C7C7C7",
        gray400: "#AEAEAE",
        gray500: "#959595",
        gray600: "#7C7C7C",
        gray700: "#636363",
        gray800: "#4A4A4A",
        gray900: "#2F2F2F",

        // ✅ DSK Signature Colors
        dskRed: "#B81010",
        dskBlue: "#113D7B",
        dskAccent: "#FFCD00",

        // ✅ Utility Shades
        success: "#3CB371",
        warning: "#FFA500",
        danger: "#DC2626",
        info: "#3B82F6",
    },

    font: {
        primary: "Inter, sans-serif",
        size: {
            sm: "0.875rem",
            base: "1rem",
            lg: "1.125rem",
            xl: "1.25rem",
            "2xl": "1.5rem",
        },
    },

    spacing: {
        xs: "0.5rem",
        sm: "1rem",
        md: "2rem",
        lg: "3rem",
    },
};

export default DSKTheme;
