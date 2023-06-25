<h1 align="center">modern-renderer</h1>

<p align="center">
  <a href="https://unpkg.com/modern-renderer">
    <img src="https://img.shields.io/bundlephobia/minzip/modern-renderer" alt="Minzip">
  </a>
  <a href="https://www.npmjs.com/package/modern-renderer">
    <img src="https://img.shields.io/npm/v/modern-renderer.svg" alt="Version">
  </a>
  <a href="https://www.npmjs.com/package/modern-renderer">
    <img src="https://img.shields.io/npm/dm/modern-renderer" alt="Downloads">
  </a>
  <a href="https://github.com/qq15725/modern-renderer/issues">
    <img src="https://img.shields.io/github/issues/qq15725/modern-renderer" alt="Issues">
  </a>
  <a href="https://github.com/qq15725/modern-renderer/blob/main/LICENSE">
    <img src="https://img.shields.io/npm/l/modern-renderer.svg" alt="License">
  </a>
</p>

## Install

```shell
npm i modern-renderer
```

## Usage

```ts
import { WebGLRenderer } from 'modern-renderer'

const renderer = new WebGLRenderer(document.querySelector('canvas'))

const program = renderer.createProgram({
  vert: `precision mediump float;
attribute vec2 position;
void main() {
  gl_Position = vec4(position, 0, 1);
}`,
  frag: `precision mediump float;
uniform vec4 color;
void main() {
  gl_FragColor = color;
}`,
})

const vertexBuffer = renderer.createBuffer({
  target: 'array_buffer',
  data: new Float32Array([
    -1, -1, +1, -1,
    -1, +1, +1, +1,
  ]),
  usage: 'static_draw',
})

const indexBuffer = renderer.createBuffer({
  target: 'element_array_buffer',
  data: new Uint16Array([
    0, 1, 2,
    1, 3, 2,
  ]),
  usage: 'static_draw',
})

const vertexArray = {
  attributes: {
    position: vertexBuffer,
  },
  indexBuffer,
}

renderer.activeProgram(program)
const vao = renderer.createVertexArray(vertexArray)

renderer.activeProgram(program)
renderer.activeVertexArray(vao ?? vertexArray)
renderer.updateUniforms({
  color: [0, 1, 0, 1],
})
renderer.draw()
```
