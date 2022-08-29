import * as React from "react";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { Divider, TextField } from "@mui/material";
import useStore from "../store";
import shallow from "zustand/shallow";

export const DropMenu = ({ label, options, onSelect }) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <div>
      <Button
        color='pop'
        id="basic-button"
        aria-controls={open ? "basic-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        onClick={handleClick}
      >
        {label}
      </Button>
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          "aria-labelledby": "basic-button",
        }}
      >
        {options.map((o) => (
          <MenuItem
            key={o.value}
            onClick={() => {
              handleClose();
              if (onSelect) {
                onSelect(o.value)
              }
            }}
          >
            {o.label}
          </MenuItem>
        ))}
      </Menu>
    </div>
  );
};

export const RootSettings = () => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const setRootBound = useStore(state=>state.setRootBound,shallow);
  const rootBounds = useStore(state=>state.rootBounds,shallow);

  return (
    <div>
      <Button
        color='pop'
        id="drop-settings-button"
        aria-controls={open ? "drop-settings-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        onClick={handleClick}
      >
        Root
      </Button>
      <Menu
        id="drop-settings-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          "aria-labelledby": "drop-settings-button",
        }}
      >
        <MenuItem></MenuItem>
        <MenuItem key='pos-x'>
          <TextField size='small' label='Position X' value={rootBounds[0].value} sx={{marginRight:1}} onChange={(e)=>setRootBound(e.target.value,0,true)}/> 
          <TextField size='small' label='Position X (Delta)' value={rootBounds[0].delta} onChange={(e)=>setRootBound(e.target.value,0,false)}/> 
        </MenuItem>
        <MenuItem key='pos-y'>
          <TextField size='small' label='Position Y' value={rootBounds[1].value} sx={{marginRight:1}} onChange={(e)=>setRootBound(e.target.value,1,true)}/> 
          <TextField size='small' label='Position Y (Delta)' value={rootBounds[1].delta} onChange={(e)=>setRootBound(e.target.value,1,false)}/> 
        </MenuItem>
        <MenuItem key='pos-z'>
          <TextField size='small' label='Position Z' value={rootBounds[2].value} sx={{marginRight:1}} onChange={(e)=>setRootBound(e.target.value,2,true)}/> 
          <TextField size='small' label='Position Z (Delta)' value={rootBounds[2].delta} onChange={(e)=>setRootBound(e.target.value,2,false)}/> 
        </MenuItem>
        <Divider orientation="horizontal"/>
        <MenuItem key='rot-r'>
          <TextField size='small' label='Rotation R' value={rootBounds[3].value} sx={{marginRight:1}} onChange={(e)=>setRootBound(e.target.value,3,true)}/> 
          <TextField size='small' label='Rotation R (Delta)' value={rootBounds[3].delta} onChange={(e)=>setRootBound(e.target.value,3,false)}/> 
        </MenuItem>
        <MenuItem key='rot-p'>
          <TextField size='small' label='Rotation P' value={rootBounds[4].value} sx={{marginRight:1}} onChange={(e)=>setRootBound(e.target.value,4,true)}/> 
          <TextField size='small' label='Rotation P (Delta)' value={rootBounds[4].delta} onChange={(e)=>setRootBound(e.target.value,4,false)}/> 
        </MenuItem>
        <MenuItem key='rot-y'>
          <TextField size='small' label='Rotation Y' value={rootBounds[5].value} sx={{marginRight:1}} onChange={(e)=>setRootBound(e.target.value,5,true)}/> 
          <TextField size='small' label='Rotation Y (Delta)' value={rootBounds[5].delta} onChange={(e)=>setRootBound(e.target.value,5,false)}/> 
        </MenuItem>
      </Menu>
    </div>
  );
};