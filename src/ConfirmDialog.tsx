import {
  Dialog,
  DialogContent,
  Typography,
  DialogActions,
  Button,
} from "@mui/material";
import React from "react";

const ConfirmDialog = React.forwardRef(function (
  _props: {},
  ref: React.Ref<{ show: (message?: string) => Promise<boolean> }>
) {
  const [open, setOpen] = React.useState(false);
  const [message, setMessage] = React.useState("");
  const onConfirm = React.useRef<(value: boolean) => void>();

  React.useImperativeHandle(
    ref,
    () => ({
      show: async (message?: string) => {
        setMessage(message || "Are you sure?");
        setOpen(true);
        return new Promise<boolean>((resolve) => {
          onConfirm.current = resolve;
        });
      },
    }),
    []
  );

  return (
    <Dialog open={open}>
      <DialogContent>
        <Typography>{message}</Typography>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => {
            onConfirm.current!(true);
            setOpen(false);
          }}
          color="error"
        >
          Confirm
        </Button>
        <Button
          color="info"
          onClick={() => {
            onConfirm.current!(false);
            setOpen(false);
          }}
        >
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
});

export default ConfirmDialog;
