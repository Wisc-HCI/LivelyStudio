import { Grommet, Grid, Box } from "grommet";
import { getTheme } from "./theme";
import { Scene } from 'robot-scene';
import { Environment } from 'simple-vp';
import useStore from './store';
import useMeasure from 'react-use-measure';

function App() {
  const primaryColor = "#c5050c";
  const theme = getTheme(primaryColor);
  const [editorRef, editorBounds] = useMeasure();

  // console.log(Scene)

  return (
    <Grommet full theme={theme}>
      <Grid
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
        <Box gridArea="header" background="#9b0000" justify='center' pad='small'>Puppeteer</Box>
        <Box gridArea="sim" round='xsmall' background="#44444477" pad='xxsmall' style={{overflow:'hidden'}}>
        <Scene
              displayTfs={true}
              displayGrid={true}
              isPolar={false}
              backgroundColor='#1e1e1e'
              planeColor='#141414'
              highlightColor={primaryColor}
              plane={-0.75}
              fov={50}
              store={useStore}
              // onPointerMissed={clearFocus}
              // paused={paused}
          />
        </Box>
        <Box ref={editorRef} gridArea="editor" round='xsmall' background="#44444477" align='center' justify='center'>
          <Environment store={useStore} highlightColor={primaryColor} height={editorBounds.height-5} width={editorBounds.width-5} snapToGrid={false}/>
        </Box>
      </Grid>
    </Grommet>
  );
}

export default App;
