import { Grommet, Grid, Box, Layer } from "grommet";
import { getTheme } from "./theme";
import { Scene } from "robot-scene";
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
import { appWindow } from "@tauri-apps/api/window";
import { DEFAULTS } from "./defaults";

function App() {
  const primaryColor = "#c5050c";
  const theme = getTheme(primaryColor);
  const [editorRef, editorBounds] = useMeasure();
  const urdf = useStore((state) => state.urdf);
  const [mode, setMode] = useState(
    urdf === DEFAULTS.urdf ? "setup" : "default"
  );

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
        <Box width="100vw" height="100vh" direction="row">
          <Box
            flex
            background="#111"
            // pad="xxsmall"
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

          <Box flex background="#111" direction="column">
            {/* <Box align="center" pad="small" justify="between" direction="row" style={{boxShadow:'2px 2px 1px 1px #11111155'}}> */}
              <Menu mode={mode} setMode={setMode} />
            {/* </Box> */}
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
      </Grommet>
    </ThemeProvider>
  );
}

export default App;
