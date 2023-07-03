import { getVarTypeSize } from './utils'

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

export type WebGLFramebufferTarget = 'framebuffer'

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
   * Filtering mode of the Texture.
   */
  filterMode: 'linear' | 'nearest' | 'nearest_mipmap_nearest' | 'linear_mipmap_nearest' | 'nearest_mipmap_linear' | 'linear_mipmap_linear'

  /**
   * Texture coordinate wrapping mode.
   */
  wrapMode: 'repeat' | 'clamp_to_edge' | 'mirrored_repeat'

  /**
   * Defines the anisotropic filtering level of the Texture.
   */
  anisoLevel: number
}

export type WebGLTexturePropsData = Partial<Omit<WebGLTextureProps, 'id'>>

export type WebGLVertexAttribType = 'float' | 'unsigned_byte' | 'unsigned_short'

export interface WebGLVertexAttribProps {
  buffer: WebGLBuffer
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
  attributes: Record<string, WebGLBuffer | WebGLVertexAttribProps>

  /**
   * Index buffer
   */
  indexBuffer?: WebGLBuffer
}

export type WebGLVertexArrayPropsData = Partial<WebGLVertexArrayProps>

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
  public debug = false
  public view: HTMLCanvasElement
  public gl: WebGLRenderingContext | WebGL2RenderingContext
  public version: 1 | 2
  public extensions: WebGLExtensions
  public bindingPoints = new Map<number, WebGLTarget>()
  public relatedProps = new WeakMap<object, any>()

  /**
   * Previous binded framebuffer
   */
  public framebuffer: {
    target: WebGLFramebufferTarget
    value: WebGLFramebuffer | null
  } = {
      target: 'framebuffer',
      value: null,
    }

  /**
   * Previous binded program
   */
  public program: {
    value: WebGLProgram | null
  } = {
      value: null,
    }

  /**
   * All binding textures
   */
  public textures = new Map<WebGLTextureIndex, Map<WebGLTextureTarget, WebGLTexture | null>>()

  /**
   * Previous binded texture
   */
  public texture: {
    target: WebGLTextureTarget
    index: WebGLTextureIndex
    value: WebGLTexture | null
  } = {
      index: 0,
      target: 'texture_2d',
      value: null,
    }

  /**
   * All binding buffers
   */
  public buffers = new Map<WebGLBufferTarget, WebGLBuffer | null>()

  /**
   * Previous binded buffer
   */
  public buffer: {
    target: WebGLBufferTarget
    value: WebGLBuffer | null
  } = {
      target: 'array_buffer',
      value: null,
    }

  /**
   * Previous binded vertexArrayObject
   */
  public vertexArrayObject: {
    value: WebGLVertexArrayObject | null
  } = {
      value: null,
    }

  public constructor(view = document.createElement('canvas')) {
    let gl: any = view.getContext('webgl2')
    let version: 1 | 2 = 2

    if (!gl) {
      gl = view.getContext('webgl')
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
          this.bindingPoints.set(value, key.toLowerCase() as any)
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
  }

  public checkError(...args: any[]) {
    if (this.debug) {
      const code = this.gl.getError()
      if (code > 0) {
        console.warn(`gl.getError code: ${ code }`, ...args)
      }
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
  public getBindingPoint(target: WebGLTarget): number {
    return (this.gl as any)[target.toUpperCase()] as number
  }

  public getRelatedProps(source: object, type: 'framebuffer'): WebGLFramebufferProps
  public getRelatedProps(source: object, type: 'program'): WebGLProgramProps
  public getRelatedProps(source: object, type: 'buffer'): WebGLBufferProps
  public getRelatedProps(source: object, type: 'texture'): WebGLTextureProps
  public getRelatedProps(source: object, type: 'vertexArray'): Map<WebGLBufferTarget, WebGLBuffer | null>
  public getRelatedProps(source: object, type: string): any {
    let props = this.relatedProps.get(source)

    if (props) {
      return props
    }

    switch (type) {
      case 'framebuffer':
        props = {
          id: UID++,
          colorTextures: [],
          depthTexture: null,
          stencilTexture: null,
          mipLevel: 0,
        } as WebGLFramebufferProps
        break
      case 'program':
        props = {
          id: UID++,
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
          id: UID++,
          target: 'array_buffer',
          data: null,
          usage: 'static_draw',
        } as WebGLBufferProps
        break
      case 'texture':
        props = {
          id: UID++,
          target: 'texture_2d',
          index: 0,
          source: null,
          filterMode: 'linear',
          wrapMode: 'repeat',
          anisoLevel: 0,
        } as WebGLTextureProps
        break
      case 'vertexArray':
        props = new Map()
        break
    }

    this.relatedProps.set(source, props)

    return props
  }

  public createShader(source: string, type: 'vertex_shader' | 'fragment_shader'): WebGLShader {
    const shader = this.gl.createShader(this.getBindingPoint(type))

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

  public createProgram(propsData?: WebGLProgramPropsData): WebGLProgram {
    const program = this.gl.createProgram()

    if (!program) {
      throw new Error('failed to createProgram')
    }

    if (propsData) {
      this.updateProgram(program, propsData)
    }

    return program
  }

  public updateProgram(propsData: WebGLProgramPropsData): void
  public updateProgram(program: WebGLProgram, propsData: WebGLProgramPropsData): void
  public updateProgram(...args: any[]): void {
    if (args.length > 1) {
      const oldValue = this.program.value
      this.program.value = args[0]
      this.updateProgram(args[1])
      this.program.value = oldValue
      return
    }

    const propsData = args[0]
    const program = this.program.value

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

      const type = this.bindingPoints.get(attrib.type) ?? String(attrib.type) as any

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
        type: this.bindingPoints.get(uniform.type) ?? String(uniform.type) as any,
        size: uniform.size,
        isArray: name !== uniform.name,
        location: this.gl.getUniformLocation(program, name),
      })
    }
  }

  public activeProgram(program: WebGLProgram | null, then?: () => void | false): void {
    // changed
    const oldValue = this.program.value
    const changed = {
      value: oldValue !== program,
    }

    // use
    changed.value && this.gl.useProgram(program)
    this.program.value = program
    if (then?.() === false) {
      changed.value && this.gl.useProgram(oldValue)
      this.program.value = oldValue
    }
  }

  public createFramebuffer(propsData?: WebGLFramebufferPropsData): WebGLFramebuffer {
    const framebuffer = this.gl.createFramebuffer()

    if (!framebuffer) {
      throw new Error('failed to createFramebuffer')
    }

    if (propsData) {
      this.updateFramebuffer(framebuffer, propsData)
    }

    return framebuffer
  }

  public updateFramebuffer(propsData: WebGLFramebufferPropsData): void
  public updateFramebuffer(framebuffer: WebGLFramebuffer, propsData: WebGLFramebufferPropsData): void
  public updateFramebuffer(...args: any[]): void {
    if (args.length > 1) {
      return this.activeFramebuffer(args[0], () => {
        this.updateFramebuffer(args[1])
        return false
      })
    }

    const propsData = args[0]
    const framebuffer = this.framebuffer.value

    if (!framebuffer) return

    const props = this.getRelatedProps(framebuffer, 'framebuffer')

    for (const key in propsData) {
      (props as any)[key] = (propsData as any)[key]
    }

    if (props.colorTextures) {
      for (let len = props.colorTextures.length, i = 0; i < len; i++) {
        const texture = props.colorTextures[i]

        this.activeTexture(texture, target => {
          this.gl.framebufferTexture2D(
            this.gl.FRAMEBUFFER,
            this.gl.COLOR_ATTACHMENT0 + i,
            target,
            texture,
            props.mipLevel,
          )
          this.checkError('framebufferTexture2D')
          return false
        })
      }
    }

    if (props.colorTextures.length > 1 && 'drawBuffers' in this.gl) {
      this.gl.drawBuffers(
        props.colorTextures.map((_, i) => this.gl.COLOR_ATTACHMENT0 + i),
      )
      this.checkError('drawBuffers')
    }

    if (props.depthTexture && (this.version > 1 || this.extensions.depthTexture)) {
      this.activeTexture(props.depthTexture, target => {
        this.gl.framebufferTexture2D(
          this.gl.FRAMEBUFFER,
          this.gl.DEPTH_ATTACHMENT,
          target,
          props.depthTexture,
          props.mipLevel,
        )

        return false
      })
    }
  }

  public activeFramebuffer(framebuffer: WebGLFramebuffer | null, then?: () => void | false): void {
    // changed
    const oldValue = this.framebuffer.value
    const changed = {
      value: oldValue !== framebuffer,
    }

    changed.value && this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, framebuffer)
    this.framebuffer.value = framebuffer
    if (then?.() === false) {
      changed.value && this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, oldValue)
      this.framebuffer.value = oldValue
    }
  }

  public createTexture(propsData?: WebGLTexturePropsData): WebGLTexture {
    const texture = this.gl.createTexture()

    if (!texture) {
      throw new Error('failed to createTexture')
    }

    if (propsData) {
      this.updateTexture(texture, propsData)
    }

    return texture
  }

  public updateTexture(propsData: WebGLTexturePropsData): void
  public updateTexture(texture: WebGLTexture, propsData: WebGLTexturePropsData): void
  public updateTexture(...args: any[]): void {
    if (args.length > 1) {
      return this.activeTexture({
        index: args[1].index,
        target: args[1].target,
        value: args[0],
      }, () => {
        this.updateTexture(args[1])
        return false
      })
    }

    const propsData = args[0]
    const texture = this.texture.value

    if (!texture) return

    const props = this.getRelatedProps(texture, 'texture')

    const changed: Record<string, boolean> = {}
    for (const key in propsData) {
      const value = (propsData as any)[key]
      changed[key] = (props as any)[key] !== value
      ;(props as any)[key] = value
    }

    const target = this.getBindingPoint(props.target)

    if (changed.source && props.source) {
      this.gl.texImage2D(
        target,
        0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, props.source,
      )
      this.checkError('texImage2D')
    }

    const wrapMode = this.getBindingPoint(props.wrapMode)
    this.gl.texParameteri(target, this.gl.TEXTURE_WRAP_S, wrapMode)
    this.gl.texParameteri(target, this.gl.TEXTURE_WRAP_T, wrapMode)

    const filterMode = this.getBindingPoint(props.filterMode.split('_')[0] as any)
    if (props.filterMode.includes('_')) {
      this.gl.texParameteri(target, this.gl.TEXTURE_MIN_FILTER, this.getBindingPoint(props.filterMode))
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

  public activeTexture(
    texture: WebGLTexture | null | {
      index?: WebGLTextureIndex
      target?: WebGLTextureTarget
      value: WebGLTexture | null
    },
    then?: (target: number) => void | false,
  ): void {
    // normalization params
    const isObjectParams = texture && 'value' in texture
    const value = isObjectParams ? texture.value : texture
    const props = value ? this.getRelatedProps(value, 'texture') : null
    const target = (isObjectParams ? texture.target : null) ?? props?.target ?? 'texture_2d'
    const index = (isObjectParams ? texture.index : null) ?? props?.index ?? 0

    // changed
    const oldIndex = this.texture.index
    let textures = this.textures.get(index)
    if (!textures) this.textures.set(index, textures = new Map())
    const oldValue = textures.get(target) ?? null
    const changed = {
      index: index !== oldIndex,
      texture: value !== oldValue,
    }

    // active and bind
    const bindingTarget = this.getBindingPoint(target)
    changed.index && this.gl.activeTexture(this.gl.TEXTURE0 + index)
    changed.texture && this.gl.bindTexture(bindingTarget, value)
    this.texture.index = index
    this.texture.target = target
    this.texture.value = value
    textures.set(target, value)
    if (then?.(bindingTarget) === false) {
      changed.index && this.gl.activeTexture(this.gl.TEXTURE0 + oldIndex)
      changed.texture && this.gl.bindTexture(bindingTarget, oldValue)
      textures.set(target, oldValue)
      this.texture.index = oldIndex
      this.texture.value = oldValue
    }
  }

  public createBuffer(propsData?: WebGLBufferPropsData): WebGLBuffer {
    const buffer = this.gl.createBuffer()

    if (!buffer) {
      throw new Error('failed to createBuffer')
    }

    if (propsData) {
      this.updateBuffer(buffer, propsData)
    }

    return buffer
  }

  public updateBuffer(propsData: WebGLBufferPropsData): void
  public updateBuffer(buffer: WebGLBuffer, propsData: WebGLBufferPropsData): void
  public updateBuffer(...args: any[]): void {
    if (args.length > 1) {
      return this.activeBuffer({
        target: args[1].target,
        value: args[0],
      }, () => {
        this.updateBuffer(args[1])
        return false
      })
    }

    const propsData = args[0]
    const buffer = this.buffer.value

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

    const bindingTarget = this.getBindingPoint(props.target)

    if (changed.data) {
      if (
        props.data
        && !changed.usage
        && changed.byteLength
      ) {
        this.gl.bufferSubData(bindingTarget, 0, props.data)
        this.checkError('bufferSubData')
      } else {
        this.gl.bufferData(bindingTarget, props.data, this.getBindingPoint(props.usage))
        this.checkError('bufferData')
      }
    }
  }

  public activeBuffer(
    buffer: WebGLBuffer | null | {
      target?: WebGLBufferTarget
      value: WebGLBuffer | null
    },
    then?: () => void | false,
  ): void {
    // normalization params
    const isObjectParams = buffer && 'value' in buffer
    const value = isObjectParams ? buffer.value : buffer
    const props = value ? this.getRelatedProps(value, 'buffer') : null
    const target = (isObjectParams ? buffer.target : null) ?? props?.target ?? 'array_buffer'

    // changed
    const oldValue = this.buffers.get(target) ?? null
    const changed = {
      buffer: value !== oldValue,
    }

    // bind
    const bindingTarget = this.getBindingPoint(target)
    changed.buffer && this.gl.bindBuffer(bindingTarget, value)
    this.buffer.value = value
    this.buffer.target = target
    this.buffers.set(target, value)
    if (then?.() === false) {
      changed.buffer && this.gl.bindBuffer(bindingTarget, oldValue)
      this.buffer.value = oldValue
      this.buffers.set(target, oldValue)
    }
  }

  public activeVertexAttrib(props: WebGLVertexAttribProps, location = 0): void {
    this.activeBuffer({
      target: 'array_buffer',
      value: props.buffer,
    })

    this.gl.enableVertexAttribArray(location)
    this.gl.vertexAttribPointer(
      location,
      props.size ?? 0,
      this.getBindingPoint(props.type ?? 'float'),
      props.normalized ?? false,
      props.stride ?? 0,
      props.offset ?? 0,
    )
    this.checkError('vertexAttribPointer')

    // ext: instancedArrays
    if (props.divisor) {
      if ('vertexAttribDivisor' in this.gl) {
        this.gl.vertexAttribDivisor(location, props.divisor)
        this.checkError('vertexAttribDivisor')
      } else {
        console.warn('failed to active vertex array object, GPU Instancing is not supported on this device')
      }
    }
  }

  public createVertexArray(propsData?: WebGLVertexArrayPropsData): WebGLVertexArrayObject | null
  public createVertexArray(program?: WebGLProgram, propsData?: WebGLVertexArrayPropsData): WebGLVertexArrayObject | null
  public createVertexArray(...args: any[]): WebGLVertexArrayObject | null {
    if ('createVertexArray' in this.gl) {
      const vertexArray = this.gl.createVertexArray()

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

  public updateVertexArray(propsData: WebGLVertexArrayPropsData): void
  public updateVertexArray(vertexArray: WebGLVertexArrayObject, propsData: WebGLVertexArrayPropsData): void
  public updateVertexArray(program: WebGLProgram, vertexArray: WebGLVertexArrayObject, propsData: WebGLVertexArrayPropsData): void
  public updateVertexArray(...args: any[]): void {
    if (args.length > 2) {
      return this.activeProgram(args[0], () => {
        this.updateVertexArray(args[1], args[2])
        return false
      })
    } else if (args.length === 2) {
      if (args[0]) {
        const vertexArray = args[0]
        this.activeVertexArray(vertexArray, () => {
          this.updateVertexArray(args[1])
          this.activeVertexArray(null)
          const props = this.getRelatedProps(vertexArray, 'vertexArray')
          this.buffers.forEach((value, key) => {
            props.set(key, value)
          })
          this.activeBuffer({ target: 'array_buffer', value: null })
          this.activeBuffer({ target: 'element_array_buffer', value: null })
          return false
        })
        return
      } else {
        return this.updateVertexArray(args[1])
      }
    }

    const program = this.program.value
    if (!program) return
    const propsData = args[0]

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
        const isObjectParams = 'buffer' in attrib
        const buffer = isObjectParams ? attrib.buffer : attrib
        let bufferProps = this.getRelatedProps(buffer, 'buffer')
        if (isObjectParams) {
          bufferProps = { ...bufferProps, ...attrib }
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
          id: bufferProps.id,
          buffer,
          size,
          stride: bufferProps?.stride,
          offset: bufferProps?.offset,
          location: attributeInfo?.location,
          byteLength,
        })
      }

      attribs.forEach(attrib => {
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
          this.activeVertexAttrib(attrib, attrib.location)
        }
      })
    }

    // active index buffer
    this.activeBuffer({
      target: 'element_array_buffer',
      value: propsData.indexBuffer ?? null,
    })
  }

  public activeVertexArray(
    vertexArray: WebGLVertexArrayObject | null | Partial<WebGLVertexArrayProps>,
    then?: () => void | false,
  ): void {
    if (vertexArray && 'attributes' in vertexArray) {
      this.updateVertexArray(vertexArray)
      then?.()
    } else {
      // changed
      const oldValue = this.vertexArrayObject.value
      const changed = {
        value: vertexArray !== oldValue,
      }

      // bind
      if ('bindVertexArray' in this.gl) {
        changed.value && this.gl.bindVertexArray(vertexArray)
        this.vertexArrayObject.value = vertexArray
        if (then?.() === false) {
          changed.value && this.gl.bindVertexArray(oldValue)
          this.vertexArrayObject.value = oldValue
        }
      }
    }
  }

  public updateUniforms(program: WebGLProgram, uniforms: Record<string, any>): void
  public updateUniforms(uniforms: Record<string, any>): void
  public updateUniforms(...args: any[]): void {
    if (args.length > 1) {
      return this.activeProgram(args[0], () => {
        this.updateUniforms(args[1])
        return false
      })
    }

    const program = this.program.value
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

  public viewport(
    x = 0,
    y = 0,
    width = this.gl.drawingBufferWidth,
    height = this.gl.drawingBufferHeight,
  ) {
    this.gl.viewport(x, y, width, height)
  }

  public clear(
    r = 0, g = 0, b = 0, a = 0,
    mask = this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT,
  ) {
    this.gl.clearColor(r, g, b, a)
    this.gl.clear(mask)
  }

  public draw(propsData: Partial<WebGLDrawProps> = {}) {
    const {
      mode = 'triangles',
      first = 0,
      instanceCount,
    } = propsData

    let {
      count = 0,
      bytesPerElement = 0,
    } = propsData

    const buffers = this.vertexArrayObject.value
      ? this.getRelatedProps(this.vertexArrayObject.value, 'vertexArray')
      : this.buffers

    if (!count || !bytesPerElement) {
      const indexBuffer = buffers.get('element_array_buffer')
      if (indexBuffer) {
        const props = this.getRelatedProps(indexBuffer, 'buffer')
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
      const buffer = buffers.get('array_buffer')
      if (buffer) {
        const props = this.getRelatedProps(buffer, 'buffer')
        if (props.size && props.data && 'length' in props.data) {
          count = ~~(Number(props.data.length) / props.size)
        }
      }
    }

    const bindingMode = this.getBindingPoint(mode)

    if (bytesPerElement) {
      if (bytesPerElement === 2 || (bytesPerElement === 4 && Boolean(this.extensions.uint32ElementIndex))) {
        const type = bytesPerElement === 2 ? this.gl.UNSIGNED_SHORT : this.gl.UNSIGNED_INT
        if (instanceCount && 'drawElementsInstanced' in this.gl) {
          this.gl.drawElementsInstanced(bindingMode, count, type, first * bytesPerElement, instanceCount)
          this.checkError('drawElementsInstanced')
        } else {
          this.gl.drawElements(bindingMode, count, type, first * bytesPerElement)
          this.checkError('drawElements')
        }
      } else {
        console.warn('unsupported index buffer type: uint32')
      }
    } else if (instanceCount && 'drawArraysInstanced' in this.gl) {
      this.gl.drawArraysInstanced(bindingMode, first, count, instanceCount)
      this.checkError('drawArraysInstanced')
    } else {
      this.gl.drawArrays(bindingMode, first, count)
      this.checkError('drawArrays')
    }
  }

  public destroy() {
    this.view.removeEventListener('webglcontextlost', this.onContextLost as any)
    this.view.removeEventListener('webglcontextrestored', this.onContextRestored as any)
    this.extensions.loseContext?.loseContext()
  }

  public toPixels(): Uint8ClampedArray {
    const width = this.gl.drawingBufferWidth
    const height = this.gl.drawingBufferHeight
    const length = width * height * 4
    const row = width * 4
    const end = (height - 1) * row
    const flipedPixels = new Uint8Array(length)
    const pixels = new Uint8ClampedArray(length)
    this.gl.readPixels(
      0,
      0,
      width,
      height,
      this.gl.RGBA,
      this.gl.UNSIGNED_BYTE,
      flipedPixels,
    )
    for (let i = 0; i < length; i += row) {
      pixels.set(flipedPixels.subarray(i, i + row), end - i)
    }
    return pixels
  }
}
