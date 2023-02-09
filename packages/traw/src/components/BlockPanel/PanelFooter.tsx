import classNames from 'classnames';
import RecordingTimer from 'components/BlockPanel/RecordingTimer';
import SpeechViewer from 'components/BlockPanel/SpeechViewer';
import { SpeakingIndicator } from 'components/Indicator';
import React, { useState } from 'react';
import { getSupportedLanguageByLocale } from 'utils/supportedLanguage';
import SvgSend from '../../icons/send';
import { TrawSpeechRecognizer } from 'recorder';

export interface PanelFooterProps {
  isRecording: boolean;
  isTalking: boolean;
  recognizedText: string;
  speechRecognitionLanguage: string;
  onCreate: (text: string) => void;
  onClickSpeechRecognitionLanguage?: () => void;
}

export const PanelFooter = ({
  isRecording,
  isTalking,
  recognizedText,
  speechRecognitionLanguage,
  onCreate,
  onClickSpeechRecognitionLanguage,
}: PanelFooterProps) => {
  const [text, setText] = useState<string | undefined>(undefined);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key !== 'Enter') return;
    if (e.shiftKey) return;
    e.preventDefault();
    if (!text) return;
    onCreate(text);
    setText('');
  };

  const handleClick = () => {
    if (!text) return;
    onCreate(text);
    setText('');
  };
  const supportedLanguage = getSupportedLanguageByLocale(speechRecognitionLanguage);

  return (
    <footer className="mt-2 mb-2 select-none">
      <div
        className={classNames(
          'flex',
          'flex-col',
          'align-items',
          'items-stretch',
          'border',
          'border-traw-divider',
          'px-2',
          'gap-3',
          'py-1.5',
          'transition-all',
          {
            'rounded-xl bg-transparent  ': isRecording,
            'rounded-none border-transparent ': !isRecording,
          },
        )}
      >
        {isRecording && (
          <>
            <div className="flex flex-row px-0.5 items-center">
              <RecordingTimer className="flex-1" />
              <button
                className="w-auto  px-1 mr-0.5 rounded-full text-xs hover:bg-gray-100"
                onClick={onClickSpeechRecognitionLanguage}
              >
                {supportedLanguage}
              </button>
              <SpeakingIndicator size={17} isSpeaking={isTalking} />
            </div>
            {TrawSpeechRecognizer.isSupported() ? (
              <SpeechViewer className="h-8 text-xs overflow-y-scroll px-0.5" text={recognizedText} />
            ) : (
              <div className="h-4" />
            )}
          </>
        )}
        <div
          className={classNames(
            'group',
            'flex',
            'items-center',
            'rounded-full',
            'py-1',
            'px-2',
            'border',
            'border-transparent',
            'bg-traw-sky focus-within:border-traw-purple focus-within:bg-transparent',
            'transition-colors',
          )}
        >
          <textarea
            className={classNames(
              'w-full',
              'resize-none',
              'text-traw-grey-dark',
              'text-xs',
              'px-1',
              'py-1.5',
              'gap-2',
              'transition-colors',
              'bg-traw-sky ',
              'focus-visible:outline-0',
              'group-focus-within:bg-transparent',
            )}
            rows={1}
            placeholder="Enter messages here."
            value={text}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
          />
          <button
            className={classNames(
              'w-4 transition-colors duration-150 text-traw-grey-100 group-focus-within:text-traw-purple ',
            )}
            onClick={handleClick}
          >
            <SvgSend className="fill-current w-4 h-4" />
          </button>
        </div>
      </div>
    </footer>
  );
};

export default PanelFooter;
