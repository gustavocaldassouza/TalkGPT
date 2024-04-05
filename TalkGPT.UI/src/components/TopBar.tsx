import ChatIcon from "@mui/icons-material/Chat";
import SettingsIcon from "@mui/icons-material/Settings";
import {
  Alert,
  Button,
  CircularProgress,
  Drawer,
  List,
  Snackbar,
} from "@mui/material";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Toolbar from "@mui/material/Toolbar";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import * as React from "react";
import Setting from "../models/Setting";
import SettingButton from "./SettingButton";
import SettingOption from "../models/SettingOption";
import { useState } from "react";
import MenuIcon from "@mui/icons-material/Menu";
import Chat from "../models/Chat";
import ChatButton from "./ChatButton";
import { blue } from "@mui/material/colors";
import AlertDialogSlide from "./AlertDialogSlide";

const models: SettingOption[] = [
  { label: "gpt-3.5-turbo", value: true },
  { label: "gpt-4-turbo-preview", value: false },
];
const voices: SettingOption[] = [
  { label: "echo", value: true },
  { label: "alloy", value: false },
  { label: "fable", value: false },
  { label: "onyx", value: false },
  { label: "nova", value: false },
  { label: "shimmer", value: false },
];

const settings: Setting[] = [
  { label: "API Key Settings", id: 0 },
  { label: "Context Settings", id: 1 },
  { label: "Model Settings", id: 2, nested: true, list_nested: models },
  { label: "Voice Settings", id: 3, nested: true, list_nested: voices },
  {
    label: "Response Settings",
    id: 4,
    nested: true,
    list_nested: [
      { label: "Text and Voice", value: true },
      { label: "Text Only", value: false },
    ],
  },
  {
    label: "Style Settings",
    id: 5,
    nested: true,
    list_nested: [
      { label: "Light Mode", value: true },
      { label: "Dark Mode", value: false },
    ],
  },
];

interface TopBarProps {
  onHandleStyleChange: (lightMode: string) => void;
  onHandleOpenAiKey: (keyExist: boolean) => void;
  onHandleChatSelect: (chat: Chat) => void;
}

function TopBar({
  onHandleStyleChange,
  onHandleOpenAiKey,
  onHandleChatSelect,
}: TopBarProps) {
  const [open, setOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [error, setError] = useState(false);
  const [chatList, setChatList] = useState<Chat[]>();
  const [chatToDeleteId, setChatToDeleteId] = useState(0);

  function handleClose(_event: React.SyntheticEvent | Event, reason?: string) {
    if (reason === "clickaway") {
      return;
    }

    setOpen(false);
  }

  const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(
    null
  );
  const [settingsOpen, setSettingsOpen] = React.useState(false);
  const [chatOpen, setChatOpen] = React.useState(false);

  function handleCloseUserMenu(): void {
    setAnchorElUser(null);
  }

  function handleAiKeyChange(key: string = "") {
    if (key === "") {
      setMessage("API Key cannot be empty");
      setError(true);
      setOpen(true);
      return;
    }
    fetch(`http://localhost:3000/chat/set/key/${key}`, { method: "PUT" })
      .then(async (response) => {
        if (!response.ok) {
          const text = await response.text();
          throw new Error(text);
        }
      })
      .then(() => {
        setError(false);
        setMessage("API Key updated successfully");
        onHandleOpenAiKey(true);
        setOpen(true);
      })
      .catch((error) => {
        let messageError = "";
        try {
          messageError = JSON.parse(error.message).message;
        } catch (err) {
          if (error instanceof Error) {
            messageError = error.message;
          }
        }
        setMessage(messageError);
        setError(true);
        setOpen(true);
      });
  }

  function handleModelChange(model: string) {
    fetch(`http://localhost:3000/chat/set/model/${model}`, { method: "PUT" })
      .then(async (response) => {
        if (!response.ok) {
          const text = await response.text();
          throw new Error(text);
        }
      })
      .then(() => {
        setError(false);
        setMessage("Model updated successfully");
        setOpen(true);
        return true;
      })
      .catch((error) => {
        let messageError = "";
        try {
          messageError = JSON.parse(error.message).message;
        } catch (err) {
          if (error instanceof Error) {
            messageError = error.message;
          }
        }
        setMessage(messageError);
        setError(true);
        setOpen(true);
        return false;
      });
  }

  function handleVoiceChange(voice: string) {
    fetch(`http://localhost:3000/chat/set/voice/${voice}`, { method: "PUT" })
      .then(async (response) => {
        if (!response.ok) {
          const text = await response.text();
          throw new Error(text);
        }
      })
      .then(() => {
        setError(false);
        setMessage("Voice updated successfully");
        setOpen(true);
      })
      .catch((error) => {
        let messageError = "";
        try {
          messageError = JSON.parse(error.message).message;
        } catch (err) {
          if (error instanceof Error) {
            messageError = error.message;
          }
        }
        setMessage(messageError);
        setError(true);
        setOpen(true);
      });
  }

  function handleContextChange(context: string = "") {
    if (context === "") {
      setMessage("Context cannot be empty");
      setError(true);
      setOpen(true);
      return;
    }
    fetch(`http://localhost:3000/chat/set/context/${context}`, {
      method: "PUT",
    })
      .then(async (response) => {
        if (!response.ok) {
          const text = await response.text();
          throw new Error(text);
        }
      })
      .then(() => {
        setError(false);
        setMessage("Context updated successfully");
        setOpen(true);
      })
      .catch((error) => {
        let messageError = "";
        try {
          messageError = JSON.parse(error.message).message;
        } catch (err) {
          if (error instanceof Error) {
            messageError = error.message;
          }
        }
        setMessage(messageError);
        setError(true);
        setOpen(true);
      });
  }

  function handleResponseChange(responseType: string) {
    let type = "1";
    if (responseType === "Text and Voice") {
      type = "0";
    }
    fetch(`http://localhost:3000/chat/set/responsetype/${type}`, {
      method: "PUT",
    })
      .then(async (response) => {
        if (!response.ok) {
          const text = await response.text();
          throw new Error(text);
        }
      })
      .then(() => {
        setError(false);
        setMessage("Response type updated successfully");
        setOpen(true);
      })
      .catch((error) => {
        let messageError = "";
        try {
          messageError = JSON.parse(error.message).message;
        } catch (err) {
          if (error instanceof Error) {
            messageError = error.message;
          }
        }
        setMessage(messageError);
        setError(true);
        setOpen(true);
      });
  }

  function handleOpenChat() {
    setLoading(true);
    fetch(`http://localhost:3000/chat`)
      .then(async (response) => {
        if (!response.ok) {
          const text = await response.text();
          throw new Error(text);
        }
        return response.json();
      })
      .then((data: Chat[]) => {
        setError(false);
        setChatList(data);
        setChatOpen(true);
        setLoading(false);
      })
      .catch((error) => {
        let messageError = "";
        try {
          messageError = JSON.parse(error.message).message;
        } catch (err) {
          if (error instanceof Error) {
            messageError = error.message;
          }
        }
        setMessage(messageError);
        setError(true);
        setOpen(true);
        setLoading(false);
      });
  }

  function handleClickChat(chat?: Chat, closeChat: boolean = true) {
    setChatOpen(!closeChat);
    if (!chat) {
      //new chat
      chat = {
        id: 0,
        messages: [],
        createdAt: "",
      };
    }
    onHandleChatSelect(chat);
  }

  function handleDeleteChat(id: number) {
    setChatToDeleteId(id);
  }

  function handleConfirmDelete() {
    if (chatToDeleteId === 0) return;
    setLoading(true);
    fetch(`http://localhost:3000/chat/${chatToDeleteId}`, { method: "DELETE" })
      .then(async (response) => {
        if (!response.ok) {
          const text = await response.text();
          throw new Error(text);
        }
      })
      .then(() => {
        setError(false);
        setMessage("Chat deleted successfully");
        setOpen(true);
        setChatList((prevChatList) =>
          prevChatList?.filter((chat) => chat.id !== chatToDeleteId)
        );
        setChatToDeleteId(0);
        handleClickChat(undefined, false);
        setLoading(false);
      })
      .catch((error) => {
        let messageError = "";
        try {
          messageError = JSON.parse(error.message).message;
        } catch (err) {
          if (error instanceof Error) {
            messageError = error.message;
          }
        }
        setMessage(messageError);
        setError(true);
        setOpen(true);
        setLoading(false);
      });
  }

  function handleCloseDelete() {
    setChatToDeleteId(0);
  }

  return (
    <>
      {chatToDeleteId > 0 && (
        <AlertDialogSlide
          handleConfirm={handleConfirmDelete}
          handleClose={handleCloseDelete}
          loading={loading}
        />
      )}
      <AppBar position="static">
        <Container maxWidth="xl">
          <Snackbar
            anchorOrigin={{ vertical: "top", horizontal: "center" }}
            open={open}
            autoHideDuration={3000}
            onClose={handleClose}
          >
            <Alert
              onClose={handleClose}
              severity={error ? "error" : "success"}
              variant="filled"
              sx={{ width: "100%" }}
            >
              {message}
            </Alert>
          </Snackbar>
          <Toolbar disableGutters sx={{ justifyContent: "space-between" }}>
            <Box display={{ md: "flex" }}>
              {loading && (
                <CircularProgress
                  size={"40px"}
                  sx={{
                    color: blue[500],
                    position: "absolute",
                    zIndex: 1,
                  }}
                />
              )}
              <IconButton sx={{ p: 0 }} onClick={handleOpenChat}>
                <MenuIcon sx={{ m: 1, color: "white" }} />
              </IconButton>
              <Box display={{ md: "flex" }} mt={1} ml={1}>
                <ChatIcon sx={{ display: { md: "flex" }, mr: 1 }} />
                <Typography
                  variant="h6"
                  noWrap
                  component="a"
                  sx={{
                    mr: 2,
                    display: { md: "flex" },
                    fontWeight: 700,
                    color: "inherit",
                    textDecoration: "none",
                  }}
                >
                  TalkGPT
                </Typography>
              </Box>
            </Box>
            <Box sx={{ flexGrow: 0 }}>
              <Tooltip title="Open settings">
                <IconButton onClick={() => setSettingsOpen(true)} sx={{ p: 0 }}>
                  <SettingsIcon sx={{ m: 1, color: "white" }} />
                </IconButton>
              </Tooltip>
              <Menu
                sx={{ mt: "45px" }}
                id="menu-appbar"
                anchorEl={anchorElUser}
                anchorOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                keepMounted
                transformOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                open={Boolean(anchorElUser)}
                onClose={() => handleCloseUserMenu()}
              >
                {settings.map((setting) => (
                  <MenuItem key={setting.id} onClick={handleCloseUserMenu}>
                    <Typography textAlign="center">{setting.label}</Typography>
                  </MenuItem>
                ))}
              </Menu>
            </Box>
          </Toolbar>
          <Drawer
            anchor={"left"}
            open={settingsOpen}
            onClose={() => setSettingsOpen(false)}
          >
            <List>
              {settings.map((setting: Setting) => (
                <SettingButton
                  onAiKeyChange={handleAiKeyChange}
                  onContextChange={handleContextChange}
                  onModelChange={handleModelChange}
                  onVoiceChange={handleVoiceChange}
                  onResponseChange={handleResponseChange}
                  key={setting.id}
                  setting={setting}
                  onHandleStyleChange={onHandleStyleChange}
                />
              ))}
            </List>
          </Drawer>
          <Drawer
            anchor={"left"}
            open={chatOpen}
            onClose={() => setChatOpen(false)}
          >
            <Typography variant="button" sx={{ m: 1 }} textAlign={"center"}>
              Chat History
            </Typography>
            <Button
              variant="contained"
              sx={{ m: 1, mt: 0 }}
              onClick={() => handleClickChat()}
            >
              New chat
            </Button>
            <List
              sx={{
                bgcolor: "background.paper",
                width: "360px",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                pt: 0,
              }}
            >
              {!chatList && <CircularProgress />}
              {chatList &&
                chatList.map((chat: Chat) => (
                  <ChatButton
                    chat={chat}
                    key={chat.id}
                    handleClickChat={handleClickChat}
                    handleDeleteChat={handleDeleteChat}
                  />
                ))}
            </List>
          </Drawer>
        </Container>
      </AppBar>
    </>
  );
}
export default TopBar;
