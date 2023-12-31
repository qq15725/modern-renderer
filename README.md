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

## Features

- All operations return WebGL native objects (no additional encapsulation)

- Automatically adapted to WebGL or WebGL2 (default)

- Cache WebGL state to avoid unwanted GPU communication

- The native WebGL object extension state is associated with WeakMap to avoid memory leaks

- Provides simple VAO call

- TypeScript, of course

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

const elementArrayBuffer = renderer.createBuffer({
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
  elementArrayBuffer,
}

const vao = renderer.createVertexArray(program, vertexArray)

renderer.activeProgram(program)
renderer.activeVertexArray(vao ?? vertexArray)
renderer.updateUniforms({
  color: [0, 1, 0, 1],
})
renderer.draw()
```

## Global function style

```ts
import {
  WebGLRenderer,
  setCurrentRenderer,
  glCreateProgram,
  glCreateBuffer,
  glCreateVertexArray,
  glActiveProgram,
  glActiveVertexArray,
  glUpdateUniforms,
  glDraw,
} from 'modern-renderer'

setCurrentRenderer(new WebGLRenderer(document.querySelector('canvas')))

const program = glCreateProgram({
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

const vertexBuffer = glCreateBuffer({
  target: 'array_buffer',
  data: new Float32Array([
    -1, -1, +1, -1,
    -1, +1, +1, +1,
  ]),
  usage: 'static_draw',
})

const elementArrayBuffer = glCreateBuffer({
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
  elementArrayBuffer,
}

const vao = glCreateVertexArray(program, vertexArray)

glActiveProgram(program)
glActiveVertexArray(vao ?? vertexArray)
glUpdateUniforms({
  color: [0, 1, 0, 1],
})
glDraw()
```
