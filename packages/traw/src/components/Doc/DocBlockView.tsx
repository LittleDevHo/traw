import classNames from 'classnames';

import { useTrawApp } from 'hooks';
import moment from 'moment';
import React, { memo, useEffect, useMemo } from 'react';
import { TrawSnapshot } from 'types';
import { UserAvatar } from '../Avatar/Avatar';
import DocImageViewer from './DocImageViewer';

export interface BlockItemProps {
  userId: string;
  blockId: string;
  date: number;
  blockText: string;
  isVoiceBlock: boolean;
  hideUserName?: boolean;
  isPlaying?: boolean;
  beforeBlockUserId: string;
  highlightText?: string;
  isFirstSection: boolean;
}

export const DockBlockView = memo(
  ({
    userId,
    isFirstSection,
    date,
    isVoiceBlock,
    blockText,
    isPlaying,
    beforeBlockUserId,
    highlightText,
  }: BlockItemProps) => {
    const trawApp = useTrawApp();

    const user = trawApp.useStore((state: TrawSnapshot) => state.users[userId]);

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

    return (
      <div className="bg-white w-full">
        {isFirstSection && <DocImageViewer time={date || 0} userId={userId} />}
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
          <span
            className={classNames(
              'text-base',
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
        </div>
      </div>
    );
  },
);

DockBlockView.displayName = 'DockBlockView';

export default DockBlockView;
