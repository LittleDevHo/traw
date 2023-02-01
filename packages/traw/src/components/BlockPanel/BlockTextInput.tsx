import { useTrawApp } from 'hooks';
import React, { useEffect, useRef, useState } from 'react';

interface BlockTextInputProps {
  blockId: string;
  originText: string;
  endEditMode: () => void;
}

const BlockTextInput = ({ blockId, originText, endEditMode }: BlockTextInputProps) => {
  const trawApp = useTrawApp();
  const [newValue, setNewValue] = useState(originText);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleBlockTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewValue(e.target.value);
  };

  const handleEditEnd = () => {
    endEditMode();
    trawApp.editBlock(blockId, newValue);
  };

  useEffect(() => {
    setTimeout(() => {
      if (!textareaRef.current) return;
      textareaRef.current.style.cssText = 'height:auto; padding:0';

      textareaRef.current.style.cssText = `height: calc(${textareaRef.current.scrollHeight}px + 1rem)`;
    }, 0);
  }, [textareaRef, newValue]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Escape') {
      setNewValue(originText);
      endEditMode();
      return;
    }
    if (e.key !== 'Enter') return;
    if (e.shiftKey) return;
    handleEditEnd();
  };

  useEffect(() => {
    if (!textareaRef.current) return;
    textareaRef.current.focus();
    textareaRef.current.selectionStart = textareaRef.current.value.length;
  }, [textareaRef]);

  return (
    <>
      <textarea
        ref={textareaRef}
        className="text-sm rounded-md px-0.5 py-1 transition-colors bg-traw-grey-50 w-full resize-none "
        value={newValue}
        onChange={handleBlockTextChange}
        onBlur={handleEditEnd}
        onKeyDown={handleKeyDown}
      />
    </>
  );
};

export default BlockTextInput;
