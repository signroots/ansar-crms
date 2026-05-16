/* eslint-disable react/prop-types */
import { Box, ThemeProvider } from "@mui/material";

import theme from "../../../common/theme";
import StaffBottomBar from "./StaffBottomBar";
import StaffHeader from "./StaffHeader";

function StaffLayout({ children }) {
  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "100dvh",
          overflow: "hidden",
          bgcolor: "#f6f8fb",
        }}
      >
        <StaffHeader />

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            overflowY: "auto",
            px: { xs: 1.25, sm: 2 },
            pt: { xs: 1.25, sm: 2 },
            pb: "104px",
            bgcolor: "#f6f8fb",
          }}
        >
          {children}
        </Box>

        <StaffBottomBar />
      </Box>
    </ThemeProvider>
  );
}

export default StaffLayout;
