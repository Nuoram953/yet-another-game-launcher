import { GameReviewThoughts } from "@prisma/client";
import ButtonIcon from "@render/components/new/button/ButtonIcon";
import { debounce } from "lodash";
import { ThumbsDown, ThumbsUp, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export const ThoughtCard = ({
  note,
  onDelete,
  onUpdate,
}: {
  note: GameReviewThoughts;
  onDelete: (id: string) => void;
  onUpdate: (data: Partial<GameReviewThoughts>) => void;
}) => {
  const [text, setText] = useState(note.text);

  const debouncedUpdate = useRef(
    debounce((data: Partial<GameReviewThoughts>) => {
      onUpdate(data);
    }, 1000),
  ).current;

  useEffect(() => {
    setText(note.text);
  }, [note.id]);

  useEffect(() => {
    return () => debouncedUpdate.cancel();
  }, [debouncedUpdate]);

  return (
    <div className="flex flex-col rounded-md border border-normal bg-foreground p-3 shadow-md transition-colors hover:border-hover hover:bg-gray-600">
      <textarea
        value={text}
        onChange={(e) => {
          const value = e.target.value;
          setText(value);
          debouncedUpdate({ ...note, text: value });
        }}
        placeholder="Write a short thought…"
        className="w-full flex-1 resize-none rounded-md bg-foreground p-2 text-sm text-white placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400"
        rows={4}
      />

      <div className="mt-1 flex items-center justify-between text-[11px] text-gray-400">
        <div>
          <span>Created {new Date(note.createdAt).toLocaleDateString()}</span>
          {new Date(note.createdAt).toLocaleDateString() != new Date(note.updatedAt).toLocaleDateString() && (
            <span className="ml-2">Updated {new Date(note.updatedAt).toLocaleDateString()}</span>
          )}
        </div>

        <div className="flex gap-2">
          <ButtonIcon
            intent="tertiary"
            onClick={() => onUpdate({ id: note.id, isPositive: !note.isPositive })}
            className="p-1 text-gray-400 hover:text-green-500"
            text="Positive"
            icon={<ThumbsUp size={14} className={`${note.isPositive && "text-green-500"}`} />}
          />

          <ButtonIcon
            intent="tertiary"
            onClick={() => onUpdate({ id: note.id, isNegative: !note.isNegative })}
            className="p-1 text-gray-400 hover:text-red-500"
            text="Negative"
            icon={<ThumbsDown size={14} className={`${note.isNegative && "text-red-500"}`} />}
          />

          <ButtonIcon
            intent="tertiary"
            onClick={() => onDelete(note.id)}
            className="p-1 text-gray-400 hover:text-red-500"
            text="Remove thought"
            icon={<Trash2 size={14} />}
          />
        </div>
      </div>
    </div>
  );
};
