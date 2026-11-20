import { useEffect, useRef } from 'react';

export default function RadioStaticOverlay({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d', { alpha: false });
    if (!canvas || !context) return;

    const width = 240;
    const height = 135;
    canvas.width = width;
    canvas.height = height;
    const frame = context.createImageData(width, height);
    let request = 0;
    let lastFrame = 0;

    const draw = (time: number) => {
      if (time - lastFrame > 34) {
        lastFrame = time;
        const data = frame.data;
        for (let pixel = 0; pixel < width * height; pixel += 1) {
          const shade = Math.random() > 0.49 ? 255 : Math.floor(Math.random() * 100);
          const offset = pixel * 4;
          data[offset] = shade;
          data[offset + 1] = shade;
          data[offset + 2] = shade;
          data[offset + 3] = 255;
        }
        context.putImageData(frame, 0, 0);
      }
      request = window.requestAnimationFrame(draw);
    };

    request = window.requestAnimationFrame(draw);
    return () => window.cancelAnimationFrame(request);
  }, [active]);

  return (
    <div className={`radio-static-overlay${active ? ' is-active' : ''}`} aria-hidden="true">
      <canvas ref={canvasRef} />
      <div className="static-scanlines" />
      <div className="static-tear static-tear-one" />
      <div className="static-tear static-tear-two" />
      <div className="static-corner-glow" />
    </div>
  );
}
