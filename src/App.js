import { Grommet, Grid, Box } from "grommet";
import { getTheme } from "./theme";
// import { Scene } from 'robot-scene';

function App() {
  const primaryColor = "#c5050c";
  const theme = getTheme(primaryColor);

  return (
    <Grommet full theme={theme}>
      <Grid
        fill
        rows={["xxsmall", "flex"]}
        columns={["flex", "flex"]}
        gap="xsmall"
        areas={[
          { name: "header", start: [0, 0], end: [1, 0] },
          { name: "nav", start: [0, 1], end: [0, 1] },
          { name: "main", start: [1, 1], end: [1, 1] },
        ]}
      >
        <Box gridArea="header" background="#9b0000" justify='center' pad='small'>Puppeteer</Box>
        <Box gridArea="nav" round='xsmall' background="#44444477">
        {/* <Scene
              displayTfs={true}
              displayGrid={true}
              isPolar={false}
              backgroundColor='#1e1e1e'
              planeColor='#141414'
              highlightColor={primaryColor}
              plane={-0.75}
              fov={50}
              // store={useStore}
              // onPointerMissed={clearFocus}
              // paused={paused}
          /> */}
        </Box>
        <Box gridArea="main" round='xsmall' background="#44444477"/>
      </Grid>
    </Grommet>
  );
}

export default App;
