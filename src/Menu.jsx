import React from "react";
// import AceEditor from "react-ace";
// import useStore from "../store";
import { Box } from "grommet";
import { Alert, IconButton, Badge } from "@mui/material";
import { DropMenu } from "./Elements/DropMenu";
import useStore from "./store";
import { FiThumbsUp, FiSettings, FiGrid } from "react-icons/fi";
import { DEFAULTS } from "./defaults";
import DefaultRobots from "./DefaultRobots";
// import { StatusInfo, StatusGood, StatusWarning, FormDown } from 'grommet-icons';

export const Menu = ({ mode, setMode }) => {
  const urdf = useStore((state) => state.urdf);
  const setUrdf = useStore(state=>state.setUrdf);
  const isValid = useStore((state) => state.isValid);
  const marker = urdf === DEFAULTS.urdf ? 'warning' : !isValid ? 'error' : null;

  return (
    <Box flex direction="row" align="center" justify="end" gap="small">
      {/* <Alert
        sx={{ height: "30px" }}
        variant="filled"
        severity="success"
        icon={<FiThumbsUp />}
      >
        Some alert text
      </Alert> */}
      {mode === "setup" && (
        <DropMenu
          label="Defaults"
          onSelect={(v) => setUrdf(DefaultRobots[v])}
          options={[
            { value: "ur3", label: "UR3" },
            { value: "panda", label: "Panda" },
          ]}
        />
      )}
      <Badge invisible={marker===null} color={marker ? marker : 'pop'} badgeContent={marker === 'warning' || 'error' ? "!" : null} overlap="circular">
        <IconButton
            disabled={mode === "setup" && marker !== null}
            color="pop"
            onClick={() => setMode(mode === "default" ? "setup" : "default")}
        >
          {mode === "default" ? <FiSettings /> : <FiGrid />}
        </IconButton>
      </Badge>
    </Box>
  );
};
