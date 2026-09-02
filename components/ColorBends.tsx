"use client";

import { useEffect, useRef } from "react";

type ColorBendsProps = { className?: string };

const fragmentShader = `
  precision highp float;
  uniform vec2 uCanvas;
  uniform float uTime;
  uniform vec2 uPointer;
  varying vec2 vUv;
  vec3 palette(float t) {
    vec3 a = vec3(0.01, 0.01, 0.01);
    vec3 b = vec3(0.11, 0.11, 0.12);
    vec3 c = vec3(0.68, 0.68, 0.68);
    vec3 d = vec3(0.08, 0.12, 0.18);
    return a + b * cos(6.28318 * (c * t + d));
  }
  void main() {
    vec2 p = vUv * 2.0 - 1.0;
    p.x *= uCanvas.x / max(uCanvas.y, 1.0);
    p += uPointer * 0.075;
    float t = uTime * 0.09;
    float wave = sin(p.x * 2.5 + sin(p.y * 2.0 - t) * 1.8 + t);
    wave += sin(p.y * 3.0 - cos(p.x * 1.7 + t) * 1.35 - t * 1.2);
    wave += sin((p.x + p.y) * 2.0 + t * 0.7);
    vec3 col = palette(wave * 0.18 + p.y * 0.14 + t * 0.08);
    float vignette = 1.0 - 0.35 * dot(p * 0.55, p * 0.55);
    gl_FragColor = vec4(col * vignette, 1.0);
  }
`;

const vertexShader = `
  precision highp float;
  attribute vec2 position;
  varying vec2 vUv;
  void main() {
    vUv = position * 0.5 + 0.5;
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

export default function ColorBends({ className }: ColorBendsProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let cleanup = () => {};
    try {
      const canvas = document.createElement("canvas");
      canvas.setAttribute("aria-hidden", "true");
      const gl = canvas.getContext("webgl", { alpha: true, antialias: false, powerPreference: "low-power" });
      if (!gl) return;

      const compile = (type: number, source: string) => {
        const shader = gl.createShader(type);
        if (!shader) return null;
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
          gl.deleteShader(shader);
          return null;
        }
        return shader;
      };

      const vertex = compile(gl.VERTEX_SHADER, vertexShader);
      const fragment = compile(gl.FRAGMENT_SHADER, fragmentShader);
      if (!vertex || !fragment) return;
      const program = gl.createProgram();
      const buffer = gl.createBuffer();
      if (!program || !buffer) return;
      gl.attachShader(program, vertex);
      gl.attachShader(program, fragment);
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;

      gl.useProgram(program);
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      const position = gl.getAttribLocation(program, "position");
      if (position < 0) return;
      gl.enableVertexAttribArray(position);
      gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
      const canvasUniform = gl.getUniformLocation(program, "uCanvas");
      const timeUniform = gl.getUniformLocation(program, "uTime");
      const pointerUniform = gl.getUniformLocation(program, "uPointer");
      if (!canvasUniform || !timeUniform || !pointerUniform) return;

      container.appendChild(canvas);
      let pointerX = 0;
      let pointerY = 0;
      let frame = 0;
      let stopped = false;

      const resize = () => {
        const width = container.clientWidth || 1;
        const height = container.clientHeight || 1;
        const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
        canvas.width = Math.max(1, Math.floor(width * ratio));
        canvas.height = Math.max(1, Math.floor(height * ratio));
        canvas.style.width = "100%";
        canvas.style.height = "100%";
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.uniform2f(canvasUniform, width, height);
      };
      const move = (event: PointerEvent) => {
        const rect = container.getBoundingClientRect();
        if (!rect.width || !rect.height) return;
        pointerX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        pointerY = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      };
      const stop = (event?: Event) => {
        event?.preventDefault();
        stopped = true;
        cancelAnimationFrame(frame);
        canvas.style.display = "none";
      };
      const render = (now: number) => {
        if (stopped || gl.isContextLost()) return;
        try {
          gl.uniform1f(timeUniform, now / 1000);
          gl.uniform2f(pointerUniform, pointerX, pointerY);
          gl.drawArrays(gl.TRIANGLES, 0, 3);
          frame = requestAnimationFrame(render);
        } catch {
          stop();
        }
      };

      const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(resize);
      observer?.observe(container);
      window.addEventListener("resize", resize, { passive: true });
      window.addEventListener("pointermove", move, { passive: true });
      canvas.addEventListener("webglcontextlost", stop);
      resize();
      frame = requestAnimationFrame(render);

      cleanup = () => {
        stopped = true;
        cancelAnimationFrame(frame);
        observer?.disconnect();
        window.removeEventListener("resize", resize);
        window.removeEventListener("pointermove", move);
        canvas.removeEventListener("webglcontextlost", stop);
        canvas.remove();
        if (!gl.isContextLost()) {
          gl.deleteBuffer(buffer);
          gl.deleteProgram(program);
          gl.deleteShader(vertex);
          gl.deleteShader(fragment);
        }
      };
    } catch (error) {
      console.warn("MUNlocked background switched to its CSS fallback.", error);
      container.replaceChildren();
    }
    return () => cleanup();
  }, []);

  return <div ref={containerRef} className={className} />;
}
