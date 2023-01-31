import useDeviceDetect from 'hooks/useDeviceDetect';
import React, { ReactNode } from 'react';
import { CanvasMenuMobile } from './CanvasMenu.mobile';

import { CanvasMenuDesktop } from './CanvasMenu.desktop';

export interface CanvasMenuProps {
  Room?: ReactNode;
}

export const CanvasMenu = React.memo(function TopPanel({ Room }: CanvasMenuProps) {
  const { isBrowser } = useDeviceDetect();

  return isBrowser ? <CanvasMenuDesktop Room={Room} /> : <CanvasMenuMobile Room={Room} />;
});
