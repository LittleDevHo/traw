import classNames from 'classnames';
import { UserAvatar } from 'components/Avatar';

import { useTrawApp } from 'hooks';
import moment from 'moment';
import React, { memo, useEffect, useMemo, useState } from 'react';
import { styled } from 'stitches.config';
import { TrawSnapshot } from 'types';

import BlockItemMenu from '../BlockItemMenu';
import BlockTextInput from '../BlockTextInput';
import { BlockItemProps } from './BlockItem';

export const CanvasBlockItem = memo(
  ({ userId, blockId, date, blockText, beforeBlockUserId, highlightText }: BlockItemProps) => {
    const trawApp = useTrawApp();

    const user = trawApp.useStore((state: TrawSnapshot) => state.users[userId]);
    const editorId = trawApp.useStore((state: TrawSnapshot) => state.user.id);

    const showBlockMenu = editorId === userId;

    const [editMode, setEditMode] = useState(false);

    const dateStr = useMemo(() => {
      if (typeof date === 'string') {
        return date;
      } else {
        return moment(date).format('hh:mm A');
      }
    }, [date]);

    useEffect(() => {
      async function fetchAndSetUser() {
        if (trawApp.requestUser) {
          const user = await trawApp.requestUser(userId);
          if (user) {
            trawApp.addUser(user);
          }
        }
      }

      if (!user) {
        fetchAndSetUser();
      }
    }, [trawApp, user, userId]);

    const handleToggleEditMode = () => {
      setEditMode(!editMode);
    };

    const handleDeleteBlock = () => {
      trawApp.deleteBlock(blockId);
    };

    return (
      <div className="bg-white w-full">
        {beforeBlockUserId === userId ? null : (
          <div className="flex flex-1 flex-row items-center w-full grow gap-1 mt-3 mb-1">
            <div className="flex relative">
              {user && <UserAvatar avatarUrl={user.profileUrl} userName={user.name} size={15} />}
            </div>
            {user && <div className="font-bold text-[13px] text-traw-grey-dark">{user.name}</div>}
            <div className="text-traw-grey-100 text-[10px]">{dateStr}</div>
          </div>
        )}

        <div className={classNames('flex', 'flex-1', 'align-start', 'justify-between')}>
          {!editMode ? (
            <StyledTextContainer onClick={handleToggleEditMode}>
              {highlightText
                ? blockText.split(new RegExp(`(${highlightText})`, 'gi')).map((part, i) => (
                    <span
                      key={i}
                      style={
                        part.toLowerCase() === highlightText.toLowerCase()
                          ? { backgroundColor: 'rgb(114 110 246 / 40%)' }
                          : {}
                      }
                    >
                      {part}
                    </span>
                  ))
                : `${blockText}` || '[Empty]'}
            </StyledTextContainer>
          ) : (
            <BlockTextInput blockId={blockId} originText={blockText} endEditMode={handleToggleEditMode} />
          )}
          {showBlockMenu && (
            <BlockItemMenu handleToggleEditMode={handleToggleEditMode} handleDeleteBlock={handleDeleteBlock} />
          )}
        </div>
      </div>
    );
  },
);

const StyledTextContainer = styled('span', {
  fontSize: '$2',
  color: '$textPrimary',
  borderRadius: '6px',
  padding: '0.5px 4px',
  transitionProperty: 'color, background-color, border-color, text-decoration-color, fill, stroke',
  transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
  transitionDuration: '150ms',
  wordBreak: 'break-all',
  whiteSpace: 'pre-wrap',
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: '$traw-grey-50',
  },
});

CanvasBlockItem.displayName = 'CanvasBlockItem';

export default CanvasBlockItem;
