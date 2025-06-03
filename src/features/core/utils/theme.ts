// Gruvbox dark theme configuration for Leva controls
export const gruvboxTheme = {
  colors: {
    elevation1: '#282828', // Main background
    elevation2: '#3c3836', // Controls background
    elevation3: '#504945', // Hover state
    accent1: '#98971a', // Primary accent (green)
    accent2: '#d65d0f', // Secondary accent (orange)
    accent3: '#b8bb26', // Tertiary accent (light green)
    highlight1: '#ebdbb2', // Text color
    highlight2: '#d5c4a1', // Secondary text
    highlight3: '#bdae93', // Disabled text
    vivid1: '#fb4934', // Red for errors/warnings
  },
  radii: {
    xs: '2px',
    sm: '3px',
    lg: '4px',
  },
  space: {
    xs: '3px',
    sm: '6px',
    md: '10px',
    lg: '14px',
    xl: '18px',
  },
  fonts: {
    mono: 'ui-monospace, SFMono-Regular, Menlo, monospace',
    sans: 'system-ui, sans-serif',
  },
  sizes: {
    rootWidth: '280px',
    controlWidth: '160px',
    scrubberWidth: '8px',
    scrubberHeight: '16px',
    rowHeight: '24px',
    folderHeight: '20px',
    checkboxSize: '16px',
    joystickWidth: '100px',
    joystickHeight: '100px',
    colorPickerWidth: '160px',
    colorPickerHeight: '100px',
    imagePreviewWidth: '100px',
    imagePreviewHeight: '100px',
    monitorHeight: '60px',
    titleBarHeight: '39px',
  },
  borderWidths: {
    root: '0px',
    input: '1px',
    focus: '2px',
    hover: '1px',
    active: '1px',
    folder: '1px',
  },
  fontSizes: {
    root: '11px',
  },
} as const;
