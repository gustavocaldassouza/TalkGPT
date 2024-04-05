import KeyboardVoiceIcon from "@mui/icons-material/KeyboardVoice";
import MicOffIcon from "@mui/icons-material/MicOff";
import SendIcon from "@mui/icons-material/Send";
import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  IconButton,
  LinearProgress,
  Snackbar,
  TextField,
  Typography,
} from "@mui/material";
import { format } from "date-fns";
import { MouseEvent, useEffect, useRef, useState } from "react";
import Message from "../models/Message";
import Chat from "../models/Chat";
import LoadingButton from "@mui/lab/LoadingButton";
import DeleteIcon from "@mui/icons-material/Delete";

const mimeType = "audio/webm";

interface ChatProps {
  keyExists: boolean;
  chat: Chat;
}

export default function ChatContainer({ keyExists, chat }: ChatProps) {
  const [chatSelected, setChatSelected] = useState<Chat>(chat);
  const [seconds, setSeconds] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("AI Thinking");
  const [status, setStatus] = useState<boolean>(false);
  const [stream, setStream] = useState<MediaStream>();
  const [permission, setPermission] = useState(false);
  const mediaRecorder = useRef<MediaRecorder>();
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [open, setOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [textFieldMessage, setTextFieldMessage] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [canAutoPlay, setCanAutoPlay] = useState(false);

  useEffect(() => {
    async function fetchAudios() {
      if (chat.messages.length > 0) {
        setLoading(true);
        setLoadingMessage("Fetching messages");
      }

      await Promise.all(
        chat.messages.map(async (message: Message) => {
          if (message.audio) {
            const blob = await fetchAudio(message.id);
            if (blob) {
              message.audio = URL.createObjectURL(blob);
            }
          }
        })
      );

      setChatSelected({ ...chat }); // Trigger a re-render after all audios are set
      setLoading(false);
    }

    setChatSelected({
      id: 0,
      messages: [],
      createdAt: "",
    });
    fetchAudios();
    setCanAutoPlay(false);
  }, [chat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatSelected.messages]);

  useEffect(() => {
    const timer =
      timerActive && setInterval(() => setSeconds(seconds + 1), 1000);
    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [timerActive, seconds]);

  useEffect(() => {
    async function transcribeAudio() {
      setLoading(true);
      setLoadingMessage("Transcribing audio");
      const audioBlob = new Blob([...audioChunks], { type: mimeType });
      const formData = new FormData();
      formData.append("audio", audioBlob, "audio.webm");

      fetch("http://localhost:3000/chat/transcribe", {
        method: "POST",
        body: formData,
      })
        .then(async (response) => {
          if (!response.ok) {
            const text = await response.text();
            throw new Error(text);
          }
          return response.json();
        })
        .then((data: Message) => {
          let audioBlob;
          let audioUrl;

          if (audioChunks.length !== 0) {
            audioBlob = new Blob([...audioChunks], { type: mimeType });
            audioUrl = URL.createObjectURL(audioBlob);
          }

          let last_message_id = 0;
          if (chatSelected.messages.length > 0) {
            last_message_id =
              chatSelected.messages[chatSelected.messages.length - 1].id + 1;
          }
          const message: Message = {
            isUser: true,
            content: data.content,
            id: last_message_id + 1,
            audio_preview: audioUrl,
            chatId: chatSelected.id,
            preview: true,
            audio: data.audio,
          };
          setChatSelected({
            ...chatSelected,
            messages: [...chatSelected.messages, message],
          });
          setLoading(false);
          setAudioChunks([]);
        })
        .catch((error) => {
          setOpen(true);
          setErrorMessage(JSON.parse(error.message).message);
        });
    }
    if (!status && audioChunks.length > 0) {
      transcribeAudio();
    }
  }, [status, audioChunks, chatSelected]);

  function stopTimer() {
    setTimerActive(false);
  }

  function startTimer() {
    setTimerActive(true);
  }

  function handleClose(_event: React.SyntheticEvent | Event, reason?: string) {
    if (reason === "clickaway") {
      return;
    }

    setOpen(false);
  }

  async function fetchAudio(id: number): Promise<Blob | void> {
    try {
      const resp = await fetch("http://localhost:3000/chat/audio/" + id, {
        method: "GET",
      });
      if (!resp.ok) {
        const text = await resp.text();
        throw new Error(text);
      }
      return await resp.blob();
      /* eslint-disable @typescript-eslint/no-explicit-any */
    } catch (error: any) {
      let errorMessage = "";
      try {
        errorMessage = JSON.parse(error.message).message;
      } catch (err) {
        if (err instanceof Error) {
          errorMessage = error.message;
        }
      }
      setErrorMessage(errorMessage);
      setOpen(true);
    }
  }

  function handleMicrophone() {
    if (!keyExists) {
      setErrorMessage("Set a key first");
      setOpen(true);
      return;
    }
    if (chatSelected.messages.length > 0) {
      if (
        chatSelected.messages[chatSelected.messages.length - 1].preview &&
        !chatSelected.messages[chatSelected.messages.length - 1].cancelled
      ) {
        setErrorMessage(
          "You have a preview message. Cancel or confirm the preview first."
        );
        setOpen(true);
        return;
      }
    }
    if (permission) {
      if (status) {
        stopTimer();
        stopRecording();
        return;
      }
      setSeconds(0);
      startTimer();
      startRecording();
      return;
    }
    getMicrophonePermission();
  }

  function handleCancelPreview(message: Message) {
    setChatSelected({
      ...chatSelected,
      messages: chatSelected.messages.map((msg) => {
        if (msg.id === message.id) {
          msg.cancelled = true;
          msg.preview = false;
        }
        return msg;
      }),
    });
  }

  function handleDeletePreview(message: Message) {
    if (message.cancelled) {
      setChatSelected({
        ...chatSelected,
        messages: chatSelected.messages.filter((msg) => msg.id !== message.id),
      });
    }
  }

  async function handleSend(
    event: React.KeyboardEvent | MouseEvent<HTMLButtonElement>,
    message?: Message
  ) {
    event.preventDefault();
    if (!keyExists) {
      setErrorMessage("Set a key first");
      setOpen(true);
      return;
    }
    if (!textFieldMessage && !message) return;

    setAudioChunks([]);
    let last_message_id = 0;
    if (chatSelected.messages.length > 0) {
      last_message_id =
        chatSelected.messages[chatSelected.messages.length - 1].id + 1;
    }
    if (!message) {
      const newMessage: Message = {
        isUser: true,
        content: textFieldMessage,
        id: last_message_id + 1,
        chatId: chatSelected.id,
        createdAt: new Date().toISOString(),
      };
      startChat(newMessage);
    } else {
      startChat(message);
    }

    setCanAutoPlay(true);
    setSeconds(0);
    setAudioChunks([]);
    setTextFieldMessage("");
  }

  async function getMicrophonePermission() {
    if ("MediaRecorder" in window) {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: false,
        });
        setPermission(true);
        setStream(mediaStream);
      } catch (err) {
        if (err instanceof Error) {
          alert(err.message);
        }
      }
    } else {
      alert("The MediaRecorder API is not supported in your browser.");
    }
  }

  function startRecording() {
    if (!stream) {
      return;
    }
    setStatus(true);
    const media = new MediaRecorder(stream, { mimeType: mimeType });
    mediaRecorder.current = media;
    mediaRecorder.current.start();
    const localAudioChunks: Blob[] = [];
    mediaRecorder.current.ondataavailable = (event) => {
      if (typeof event.data === "undefined") return;
      if (event.data.size === 0) return;
      localAudioChunks.push(event.data);
      setAudioChunks(localAudioChunks);
    };
  }

  function stopRecording() {
    mediaRecorder.current!.stop();
    setStatus(false);
  }

  async function startChat(message: Message) {
    setLoading(true);
    setLoadingMessage("AI Thinking...");
    fetch(`http://localhost:3000/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(message),
    })
      .then(async (resp) => {
        if (!resp.ok) {
          const text = await resp.text();
          throw new Error(text);
        }
        return resp.json();
      })
      .then((data: Message) => {
        getAudioFromId(data, message);
      })
      .catch((error) => {
        let errorMessage = "";
        let errorCode = "";
        try {
          errorMessage = JSON.parse(error.message).message;
          errorCode = JSON.parse(error.message).error.code;
        } catch (err) {
          if (err instanceof Error) {
            errorMessage = error.message;
          }
        }
        setLoading(false);
        setOpen(true);
        setErrorMessage(errorMessage + ": " + errorCode);
      });
  }

  function getAudioFromId(chatMessage: Message, message: Message) {
    fetch("http://localhost:3000/chat/audio/" + chatMessage.id, {
      method: "GET",
    })
      .then(async (resp) => {
        if (!resp.ok) {
          const text = await resp.text();
          throw new Error(text);
        }
        return resp.blob();
      })
      .then((blob) => {
        chatMessage.audio =
          blob.size === 0 ? undefined : URL.createObjectURL(blob);
        chatMessage.isUser = false;

        const updatedMessages = chatSelected.messages.filter(
          (msg) => !msg.preview
        );
        message.preview = false;
        message.audio = message.audio_preview;
        if (chatSelected.id === 0) {
          chatSelected.id = chatMessage.chatId ?? 0;
        }
        setChatSelected({
          ...chatSelected,
          messages: [...updatedMessages, message, chatMessage],
        });
        setLoading(false);
      })
      .catch((error) => {
        let errorMessage = "";
        try {
          errorMessage = JSON.parse(error.message).message;
        } catch (err) {
          if (err instanceof Error) {
            errorMessage = error.message;
          }
        }
        setErrorMessage(errorMessage);
        setOpen(true);
      });
  }

  return (
    <Container maxWidth="xl">
      <Box height="calc(100vh - 56px - 74px - 42px)" overflow="auto">
        <Box mt={2}></Box>
        {chatSelected.messages.map((message: Message) => (
          <Box
            display="flex"
            justifyContent={message.isUser ? "flex-end" : "flex-start"}
            key={message.id}
            sx={{
              m: "5px",
              p: 0,
              height: "auto",
            }}
          >
            <Box
              display="inline-block"
              maxWidth="50%"
              minWidth={"30%"}
              sx={{
                backgroundColor: message.isUser ? "#e8e8e8" : "#1976D2",
                color: message.isUser ? "black" : "white",
                borderRadius: message.isUser
                  ? "6px 6px 0px 6px"
                  : "6px 6px 6px 0px",
              }}
            >
              {!message.preview && message.audio && (
                <Box m={1}>
                  <audio
                    src={message.audio}
                    controls
                    autoPlay={
                      !message.isUser &&
                      canAutoPlay &&
                      message.id ===
                        chatSelected.messages[chatSelected.messages.length - 1]
                          .id
                    }
                    style={{ width: "100%" }}
                  ></audio>
                </Box>
              )}
              {message.preview && message.audio_preview && (
                <Box m={1}>
                  <audio
                    src={message.audio_preview}
                    controls
                    autoPlay={!message.isUser}
                    style={{ width: "100%" }}
                  ></audio>
                </Box>
              )}
              {!message.audio && <Box m={1}></Box>}
              {message.content && (
                <Box>
                  <Typography
                    padding="0px 10px 0px 10px"
                    variant="subtitle1"
                    color={message.cancelled ? "textSecondary" : ""}
                  >
                    {message.content}
                  </Typography>
                  {message.createdAt && (
                    <Typography
                      paddingRight="10px"
                      variant="caption"
                      textAlign={"right"}
                      width={"100%"}
                      display="block"
                    >
                      {new Date(message.createdAt).toLocaleString()}
                    </Typography>
                  )}
                </Box>
              )}
              {message.preview && (
                <Box m={1}>
                  <LoadingButton
                    variant="contained"
                    sx={{ mr: 1 }}
                    onClick={(e) => {
                      handleSend(e, message);
                    }}
                    loading={loading}
                  >
                    Accept
                  </LoadingButton>
                  <Button
                    disabled={loading}
                    onClick={() => handleCancelPreview(message)}
                  >
                    Cancel
                  </Button>
                </Box>
              )}
              {message.cancelled && (
                <Box m={1}>
                  <IconButton
                    aria-label="delete"
                    onClick={() => handleDeletePreview(message)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              )}
            </Box>
          </Box>
        ))}
        <Box ref={messagesEndRef} />
      </Box>

      <Box height={"36px"} mb={"10px"}>
        {loading && (
          <>
            <Typography ml={1} variant="overline">
              {loadingMessage}
            </Typography>
            <LinearProgress sx={{ ml: 1 }} />
          </>
        )}
      </Box>
      <Box
        sx={{
          display: "flex",
          width: "calc(100% - 5px)",
          flexDirection: "row",
          m: "5px",
        }}
      >
        <TextField
          id="standard-basic"
          label={"Type your message or speak up..."}
          variant="outlined"
          fullWidth
          value={textFieldMessage}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            setTextFieldMessage(event.target.value);
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              handleSend(event);
            }
          }}
        />
        <IconButton
          onClick={handleMicrophone}
          sx={{ color: status ? "red" : "gray" }}
        >
          <Box display={"flex"} flexDirection={"column"}>
            {permission && <KeyboardVoiceIcon sx={{ m: 1 }} />}
            {permission && status && (
              <>
                <Chip
                  sx={{ position: "absolute", bottom: 0 }}
                  size="small"
                  label={format(seconds * 1000, "m:ss")}
                  color="error"
                />
              </>
            )}
          </Box>
          {!permission && <MicOffIcon sx={{ m: 1 }} />}
        </IconButton>
        <IconButton onClick={(e) => handleSend(e)}>
          <SendIcon sx={{ m: 1 }} />
        </IconButton>
      </Box>

      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        open={open}
        autoHideDuration={6000}
        onClose={handleClose}
      >
        <Alert
          onClose={handleClose}
          severity="error"
          variant="filled"
          sx={{ width: "100%" }}
        >
          {errorMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
}
