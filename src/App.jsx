import { Grommet, Grid, Box } from "grommet";
import { getTheme } from "./theme";
import {
  Scene
} from "robot-scene";
import { Environment } from "simple-vp";
import useStore from "./store";
import useMeasure from "react-use-measure";
import { useState, memo } from "react";
import { URDF } from "./Tabs/URDF";
import { Menu } from "./Menu";
// import Button from "@mui/material/Button";
// import { Icon, IconButton } from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import MeshLookupTable from "./Meshes";
// import { FiSettings } from "react-icons/fi";

function App() {
  const primaryColor = "#c5050c";
  const theme = getTheme(primaryColor);
  const [editorRef, editorBounds] = useMeasure();
  const [mode, setMode] = useState("default");

  const muiTheme = createTheme({
    palette: {
      mode: "dark",
      primaryColor: {
        main: primaryColor,
      },
      quiet: {
        main: "#444",
        darker: "#333",
      },
      pop: {
        main: "#999",
        darker: "#777",
      },
    },
  });

  // console.log('rerender')

  return (
    <ThemeProvider theme={muiTheme}>
      <Grommet full theme={theme}>
        <Box fill direction="row" style={{ position: "fixed" }}>
          <Box
            flex
            background="#44444477"
            pad="xxsmall"
            style={{ overflow: "hidden" }}
          >
            <Scene
                  // displayTfs={true}
                  displayGrid={true}
                  isPolar={false}
                  backgroundColor="#1e1e1e"
                  planeColor="#141414"
                  highlightColor={primaryColor}
                  plane={0}
                  fov={50}
                  store={useStore}
                  meshLookup={MeshLookupTable}
                  // onPointerMissed={clearFocus}
                  // paused={paused}
                />
          </Box>
          <Box flex background="#44444477" direction="column">
            <Box align="center" pad="small" justify="between" direction="row">
              <Menu mode={mode} setMode={setMode} />

              {/* <Button color="pop" variant="outlined">
                {mode === "default" ? "Setup" : "Return"}
              </Button> */}
            </Box>
            {mode === "default" ? (
              <Box
                ref={editorRef}
                align="center"
                justify="center"
                animation="fadeIn"
                height="100%"
              >
                <Environment
                  store={useStore}
                  highlightColor={primaryColor}
                  height={editorBounds.height - 5}
                  width={editorBounds.width - 5}
                  snapToGrid={false}
                />
              </Box>
            ) : (
              <URDF />
            )}
          </Box>
        </Box>
        {/* <Grid
        fill
        rows={["xxsmall", "flex"]}
        columns={["flex", "flex"]}
        gap="xsmall"
        areas={[
          { name: "header", start: [0, 0], end: [1, 0] },
          { name: "sim", start: [0, 1], end: [0, 1] },
          { name: "editor", start: [1, 1], end: [1, 1] },
        ]}
      >
        <Box gridArea="header" background="#9b0000" direction='row' justify='between' align='center' pad='small'>
          Puppeteer
          
        
      </Grid> */}
      </Grommet>
    </ThemeProvider>
  );
}

export default App;
