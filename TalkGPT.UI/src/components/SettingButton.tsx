import {
  Button,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  TextField,
} from "@mui/material";
import KeyIcon from "@mui/icons-material/Key";
import FormatQuoteIcon from "@mui/icons-material/FormatQuote";
import PsychologyIcon from "@mui/icons-material/Psychology";
import RecordVoiceOverIcon from "@mui/icons-material/RecordVoiceOver";
import {
  ExpandLess,
  ExpandMore,
  SpatialTrackingSharp,
} from "@mui/icons-material";
import LightModeIcon from "@mui/icons-material/LightMode";
import React, { useEffect } from "react";
import SettingOption from "../models/SettingOption";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import Setting from "../models/Setting";
import echoSound from "../assets/echo.wav";
import alloySound from "../assets/alloy.wav";
import fableSound from "../assets/fable.wav";
import onyxSound from "../assets/onyx.wav";
import novaSound from "../assets/nova.wav";
import shimmerSound from "../assets/shimmer.wav";

interface SettingButtonProps {
  setting: Setting;
  onAiKeyChange: (aiKey: string) => void;
  onContextChange: (context: string) => void;
  onModelChange: (model: string) => void;
  onVoiceChange: (voice: string) => void;
  onResponseChange: (response: string) => void;
  onHandleStyleChange: (lightMode: string) => void;
}

export default function SettingButton({
  setting,
  onAiKeyChange,
  onContextChange,
  onModelChange,
  onVoiceChange,
  onResponseChange,
  onHandleStyleChange,
}: SettingButtonProps) {
  const [open, setOpen] = React.useState(false);
  const [openDialog, setOpenDialog] = React.useState(false);
  const [dialogTitle, setDialogTitle] = React.useState("");
  const [dialogInput, setDialogInput] = React.useState("");
  const [dialogContent, setDialogContent] = React.useState("");
  const [selectedValue, setSelectedValue] = React.useState("");
  const [audioPreview, setAudioPreview] = React.useState<HTMLAudioElement>();

  useEffect(() => {
    if (audioPreview) {
      audioPreview.play();
    }
  }, [audioPreview]);

  useEffect(() => {
    if (selectedValue) {
      if (setting.id === 5) {
        onHandleStyleChange(selectedValue);
        setting.list_nested!.map((item: SettingOption) => {
          if (item.value && item.label !== selectedValue) {
            item.value = false;
          }
          if (item.label === selectedValue) {
            item.value = true;
          }
        });
        return;
      }
    }
  }, [onHandleStyleChange, selectedValue, setting.id, setting.list_nested]);

  function handleButton() {
    setOpen(!open);
    if (!setting.nested) {
      setOpenDialog(true);
    }
    if (setting.id === 0) {
      setDialogTitle("Change API Key");
      setDialogInput("API Key");
    } else if (setting.id === 1) {
      setDialogTitle("Change Context");
      setDialogInput("Context");
    } else if (setting.id === 2) {
      setDialogTitle("Change Model");
    } else if (setting.id === 3) {
      setDialogTitle("Change Voice");
    } else if (setting.id === 4) {
      setDialogTitle("Change Response");
    }
  }

  function handleButtonSetting(index: number) {
    const option = setting.list_nested![index];
    setSelectedValue(option.label);
    if (setting.id === 2) {
      setDialogContent(
        "Are you sure you want to change the model to " + option.label + "?"
      );
    } else if (setting.id === 3) {
      setDialogContent(
        "Are you sure you want to change the voice to " + option.label + "?"
      );
    } else if (setting.id === 4) {
      setDialogContent(
        "Are you sure you want to change the response to " + option.label + "?"
      );
    }

    if (setting.id === 5) return;
    setOpenDialog(true);
  }

  function handleClose(confirm: boolean) {
    if (confirm) {
      if (setting.id === 0) {
        onAiKeyChange(selectedValue);
      } else if (setting.id === 1) {
        onContextChange(selectedValue);
      } else if (setting.id === 2) {
        onModelChange(selectedValue);
        setting.list_nested!.map((item: SettingOption) => {
          if (item.value && item.label !== selectedValue) {
            item.value = false;
          }
          if (item.label === selectedValue) {
            item.value = true;
          }
        });
      } else if (setting.id === 3) {
        onVoiceChange(selectedValue);
        setting.list_nested!.map((item: SettingOption) => {
          if (item.value && item.label !== selectedValue) {
            item.value = false;
          }
          if (item.label === selectedValue) {
            item.value = true;
          }
        });
      } else if (setting.id === 4) {
        onResponseChange(selectedValue);
        setting.list_nested!.map((item: SettingOption) => {
          if (item.value && item.label !== selectedValue) {
            item.value = false;
          }
          if (item.label === selectedValue) {
            item.value = true;
          }
        });
      }
    }
    setOpenDialog(false);
    if (audioPreview) {
      audioPreview.pause();
      audioPreview.currentTime = 0;
      setAudioPreview(undefined);
    }
  }

  function handlePreview() {
    if (audioPreview) {
      audioPreview.pause();
      audioPreview.currentTime = 0;
      setAudioPreview(undefined);
    } else {
      if (selectedValue === "echo") {
        const audio = new Audio(echoSound);
        setAudioPreview(audio);
      } else if (selectedValue === "alloy") {
        const audio = new Audio(alloySound);
        setAudioPreview(audio);
      } else if (selectedValue === "fable") {
        const audio = new Audio(fableSound);
        setAudioPreview(audio);
      } else if (selectedValue === "onyx") {
        const audio = new Audio(onyxSound);
        setAudioPreview(audio);
      } else if (selectedValue === "nova") {
        const audio = new Audio(novaSound);
        setAudioPreview(audio);
      } else if (selectedValue === "shimmer") {
        const audio = new Audio(shimmerSound);
        setAudioPreview(audio);
      }
    }
  }

  return (
    <>
      <ListItem
        key={setting.id}
        disablePadding
        sx={{ mr: 5 }}
        onClick={handleButton}
      >
        <ListItemButton>
          <ListItemIcon sx={{ width: "auto" }}>
            {setting.id === 0 && <KeyIcon />}
            {setting.id === 1 && <FormatQuoteIcon />}
            {setting.id === 2 && <PsychologyIcon />}
            {setting.id === 3 && <RecordVoiceOverIcon />}
            {setting.id === 4 && <SpatialTrackingSharp />}
            {setting.id === 5 && <LightModeIcon />}
          </ListItemIcon>
          <ListItemText primary={setting.label} />
          {setting.nested && open && <ExpandLess />}
          {setting.nested && !open && <ExpandMore />}
        </ListItemButton>
      </ListItem>
      {setting.nested && (
        <Collapse in={open} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {setting.list_nested!.map((item: SettingOption, index) => (
              <ListItemButton
                sx={{ pl: 4 }}
                key={index}
                onClick={() => handleButtonSetting(index)}
              >
                <ListItemIcon>{item.value && <CheckCircleIcon />}</ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            ))}
          </List>
        </Collapse>
      )}
      <Dialog
        fullWidth
        open={openDialog}
        onClose={() => handleClose(false)}
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle>{dialogTitle}</DialogTitle>
        <DialogContent>
          {!setting.nested && (
            <TextField
              fullWidth
              id="outlined-basic"
              label={dialogInput}
              value={selectedValue}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                setSelectedValue(event.target.value);
              }}
              variant="outlined"
              sx={{ mt: 1 }}
            />
          )}
          {setting.nested && (
            <DialogContentText id="alert-dialog-slide-description">
              {dialogContent}
            </DialogContentText>
          )}
        </DialogContent>
        <DialogActions>
          {setting.id === 3 && (
            <Button
              onClick={handlePreview}
              sx={{ color: audioPreview ? "red" : "primary" }}
            >
              {audioPreview ? "Stop" : "Preview"}
            </Button>
          )}
          <Button onClick={() => handleClose(false)}>Cancel</Button>
          <Button onClick={() => handleClose(true)}>Confirm</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
