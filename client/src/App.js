import React, { useState, useEffect } from "react";
import Alert from '@mui/material/Alert';
import AppBar from "@mui/material/AppBar";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import Grid from "@mui/material/Grid";
import HomeIcon from "@mui/icons-material/Home";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import LinearProgress from "@mui/material/LinearProgress";
import Link from "@mui/material/Link";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import Tooltip from "@mui/material/Tooltip";
import { styled } from "@mui/material/styles";
import { createTheme, ThemeProvider } from "@mui/material/styles";

function Copyright() {
  return (
    <Typography variant="body2" color="text.secondary" align="center">
      {"Copyright © "}
      <Link color="inherit" href="https://github.com/vchiapaikeo/superbowl-boxes-v2">
        superbowl-boxes-v2
      </Link>{" "}
      {new Date().getFullYear()}
      {"."}
    </Typography>
  );
}

const theme = createTheme();

const Header = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#fff",
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: "center",
  color: theme.palette.text.primary,
}));

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#fff",
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: "center",
  color: theme.palette.text.secondary,
}));

const getHeader = (index, value) => {
  return (
    <Grid item xs={1} key={index}>
      <Header>
        <b>{value}</b>
      </Header>
    </Grid>
  );
};

const getItem = (index, value) => {
  return (
    <Grid item xs={1} key={index}>
      <Item>{value}</Item>
    </Grid>
  );
};

const getGridItem = (index, names) => {
  if (index === 0) {
    return getItem(index, "-");
  } else if (index >= 1 && index <= 10) {
    return getHeader(index, index - 1);
  } else if (index > 10 && index % 11 === 0) {
    return getHeader(index, index / 11 - 1);
  }
  const subtractor = parseInt(index / 11, 10) - 1;
  const convertedIndex = index - 12 - subtractor;
  return getItem(index, names[convertedIndex]);
};

export default function App() {
  const [loading, setLoading] = useState(true);
  const [names, setNames] = useState([]);
  const [saved, setSaved] = useState(false);
  const [shouldIncludeBlanks, setShouldIncludeBlanks] = useState(false);

  async function postSave() {
    const response = await fetch("/api/v1/names/save", {
      method: "POST",
      body: JSON.stringify({ names }),
      headers: { "Content-Type": "application/json" },
    });
    if (response.status !== 200) throw Error(response);
    setSaved(true);
  }

  async function getShuffledNames(shouldIncludeBlanks) {
    const response = await fetch(`/api/v1/names?includeBlanks=${shouldIncludeBlanks}`);
    const body = await response.json();
    if (response.status !== 200) throw Error(body.message);
    return body;
  }

  function loadNames() {
    if (saved === true) {
      return;
    }
    getShuffledNames(shouldIncludeBlanks)
      .then((res) => {
        setLoading(false);
        setNames(res.names);
        setSaved(res.saved);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }

  useEffect(() => {
    loadNames();
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar position="relative">
        <Toolbar>
          <HomeIcon sx={{ mr: 2 }} />
          <Typography variant="h6" color="inherit" noWrap>
            Crossword Crew Super Bowl Boxes 2023 Edition
          </Typography>
        </Toolbar>
      </AppBar>
      {/* Main */}
      <main>
        {saved === true
          ? <Alert severity="info" style={{ margin: "8px 8px 8px 8px" }}>
              {`Results have been saved. To reset, send a post request to https://superbowl-boxes-v2-yyht2u2fgq-uc.a.run.app/api/v1/clear`}
            </Alert>
          : null
        }
        <Box
          sx={{
            bgcolor: "background.paper",
            pt: 4,
            pb: 2,
          }}
        >
          <Stack sx={{ pt: 1 }} direction="row" spacing={4} justifyContent="center">
            <Button variant="contained" onClick={() => loadNames()} disabled={saved}>
              Randomize
            </Button>
            <Button variant={saved ? "outlined" : "contained"} onClick={() => postSave()}>
              Save
            </Button>
            <Tooltip title="Should Include Blanks ensures that every name is displayed an equal number of times and will fill empty spaces with a hyphen">
              <FormControlLabel
                control={
                  <Switch
                    checked={shouldIncludeBlanks}
                    onChange={(event) => setShouldIncludeBlanks(event.target.checked)}
                    inputProps={{ "aria-label": "controlled" }}
                  />
                }
                label="Should Include Blanks"
              />
            </Tooltip>
          </Stack>
        </Box>
        <Container maxWidth="xl" style={{ padding: "1em" }}>
          <Typography variant="h6" component="h2" style={{ textAlign: "center" }}>
            Kansas City
          </Typography>

          <div style={{ display: "inline-flex" }}>
            <div style={{ writingMode: "tb-rl" }}>
              <Typography variant="h6" component="h2" style={{ textAlign: "center" }}>
                Philadelphia
              </Typography>
            </div>
            <Grid container spacing={1} columns={11}>
              {loading === true ? (
                <Box sx={{ width: "100%" }}>
                  <LinearProgress />
                </Box>
              ) : (
                Array.from(Array(121)).map((_, index) => getGridItem(index, names))
              )}
            </Grid>
          </div>
        </Container>
      </main>
      {/* Footer */}
      <Box sx={{ bgcolor: "background.paper", p: 6 }} component="footer">
        <Typography variant="h6" align="center" gutterBottom>
          Footer
        </Typography>
        <Typography variant="subtitle1" align="center" color="text.secondary" component="p">
          May the odds be ever in your favor
        </Typography>
        <Copyright />
      </Box>
      {/* End footer */}
    </ThemeProvider>
  );
}
