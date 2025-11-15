import { debounce } from "lodash";
import { useEffect, useMemo, useState } from "react";

type Props = {
  note: {
    id: string;
    text: string;
  };
  handleUpdateThought: (id: string, value: string) => void;
};

export const DebouncedThoughtTextarea = ({ note, handleUpdateThought }: Props) => {
  const [localText, setLocalText] = useState(note.text);

  const debouncedUpdate = useMemo(
    () =>
      debounce((value: string) => {
        handleUpdateThought(note.id, value);
      }, 300),
    [note.id, handleUpdateThought],
  );

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setLocalText(value); // keeps cursor position
    debouncedUpdate(value); // debounced save
  };

  useEffect(() => {
    setLocalText(note.text);
  }, [note.text]);

  useEffect(() => {
    return () => debouncedUpdate.cancel();
  }, [debouncedUpdate]);

  return <textarea value={localText} onChange={handleChange} />;
};
