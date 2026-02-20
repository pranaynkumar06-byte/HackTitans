/**
 * RadarChart.jsx
 * Canvas-based radar chart for 5-axis athlete scoring visualization.
 * Axes: Speed, Strength, Endurance, Skill, Reaction
 */
import { useRef, useEffect } from 'react';

const DEFAULT_LABELS = ['Speed', 'Strength', 'Endurance', 'Skill', 'Reaction'];
const COLORS = {
    grid: 'rgba(100, 116, 139, 0.2)',
    gridLabel: '#94a3b8',
    fill: 'rgba(57, 255, 20, 0.15)',
    stroke: '#39ff14',
    dot: '#39ff14',
    compareFill: 'rgba(0, 212, 255, 0.1)',
    compareStroke: '#00d4ff',
};

export default function RadarChart({
    data = [0, 0, 0, 0, 0],
    compareData = null,
    labels = DEFAULT_LABELS,
    size = 300,
}) {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;
        canvas.width = size * dpr;
        canvas.height = size * dpr;
        ctx.scale(dpr, dpr);
        ctx.clearRect(0, 0, size, size);

        const cx = size / 2;
        const cy = size / 2;
        const maxR = size * 0.38;
        const sides = labels.length;
        const angleStep = (2 * Math.PI) / sides;
        const startAngle = -Math.PI / 2; // Start from top

        // Draw grid rings
        for (let ring = 1; ring <= 5; ring++) {
            const r = (ring / 5) * maxR;
            ctx.beginPath();
            for (let i = 0; i <= sides; i++) {
                const angle = startAngle + i * angleStep;
                const x = cx + r * Math.cos(angle);
                const y = cy + r * Math.sin(angle);
                i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
            }
            ctx.closePath();
            ctx.strokeStyle = COLORS.grid;
            ctx.lineWidth = 1;
            ctx.stroke();
        }

        // Draw axis lines
        for (let i = 0; i < sides; i++) {
            const angle = startAngle + i * angleStep;
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(cx + maxR * Math.cos(angle), cy + maxR * Math.sin(angle));
            ctx.strokeStyle = COLORS.grid;
            ctx.lineWidth = 1;
            ctx.stroke();
        }

        // Draw labels
        ctx.font = '600 11px Inter, sans-serif';
        ctx.fillStyle = COLORS.gridLabel;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        for (let i = 0; i < sides; i++) {
            const angle = startAngle + i * angleStep;
            const labelR = maxR + 22;
            const x = cx + labelR * Math.cos(angle);
            const y = cy + labelR * Math.sin(angle);
            ctx.fillText(labels[i], x, y);
        }

        // Draw compare data (if provided) — behind main data
        if (compareData) {
            drawDataPolygon(ctx, compareData, cx, cy, maxR, sides, angleStep, startAngle,
                COLORS.compareFill, COLORS.compareStroke, false);
        }

        // Draw main data
        drawDataPolygon(ctx, data, cx, cy, maxR, sides, angleStep, startAngle,
            COLORS.fill, COLORS.stroke, true);

    }, [data, compareData, labels, size]);

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <canvas
                ref={canvasRef}
                width={size}
                height={size}
                style={{ width: `${size}px`, height: `${size}px` }}
            />
        </div>
    );
}

function drawDataPolygon(ctx, values, cx, cy, maxR, sides, angleStep, startAngle, fillColor, strokeColor, drawDots) {
    ctx.beginPath();
    for (let i = 0; i <= sides; i++) {
        const idx = i % sides;
        const val = Math.min(100, Math.max(0, values[idx] || 0));
        const r = (val / 100) * maxR;
        const angle = startAngle + idx * angleStep;
        const x = cx + r * Math.cos(angle);
        const y = cy + r * Math.sin(angle);
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fillStyle = fillColor;
    ctx.fill();
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw dots on vertices
    if (drawDots) {
        for (let i = 0; i < sides; i++) {
            const val = Math.min(100, Math.max(0, values[i] || 0));
            const r = (val / 100) * maxR;
            const angle = startAngle + i * angleStep;
            const x = cx + r * Math.cos(angle);
            const y = cy + r * Math.sin(angle);

            ctx.beginPath();
            ctx.arc(x, y, 4, 0, 2 * Math.PI);
            ctx.fillStyle = strokeColor;
            ctx.fill();

            // Value label
            ctx.font = '700 10px monospace';
            ctx.fillStyle = strokeColor;
            ctx.fillText(Math.round(val), x, y - 12);
        }
    }
}
