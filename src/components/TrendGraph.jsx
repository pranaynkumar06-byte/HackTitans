/**
 * TrendGraph.jsx
 * Simple canvas-based line chart for performance trends over time.
 */
import { useRef, useEffect } from 'react';

export default function TrendGraph({
    data = [],
    labels = [],
    height = 200,
    color = '#39ff14',
    secondaryColor = '#00d4ff',
    secondaryData = null,
    title = '',
}) {
    const canvasRef = useRef(null);
    const containerRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container || data.length === 0) return;

        const width = container.offsetWidth;
        const dpr = window.devicePixelRatio || 1;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;

        const ctx = canvas.getContext('2d');
        ctx.scale(dpr, dpr);
        ctx.clearRect(0, 0, width, height);

        const pad = { top: 20, right: 20, bottom: 30, left: 40 };
        const chartW = width - pad.left - pad.right;
        const chartH = height - pad.top - pad.bottom;

        const allValues = [...data, ...(secondaryData || [])];
        const maxVal = Math.max(100, ...allValues);
        const minVal = Math.min(0, ...allValues);
        const range = maxVal - minVal || 1;

        // Grid lines
        ctx.strokeStyle = 'rgba(100, 116, 139, 0.15)';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 4; i++) {
            const y = pad.top + (i / 4) * chartH;
            ctx.beginPath();
            ctx.moveTo(pad.left, y);
            ctx.lineTo(width - pad.right, y);
            ctx.stroke();

            // Y axis labels
            const val = Math.round(maxVal - (i / 4) * range);
            ctx.fillStyle = '#64748b';
            ctx.font = '500 10px Inter, sans-serif';
            ctx.textAlign = 'right';
            ctx.fillText(val, pad.left - 8, y + 4);
        }

        // X axis labels
        if (labels.length > 0) {
            ctx.fillStyle = '#64748b';
            ctx.font = '500 9px Inter, sans-serif';
            ctx.textAlign = 'center';
            const step = Math.max(1, Math.floor(labels.length / 8));
            for (let i = 0; i < labels.length; i += step) {
                const x = pad.left + (i / (data.length - 1)) * chartW;
                ctx.fillText(labels[i], x, height - 8);
            }
        }

        // Draw secondary line first
        if (secondaryData && secondaryData.length > 0) {
            drawLine(ctx, secondaryData, chartW, chartH, pad, range, minVal, secondaryColor, false);
        }

        // Draw primary line
        drawLine(ctx, data, chartW, chartH, pad, range, minVal, color, true);

    }, [data, secondaryData, labels, height, color, secondaryColor]);

    return (
        <div ref={containerRef} style={{ width: '100%' }}>
            {title && (
                <div style={{
                    fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)',
                    textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px',
                }}>{title}</div>
            )}
            <canvas ref={canvasRef} />
        </div>
    );
}

function drawLine(ctx, data, chartW, chartH, pad, range, minVal, color, drawDots) {
    if (data.length < 2) return;

    // Gradient fill under line
    const grad = ctx.createLinearGradient(0, pad.top, 0, pad.top + chartH);
    grad.addColorStop(0, color + '33');
    grad.addColorStop(1, color + '00');

    ctx.beginPath();
    data.forEach((val, i) => {
        const x = pad.left + (i / (data.length - 1)) * chartW;
        const y = pad.top + chartH - ((val - minVal) / range) * chartH;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });

    // Fill
    const lastX = pad.left + chartW;
    const baseY = pad.top + chartH;
    ctx.lineTo(lastX, baseY);
    ctx.lineTo(pad.left, baseY);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // Stroke
    ctx.beginPath();
    data.forEach((val, i) => {
        const x = pad.left + (i / (data.length - 1)) * chartW;
        const y = pad.top + chartH - ((val - minVal) / range) * chartH;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Dots
    if (drawDots) {
        data.forEach((val, i) => {
            const x = pad.left + (i / (data.length - 1)) * chartW;
            const y = pad.top + chartH - ((val - minVal) / range) * chartH;
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, 2 * Math.PI);
            ctx.fillStyle = color;
            ctx.fill();
        });
    }
}
