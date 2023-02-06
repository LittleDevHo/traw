import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { MagnifyingGlassIcon, CopyIcon } from '@radix-ui/react-icons';
import React, { useState } from 'react';

import {
  AlignStyle,
  ColorStyle,
  DashStyle,
  FontStyle,
  ShapeStyles,
  SizeStyle,
  TDShapeType,
  TDSnapshot,
} from '@tldraw/tldraw';
import { DMContent, DMRadioItem } from 'components/Primitives/DropdownMenu';
import { ToolButton } from 'components/Primitives/ToolButton';
import {
  ALIGN_ICONS,
  ColorGrid,
  currentStyleSelector,
  DASH_ICONS,
  FontIcon,
  selectedIdsSelector,
  SIZE_ICONS,
  StyledGroup,
  STYLE_KEYS,
  themeSelector,
} from 'components/ToolsPanel/StyleMenu';
import { useTldrawApp } from 'hooks/useTldrawApp';
import { CircleIcon } from 'icons/CircleIcon';
import SvgTransparency from 'icons/Transparency';
import SvgTrash from 'icons/Trash';
import { fills, strokes } from 'state/shapes/shared';
import { breakpoints } from 'utils/breakpoints';
import { preventEvent } from 'utils/preventEvent';
import { useTrawApp } from 'hooks';
import classNames from 'classnames';

interface EditWidgetProps {
  camera: {
    point: number[];
    zoom: number;
  };
  top: number;
  left: number;
}

const optionsSelector = (s: TDSnapshot) => {
  const options: string[] = [];
  const { currentPageId: pageId } = s.appState;
  const page = s.document.pages[pageId];
  for (const id of s.document.pageStates[pageId].selectedIds) {
    if (!page.shapes[id]) continue;
    if ('text' in page.shapes[id]) options.push(TDShapeType.Text);
    if ('label' in page.shapes[id]) options.push('label');
    if (page.shapes[id].type) options.push(page.shapes[id].type);
  }
  return options;
};

const EditWidget = ({ camera, top, left }: EditWidgetProps) => {
  const [widgetHint, setWidgetHint] = useState<string | undefined>(undefined);

  const trawApp = useTrawApp();
  const app = useTldrawApp();

  const theme = app.useStore(themeSelector);

  const options = app.useStore(optionsSelector);
  const currentStyle = app.useStore(currentStyleSelector);

  const selectedIds = app.useStore(selectedIdsSelector);

  const [displayedStyle, setDisplayedStyle] = React.useState(currentStyle);
  const rDisplayedStyle = React.useRef(currentStyle);

  React.useEffect(() => {
    setWidgetHint(undefined);

    if (options.length === 0) return;

    if (options.includes(TDShapeType.Arrow)) {
      setWidgetHint('You can connect each objects');
      return;
    }

    if (
      options.includes(TDShapeType.Ellipse) ||
      options.includes(TDShapeType.Rectangle) ||
      options.includes(TDShapeType.Triangle)
    ) {
      setWidgetHint('Press Enter or double click to add text');
      return;
    }
  }, [options]);

  React.useEffect(() => {
    const {
      appState: { currentStyle },
      page,
      selectedIds,
    } = app;
    let commonStyle = {} as ShapeStyles;
    if (selectedIds.length <= 0) {
      commonStyle = currentStyle;
    } else {
      const overrides = new Set<string>([]);
      app.selectedIds
        .map((id) => page.shapes[id])
        .forEach((shape) => {
          STYLE_KEYS.forEach((key) => {
            if (overrides.has(key)) return;
            if (commonStyle[key] === undefined) {
              // @ts-ignore
              commonStyle[key] = shape.style[key];
            } else {
              if (commonStyle[key] === shape.style[key]) return;
              // @ts-ignore
              commonStyle[key] = shape.style[key];
              overrides.add(key);
            }
          });
        });
    }
    // Until we can work out the correct logic for deciding whether or not to
    // update the selected style, do a string comparison. Yuck!
    if (JSON.stringify(commonStyle) !== JSON.stringify(rDisplayedStyle.current)) {
      rDisplayedStyle.current = commonStyle;
      setDisplayedStyle(commonStyle);
    }
  }, [currentStyle, selectedIds, app]);

  const handleDashChange = React.useCallback(
    (value: string) => {
      app.style({ dash: value as DashStyle });
    },
    [app],
  );

  const handleSizeChange = React.useCallback(
    (value: string) => {
      app.style({ size: value as SizeStyle });
    },
    [app],
  );

  const handleFontChange = React.useCallback(
    (value: string) => {
      app.style({ font: value as FontStyle });
    },
    [app],
  );

  const handleTextAlignChange = React.useCallback(
    (value: string) => {
      app.style({ textAlign: value as AlignStyle });
    },
    [app],
  );

  const handleToggleFilled = React.useCallback(() => {
    app.style({ isFilled: rDisplayedStyle.current.isFilled ? false : true });
  }, [app]);

  const handleDelete = React.useCallback(() => {
    app.delete();
  }, [app]);

  const handleFitScreen = React.useCallback(() => {
    trawApp.zoomToSelection();
  }, [trawApp]);

  const handleDuplicate = React.useCallback(() => {
    app.duplicate();
  }, [app]);

  const showFilledColor = React.useMemo(() => {
    if (options.length === 0) return false;

    if (
      options.includes(TDShapeType.Rectangle) ||
      options.includes(TDShapeType.Ellipse) ||
      options.includes(TDShapeType.Triangle)
    ) {
      return true;
    }

    return false;
  }, [options]);

  const showLineStyle = React.useMemo(() => {
    if (options.length === 0) return false;

    if (options.length === 1 && options[0] === TDShapeType.Text) return false;

    if (
      options.includes(TDShapeType.Ellipse) ||
      options.includes(TDShapeType.Rectangle) ||
      options.includes(TDShapeType.Triangle) ||
      options.includes(TDShapeType.Draw) ||
      options.includes(TDShapeType.Line) ||
      options.includes(TDShapeType.Arrow)
    ) {
      return true;
    }

    return false;
  }, [options]);

  const showTextStyle = React.useMemo(() => {
    if (options.length === 0) return false;

    if (options.includes(TDShapeType.Text) || options.includes('label')) return true;

    return false;
  }, [options]);

  if (app.readOnly) return null;

  return (
    <div
      style={{
        top: (top + camera.point[1]) * camera.zoom,
        left: (left + camera.point[0]) * camera.zoom,
      }}
      className={`z-10 absolute`}
    >
      <div
        className={classNames('absolute', 'flex', 'flex-col', 'gap-2', {
          '-top-[52px]': !widgetHint,
          '-top-[92px]': widgetHint,
        })}
      >
        <ul className="flex p-2 gap-2 items-center bg-white rounded-xl shadow-[0_10px_60px_rgba(189,188,249,0.5)]">
          {/* Fit to screen - all */}
          <li>
            <ToolButton variant="icon" onClick={handleFitScreen}>
              <MagnifyingGlassIcon />
            </ToolButton>
          </li>
          {/* color - except image */}
          {!options.includes(TDShapeType.Image) && (
            <li>
              <DropdownMenu.Root dir="ltr" modal={false}>
                <DropdownMenu.Trigger asChild id="TD-Styles">
                  <ToolButton variant="icon">
                    <CircleIcon
                      size={18}
                      strokeWidth={2.5}
                      fill="transparent"
                      stroke={strokes.light[rDisplayedStyle.current.color as ColorStyle]}
                    />
                  </ToolButton>
                </DropdownMenu.Trigger>
                <DMContent id="language-menu" side="top" align="center" sideOffset={10} alignOffset={0}>
                  <ColorGrid>
                    {Object.keys(strokes.light).map((style: string) => (
                      <DropdownMenu.Item
                        key={style}
                        onSelect={preventEvent}
                        asChild
                        id={`TD-Styles-Color-Swatch-${style}`}
                      >
                        <ToolButton
                          variant="icon"
                          isActive={displayedStyle.color === style}
                          onClick={() => app.style({ color: style as ColorStyle })}
                        >
                          <CircleIcon
                            size={18}
                            strokeWidth={2.5}
                            fill={displayedStyle.isFilled ? fills[theme][style as ColorStyle] : 'transparent'}
                            stroke={strokes.light[style as ColorStyle]}
                          />
                        </ToolButton>
                      </DropdownMenu.Item>
                    ))}
                  </ColorGrid>
                </DMContent>
              </DropdownMenu.Root>
            </li>
          )}
          {showFilledColor && (
            /** Filled color - rectangle, ellipse, triangle */
            <li>
              <ToolButton variant="icon" onClick={handleToggleFilled}>
                {displayedStyle.isFilled ? (
                  <CircleIcon
                    size={18}
                    strokeWidth={2.5}
                    fill={
                      displayedStyle.isFilled
                        ? fills[theme][rDisplayedStyle.current.color as ColorStyle]
                        : 'transparent'
                    }
                    stroke={strokes.light[rDisplayedStyle.current.color as ColorStyle]}
                  />
                ) : (
                  <SvgTransparency />
                )}
              </ToolButton>
            </li>
          )}
          {showLineStyle && (
            /**  Line Style - except text, label */
            <li>
              <DropdownMenu.Root dir="ltr" modal={false}>
                <DropdownMenu.Trigger asChild id="TD-Styles">
                  <ToolButton variant="icon">{DASH_ICONS[rDisplayedStyle.current.dash as DashStyle]}</ToolButton>
                </DropdownMenu.Trigger>
                <DMContent id="language-menu" side="top" align="center" sideOffset={10} alignOffset={0}>
                  <StyledGroup dir="ltr" value={displayedStyle.dash} onValueChange={handleDashChange}>
                    {Object.values(DashStyle).map((style) => (
                      <DMRadioItem
                        key={style}
                        isActive={style === displayedStyle.dash}
                        value={style}
                        onSelect={preventEvent}
                        bp={breakpoints}
                        id={`TD-Styles-Dash-${style}`}
                      >
                        {DASH_ICONS[style as DashStyle]}
                      </DMRadioItem>
                    ))}
                  </StyledGroup>
                </DMContent>
              </DropdownMenu.Root>
            </li>
          )}
          {/* Size - except image */}
          {!options.includes(TDShapeType.Image) && (
            <li>
              <DropdownMenu.Root dir="ltr" modal={false}>
                <DropdownMenu.Trigger asChild id="TD-Styles">
                  <ToolButton variant="icon">{SIZE_ICONS[rDisplayedStyle.current.size as SizeStyle]}</ToolButton>
                </DropdownMenu.Trigger>
                <DMContent id="language-menu" side="top" align="center" sideOffset={10} alignOffset={0}>
                  <StyledGroup dir="ltr" value={displayedStyle.size} onValueChange={handleSizeChange}>
                    {Object.values(SizeStyle).map((sizeStyle) => (
                      <DMRadioItem
                        key={sizeStyle}
                        isActive={sizeStyle === displayedStyle.size}
                        value={sizeStyle}
                        onSelect={preventEvent}
                        bp={breakpoints}
                        id={`TD-Styles-Dash-${sizeStyle}`}
                      >
                        {SIZE_ICONS[sizeStyle as SizeStyle]}
                      </DMRadioItem>
                    ))}
                  </StyledGroup>
                </DMContent>
              </DropdownMenu.Root>
            </li>
          )}

          {/* Font - text, label, rectangle*/}
          {showTextStyle && (
            <>
              <li id="TD-Styles-Font-Container">
                <DropdownMenu.Root dir="ltr" modal={false}>
                  <DropdownMenu.Trigger asChild id="TD-Styles">
                    <ToolButton variant="icon">
                      <FontIcon fontStyle={rDisplayedStyle.current.font}>Aa</FontIcon>
                    </ToolButton>
                  </DropdownMenu.Trigger>
                  <DMContent id="language-menu" side="top" align="center" sideOffset={10} alignOffset={0}>
                    <StyledGroup dir="ltr" value={displayedStyle.font} onValueChange={handleFontChange}>
                      {Object.values(FontStyle).map((fontStyle) => (
                        <DMRadioItem
                          key={fontStyle}
                          isActive={fontStyle === displayedStyle.font}
                          value={fontStyle}
                          onSelect={preventEvent}
                          bp={breakpoints}
                          id={`TD-Styles-Font-${fontStyle}`}
                        >
                          <FontIcon fontStyle={fontStyle}>Aa</FontIcon>
                        </DMRadioItem>
                      ))}
                    </StyledGroup>
                  </DMContent>
                </DropdownMenu.Root>
              </li>

              {/* Align */}
              {options.includes(TDShapeType.Text) && rDisplayedStyle.current.textAlign && (
                <li>
                  <DropdownMenu.Root dir="ltr" modal={false}>
                    <DropdownMenu.Trigger asChild id="TD-Styles">
                      <ToolButton variant="icon">{ALIGN_ICONS[rDisplayedStyle.current.textAlign]}</ToolButton>
                    </DropdownMenu.Trigger>
                    <DMContent id="language-menu" side="top" align="center" sideOffset={10} alignOffset={0}>
                      <StyledGroup dir="ltr" value={displayedStyle.textAlign} onValueChange={handleTextAlignChange}>
                        {Object.values(AlignStyle).map((style) => (
                          <DMRadioItem
                            key={style}
                            isActive={style === displayedStyle.textAlign}
                            value={style}
                            onSelect={preventEvent}
                            bp={breakpoints}
                            id={`TD-Styles-Align-${style}`}
                          >
                            {ALIGN_ICONS[style]}
                          </DMRadioItem>
                        ))}
                      </StyledGroup>
                    </DMContent>
                  </DropdownMenu.Root>
                </li>
              )}
            </>
          )}

          {/* Duplicate - all */}
          <li>
            <ToolButton variant="icon" onClick={handleDuplicate}>
              <CopyIcon />
            </ToolButton>
          </li>

          {/* Delete - all */}
          <li>
            <ToolButton variant="icon" onClick={handleDelete}>
              <SvgTrash />
            </ToolButton>
          </li>
        </ul>
        {widgetHint && (
          <div className="flex items-center justify-center text-xs text-traw-grey-200 select-none">{widgetHint}</div>
        )}
      </div>
    </div>
  );
};

export default EditWidget;
