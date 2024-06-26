import * as React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Slide from "@mui/material/Slide";
import { TransitionProps } from "@mui/material/transitions";
import { LoadingButton } from "@mui/lab";
import { Typography } from "@mui/material";

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="right" ref={ref} {...props} />;
});

interface AlertDialogSlideProps {
  handleConfirm: () => void;
  handleClose: () => void;
  loading: boolean;
}

export default function AlertDialogSlide({
  handleConfirm,
  handleClose,
  loading,
}: AlertDialogSlideProps) {
  return (
    <Dialog
      open={true}
      TransitionComponent={Transition}
      keepMounted
      onClose={handleClose}
      aria-describedby="alert-dialog-slide-description"
    >
      <DialogTitle>{"Delete Chat?"}</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-slide-description">
          Do you wish to delete this chat? <br />
          <Typography variant="button" color="red">
            All data will be permanently deleted.
          </Typography>
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button size="large" variant="contained" onClick={handleClose}>
          Disagree
        </Button>
        <LoadingButton size="large" loading={loading} onClick={handleConfirm}>
          Agree
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}
