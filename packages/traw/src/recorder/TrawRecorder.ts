import { TrawVoiceRecorder } from 'recorder/TrawVoiceRecorder';
import { SpeechRecognitionResult, TrawSpeechRecognizer } from 'recorder/TrawSpeechRecognizer';
import { onTalkingHandler, TrawTalkingDetector } from 'recorder/TrawTalkingDetector';
import { MediaStreamManager } from 'recorder/MediaStreamManager';
import {
  onBlockCreatedHandler,
  onCreatingBlockUpdatedHandler,
  onVoiceCreatedHandler,
  TrawVoiceBlockGenerator,
} from 'recorder/TrawVoiceBlockGenerator';

export interface TrawRecorderOptions {
  audioDeviceId?: string;
  audioBitsPerSecond?: number;
  speechRecognitionLanguage: string;
  audioContext?: AudioContext;
  silenceTimeout?: number;

  onTalking?: onTalkingHandler;

  onCreatingBlockUpdate?: onCreatingBlockUpdatedHandler;
  onBlockCreated?: onBlockCreatedHandler;
  onVoiceCreated?: onVoiceCreatedHandler;
}

export class TrawRecorder {
  private _audioContext: AudioContext;
  private _mediaStreamManager: MediaStreamManager;
  private _trawVoiceBlockGenerator: TrawVoiceBlockGenerator;
  private _trawVoiceRecorder: TrawVoiceRecorder;
  private _trawTalkingDetector: TrawTalkingDetector;
  private _trawSpeechRecognizer?: TrawSpeechRecognizer;

  /**
   * true when the user is exactly talking at the moment.
   * @private
   */
  private _isTalking = false;

  /**
   * true when the user is continuously talking.
   * When the user stops talking, it is going to become false after silenceTimeout.
   * While in the silenceTimeout window, it is true after stop talking.
   * @private
   */
  private _isSilent = true;

  public onTalking?: onTalkingHandler;
  public onCreatingBlockUpdate?: onCreatingBlockUpdatedHandler;
  public onBlockCreated?: onBlockCreatedHandler;
  public onVoiceCreated?: onVoiceCreatedHandler;

  constructor({
    audioDeviceId,
    audioBitsPerSecond,
    speechRecognitionLanguage,
    audioContext,
    silenceTimeout = 1800,
    onTalking,
    onCreatingBlockUpdate,
    onBlockCreated,
    onVoiceCreated,
  }: TrawRecorderOptions) {
    this.onTalking = onTalking;
    this.onCreatingBlockUpdate = onCreatingBlockUpdate;
    this.onBlockCreated = onBlockCreated;
    this.onVoiceCreated = onVoiceCreated;

    this._audioContext = audioContext ?? new AudioContext();
    this._mediaStreamManager = new MediaStreamManager({
      audioDeviceId,
      onChangeMediaStream: this._onChangeMediaStream,
    });
    this._trawVoiceBlockGenerator = new TrawVoiceBlockGenerator({
      silenceTimeout,
      speechRecognitionLanguage,
      onCreatingBlockUpdated: this.onCreatingBlockUpdate,
      onBlockCreated: this.onBlockCreated,
      onVoiceCreated: this.onVoiceCreated,
    });
    this._trawVoiceRecorder = new TrawVoiceRecorder({
      audioBitsPerSecond,
      onFileCreated: this._onFileCreated,
    });
    this._trawTalkingDetector = new TrawTalkingDetector({
      audioContext: this._audioContext,
      onTalking: this._onTalking,
      onSilence: this._onSilence,
      silenceTimeout,
    });
    if (TrawSpeechRecognizer.isSupported()) {
      this._trawSpeechRecognizer = new TrawSpeechRecognizer({
        lang: speechRecognitionLanguage,
        onRecognized: this._onRecognized,
      });
    }
  }

  public static isSupported(): boolean {
    return TrawVoiceRecorder.isSupported() && MediaStreamManager.isSupported();
  }

  public get isMuted(): boolean {
    return this._mediaStreamManager.isMuted;
  }

  public startRecording = async (): Promise<void> => {
    if (this._audioContext.state === 'suspended') {
      await this._audioContext.resume();
    } else if (this._audioContext.state === 'closed') {
      this._audioContext = new AudioContext();
      this._trawTalkingDetector.updateAudioContext(this._audioContext);
    }

    this._trawSpeechRecognizer?.startRecognition();
    await this._mediaStreamManager.startMediaStream();
    this._trawVoiceBlockGenerator.markBlockStartedAt();
    this._trawVoiceRecorder.startVoiceRecorder();
  };

  public stopRecording = (): void => {
    this._trawVoiceRecorder.stopVoiceRecorder();
    this._trawSpeechRecognizer?.stopRecognition();
    this._mediaStreamManager.stopMediaStream();
    this._onTalking(false);
  };

  public mute = (): void => {
    if (!this.isMuted) {
      this._mediaStreamManager.muteMediaStream();
      this._trawSpeechRecognizer?.stopRecognition();
    }
  };

  public unmute = (): void => {
    if (this.isMuted) {
      this._mediaStreamManager.unmuteMediaStream();
      this._trawSpeechRecognizer?.startRecognition();
    }
  };

  public changeSpeechRecognitionLanguage = (lang: string): void => {
    this._trawSpeechRecognizer?.changeLanguage(lang);
    this._trawVoiceBlockGenerator.changeSpeechRecognitionLanguage(lang);
  };

  private _onChangeMediaStream = (mediaStream?: MediaStream) => {
    this._trawVoiceRecorder.updateMediaStream(mediaStream);
    this._trawTalkingDetector.updateMediaStream(mediaStream);
  };

  private _onTalking = (isTalking: boolean) => {
    if (isTalking) {
      this._isTalking = true;
      this._isSilent = false;
      this._trawVoiceBlockGenerator.onStartTalking();
    } else {
      this._isTalking = false;
    }
    this.onTalking?.(isTalking);
  };

  private _onSilence = () => {
    this._isSilent = true;
    const isCreated = this._trawVoiceBlockGenerator.createBlock();
    if (isCreated) {
      this._trawVoiceRecorder.splitVoiceChunk();
    }
  };

  private _onRecognized = (action: 'add' | 'update', result: SpeechRecognitionResult) => {
    if (this._isSilent) {
      /*
       * Ignore recognition result when the user is not talking
       * - Changje Jeong, 2023-01-31
       *
       * It's related to Chrome echo cancellation.
       * Chrome only supports echo cancellation on WebRTC mediaStream.
       *
       * Because of it, when the user tries to use Traw through the speaker,
       * SpeechRecognition still works, which recognizes voices of others.
       *
       * To prevent dictating talks from others,
       * ignoring SpeechRecognition results when _isSilent is true.
       */
      return;
    }
    this._trawVoiceBlockGenerator.onRecognized(action, result);
  };

  private _onFileCreated = (file: File, ext: string) => {
    this._trawVoiceBlockGenerator.createBlockVoice(file, ext);
  };
}
