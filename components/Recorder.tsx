import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  Dispatch,
  SetStateAction,
} from 'react';
import cn from 'classnames';
import styled from 'styled-components';
import axios from 'axios';
import Loading from './Loading';
import RecorderIcon from './RecorderIcon';
import { getRecorderId } from './helper';

/*
  Adaptation of react-media-recorder: https://github.com/0x006F/react-media-recorder/blob/master/src/index.ts
*/

type StatusMessages =
  | 'media_aborted'
  | 'permission_denied'
  | 'no_specified_media_found'
  | 'media_in_use'
  | 'invalid_media_constraints'
  | 'no_constraints'
  | 'recorder_error'
  | 'idle'
  | 'acquiring_media'
  | 'delayed_start'
  | 'recording'
  | 'stopping'
  | 'stopped';

enum RecorderErrors {
  AbortError = 'media_aborted',
  NotAllowedError = 'permission_denied',
  NotFoundError = 'no_specified_media_found',
  NotReadableError = 'media_in_use',
  OverconstrainedError = 'invalid_media_constraints',
  TypeError = 'no_constraints',
  NONE = '',
  NO_RECORDER = 'recorder_error',
}

interface Props {
  onStop: (url: string, cardId: number) => void;
  blobUrl: string;
  listId?: number;
  cardId?: number;
  setDisableAll?: Dispatch<SetStateAction<boolean>>;
  fullDisable?: boolean;
  playList?: boolean;
  socket?: SocketIOClient.Socket;
  title?: string;
}

const StyledAudioWrapper = styled.section`
  audio {
    &.disabled {
      &::-webkit-media-controls-play-button {
        pointer-events: none;
        opacity: 0.5;
      }
    }
    &:focus {
      outline: none;
    }
  }

  & .recording {
    background: red;
  }
`;

const Recorder = ({
  onStop,
  blobUrl,
  listId,
  cardId,
  fullDisable,
  setDisableAll,
  playList,
  socket,
  title,
}: Props) => {
  const [hovering, setHovering] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loop, setLoop] = useState(false);
  const mediaRecorderOptions = null;
  // for individual recorder components
  const [disabledRecord, setDisableRecord] = useState(false);
  const [disabledStop, setDisableStop] = useState(true);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const mediaChunks = useRef<Blob[]>([]);
  const mediaStream = useRef<MediaStream | null>(null);
  const [status, setStatus] = useState<StatusMessages>('idle');

  const [mediaBlobUrl, setMediaBlobUrl] = useState<string | null>(blobUrl);
  const [error, setError] = useState<keyof typeof RecorderErrors>('NONE');

  // set up basic variables for app
  const getMediaStream = useCallback(async () => {
    if (status !== 'acquiring_media') {
      setStatus('acquiring_media');
    }
    const requiredMedia: MediaStreamConstraints = {
      audio: true,
    };
    try {
      const stream = await window.navigator.mediaDevices.getUserMedia(
        requiredMedia
      );
      mediaStream.current = stream;
      if (status !== 'idle') {
        setStatus('idle');
      }
    } catch (e) {
      if (error !== e.name) {
        setError(e.name);
      }
      if (status !== 'idle') {
        setStatus('idle');
      }
    }
  }, []);

  useEffect(() => {
    if (!window.MediaRecorder) {
      throw new Error('Unsupported Browser');
    }

    if (mediaRecorderOptions && mediaRecorderOptions.mimeType) {
      if (!MediaRecorder.isTypeSupported(mediaRecorderOptions.mimeType)) {
        console.error(
          `The specified MIME type you supplied for MediaRecorder doesn't support this browser`
        );
      }
    }

    async function loadStream() {
      await getMediaStream();
    }

    if (!mediaStream.current) {
      loadStream();
    }
  }, [getMediaStream, mediaRecorderOptions]);

  useEffect(() => {
    console.log(status);
  }, [status]);

  useEffect(() => {
    if (blobUrl && mediaBlobUrl !== blobUrl) {
      setMediaBlobUrl(blobUrl);
    }
  }, [blobUrl]);

  const startRecording = async () => {
    setDisableAll(true);
    socket.emit('recording', {
      recording: true,
    });
    setDisableRecord(true);
    setDisableStop(false);
    setError('NONE');
    if (!mediaStream.current) {
      await getMediaStream();
    }

    if (mediaStream.current) {
      mediaRecorder.current = new MediaRecorder(mediaStream.current);

      mediaRecorder.current.ondataavailable = onRecordingActive;

      mediaRecorder.current.onstop = await onRecordingStop;
      mediaRecorder.current.onerror = () => {
        setError('NO_RECORDER');
        setStatus('idle');
      };
      mediaRecorder.current.start();
      setStatus('recording');
    }
  };

  const onRecordingActive = ({ data }: BlobEvent) => {
    mediaChunks.current.push(data);
  };

  const onRecordingStop = async () => {
    const blobProperty: BlobPropertyBag = { type: 'audio/wav' };
    const blob = new Blob(mediaChunks.current, blobProperty);

    const data = new FormData();
    data.append('soundBlob', blob, `${title}.wav`);

    const result = await axios.post('/api/upload', data, {
      headers: { 'content-type': 'multipart/form-data' },
    });

    const url = (result && result.data) || '';

    setMediaBlobUrl(url);
    onStop(url, cardId);
    setStatus('stopped');
  };

  const stopRecording = () => {
    if (mediaRecorder.current) {
      setDisableAll(false);
      socket.emit('recording', {
        recording: false,
      });
      setDisableRecord(false);
      setDisableStop(true);
      setStatus('stopping');
      mediaRecorder.current.stop();
    }
  };

  return (
    <StyledAudioWrapper>
      {/* <canvas className="visualizer" height="60px"></canvas> */}
      <div id="buttons">
        <button
          disabled={disabledRecord || fullDisable || playList}
          className={cn('record', {
            recording: disabledRecord,
          })}
          onClick={startRecording}
        >
          Record
        </button>
        <button
          className="stop"
          disabled={disabledStop}
          onClick={stopRecording}
        >
          Stop
        </button>
        <label htmlFor="loop">Loop</label>
        <input type="checkbox" onClick={() => setLoop(!loop)} />
        <div>
          {mediaBlobUrl ? (
            <audio
              id={getRecorderId(listId, cardId, blobUrl)}
              className={cn({
                disabled: fullDisable,
              })}
              muted={fullDisable}
              src={mediaBlobUrl}
              controls
              loop={loop}
            />
          ) : (
            <div
              onDrop={async (e) => {
                e.preventDefault();
                if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                  setLoading(true);
                  setDisableAll(true);
                  const data = new FormData();
                  data.append(
                    'soundBlob',
                    e.dataTransfer.files[0],
                    e.dataTransfer.files[0].name
                  );

                  const result = await axios.post('/api/upload', data, {
                    headers: { 'content-type': 'multipart/form-data' },
                  });

                  const url = (result && result.data) || '';

                  if (url) {
                    setMediaBlobUrl(url);
                    onStop(url, cardId);
                  }

                  setLoading(false);
                  setDisableAll(false);
                }
              }}
              onDragOver={(e) => {
                e.preventDefault();
                if (!hovering && e.dataTransfer.items && e.dataTransfer.items.length > 0) {
                  setHovering(true);
                }
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                if (hovering) {
                  setHovering(false);
                }
              }}
              className={cn("dropzone", {
                hovering
              })}
            >
              {(loading || status === 'recording' ) && (
                <div className="dropzoneStatus">
                  { status === 'recording' && <RecorderIcon/>}
                  { loading && <Loading />}
                </div>
              )}
              Drop files here
            </div>
          )}
        </div>
        {error && error !== 'NONE' && <span>{error}</span>}
      </div>
    </StyledAudioWrapper>
  );
};

export default Recorder;
