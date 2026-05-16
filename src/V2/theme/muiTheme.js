import { createTheme } from "@mui/material/styles";

const muiTheme = createTheme({
  palette: {
    primary: {
      main: "#877bdc",
    },
    secondary: {
      main: "#2575FC",
    },
  },
  typography: {
    fontFamily: '"Poppins", sans-serif',
    body1: {
      color: "#555",
    },
  },
  shape: {
    borderRadius: 4,
  },
});

export default muiTheme;
