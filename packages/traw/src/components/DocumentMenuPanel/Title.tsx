import React, { useState } from 'react';
import { styled } from 'stitches.config';
import { breakpoints } from 'utils/breakpoints';

export interface TitleProps {
  title: string;
  canEdit: boolean;
  handleChangeTitle?: (title: string) => void;
}

export const Title = ({ title, canEdit, handleChangeTitle }: TitleProps) => {
  const [name, setName] = useState(title);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };

  const onBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    if (!handleChangeTitle) return;
    const newTitle = e.target.value.trim();
    if (newTitle.length === 0) {
      setName(title);
      return;
    }
    setName(newTitle);
    handleChangeTitle(newTitle);
  };
  return (
    <StyledInputLabel data-value={name} bp={breakpoints}>
      <input
        type="text"
        disabled={!canEdit}
        value={name}
        onChange={onChange}
        onBlur={onBlur}
        className="border-none focus:rounded-[5px] select-none"
      />
    </StyledInputLabel>
  );
};

const StyledInputLabel = styled('label', {
  display: 'inline-grid',
  verticalAlign: 'top',
  alignItems: 'center',
  position: 'relative',
  maxWidth: 100,
  userSelect: 'none',

  variants: {
    bp: {
      medium: {
        maxWidth: 500,
      },
    },
  },

  '&:after': {
    width: 'auto',
    minWidth: '1em',
    gridArea: '1 / 2',
    padding: '0.25em',
    margin: 0,
    content: 'attr(data-value) " "',
    visibility: 'hidden',
    whiteSpace: 'pre-wrap',
  },

  input: {
    width: 'auto',
    minWidth: '1em',
    gridArea: '1 / 2',
    padding: '0.25em',
    margin: 0,
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    color: '$textPrimary',
  },
});

export default Title;
