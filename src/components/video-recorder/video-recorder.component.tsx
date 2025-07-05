import { useEffect, useRef, useState } from "react";
import styles from "./video-recorder.module.css";

export function VideoRecorder() {
  // ---------------------------------------------------------------------------
  // variables
  // ---------------------------------------------------------------------------

  const [isPaused, setIsPaused] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [recorder, setRecorder] = useState<MediaRecorder | null>(null);

  const stream = useRef<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // ---------------------------------------------------------------------------
  // effects
  // ---------------------------------------------------------------------------

  useEffect(() => {
    getMediaStream();
    return () => {
      if (stream.current) {
        stream.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // ---------------------------------------------------------------------------
  // functions
  // ---------------------------------------------------------------------------

  async function getMediaStream() {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      stream.current = mediaStream;
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      alert("Error in getMediaStream: " + err);
    }
  }

  const startRecording = () => {
    if (stream.current) {
      const mediaRecorder = new MediaRecorder(stream.current);
      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: "video/webm" });
        const url = URL.createObjectURL(blob);
        setVideoUrl(url);
      };

      mediaRecorder.start();
      setRecorder(mediaRecorder);
      setIsRecording(true);
    }
  };

  const toggleRecording = () => {
    if (recorder && !isPaused) {
      recorder.stop();
      // setIsRecording(false);
      setIsPaused(true);
    } else if (recorder && isPaused) {
      getMediaStream();
      setTimeout(() => {
        startRecording();
      }, 1000);
      setIsPaused(false);
      setVideoUrl(null);
    }
  };

  // ---------------------------------------------------------------------------
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>🎥 Record video</h1>

      {!videoUrl && (
        <video ref={videoRef} autoPlay muted className={styles.liveVideo} />
      )}

      <div className={styles.buttonContainer}>
        {!isRecording ? (
          <button className={styles.startButton} onClick={startRecording}>
            ⏺ Start Recording
          </button>
        ) : (
          <button className={styles.pauseButton} onClick={toggleRecording}>
            {isPaused ? "🔴 Resume" : "⏸ Pause"}
          </button>
        )}
      </div>

      {videoUrl && (
        <div className={styles.previewContainer}>
          <video src={videoUrl} controls className={styles.previewVideo} />
          <a
            href={videoUrl}
            download="recorded-video.webm"
            className={styles.downloadLink}
          >
            ⬇️ Download vide
          </a>
        </div>
      )}
    </div>
  );
}

export default VideoRecorder;
