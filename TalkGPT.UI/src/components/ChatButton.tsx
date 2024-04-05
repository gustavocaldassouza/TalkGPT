import { Box, Button, IconButton, Typography } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import Chat from "../models/Chat";

interface ChatButtonProps {
  chat: Chat;
  handleClickChat(chat: Chat): void;
  handleDeleteChat(id: number): void;
}

export default function ChatButton({
  chat,
  handleClickChat,
  handleDeleteChat,
}: ChatButtonProps) {
  return (
    <Box
      sx={{
        width: "95%",
        mb: 1,
        ":hover": { backgroundColor: "lightgray" },
      }}
    >
      <Button
        sx={{ width: "calc(100% - 40px)", color: "black" }}
        onClick={() => handleClickChat(chat)}
      >
        <Box display="flex" flexDirection={"column"} width={"100%"}>
          <Typography
            variant="body2"
            textOverflow={"ellipsis"}
            textAlign={"left"}
            color="textPrimary"
            noWrap
          >
            {chat.messages[chat.messages.length - 1]?.content}
          </Typography>
          <Typography variant="caption" textAlign={"left"} color="textPrimary">
            {new Date(chat.createdAt).toLocaleString()}
          </Typography>
        </Box>
      </Button>
      <IconButton aria-label="delete" onClick={() => handleDeleteChat(chat.id)}>
        <DeleteIcon />
      </IconButton>
    </Box>
  );
}
