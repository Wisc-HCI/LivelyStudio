import React from "react";
// import AceEditor from "react-ace";
// import useStore from "../store";
import { Box } from "grommet";
import { Alert, IconButton, Badge, AppBar, Toolbar, Typography } from "@mui/material";
import { DropMenu, RootSettings } from "./Elements/DropMenu";
import useStore from "./store";
import { FiThumbsUp, FiSettings, FiGrid } from "react-icons/fi";
import { DEFAULTS } from "./defaults";
import DefaultRobots from "./DefaultRobots";
// import { StatusInfo, StatusGood, StatusWarning, FormDown } from 'grommet-icons';

export const Menu = ({ mode, setMode }) => {
  const urdf = useStore((state) => state.urdf);
  const setUrdf = useStore((state) => state.setUrdf);
  const isValid = useStore((state) => state.isValid);
  const marker = urdf === DEFAULTS.urdf ? "warning" : !isValid ? "error" : null;

  return (
    <AppBar position="static" component='nav' >
      <Toolbar variant="dense">
        {/* <Alert
        sx={{ height: "30px" }}
        variant="filled"
        severity="success"
        icon={<FiThumbsUp />}
      >
        Some alert text
      </Alert> */}
      <Typography variant='h6' component='div' sx={{flexGrow:1}}>
        {mode=== 'setup' ? "Setup" : "Editor"}
      </Typography>
        {mode === "setup" && (
          <>
            <DropMenu
              size="xsmall"
              label="Defaults"
              onSelect={(v) => setUrdf(DefaultRobots[v])}
              options={[
                { value: "ur3", label: "UR3" },
                { value: "panda", label: "Panda" },
              ]}
            />
            <RootSettings/>
          </>
        )}
        <Badge
          invisible={marker === null}
          color={marker ? marker : "pop"}
          badgeContent={marker === "warning" || "error" ? "!" : null}
          overlap="circular"
        >
          <IconButton
            size="small"
            //disabled={mode === "setup" && marker !== null}
            color="pop"
            onClick={() => setMode(mode === "default" ? "setup" : "default")}
          >
            {mode === "default" ? <FiSettings /> : <FiGrid />}
          </IconButton>
        </Badge>
      </Toolbar>
    </AppBar>
  );
};
