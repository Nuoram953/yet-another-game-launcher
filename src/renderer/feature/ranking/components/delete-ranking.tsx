import { useNavigate, useParams } from "@tanstack/react-router";
import { useDeleteRanking } from "../api/delete-ranking";
import { Dialog } from "@render/components/new/popup";
import Button from "@render/components/new/button/Button";
import { Divider } from "@render/components/new/divider/Divider";

export const DeleteRanking = () => {
  const { id } = useParams({ from: "/ranking/$id" });
  const navigate = useNavigate();

  const deleteRanking = useDeleteRanking({
    id: Number(id),
    mutationConfig: {
      onSuccess: () => {
        navigate({
          to: "/ranking",
        });
      },
    },
  });

  return (
    <div className="flex flex-col justify-center gap-4">
      <div className="flex justify-center">
        <Dialog>
          <Dialog.Trigger>
            <Button intent={"tertiary"} text="Delete this ranking" />
          </Dialog.Trigger>
          <Dialog.Content>
            <Dialog.Title>Delete ranking</Dialog.Title>
            Are you sure you want to delete this ranking? <b>This action is not reversible.</b>
            <Dialog.Footer>
              <Dialog.NegativeAction text="Cancel" size={"md"} />
              <Dialog.PositiveAction
                intent={"destroy"}
                size="md"
                text="Delete"
                disabled={deleteRanking.isPending}
                onClick={() => {
                  deleteRanking.mutate(Number(id));
                }}
              />
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog>
      </div>
    </div>
  );
};
