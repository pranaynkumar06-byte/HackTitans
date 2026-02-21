/**
 * usePoseDetection.js
 * Custom React hook for MediaPipe Pose detection.
 * Initializes the pose model, processes webcam frames, and returns landmarks.
 */
import { useRef, useState, useCallback, useEffect } from 'react';

// MediaPipe Pose landmark connections for drawing skeleton
export const POSE_CONNECTIONS = [
    [11, 12], // shoulders
    [11, 13], [13, 15], // left arm
    [12, 14], [14, 16], // right arm
    [11, 23], [12, 24], // torso
    [23, 24], // hips
    [23, 25], [25, 27], // left leg
    [24, 26], [26, 28], // right leg
    [27, 29], [29, 31], // left foot
    [28, 30], [30, 32], // right foot
];

const FPS_CAP = 30;
const FRAME_INTERVAL = 1000 / FPS_CAP;

export default function usePoseDetection() {
    const [landmarks, setLandmarks] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isRunning, setIsRunning] = useState(false);
    const [confidence, setConfidence] = useState(0);
    const [facingMode, setFacingMode] = useState('user');
    const facingModeRef = useRef('user');

    const poseRef = useRef(null);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const streamRef = useRef(null);
    const animFrameRef = useRef(null);
    const lastFrameTimeRef = useRef(0);

    /**
     * Initialize MediaPipe Pose.
     */
    const initializePose = useCallback(async () => {
        try {
            setIsLoading(true);

            // Dynamic import for code splitting
            const { Pose } = await import('@mediapipe/pose');

            const pose = new Pose({
                locateFile: (file) =>
                    `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
            });

            pose.setOptions({
                modelComplexity: 1,          // 0=lite, 1=full, 2=heavy
                smoothLandmarks: true,
                enableSegmentation: false,
                smoothSegmentation: false,
                minDetectionConfidence: 0.5,
                minTrackingConfidence: 0.5,
            });

            pose.onResults((results) => {
                if (results.poseLandmarks) {
                    setLandmarks(results.poseLandmarks);
                    // Calculate average visibility as confidence
                    const avgVisibility =
                        results.poseLandmarks.reduce((sum, lm) => sum + (lm.visibility || 0), 0) /
                        results.poseLandmarks.length;
                    setConfidence(Math.round(avgVisibility * 100));
                } else {
                    setLandmarks(null);
                    setConfidence(0);
                }
            });

            poseRef.current = pose;
            setIsLoading(false);
        } catch (error) {
            console.error('Failed to initialize MediaPipe Pose:', error);
            setIsLoading(false);
        }
    }, []);

    /**
     * Start the camera and begin pose detection.
     */
    const startCamera = useCallback(async (videoElement, canvasElement, mode) => {
        videoRef.current = videoElement;
        canvasRef.current = canvasElement;
        const useMode = mode || facingModeRef.current;

        try {
            // Stop existing stream if any
            if (streamRef.current) {
                streamRef.current.getTracks().forEach((track) => track.stop());
            }

            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: useMode,
                    width: { ideal: 1280 },
                    height: { ideal: 960 },
                },
                audio: false,
            });

            streamRef.current = stream;
            videoElement.srcObject = stream;

            await new Promise((resolve) => {
                videoElement.onloadedmetadata = () => {
                    videoElement.play();
                    resolve();
                };
            });

            setIsRunning(true);
            detectLoop();
        } catch (error) {
            console.error('Failed to start camera:', error);
        }
    }, []);

    /**
     * Switch between front and rear cameras.
     */
    const switchCamera = useCallback(async () => {
        const newMode = facingModeRef.current === 'user' ? 'environment' : 'user';
        facingModeRef.current = newMode;
        setFacingMode(newMode);

        if (isRunning && videoRef.current) {
            await startCamera(videoRef.current, canvasRef.current, newMode);
        }
    }, [isRunning, startCamera]);

    /**
     * Main detection loop with FPS cap.
     */
    const detectLoop = useCallback(() => {
        const loop = async (timestamp) => {
            if (!poseRef.current || !videoRef.current) return;

            // FPS cap
            const elapsed = timestamp - lastFrameTimeRef.current;
            if (elapsed < FRAME_INTERVAL) {
                animFrameRef.current = requestAnimationFrame(loop);
                return;
            }
            lastFrameTimeRef.current = timestamp;

            try {
                await poseRef.current.send({ image: videoRef.current });
            } catch (err) {
                // Silently handle frame processing errors
            }

            animFrameRef.current = requestAnimationFrame(loop);
        };

        animFrameRef.current = requestAnimationFrame(loop);
    }, []);

    /**
     * Stop camera and clean up resources.
     */
    const stopCamera = useCallback(() => {
        if (animFrameRef.current) {
            cancelAnimationFrame(animFrameRef.current);
            animFrameRef.current = null;
        }

        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
        }

        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }

        setIsRunning(false);
        setLandmarks(null);
        setConfidence(0);
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stopCamera();
            poseRef.current = null;
        };
    }, [stopCamera]);

    return {
        landmarks,
        isLoading,
        isRunning,
        confidence,
        facingMode,
        initializePose,
        startCamera,
        stopCamera,
        switchCamera,
        videoRef,
        canvasRef,
    };
}
