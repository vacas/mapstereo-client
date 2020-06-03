import React, { ReactElement, useCallback, useEffect, useRef, useState, Dispatch, SetStateAction } from "react";

/*
  Adaptation of react-media-recorder: https://github.com/0x006F/react-media-recorder/blob/master/src/index.ts
*/

type StatusMessages =
  | "media_aborted"
  | "permission_denied"
  | "no_specified_media_found"
  | "media_in_use"
  | "invalid_media_constraints"
  | "no_constraints"
  | "recorder_error"
  | "idle"
  | "acquiring_media"
  | "delayed_start"
  | "recording"
  | "stopping"
  | "stopped";

  enum RecorderErrors {
    AbortError = "media_aborted",
    NotAllowedError = "permission_denied",
    NotFoundError = "no_specified_media_found",
    NotReadableError = "media_in_use",
    OverconstrainedError = "invalid_media_constraints",
    TypeError = "no_constraints",
    NONE = "",
    NO_RECORDER = "recorder_error"
  }

  interface Props {
    onStop: Dispatch<SetStateAction<string>>;
    blobUrl: string;
    listId?: number;
    cardId?: number;
  }

const Recorder = ({ onStop, blobUrl, listId, cardId }: Props) => {
  // const audioRef = useRef(null);
  const [loop, setLoop] = useState(false);
  const mediaRecorderOptions = null;
  const [disabledRecord, setDisableRecord] = useState(false);
  const [disabledStop, setDisableStop] = useState(true);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const mediaChunks = useRef<Blob[]>([]);
  const mediaStream = useRef<MediaStream | null>(null);
  const [status, setStatus] = useState<StatusMessages>("idle");

  const [mediaBlobUrl, setMediaBlobUrl] = useState<string | null>(blobUrl);
  const [error, setError] = useState<keyof typeof RecorderErrors>("NONE");

  // // @ts-ignore
  // console.log('audioRef: ', audioRef.paused);
  

  // set up basic variables for app
  const getMediaStream = useCallback(async () => {
    setStatus("acquiring_media");
    const requiredMedia: MediaStreamConstraints = {
      audio: true
    };
    try {
      const stream = await window.navigator.mediaDevices.getUserMedia(
        requiredMedia
      );
      mediaStream.current = stream;
      setStatus("idle");
    } catch (error) {
      setError(error.name);
      setStatus("idle");
    }
  }, []);

  useEffect(() => {
    if (!window.MediaRecorder) {
      throw new Error("Unsupported Browser");
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

  const startRecording = async () => {
    setDisableRecord(true);
    setDisableStop(false);
    setError("NONE");
    if (!mediaStream.current) {
      await getMediaStream();
    }
    if (mediaStream.current) {
      mediaRecorder.current = new MediaRecorder(mediaStream.current);
      mediaRecorder.current.ondataavailable = onRecordingActive;
      mediaRecorder.current.onstop = onRecordingStop;
      mediaRecorder.current.onerror = () => {
        setError("NO_RECORDER");
        setStatus("idle");
      };
      mediaRecorder.current.start();
      setStatus("recording");
    }
  };

  const onRecordingActive = ({ data }: BlobEvent) => {
    mediaChunks.current.push(data);
  };

  const onRecordingStop = () => {
    const blobProperty: BlobPropertyBag = { type: "audio/wav" };
    const blob = new Blob(mediaChunks.current, blobProperty);
    const url = URL.createObjectURL(blob);
    setStatus("stopped");
    setMediaBlobUrl(url);
    onStop(url);
  };

  const stopRecording = () => {
    if (mediaRecorder.current) {
      setDisableRecord(false);
      setDisableStop(true);
      setStatus("stopping");
      mediaRecorder.current.stop();
    }
  };

  return (
    <section className="main-controls">
      {/* <canvas className="visualizer" height="60px"></canvas> */}
      <div id="buttons">
        <button
          disabled={disabledRecord}
          className="record" 
          onClick={startRecording}
          style={{
            background: disabledRecord && 'red'
          }}
        >Record</button>
        <button 
          className="stop"
          disabled={disabledStop}
          onClick={stopRecording}
        >Stop</button>
        <label htmlFor="loop">Loop</label>
        <input type="checkbox" onClick={() => setLoop(!loop)}/>
        <div>
          <audio
            id={`${listId ? `listId-${listId}-`:''}${cardId ? `cardId-${cardId}-`:''}${blobUrl}`}
            src={mediaBlobUrl}
            controls
            loop={loop} 
            onPause={(e)=> {
              // if audio was paused on its full duration, i.e. it finished playing, and is playing a list, then move on to next audio item
              if (e.currentTarget.currentTime === e.currentTarget.duration && !loop) {

              }
            }}
          />
        </div>
        {error && error !== 'NONE' && (
          <span>{error}</span>
        )}
      </div>
    </section>
  )
}

export default Recorder;