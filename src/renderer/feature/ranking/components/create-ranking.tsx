import Button from "@render/components/new/button/Button";
import { Input } from "@render/components/new/input";
import { Dialog } from "@render/components/new/popup";
import { useCreateRanking } from "../api/create-ranking";
import { AnyFieldApi, useForm } from "@tanstack/react-form";

function FieldInfo({ field }: { field: AnyFieldApi }) {
  return (
    <>
      {field.state.meta.isTouched && !field.state.meta.isValid ? <em>{field.state.meta.errors.join(",")}</em> : null}
      {field.state.meta.isValidating ? "Validating..." : null}
    </>
  );
}

export const CreateRanking = () => {
  const createRanking = useCreateRanking({
    data: {
      name: "",
      description: "",
    },
  });
  const form = useForm({
    defaultValues: {
      name: "",
      description: "",
    },

    onSubmit: async ({ formApi, value }) => {
      await createRanking.mutateAsync(value);
      formApi.reset();
    },
  });

  return (
    <Dialog>
      <Dialog.Trigger>
        <Button text="Create" size="md" />
      </Dialog.Trigger>
      <Dialog.Content>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
          <Dialog.Title>Create a new ranking</Dialog.Title>
          <Dialog.Description className="text-subtle">
            Creating a new team will enable you to class different games{" "}
          </Dialog.Description>

          <div className="flex flex-col gap-6 py-8">
            <form.Field
              name="name"
              validators={{
                onChange: ({ value }) => (!value ? "Name is required" : undefined),
              }}
              children={(field) => (
                <>
                  <Input>
                    <Input.Label>Name</Input.Label>
                    <Input.Text
                      placeholder="Ranking's name"
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                    <Input.Help>
                      <FieldInfo field={field} />
                    </Input.Help>
                  </Input>
                </>
              )}
            />

            <form.Field
              name="description"
              children={(field) => (
                <>
                  <Input>
                    <Input.Label>Description</Input.Label>
                    <Input.Text
                      placeholder="Description"
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                  </Input>
                </>
              )}
            />
          </div>
          <Dialog.Footer>
            <Dialog.NegativeAction text="Cancel" />

            <form.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting, state.isValid]}
              children={([canSubmit, isSubmitting, isValid]) => (
                <>
                  <Dialog.PositiveAction
                    text="Create ranking"
                    type="submit"
                    disabled={!canSubmit || isSubmitting || !isValid}
                  />
                </>
              )}
            />
          </Dialog.Footer>
        </form>
      </Dialog.Content>
    </Dialog>
  );
};
