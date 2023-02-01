import classNames from 'classnames';

import { useTrawApp } from 'hooks';
import usePlay from 'hooks/usePlay';
import moment from 'moment';
import React, { useCallback, useEffect, useMemo, useState, memo } from 'react';
import { TrawSnapshot, TRViewMode } from 'types';
import { UserAvatar } from '../Avatar/Avatar';
import BlockItemMenu from './BlockItemMenu';
import BlockTextInput from './BlockTextInput';

export interface BlockItemProps {
  userId: string;
  blockId: string;
  date: string | number;
  blockText: string;
  isVoiceBlock: boolean;
  hideUserName?: boolean;
  isPlaying?: boolean;
  beforeBlockUserId: string;
  highlightText?: string;
}

export const BlockItem = memo(
  ({ userId, blockId, date, isVoiceBlock, blockText, isPlaying, beforeBlockUserId, highlightText }: BlockItemProps) => {
    const trawApp = useTrawApp();

    const user = trawApp.useStore((state: TrawSnapshot) => state.users[userId]);
    const editorId = trawApp.useStore((state: TrawSnapshot) => state.user.id);
    const showBlockMenu = editorId === userId;

    const viewMode = trawApp.useStore((state: TrawSnapshot) => state.ui.mode);

    const [editMode, setEditMode] = useState(false);

    const { handlePlayClick } = usePlay();

    const dateStr = useMemo(() => {
      if (typeof date === 'string') {
        return date;
      } else {
        return moment(date).format('hh:mm A');
      }
    }, [date]);

    const onClick = useCallback(() => {
      if (viewMode === TRViewMode.CANVAS) {
        setEditMode(true);
        return;
      }

      if (viewMode === TRViewMode.VIDEO) {
        handlePlayClick(blockId);
        return;
      }

      if (viewMode === TRViewMode.DOC) {
        return;
      }
    }, [blockId, handlePlayClick, viewMode]);

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
            <span
              className={classNames(
                'text-sm',
                'rounded-md',
                'py-1',
                'px-0.5',
                'transition-colors',
                'break-all',
                'whitespace-pre-wrap',
                {
                  'cursor-pointer': isVoiceBlock,
                  'hover:bg-traw-grey-50': isVoiceBlock,
                  'bg-traw-purple-light': isPlaying,
                },
              )}
              onClick={onClick}
            >
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
            </span>
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

BlockItem.displayName = 'BlockItem';

export default BlockItem;
