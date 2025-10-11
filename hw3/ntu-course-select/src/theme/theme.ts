import { createTheme } from '@mui/material/styles'

export const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2', // 藍色主色調
      light: '#42a5f5',
      dark: '#1565c0',
    },
    secondary: {
      main: '#757575', // 灰色輔助色
    },
    background: {
      default: '#ffffff', // 白色背景
      paper: '#fafafa', // 紙張背景
    },
    text: {
      primary: '#424242', // 深灰色文字
      secondary: '#757575', // 淺灰色文字
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
      color: '#424242',
    },
    h5: {
      fontWeight: 600,
      color: '#424242',
    },
    h6: {
      fontWeight: 600,
      color: '#424242',
    },
    body1: {
      color: '#424242',
    },
    body2: {
      color: '#757575',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none', // 不要自動轉大寫
          borderRadius: 4,
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          borderRadius: 8,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 4,
          },
        },
      },
    },
  },
})
