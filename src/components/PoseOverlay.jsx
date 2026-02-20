/**
 * PoseOverlay.jsx
 * Canvas overlay that draws the MediaPipe skeleton on top of the camera feed.
 * Draws landmark points and connecting lines with color-coded quality feedback.
 */
import { useEffect, useRef } from 'react';
import { POSE_CONNECTIONS } from '../hooks/usePoseDetection';

const LANDMARK_COLOR = '#39ff14';
const CONNECTION_COLOR = 'rgba(0, 212, 255, 0.7)';
const WARNING_COLOR = '#fbbf24';
const BAD_COLOR = '#ff3b5c';

export default function PoseOverlay({ landmarks, formQuality, width = 640, height = 480 }) {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (!landmarks || landmarks.length === 0) return;

        // Set canvas size
        canvas.width = width;
        canvas.height = height;

        // Choose color based on form quality
        let pointColor = LANDMARK_COLOR;
        let lineColor = CONNECTION_COLOR;
        if (formQuality === 'warning') {
            pointColor = WARNING_COLOR;
            lineColor = 'rgba(251, 191, 36, 0.6)';
        } else if (formQuality === 'bad') {
            pointColor = BAD_COLOR;
            lineColor = 'rgba(255, 59, 92, 0.6)';
        }

        // Draw connections
        ctx.strokeStyle = lineColor;
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';

        for (const [startIdx, endIdx] of POSE_CONNECTIONS) {
            const start = landmarks[startIdx];
            const end = landmarks[endIdx];

            if (start?.visibility > 0.3 && end?.visibility > 0.3) {
                ctx.beginPath();
                ctx.moveTo(start.x * width, start.y * height);
                ctx.lineTo(end.x * width, end.y * height);
                ctx.stroke();
            }
        }

        // Draw landmark points
        for (let i = 0; i < landmarks.length; i++) {
            const lm = landmarks[i];
            if (lm.visibility > 0.3) {
                const x = lm.x * width;
                const y = lm.y * height;

                // Outer glow
                ctx.beginPath();
                ctx.arc(x, y, 6, 0, 2 * Math.PI);
                ctx.fillStyle = `${pointColor}33`;
                ctx.fill();

                // Inner dot
                ctx.beginPath();
                ctx.arc(x, y, 4, 0, 2 * Math.PI);
                ctx.fillStyle = pointColor;
                ctx.fill();
            }
        }
    }, [landmarks, formQuality, width, height]);

    return (
        <canvas
            ref={canvasRef}
            width={width}
            height={height}
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                transform: 'scaleX(-1)', // Mirror to match video
            }}
        />
    );
}
