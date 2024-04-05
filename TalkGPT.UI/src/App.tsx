import React from "react";
import ChatContainer from "./components/ChatContainer";
import TopBar from "./components/TopBar";
import { createTheme, CssBaseline, ThemeProvider } from "@mui/material";
import Chat from "./models/Chat";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
  },
});

const lightTheme = createTheme({
  palette: {
    mode: "light",
  },
});

function App(): JSX.Element {
  const [theme, setTheme] = React.useState(lightTheme);
  const [keyExists, setKeyExists] = React.useState(false);
  const [chatSelected, setChatSelected] = React.useState<Chat>({
    id: 0,
    messages: [],
    createdAt: "",
  });

  function handleStyleChange(lightMode: string) {
    if (lightMode === "Light Mode") {
      setTheme(lightTheme);
    } else if (lightMode === "Dark Mode") {
      setTheme(darkTheme);
    }
  }

  function handleOpenAiKey(keyExist: boolean) {
    setKeyExists(keyExist);
  }

  function handleChatSelect(chat: Chat) {
    chat.messages.map((message) => {
      if (message.role === "user") {
        message.isUser = true;
      }
    });
    setChatSelected(chat);
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <TopBar
        onHandleStyleChange={handleStyleChange}
        onHandleOpenAiKey={handleOpenAiKey}
        onHandleChatSelect={handleChatSelect}
      />
      <ChatContainer keyExists={keyExists} chat={chatSelected} />
    </ThemeProvider>
  );
}

export default App;
