"use client";

import { useEffect, useRef } from "react";

type ColorBendsProps = {
  className?: string;
};

const fragmentShader = `
  uniform vec2 uCanvas;
  uniform float uTime;
  uniform vec2 uPointer;
  varying vec2 vUv;

  vec3 palette(float t) {
    vec3 a = vec3(0.08, 0.04, 0.12);
    vec3 b = vec3(0.72, 0.25, 0.44);
    vec3 c = vec3(0.75, 0.48, 0.22);
    vec3 d = vec3(0.48, 0.18, 0.55);
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

    const canvas = document.createElement("canvas");
    canvas.setAttribute("aria-hidden", "true");
    const gl = canvas.getContext("webgl", { alpha: true, antialias: false });
    if (!gl) return;
    container.appendChild(canvas);

    const compile = (type: number, source: string) => {
      const shader = gl.createShader(type)!;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader) || "Shader compile failed");
      return shader;
    };
    const program = gl.createProgram()!;
    gl.attachShader(program, compile(gl.VERTEX_SHADER, vertexShader));
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, fragmentShader));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program) || "Shader link failed");
    gl.useProgram(program);
    const buffer = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    const canvasUniform = gl.getUniformLocation(program, "uCanvas");
    const timeUniform = gl.getUniformLocation(program, "uTime");
    const pointerUniform = gl.getUniformLocation(program, "uPointer");
    let pointerX = 0;
    let pointerY = 0;

    const resize = () => {
      const width = container.clientWidth || 1;
      const height = container.clientHeight || 1;
      const ratio = Math.min(window.devicePixelRatio, 2);
      canvas.width = width * ratio;
      canvas.height = height * ratio;
      canvas.style.width = "100%";
      canvas.style.height = "100%";
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(canvasUniform, width, height);
    };
    const move = (event: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      pointerX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointerY = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    };
    const observer = new ResizeObserver(resize);
    observer.observe(container);
    window.addEventListener("pointermove", move, { passive: true });
    resize();

    const startedAt = performance.now();
    let frame = 0;
    const render = () => {
      gl.uniform1f(timeUniform, (performance.now() - startedAt) / 1000);
      gl.uniform2f(pointerUniform, pointerX, pointerY);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      frame = requestAnimationFrame(render);
    };
    render();

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("pointermove", move);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      container.replaceChildren();
    };
  }, []);

  return <div ref={containerRef} className={className} />;
}
