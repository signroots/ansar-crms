import { Box, ThemeProvider } from "@mui/material";

import theme from "../../../theme/muiTheme";
import StaffTeacherBottomBar from "./StaffTeacherBottomBar";
import StaffTeacherHeader from "./StaffTeacherHeader";

function StaffTeacherLayout({ children }) {
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
        <StaffTeacherHeader />

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

        <StaffTeacherBottomBar />
      </Box>
    </ThemeProvider>
  );
}

export default StaffTeacherLayout;
