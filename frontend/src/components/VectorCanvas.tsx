import React, { useEffect, useRef } from 'react';

interface VectorPoint {
  x: number;
  y: number;
  color: string;
  label: string;
}

interface Props {
  vectores: VectorPoint[];
  mostrarParalelogramo?: boolean;
}

export const VectorCanvas: React.FC<Props> = ({ vectores, mostrarParalelogramo }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    const ox = w / 2;
    const oy = h / 2;
    const scale = 20;

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.fillRect(0, 0, w, h);

    // Rejilla tenue
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.25)';
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += scale) {
      ctx.beginPath();
      ctx.moveTo(x, 0); ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += scale) {
      ctx.beginPath();
      ctx.moveTo(0, y); ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Ejes
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, oy); ctx.lineTo(w, oy);
    ctx.moveTo(ox, 0); ctx.lineTo(ox, h);
    ctx.stroke();

    // Paralelogramo
    if (mostrarParalelogramo && vectores.length >= 3) {
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.8)';
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(ox + vectores[0].x * scale, oy - vectores[0].y * scale);
      ctx.lineTo(ox + vectores[2].x * scale, oy - vectores[2].y * scale);
      ctx.moveTo(ox + vectores[1].x * scale, oy - vectores[1].y * scale);
      ctx.lineTo(ox + vectores[2].x * scale, oy - vectores[2].y * scale);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Dibujo de flechas
    vectores.forEach((v) => {
      const dx = ox + v.x * scale;
      const dy = oy - v.y * scale;

      ctx.strokeStyle = v.color;
      ctx.fillStyle = v.color;
      ctx.lineWidth = 2;

      ctx.beginPath();
      ctx.moveTo(ox, oy);
      ctx.lineTo(dx, dy);
      ctx.stroke();

      const angle = Math.atan2(dy - oy, dx - ox);
      ctx.beginPath();
      ctx.moveTo(dx, dy);
      ctx.lineTo(dx - 8 * Math.cos(angle - Math.PI / 6), dy - 8 * Math.sin(angle - Math.PI / 6));
      ctx.lineTo(dx - 8 * Math.cos(angle + Math.PI / 6), dy - 8 * Math.sin(angle + Math.PI / 6));
      ctx.fill();

      ctx.font = 'bold 10px sans-serif';
      ctx.fillText(v.label, dx + 4, dy - 4);
    });
  }, [vectores, mostrarParalelogramo]);

  return (
    <div className="flex justify-center p-2 rounded-xl border border-slate-200/80 bg-white/50 overflow-hidden my-2">
      <canvas ref={canvasRef} width={380} height={240} className="rounded-lg" />
    </div>
  );
};