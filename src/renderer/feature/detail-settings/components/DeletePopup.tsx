import { LaunchType } from "@common/types";
import Button from "@render/components/new/button/Button";
import { Dialog } from "@render/components/new/popup";
import { useLaunch } from "../api/delete-launch";
import { useState } from "react";

interface DeletePopupProps {
  type: LaunchType;
  launchId: number;
}

export const DeletePopup = ({ type, launchId }: DeletePopupProps) => {
  const [open, setOpen] = useState(false);

  const deleteLaunch = useLaunch({
    id: launchId,
    type,
    mutationConfig: {
      onSuccess: () => {
        setOpen(false);
      },
    },
  });

  const handleDelete = () => {
    deleteLaunch.mutate(undefined);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <Button intent="destructive" size="small">
          Delete Configuration
        </Button>
      </Dialog.Trigger>
      <Dialog.Content>
        <Dialog.Title>Delete Configuration</Dialog.Title>
        <span>Are you sure you want to delete this configuration? This operation cannot be reversed</span>
        <Dialog.Footer>
          <Dialog.Close asChild>
            <Dialog.NegativeAction size="small">Cancel</Dialog.NegativeAction>
          </Dialog.Close>
          <Dialog.PositiveAction size="small" onClick={handleDelete} disabled={deleteLaunch.isPending}>
            {deleteLaunch.isPending ? "Deleting..." : "Confirm"}
          </Dialog.PositiveAction>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  );
};
