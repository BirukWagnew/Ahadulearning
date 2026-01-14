import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ReactPlayer from "react-player";
import { Slider } from "../ui/slider";
import { Button } from "../ui/button";
import {
  Maximize,
  Minimize,
  Pause,
  Play,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
} from "lucide-react";
import { toast } from "sonner";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

function VideoPlayer({
  width = "100%",
  height = "100%",
  url,
  onProgressUpdate,
  onComplete, // Added onComplete prop
  courseId,
  studentId,
  lessonId,
}) {
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [muted, setMuted] = useState(false);
  const [played, setPlayed] = useState(0);
  const [seeking, setSeeking] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [hasCompleted, setHasCompleted] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [playerError, setPlayerError] = useState(null);

  const playerRef = useRef(null);
  const playerContainerRef = useRef(null);

  const resolvedUrl = useMemo(() => {
    if (!url) return "";
    if (typeof url !== "string") return "";
    const trimmed = url.trim();
    if (!trimmed) return "";

    // Normalize windows paths/backslashes
    const normalizedSlashes = trimmed.replace(/\\/g, "/");

    if (normalizedSlashes.startsWith("http://") || normalizedSlashes.startsWith("https://")) {
      // Cloudinary: force mp4 container for better browser compatibility
      if (
        normalizedSlashes.includes("res.cloudinary.com") &&
        normalizedSlashes.includes("/video/upload/") &&
        !normalizedSlashes.includes("/video/upload/f_mp4/")
      ) {
        return normalizedSlashes.replace("/video/upload/", "/video/upload/f_mp4/");
      }
      return normalizedSlashes;
    }

    // Normalize local uploads paths
    if (normalizedSlashes.startsWith("/uploads")) {
      return `${API_BASE_URL}${normalizedSlashes}`;
    }
    if (normalizedSlashes.startsWith("uploads/")) {
      return `${API_BASE_URL}/${normalizedSlashes}`;
    }

    return normalizedSlashes;
  }, [url]);

  useEffect(() => {
    setPlayerError(null);
    setPlaying(false);
    setPlayed(0);
    setSeeking(false);
    setHasCompleted(false);
  }, [resolvedUrl, lessonId]);

  // Play/Pause toggle
  function handlePlayAndPause() {
    if (playerError) {
      setPlayerError(null);
    }
    setPlaying(!playing);
  }

  // Update current time
  function handleProgress(state) {
    if (!seeking) {
      setPlayed(state.played);
    }
  }

  // Handle video errors and buffering
  const handleVideoError = (error) => {
    console.error('Video player error:', error);
    console.error('Video URL:', resolvedUrl || url);
    setPlayerError("Video failed to load");
    setPlaying(false);

    // Try to recover by reloading
    if (playerRef.current && resolvedUrl) {
      const currentTime = playerRef.current.getCurrentTime();
      console.log('Attempting to reload video from:', currentTime);
      playerRef.current.seekTo(currentTime + 0.1);
    }
  };

  // Handle buffering
  const handleBuffer = () => {
    console.log('Video is buffering...');
  };

  // Handle video ready
  const handleReady = () => {
    console.log('Video player is ready');
    console.log('Video URL:', resolvedUrl || url);
    setPlayerError(null);
  };

  function handleRewind() {
    playerRef?.current?.seekTo(playerRef?.current?.getCurrentTime() - 5);
  }

  function handleForward() {
    playerRef?.current?.seekTo(playerRef?.current?.getCurrentTime() + 5);
  }

  function handleToggleMute() {
    setMuted(!muted);
  }

  function handleSeekChange(newValue) {
    setPlayed(newValue[0]);
    setSeeking(true);
  }

  function handleSeekMouseUp() {
    setSeeking(false);
    playerRef.current?.seekTo(played);
  }

  function handleVolumeChange(newValue) {
    setVolume(newValue[0]);
  }

  function pad(string) {
    return ("0" + string).slice(-2);
  }

  function formatTime(seconds) {
    const date = new Date(seconds * 1000);
    const hh = date.getUTCHours();
    const mm = date.getUTCMinutes();
    const ss = pad(date.getUTCSeconds());
    return hh ? `${hh}:${pad(mm)}:${ss}` : `${mm}:${ss}`;
  }

  const handleFullScreen = useCallback(() => {
    if (!isFullScreen) {
      if (playerContainerRef?.current.requestFullscreen) {
        playerContainerRef?.current?.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }, [isFullScreen]);

  // fullscreen change listener
  useEffect(() => {
    const handleFullScreenChange = () => {
      setIsFullScreen(document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullScreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullScreenChange);
    };
  }, []);

  // Check enrollment on mount
  useEffect(() => {
    const checkEnrollment = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `${API_BASE_URL}/api/enrollments/check?studentId=${studentId}&courseId=${courseId}`,
          {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          }
        );
        const data = await response.json();
        setIsEnrolled(data?.isEnrolled || false);
      } catch (error) {
        console.error("Error checking enrollment:", error);
      }
    };

    if (studentId && courseId) {
      checkEnrollment();
    }
  }, [studentId, courseId]);

  // Save progress only if enrolled
  useEffect(() => {
    if (played < 0.99 || hasCompleted || !isEnrolled) return;

    setHasCompleted(true);

    const updateProgress = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_BASE_URL}/api/progress`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            studentId,
            courseId,
            lessonId,
          }),
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Failed to update progress");
        }

        toast.success("Lesson marked as completed!");
        onProgressUpdate?.({
          studentId,
          courseId,
          lessonId,
          isCompleted: true,
          progressValue: played,
        });
        onComplete?.(); // Call onComplete when lesson is marked as completed
      } catch (error) {
        console.error("Error updating progress:", error);
        toast.error("Failed to mark lesson as completed.");
      }
    };

    updateProgress();
  }, [played, hasCompleted, isEnrolled, studentId, courseId, lessonId, onProgressUpdate, onComplete]);

  return (
    <div
      ref={playerContainerRef}
      className={`relative bg-gray-900 rounded-lg overflow-hidden shadow-2xl transition-all duration-300 ease-in-out ${
        isFullScreen ? "w-screen h-screen" : ""
      }`}
      style={{ width, height }}
      onMouseMove={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      <ReactPlayer
        key={resolvedUrl || 'no-url'}
        ref={playerRef}
        className="absolute top-0 left-0"
        width="100%"
        height="100%"
        url={resolvedUrl || undefined}
        playing={playing}
        volume={volume}
        muted={muted}
        onProgress={handleProgress}
        onError={handleVideoError}
        onBuffer={handleBuffer}
        onReady={handleReady}
        config={{
          file: {
            forceVideo: true,
            attributes: {
              preload: "metadata",
              playsInline: true,
            }
          }
        }}
      />

      {(!resolvedUrl || playerError) && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70 text-white p-4">
          <div className="text-center max-w-xl">
            <div className="text-sm font-semibold mb-2">
              {playerError ? "Video failed to load" : "No video URL provided"}
            </div>
            {resolvedUrl && (
              <div className="text-xs opacity-80 break-all mb-3">{resolvedUrl}</div>
            )}
            {resolvedUrl && (
              <Button
                variant="secondary"
                onClick={() => window.open(resolvedUrl, "_blank", "noopener,noreferrer")}
              >
                Open Video in New Tab
              </Button>
            )}
          </div>
        </div>
      )}

      {hasCompleted && isEnrolled && (
        <div className="absolute top-4 right-4 bg-green-600 text-white px-3 py-1 text-sm rounded">
          Completed
        </div>
      )}

      {!isEnrolled && (
        <div className="absolute top-4 right-4 bg-yellow-500 text-white px-3 py-1 text-sm rounded">
          Preview Mode
        </div>
      )}

      {showControls && (
        <div className="absolute bottom-0 left-0 right-0 bg-gray-800 bg-opacity-75 p-4">
          <Slider
            value={[played * 100]}
            max={100}
            step={0.1}
            onValueChange={(value) => handleSeekChange([value[0] / 100])}
            onValueCommit={handleSeekMouseUp}
            className="w-full mb-4"
          />
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button onClick={handlePlayAndPause} variant="ghost" size="icon" className="text-white">
                {playing ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
              </Button>
              <Button onClick={handleRewind} variant="ghost" size="icon" className="text-white">
                <RotateCcw className="h-6 w-6" />
              </Button>
              <Button onClick={handleForward} variant="ghost" size="icon" className="text-white">
                <RotateCw className="h-6 w-6" />
              </Button>
              <Button onClick={handleToggleMute} variant="ghost" size="icon" className="text-white">
                {muted ? <VolumeX className="h-6 w-6" /> : <Volume2 className="h-6 w-6" />}
              </Button>
              <Slider
                value={[volume * 100]}
                max={100}
                step={1}
                onValueChange={(value) => handleVolumeChange([value[0] / 100])}
                className="w-24"
              />
            </div>
            <div className="flex items-center space-x-2">
              <div className="text-white">
                {formatTime(played * (playerRef?.current?.getDuration() || 0))}/{" "}
                {formatTime(playerRef?.current?.getDuration() || 0)}
              </div>
              <Button onClick={handleFullScreen} variant="ghost" size="icon" className="text-white">
                {isFullScreen ? <Minimize className="h-6 w-6" /> : <Maximize className="h-6 w-6" />}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default VideoPlayer;