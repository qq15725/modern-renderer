import { DEVICE_PIXEL_RATIO, getVarTypeSize } from './utils'

type PickTargets<T> = T extends string
  ? T extends Uppercase<T>
    ? Lowercase<T>
    : never
  : never

export type WebGLTarget = PickTargets<keyof WebGL2RenderingContext>

export interface WebGLExtensions {
  loseContext?: WEBGL_lose_context | null
  anisotropicFiltering?: EXT_texture_filter_anisotropic | null
  floatTextureLinear?: OES_texture_float_linear | null
  s3tc?: WEBGL_compressed_texture_s3tc | null
  s3tcSRGB?: WEBGL_compressed_texture_s3tc_srgb | null
  etc?: WEBGL_compressed_texture_etc | null
  etc1?: WEBGL_compressed_texture_etc1 | null
  pvrtc?: any | null
  atc?: any | null
  astc?: WEBGL_compressed_texture_astc | null

  // webgl
  instancedArrays?: ANGLE_instanced_arrays | null
  drawBuffers?: WEBGL_draw_buffers | null
  depthTexture?: WEBGL_depth_texture | null
  vertexArrayObject?: OES_vertex_array_object | null
  uint32ElementIndex?: OES_element_index_uint | null
  floatTexture?: OES_texture_float | null
  textureHalfFloat?: OES_texture_half_float | null
  textureHalfFloatLinear?: OES_texture_half_float_linear | null

  // webgl2
  colorBufferFloat?: EXT_color_buffer_float | null
}

export interface WebGLFramebufferProps {
  /**
   * ID
   */
  id: number

  /**
   * Color attachment
   */
  colorTextures: (WebGLTexture | null)[]

  /**
   * Depth attachment
   */
  depthTexture: WebGLTexture | null

  /**
   * Stencil attachment
   */
  stencilTexture: WebGLTexture | null

  /**
   * Mip level
   */
  mipLevel: number
}

export type WebGLFramebufferPropsData = Partial<Omit<WebGLFramebufferProps, 'id'>>

export interface WebGLProgramProps {
  /**
   * ID
   */
  id: number

  /**
   * Vertex shader source
   */
  vert: string

  /**
   * Fragment shader source
   */
  frag: string

  /**
   * Attributes info
   */
  attributes: Map<string, {
    type: WebGLTarget
    size: number
    name: string
    location: number
  }>

  /**
   * Uniforms info
   */
  uniforms: Map<string, {
    index: number
    type: WebGLTarget
    size: number
    isArray: boolean
    name: string
    location: WebGLUniformLocation | null
  }>

  /**
   * Cached binding uniforms
   */
  bindingUniforms: WeakMap<object, any>
}

export type WebGLProgramPropsData = Partial<Omit<WebGLProgramProps, 'id' | 'attributes' | 'uniforms'>>

export type WebGLTextureIndex = number

export type WebGLTextureTarget = 'texture_2d' | 'texture_cube_map'

export type WebGLTextureFilterMode = 'linear' | 'nearest' | 'nearest_mipmap_nearest' | 'linear_mipmap_nearest' | 'nearest_mipmap_linear' | 'linear_mipmap_linear'

export type WebGLTextureWrapMode = 'repeat' | 'clamp_to_edge' | 'mirrored_repeat'

export interface WebGLTextureProps {
  /**
   * ID
   */
  id: number

  /**
   * Texture binding point
   */
  target: WebGLTextureTarget

  /**
   * Texture binding index
   */
  index: WebGLTextureIndex

  /**
   * Texture image source
   */
  source: TexImageSource | null

  /**
   * Texture width
   */
  width: number | null

  /**
   * Texture height
   */
  height: number | null

  /**
   * Filtering mode of the Texture.
   */
  filterMode: WebGLTextureFilterMode

  /**
   * Texture coordinate wrapping mode.
   */
  wrapMode: WebGLTextureWrapMode

  /**
   * Defines the anisotropic filtering level of the Texture.
   */
  anisoLevel: number
}

export type WebGLTexturePropsData = Partial<Omit<WebGLTextureProps, 'id'>>

export type WebGLVertexAttribType = 'float' | 'unsigned_byte' | 'unsigned_short'

export interface WebGLVertexAttribProps {
  buffer: WebGLBuffer
  enable?: boolean
  size?: number
  type?: WebGLVertexAttribType
  normalized?: boolean
  stride?: number
  offset?: number
  divisor?: number
}

export type WebGLBufferTarget = 'array_buffer' | 'element_array_buffer'

export type WebGLBufferUsage = 'static_draw' | 'dynamic_draw'

export interface WebGLBufferProps extends Omit<WebGLVertexAttribProps, 'buffer'> {
  /**
   * ID
   */
  id: number

  /**
   * Buffer binding point
   */
  target: WebGLBufferTarget

  /**
   * Buffer data
   */
  data: BufferSource | null

  /**
   * Buffer usage type
   */
  usage: WebGLBufferUsage
}

export type WebGLBufferPropsData = Partial<Omit<WebGLBufferProps, 'id'>>

export interface WebGLVertexArrayProps {
  /**
   * Vertex attributes
   */
  attributes: Record<string, WebGLVertexAttribProps>

  /**
   * Index buffer
   */
  elementArrayBuffer: WebGLBuffer | null
}

export type WebGLVertexArrayPropsData = Partial<{
  /**
   * Vertex attributes
   */
  attributes: Record<string, WebGLBuffer | WebGLVertexAttribProps>

  /**
   * Index buffer
   */
  elementArrayBuffer: WebGLBuffer | null
}>

export type WebGLDrawMode = 'points' | 'line_strip' | 'line_loop' | 'lines' | 'triangle_strip' | 'triangle_fan' | 'triangles'

export interface WebGLDrawProps {
  mode: WebGLDrawMode
  count: number
  first: number
  bytesPerElement: number
  instanceCount: number
}

let UID = 0

export class WebGLRenderer {
  readonly screen = { x: 0, y: 0, width: 0, height: 0 }
  resolution = DEVICE_PIXEL_RATIO
  view: HTMLCanvasElement
  gl: WebGLRenderingContext | WebGL2RenderingContext
  version: 1 | 2
  extensions: WebGLExtensions
  readonly bindPoints = new Map<number, WebGLTarget>()
  readonly relatedProps = new WeakMap<object, any>()

  /**
   * Binding framebuffer
   *
   * TODO blit
   */
  framebuffer: WebGLFramebuffer | null = null

  /**
   * Binding program
   */
  program: WebGLProgram | null = null

  /**
   * Active texture unit
   */
  textureUnit = 0

  /**
   * Last activated texture target
   */
  textureTarget: WebGLTextureTarget = 'texture_2d'

  /**
   * Binding texture units
   */
  textureUnits: Record<WebGLTextureTarget, WebGLTexture | null>[] = []

  /**
   * Binding array buffer
   */
  arrayBuffer: WebGLBuffer | null = null

  /**
   * Last activated array buffer target
   */
  arrayBufferTarget: WebGLBufferTarget = 'array_buffer'

  /**
   * Default vertex array (bind null)
   */
  vertexArrayNull: WebGLVertexArrayProps = {
    attributes: {},
    elementArrayBuffer: null,
  }

  /**
   * Binding vertex array
   */
  vertexArray: WebGLVertexArrayProps = this.vertexArrayNull

  /**
   * Binding vertex array object
   */
  vertexArrayObject: WebGLVertexArrayObject | null = null

  /**
   * Max texture image units
   */
  maxTextureImageUnits: number

  constructor(
    view = document.createElement('canvas'),
    options?: WebGLContextAttributes,
  ) {
    let gl: any = view.getContext('webgl2', options)
    let version: 1 | 2 = 2

    if (!gl) {
      gl = view.getContext('webgl', options)
      version = 1
    }

    if (!gl) {
      throw new Error('failed to getContext')
    }

    this.view = view
    this.gl = gl
    this.version = version
    this.extensions = this.getExtensions()

    for (const key in gl) {
      if (key === key.toUpperCase()) {
        const value = (gl as any)[key]
        if (typeof value === 'number') {
          this.bindPoints.set(value, key.toLowerCase() as any)
        }
      }
    }

    view.addEventListener('webglcontextlost', this.onContextLost as any, false)
    view.addEventListener('webglcontextrestored', this.onContextRestored as any, false)

    // polyfill
    if (version === 1) {
      const { instancedArrays, vertexArrayObject, drawBuffers } = this.extensions
      const polyfill = gl as WebGL2RenderingContext
      if (vertexArrayObject) {
        polyfill.createVertexArray = () => vertexArrayObject.createVertexArrayOES()
        polyfill.bindVertexArray = vao => vertexArrayObject.bindVertexArrayOES(vao)
        polyfill.deleteVertexArray = vao => vertexArrayObject.deleteVertexArrayOES(vao)
      }
      if (instancedArrays) {
        polyfill.vertexAttribDivisor = (a, b) => instancedArrays.vertexAttribDivisorANGLE(a, b)
        polyfill.drawElementsInstanced = (a, b, c, d, e) => instancedArrays.drawElementsInstancedANGLE(a, b, c, d, e)
        polyfill.drawArraysInstanced = (a, b, c, d) => instancedArrays.drawArraysInstancedANGLE(a, b, c, d)
      }
      if (drawBuffers) {
        polyfill.drawBuffers = (buffers: number[]) => drawBuffers.drawBuffersWEBGL(buffers)
      }
    }

    const maxTextures = gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS)
    this.maxTextureImageUnits = maxTextures

    for (let i = 0; i < maxTextures; i++) {
      this.textureUnits[i] = { texture_2d: null, texture_cube_map: null }
    }
  }

  protected getExtensions(): WebGLExtensions {
    const gl = this.gl

    const extensions: Record<string, any> = {
      loseContext: gl.getExtension('WEBGL_lose_context'),
      anisotropicFiltering: gl.getExtension('EXT_texture_filter_anisotropic'),
      floatTextureLinear: gl.getExtension('OES_texture_float_linear'),
      s3tc: gl.getExtension('WEBGL_compressed_texture_s3tc'),
      s3tcSRGB: gl.getExtension('WEBGL_compressed_texture_s3tc_srgb'), // eslint-disable-line camelcase
      etc: gl.getExtension('WEBGL_compressed_texture_etc'),
      etc1: gl.getExtension('WEBGL_compressed_texture_etc1'),
      pvrtc: gl.getExtension('WEBGL_compressed_texture_pvrtc')
        || gl.getExtension('WEBKIT_WEBGL_compressed_texture_pvrtc'),
      atc: gl.getExtension('WEBGL_compressed_texture_atc'),
      astc: gl.getExtension('WEBGL_compressed_texture_astc'),
    }

    if (this.version === 1) {
      extensions.instancedArrays = gl.getExtension('ANGLE_instanced_arrays')
      extensions.drawBuffers = gl.getExtension('WEBGL_draw_buffers')
      extensions.depthTexture = gl.getExtension('WEBGL_depth_texture')
      extensions.vertexArrayObject = gl.getExtension('OES_vertex_array_object')
        || gl.getExtension('MOZ_OES_vertex_array_object')
        || gl.getExtension('WEBKIT_OES_vertex_array_object')
      extensions.uint32ElementIndex = gl.getExtension('OES_element_index_uint')
      // Floats and half-floats
      extensions.floatTexture = gl.getExtension('OES_texture_float')
      extensions.textureHalfFloat = gl.getExtension('OES_texture_half_float')
      extensions.textureHalfFloatLinear = gl.getExtension('OES_texture_half_float_linear')
    } else if (this.version === 2) {
      extensions.colorBufferFloat = gl.getExtension('EXT_color_buffer_float')
    }

    return extensions
  }

  protected onContextLost(event: WebGLContextEvent) {
    event.preventDefault()
    setTimeout(() => {
      this.gl.isContextLost() && this.extensions.loseContext?.restoreContext()
    }, 0)
  }

  protected onContextRestored() {}

  /**
   * Get WebGL target(binding point)
   *
   * @param target
   */
  getBindPoint(target: WebGLTarget): number {
    return (this.gl as any)[target.toUpperCase()] as number
  }

  getRelatedProps(source: object, type: 'framebuffer'): WebGLFramebufferProps
  getRelatedProps(source: object, type: 'program'): WebGLProgramProps
  getRelatedProps(source: object, type: 'buffer'): WebGLBufferProps
  getRelatedProps(source: object, type: 'texture'): WebGLTextureProps
  getRelatedProps(source: object, type: 'vertexArray'): WebGLVertexArrayProps
  getRelatedProps(source: object, type: string): any {
    let props = this.relatedProps.get(source)

    if (props) {
      return props
    }

    switch (type) {
      case 'framebuffer':
        props = {
          id: (source as any).id ?? ++UID,
          colorTextures: [],
          depthTexture: null,
          stencilTexture: null,
          mipLevel: 0,
        } as WebGLFramebufferProps
        break
      case 'program':
        props = {
          id: (source as any).id ?? ++UID,
          vert: `precision mediump float;
attribute vec2 position;
void main() {
  gl_Position = vec4(position, 0, 1);
}`,
          frag: `precision mediump float;
void main() {
  gl_FragColor = vec4(1, 1, 1, 1);
}`,
          attributes: new Map(),
          uniforms: new Map(),
          bindingUniforms: new WeakMap(),
        } as WebGLProgramProps
        break
      case 'buffer':
        props = {
          id: (source as any).id ?? ++UID,
          target: 'array_buffer',
          data: null,
          usage: 'static_draw',
        } as WebGLBufferProps
        break
      case 'texture':
        props = {
          id: (source as any).id ?? ++UID,
          target: 'texture_2d',
          index: 0,
          source: null,
          width: null,
          height: null,
          filterMode: 'linear',
          wrapMode: 'repeat',
          anisoLevel: 0,
        } as WebGLTextureProps
        break
      case 'vertexArray':
        props = {
          id: (source as any).id ?? ++UID,
          attributes: {},
          elementArrayBuffer: null,
        } as WebGLVertexArrayProps
        break
    }

    this.relatedProps.set(source, props)

    return props
  }

  createShader(source: string, type: 'vertex_shader' | 'fragment_shader'): WebGLShader {
    const shader = this.gl.createShader(this.getBindPoint(type))

    if (!shader) {
      throw new Error('failed to createShader')
    }

    this.gl.shaderSource(shader, source)
    this.gl.compileShader(shader)

    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      throw new Error(`failed to compilingShader :\n${ source }\n${ this.gl.getShaderInfoLog(shader) }`)
    }

    return shader
  }

  createProgram(propsData?: WebGLProgramPropsData): WebGLProgram {
    const program = this.gl.createProgram()
    ;(program as any).id = ++UID

    if (!program) {
      throw new Error('failed to createProgram')
    }

    if (propsData) {
      this.updateProgram(program, propsData)
    }

    return program
  }

  updateProgram(propsData: WebGLProgramPropsData): void
  updateProgram(program: WebGLProgram, propsData: WebGLProgramPropsData): void
  updateProgram(...args: any[]): void {
    if (args.length > 1) {
      const oldValue = this.program
      this.program = args[0]
      this.updateProgram(args[1])
      this.program = oldValue
      return
    }

    const propsData = args[0]
    const program = this.program

    if (!program) return

    const props = this.getRelatedProps(program, 'program')

    for (const key in propsData) {
      (props as any)[key] = (propsData as any)[key]
    }

    if (!props.frag.includes('precision')) {
      props.frag = `precision mediump float;\n${ props.frag }`
    }

    const vert = this.createShader(props.vert, 'vertex_shader')
    const frag = this.createShader(props.frag, 'fragment_shader')

    this.gl.attachShader(program, vert)
    this.gl.attachShader(program, frag)
    this.gl.linkProgram(program)
    this.gl.deleteShader(vert)
    this.gl.deleteShader(frag)

    if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
      throw new Error(`failed to linkProgram: ${ this.gl.getProgramInfoLog(program) }`)
    }

    props.attributes.clear()
    props.uniforms.clear()

    for (
      let len = this.gl.getProgramParameter(program, this.gl.ACTIVE_ATTRIBUTES), i = 0;
      i < len;
      i++
    ) {
      const attrib = this.gl.getActiveAttrib(program, i)

      if (!attrib || attrib.name.startsWith('gl_')) continue

      const type = this.bindPoints.get(attrib.type) ?? String(attrib.type) as any

      props.attributes.set(attrib.name, {
        type,
        name: attrib.name,
        size: getVarTypeSize(type),
        location: this.gl.getAttribLocation(program, attrib.name),
      })
    }

    for (
      let len = this.gl.getProgramParameter(program, this.gl.ACTIVE_UNIFORMS), i = 0;
      i < len;
      i++
    ) {
      const uniform = this.gl.getActiveUniform(program, i)

      if (!uniform) continue

      const name = uniform.name.replace(/\[.*?]$/, '')

      props.uniforms.set(name, {
        name,
        index: i,
        type: this.bindPoints.get(uniform.type) ?? String(uniform.type) as any,
        size: uniform.size,
        isArray: name !== uniform.name,
        location: this.gl.getUniformLocation(program, name),
      })
    }
  }

  activeProgram(program: WebGLProgram | null, then?: () => void | false): void {
    // changed
    const oldValue = this.program
    const changed = {
      value: oldValue !== program,
    }

    // use program
    changed.value && this.gl.useProgram(program)
    this.program = program

    // rollback change
    if (then?.() === false) {
      changed.value && this.gl.useProgram(oldValue)
      this.program = oldValue
    }
  }

  createFramebuffer(propsData?: WebGLFramebufferPropsData): WebGLFramebuffer {
    const framebuffer = this.gl.createFramebuffer()
    ;(framebuffer as any).id = ++UID

    if (!framebuffer) {
      throw new Error('failed to createFramebuffer')
    }

    if (propsData) {
      this.updateFramebuffer(framebuffer, propsData)
    }

    return framebuffer
  }

  updateFramebuffer(propsData: WebGLFramebufferPropsData): void
  updateFramebuffer(framebuffer: WebGLFramebuffer, propsData: WebGLFramebufferPropsData): void
  updateFramebuffer(...args: any[]): void {
    if (args.length > 1) {
      this.activeFramebuffer(args[0])
      this.updateFramebuffer(args[1])
      return
    }

    const propsData = args[0]
    const framebuffer = this.framebuffer

    if (!framebuffer) return

    const props = this.getRelatedProps(framebuffer, 'framebuffer')

    for (const key in propsData) {
      (props as any)[key] = (propsData as any)[key]
    }

    if (props.colorTextures) {
      for (let len = props.colorTextures.length, i = 0; i < len; i++) {
        const texture = props.colorTextures[i]

        this.activeTexture({
          index: 0,
          target: 'texture_2d',
          value: texture,
          forceIndex: true,
        })

        this.gl.framebufferTexture2D(
          this.gl.FRAMEBUFFER,
          this.gl.COLOR_ATTACHMENT0 + i,
          this.gl.TEXTURE_2D,
          texture,
          props.mipLevel,
        )
      }
    }

    if (props.colorTextures.length > 1 && 'drawBuffers' in this.gl) {
      this.gl.drawBuffers(
        props.colorTextures.map((_, i) => this.gl.COLOR_ATTACHMENT0 + i),
      )
    }

    if (props.depthTexture && (this.version > 1 || this.extensions.depthTexture)) {
      this.activeTexture({
        index: 0,
        target: 'texture_2d',
        value: props.depthTexture,
        forceIndex: true,
      })

      this.gl.framebufferTexture2D(
        this.gl.FRAMEBUFFER,
        this.gl.DEPTH_ATTACHMENT,
        this.gl.TEXTURE_2D,
        props.depthTexture,
        props.mipLevel,
      )
    }
  }

  activeFramebuffer(framebuffer: WebGLFramebuffer | null, then?: () => void | false): void {
    // changed
    const oldValue = this.framebuffer
    const changed = {
      value: oldValue !== framebuffer,
    }

    // bind framebuffer
    changed.value && this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, framebuffer)
    this.framebuffer = framebuffer

    // rollback change
    if (then?.() === false) {
      changed.value && this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, oldValue)
      this.framebuffer = oldValue
    }
  }

  createTexture(propsData?: WebGLTexturePropsData): WebGLTexture {
    const texture = this.gl.createTexture()
    ;(texture as any).id = ++UID

    if (!texture) {
      throw new Error('failed to createTexture')
    }

    if (propsData) {
      this.updateTexture(texture, propsData)
    }

    return texture
  }

  updateTexture(propsData: WebGLTexturePropsData): void
  updateTexture(texture: WebGLTexture, propsData: WebGLTexturePropsData): void
  updateTexture(...args: any[]): void {
    if (args.length > 1) {
      this.activeTexture({
        index: args[1].index,
        target: args[1].target,
        value: args[0] as WebGLTexture,
        forceIndex: true,
      })

      this.updateTexture(args[1] as WebGLTexturePropsData)
      return
    }

    const propsData = args[0] as WebGLTexturePropsData
    const texture = this.textureUnits[this.textureUnit][propsData.target ?? this.textureTarget]

    if (!texture) return

    const props = this.getRelatedProps(texture, 'texture')

    const changed: Record<string, boolean> = {}
    for (const key in propsData) {
      const value = (propsData as any)[key]
      changed[key] = (props as any)[key] !== value
      ;(props as any)[key] = value
    }

    const target = this.getBindPoint(props.target)

    if (changed.source || changed.width || changed.height) {
      if (props.source) {
        this.gl.texImage2D(target, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, props.source)
      } else if (props.width && props.height) {
        this.gl.texImage2D(target, 0, this.gl.RGBA, props.width, props.height, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, null)
      }
    }

    const wrapMode = this.getBindPoint(props.wrapMode)
    this.gl.texParameteri(target, this.gl.TEXTURE_WRAP_S, wrapMode)
    this.gl.texParameteri(target, this.gl.TEXTURE_WRAP_T, wrapMode)

    const filterMode = this.getBindPoint(props.filterMode.split('_')[0] as any)
    if (props.filterMode.includes('_')) {
      this.gl.texParameteri(target, this.gl.TEXTURE_MIN_FILTER, this.getBindPoint(props.filterMode))
    } else {
      this.gl.texParameteri(target, this.gl.TEXTURE_MIN_FILTER, filterMode)
    }
    this.gl.texParameteri(target, this.gl.TEXTURE_MAG_FILTER, filterMode)

    // ext: anisotropicFiltering
    if (
      props.anisoLevel
      && props.filterMode === 'linear'
      && this.extensions.anisotropicFiltering
    ) {
      const {
        MAX_TEXTURE_MAX_ANISOTROPY_EXT,
        TEXTURE_MAX_ANISOTROPY_EXT,
      } = this.extensions.anisotropicFiltering

      this.gl.texParameterf(
        target,
        TEXTURE_MAX_ANISOTROPY_EXT,
        Math.min(
          props.anisoLevel,
          this.gl.getParameter(MAX_TEXTURE_MAX_ANISOTROPY_EXT),
        ),
      )
    }
  }

  activeTexture(
    texture: WebGLTexture | null | {
      index?: WebGLTextureIndex
      target?: WebGLTextureTarget
      forceIndex?: boolean
      value: WebGLTexture | null
    },
    then?: (target: number) => void | false,
  ): void {
    // normalization params
    let value, target, index, forceIndex
    if (texture && 'value' in texture) {
      ({ target, value, index, forceIndex } = texture)
    } else {
      value = texture
    }
    if (target === undefined || index === undefined) {
      const props = value ? this.getRelatedProps(value, 'texture') : undefined
      target = target ?? props?.target ?? 'texture_2d'
      index = index ?? props?.index ?? 0
    }

    // get or init texture unit
    let textureUnit = this.textureUnits[index]
    if (!textureUnit) {
      this.textureUnits[index] = textureUnit = { texture_2d: null, texture_cube_map: null }
    }

    // changed
    const oldValue = textureUnit[target] ?? null
    const oldIndex = this.textureUnit
    const oldTarget = this.textureTarget
    const changedTexture = value !== oldValue
    const changed = {
      index: index !== oldIndex && (changedTexture || forceIndex),
      texture: changedTexture,
    }

    // active and bind
    const glTarget = this.getBindPoint(target)
    changed.index && this.gl.activeTexture(this.gl.TEXTURE0 + index)
    changed.texture && this.gl.bindTexture(glTarget, value)
    this.textureUnit = index
    this.textureTarget = target
    textureUnit[target] = value

    // rollback change
    if (then?.(glTarget) === false) {
      changed.index && this.gl.activeTexture(this.gl.TEXTURE0 + oldIndex)
      changed.texture && this.gl.bindTexture(glTarget, oldValue)
      this.textureUnit = oldIndex
      this.textureTarget = oldTarget
      textureUnit[target] = oldValue
    }
  }

  createBuffer(propsData?: WebGLBufferPropsData): WebGLBuffer {
    const buffer = this.gl.createBuffer()
    ;(buffer as any).id = ++UID

    if (!buffer) {
      throw new Error('failed to createBuffer')
    }

    if (propsData) {
      this.updateBuffer(buffer, propsData)
    }

    return buffer
  }

  updateBuffer(propsData: WebGLBufferPropsData): void
  updateBuffer(buffer: WebGLBuffer, propsData: WebGLBufferPropsData): void
  updateBuffer(...args: any[]): void {
    if (args.length > 1) {
      this.activeBuffer({
        target: args[1].target,
        value: args[0],
      })
      this.updateBuffer(args[1])
      return
    }

    const propsData = args[0] as WebGLBufferPropsData
    const target = propsData.target ?? this.arrayBufferTarget

    const buffer = target === 'array_buffer'
      ? this.arrayBuffer
      : this.vertexArray.elementArrayBuffer

    if (!buffer) return

    const props = this.getRelatedProps(buffer, 'buffer')
    const changed: Record<string, boolean> = {
      byteLength: props.data !== null && (props.data.byteLength ?? 0) >= (propsData.data?.byteLength ?? 0),
    }

    for (const key in propsData) {
      const value = (propsData as any)[key]
      changed[key] = (props as any)[key] !== value
      ;(props as any)[key] = value
    }

    const bindingTarget = this.getBindPoint(props.target)

    if (changed.data || changed.usage || changed.byteLength) {
      if (
        props.data
        && !changed.usage
        && changed.byteLength
      ) {
        this.gl.bufferSubData(bindingTarget, 0, props.data)
      } else {
        this.gl.bufferData(bindingTarget, props.data, this.getBindPoint(props.usage))
      }
    }
  }

  activeBuffer(
    buffer: WebGLBuffer | null | {
      target?: WebGLBufferTarget
      value: WebGLBuffer | null
    },
    then?: () => void | false,
  ): void {
    // normalization params
    let target, value
    if (buffer && 'value' in buffer) {
      ({ target, value } = buffer)
    } else {
      value = buffer
    }
    if (target === undefined) {
      const props = value ? this.getRelatedProps(value, 'buffer') : null
      target = target ?? props?.target ?? 'array_buffer'
    }

    // changed
    const oldTarget = this.arrayBufferTarget
    const oldValue = target === 'array_buffer'
      ? this.arrayBuffer
      : this.vertexArray.elementArrayBuffer
    const changed = {
      buffer: value !== oldValue,
    }

    // bind buffer
    const glTarget = this.getBindPoint(target)
    changed.buffer && this.gl.bindBuffer(glTarget, value)
    if (target === 'array_buffer') {
      this.arrayBuffer = value
    } else {
      this.vertexArray.elementArrayBuffer = value
    }
    this.arrayBufferTarget = target

    // rollback change
    if (then?.() === false) {
      changed.buffer && this.gl.bindBuffer(glTarget, oldValue)
      if (target === 'array_buffer') {
        this.arrayBuffer = oldValue
      } else {
        this.vertexArray.elementArrayBuffer = oldValue
      }
      this.arrayBufferTarget = oldTarget
    }
  }

  activeVertexAttrib(key: string, props: WebGLVertexAttribProps, location = 0): void {
    this.activeBuffer({
      target: 'array_buffer',
      value: props.buffer,
    })

    this.gl.enableVertexAttribArray(location)
    this.gl.vertexAttribPointer(
      location,
      props.size ?? 0,
      this.getBindPoint(props.type ?? 'float'),
      props.normalized ?? false,
      props.stride ?? 0,
      props.offset ?? 0,
    )

    // ext: instancedArrays
    if (props.divisor) {
      if ('vertexAttribDivisor' in this.gl) {
        this.gl.vertexAttribDivisor(location, props.divisor)
      } else {
        console.warn('failed to active vertex array object, GPU Instancing is not supported on this device')
      }
    }

    this.vertexArray.attributes[key] = {
      enable: true,
      buffer: props.buffer,
      size: props.size,
      type: props.type,
      normalized: props.normalized,
      stride: props.stride,
      offset: props.offset,
      divisor: props.divisor,
    }
  }

  createVertexArray(propsData?: WebGLVertexArrayPropsData): WebGLVertexArrayObject | null
  createVertexArray(program?: WebGLProgram, propsData?: WebGLVertexArrayPropsData): WebGLVertexArrayObject | null
  createVertexArray(...args: any[]): WebGLVertexArrayObject | null {
    if ('createVertexArray' in this.gl) {
      const vertexArray = this.gl.createVertexArray()
      ;(vertexArray as any).id = ++UID

      if (!vertexArray) {
        throw new Error('failed to createVertexArray')
      }

      if (args.length === 2) {
        this.updateVertexArray(args[0], vertexArray, args[1])
      } else if (args.length === 1) {
        this.updateVertexArray(vertexArray, args[0])
      }

      return vertexArray
    }

    return null
  }

  updateVertexArray(propsData: WebGLVertexArrayPropsData): void
  updateVertexArray(vertexArray: WebGLVertexArrayObject, propsData: WebGLVertexArrayPropsData): void
  updateVertexArray(program: WebGLProgram, vertexArray: WebGLVertexArrayObject, propsData: WebGLVertexArrayPropsData): void
  updateVertexArray(...args: any[]): void {
    if (args.length > 2) {
      this.activeProgram(args[0])
      this.updateVertexArray(args[1], args[2])
      return
    } else if (args.length === 2) {
      if (args[0]) {
        const vertexArrayObject = args[0] as WebGLVertexArrayObject
        this.activeVertexArray(vertexArrayObject)
        this.updateVertexArray(args[1] as WebGLVertexArrayPropsData)
        this.activeVertexArray(null)
        this.activeBuffer({ target: 'array_buffer', value: null })
        return
      } else {
        return this.updateVertexArray(args[1])
      }
    }

    const program = this.program

    if (!program) return
    const propsData = args[0] as WebGLVertexArrayPropsData

    // active vertex attrib
    if (propsData.attributes) {
      const programProps = this.getRelatedProps(program, 'program')
      const stride: Record<number, number> = {}
      const offset: Record<number, number> = {}
      const attribs = new Map<string, WebGLVertexAttribProps & {
        id: number
        location?: number
        byteLength: number
      }>()

      for (const key in propsData.attributes) {
        const attrib = propsData.attributes[key]

        // normalization params
        let buffer, bufferProps
        if ('buffer' in attrib) {
          buffer = attrib.buffer
          bufferProps = { ...this.getRelatedProps(buffer, 'buffer'), ...attrib }
        } else {
          buffer = attrib
          bufferProps = this.getRelatedProps(buffer, 'buffer')
        }

        stride[bufferProps.id] = stride[bufferProps.id] ?? 0
        offset[bufferProps.id] = offset[bufferProps.id] ?? 0

        const attributeInfo = programProps.attributes.get(key)
        const size = bufferProps.size || (attributeInfo?.size ?? 0)
        const byteLength = size * (
          bufferProps.type === 'unsigned_byte'
            ? 1
            : bufferProps.type === 'unsigned_short'
              ? 2
              : 4
        )
        stride[bufferProps.id] += byteLength
        attribs.set(key, {
          ...bufferProps,
          buffer,
          size,
          location: attributeInfo?.location,
          byteLength,
        })
      }

      attribs.forEach((attrib, key) => {
        if (attrib.stride === undefined) {
          if (stride[attrib.id] === attrib.byteLength) {
            attrib.stride = 0
          } else {
            attrib.stride = stride[attrib.id]
          }
        }

        if (attrib.offset === undefined) {
          attrib.offset = offset[attrib.id]
          offset[attrib.id] += attrib.byteLength
        }

        if (attrib.location !== undefined) {
          this.activeVertexAttrib(key, attrib, attrib.location)
        }
      })
    }

    // active index buffer
    this.activeBuffer({
      target: 'element_array_buffer',
      value: propsData.elementArrayBuffer ?? null,
    })

    this.vertexArray.elementArrayBuffer = propsData.elementArrayBuffer ?? null
  }

  activeVertexArray(
    vertexArrayObject: WebGLVertexArrayObject | null | WebGLVertexArrayPropsData,
    then?: () => void | false,
  ): void {
    if (vertexArrayObject && 'attributes' in vertexArrayObject) {
      this.updateVertexArray(vertexArrayObject)
      then?.()
    } else {
      // changed
      const oldValue = this.vertexArrayObject
      const oldVertexArray = this.vertexArray
      const changed = {
        value: vertexArrayObject !== oldValue,
      }

      if ('bindVertexArray' in this.gl) {
        // bind vertex array
        changed.value && this.gl.bindVertexArray(vertexArrayObject)
        this.vertexArrayObject = vertexArrayObject
        if (vertexArrayObject) {
          this.vertexArray = this.getRelatedProps(vertexArrayObject, 'vertexArray')
        } else {
          this.vertexArray = this.vertexArrayNull
        }

        // rollback change
        if (then?.() === false) {
          changed.value && this.gl.bindVertexArray(oldValue)
          this.vertexArrayObject = oldValue
          this.vertexArray = oldVertexArray
        }
      }
    }
  }

  updateUniforms(program: WebGLProgram, uniforms: Record<string, any>): void
  updateUniforms(uniforms: Record<string, any>): void
  updateUniforms(...args: any[]): void {
    if (args.length > 1) {
      this.activeProgram(args[0])
      this.updateUniforms(args[1])
      return
    }

    const program = this.program
    if (!program) return

    const props = this.getRelatedProps(program, 'program')
    const uniforms = args[0]

    for (const key in uniforms) {
      const value = uniforms[key]
      const info = props.uniforms.get(key)
      if (!info) continue
      const { type, isArray, location } = info
      if (!location) continue

      const oldValue = props.bindingUniforms.get(location)
      if (oldValue === value) continue
      props.bindingUniforms.set(location, value)

      switch (type) {
        case 'float':
          if (isArray) {
            this.gl.uniform1fv(location, value)
          } else {
            this.gl.uniform1f(location, value)
          }
          break
        case 'unsigned_int':
          if (isArray) {
            (this.gl as WebGL2RenderingContext).uniform1uiv(location, value)
          } else {
            (this.gl as WebGL2RenderingContext).uniform1ui(location, value)
          }
          break
        case 'bool':
        case 'int':
        case 'sampler_2d':
        case 'sampler_cube':
        case 'sampler_2d_array':
          if (isArray) {
            this.gl.uniform1iv(location, value)
          } else {
            this.gl.uniform1i(location, value)
          }
          break
        case 'bool_vec2':
        case 'int_vec2':
          this.gl.uniform2iv(location, value)
          break
        case 'unsigned_int_vec2':
          (this.gl as WebGL2RenderingContext).uniform2uiv(location, value)
          break
        case 'float_vec2':
          this.gl.uniform2fv(location, value)
          break
        case 'bool_vec3':
        case 'int_vec3':
          this.gl.uniform3iv(location, value)
          break
        case 'unsigned_int_vec3':
          (this.gl as WebGL2RenderingContext).uniform3uiv(location, value)
          break
        case 'float_vec3':
          this.gl.uniform3fv(location, value)
          break
        case 'bool_vec4':
        case 'int_vec4':
          this.gl.uniform4iv(location, value)
          break
        case 'unsigned_int_vec4':
          (this.gl as WebGL2RenderingContext).uniform4uiv(location, value)
          break
        case 'float_vec4':
          this.gl.uniform4fv(location, value)
          break
        case 'float_mat2':
          this.gl.uniformMatrix2fv(location, false, value)
          break
        case 'float_mat3':
          this.gl.uniformMatrix3fv(location, false, value)
          break
        case 'float_mat4':
          this.gl.uniformMatrix4fv(location, false, value)
          break
      }
    }
  }

  viewport(x = 0, y = 0, width = this.gl.drawingBufferWidth, height = this.gl.drawingBufferHeight) {
    this.gl.viewport(x, y, width, height)
  }

  clear(
    mask = this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT,
  ) {
    this.gl.clear(mask)
  }

  draw(propsData: Partial<WebGLDrawProps> = {}) {
    const {
      mode = 'triangles',
      first = 0,
      instanceCount,
    } = propsData

    let {
      count = 0,
      bytesPerElement = 0,
    } = propsData

    if (!count || !bytesPerElement) {
      const elementArrayBuffer = this.vertexArray.elementArrayBuffer
      if (elementArrayBuffer) {
        const props = this.getRelatedProps(elementArrayBuffer, 'buffer')
        if (props.data) {
          if (!count) {
            if ('length' in props.data) {
              count = Number(props.data.length)
            }
          }

          if (!bytesPerElement) {
            if ('bytesPerElement' in props.data) {
              bytesPerElement = Number(props.data.bytesPerElement)
            }

            if ('length' in props.data && 'byteLength' in props.data) {
              bytesPerElement = ~~(Number(props.data.byteLength) / Number(props.data.length))
            }
          }
        }
      }
    }

    if (!count) {
      const buffer = Object.values(this.vertexArray.attributes)[0]
      if (buffer) {
        const props = this.getRelatedProps(buffer, 'buffer')
        if (props.size && props.data && 'length' in props.data) {
          count = ~~(Number(props.data.length) / props.size)
        }
      }
    }

    const bindingMode = this.getBindPoint(mode)

    if (bytesPerElement) {
      if (bytesPerElement === 2 || (bytesPerElement === 4 && Boolean(this.extensions.uint32ElementIndex))) {
        const type = bytesPerElement === 2 ? this.gl.UNSIGNED_SHORT : this.gl.UNSIGNED_INT
        if (instanceCount && 'drawElementsInstanced' in this.gl) {
          this.gl.drawElementsInstanced(bindingMode, count, type, first * bytesPerElement, instanceCount)
        } else {
          this.gl.drawElements(bindingMode, count, type, first * bytesPerElement)
        }
      } else {
        console.warn('unsupported index buffer type: uint32')
      }
    } else if (instanceCount && 'drawArraysInstanced' in this.gl) {
      this.gl.drawArraysInstanced(bindingMode, first, count, instanceCount)
    } else {
      this.gl.drawArrays(bindingMode, first, count)
    }
  }

  destroy() {
    this.view.removeEventListener('webglcontextlost', this.onContextLost as any)
    this.view.removeEventListener('webglcontextrestored', this.onContextRestored as any)
    this.extensions.loseContext?.loseContext()
  }

  toPixels(): Uint8ClampedArray {
    const width = this.gl.drawingBufferWidth
    const height = this.gl.drawingBufferHeight
    const length = width * height * 4
    const row = width * 4
    const end = (height - 1) * row
    const flipedPixels = new Uint8Array(length)
    const pixels = new Uint8ClampedArray(length)
    this.gl.readPixels(0, 0, width, height, this.gl.RGBA, this.gl.UNSIGNED_BYTE, flipedPixels)
    for (let i = 0; i < length; i += row) {
      pixels.set(flipedPixels.subarray(i, i + row), end - i)
    }
    return pixels
  }

  reset() {
    this.framebuffer = null
    this.program = null
    this.textureUnit = 0
    this.textureTarget = 'texture_2d'
    this.textureUnits = this.textureUnits.map(() => ({ texture_2d: null, texture_cube_map: null }))
    this.arrayBuffer = null
    this.arrayBufferTarget = 'array_buffer'
    this.vertexArrayNull = {
      attributes: {},
      elementArrayBuffer: null,
    }
    this.vertexArray = this.vertexArrayNull
    this.vertexArrayObject = null
  }

  resize(width: number, height: number, updateCss = true) {
    const resolution = this.resolution
    const viewWidth = Math.round(width * resolution)
    const viewHeight = Math.round(height * resolution)
    const screenWidth = viewWidth / resolution
    const screenHeight = viewHeight / resolution
    this.view.width = viewWidth
    this.view.height = viewHeight
    this.screen.width = screenWidth
    this.screen.height = screenHeight
    if (updateCss) {
      this.view.style.width = `${ screenWidth }px`
      this.view.style.height = `${ screenHeight }px`
    }
  }
}
