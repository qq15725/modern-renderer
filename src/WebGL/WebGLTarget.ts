type Pick<T> = T extends string
  ? T extends Uppercase<T>
    ? Lowercase<T>
    : never
  : never

export type WebGLTarget = Pick<keyof WebGL2RenderingContext>
