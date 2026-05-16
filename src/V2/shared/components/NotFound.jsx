import Home from "@mui/icons-material/Home";
import { Box, Button, Stack, Typography } from "@mui/material";
import { Link } from "react-router-dom";

import ROUTE_PATHS from "../../app/router/paths";

function NotFound() {
  return (
    <Box
      sx={{
        minHeight: "100dvh",
        display: "grid",
        placeItems: "center",
        bgcolor: "#f8fafc",
        px: 2,
      }}
    >
      <Stack spacing={1.5} alignItems="center" sx={{ textAlign: "center", maxWidth: 420 }}>
        <Typography variant="h1" sx={{ color: "#64748b", fontSize: 76, fontWeight: 800 }}>
          404
        </Typography>
        <Typography variant="h5" sx={{ color: "#0f172a", fontWeight: 700 }}>
          Page Not Found
        </Typography>
        <Typography variant="body2" sx={{ color: "#64748b", lineHeight: 1.7 }}>
          The page you are looking for does not exist or has been moved.
        </Typography>
        <Button
          component={Link}
          to={ROUTE_PATHS.login}
          variant="outlined"
          startIcon={<Home />}
          sx={{
            mt: 1,
            minHeight: 44,
            borderRadius: 2,
            borderColor: "#cbd5e1",
            color: "#334155",
            fontWeight: 700,
            textTransform: "none",
          }}
        >
          Go Back to Home
        </Button>
      </Stack>
    </Box>
  );
}

export default NotFound;
