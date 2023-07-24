import {
  DEVICE_PIXEL_RATIO,
  createHTMLCanvas,
  getVarTypeSize,
  isCanvasElement,
  isWebgl2,
  uid,
} from './utils'

import type {
  WebGLBufferMetadata,
  WebGLBufferOptions,
  WebGLBufferTarget,
  WebGLDrawOptions,
  WebGLExtensions,
  WebGLFramebufferMetadata,
  WebGLFramebufferOptions,
  WebGLProgramMetadata,
  WebGLProgramOptions,
  WebGLTarget,
  WebGLTextureMetadata,
  WebGLTextureOptions,
  WebGLTextureTarget,
  WebGLTextureUnit,
  WebGLVertexArrayObjectMetadata,
  WebGLVertexArrayObjectOptions,
  WebGLVertexAttribOptions,
  WebGLViewport,
} from './WebGL'

export class WebGLRenderer {
  /**
   * Screen rect
   */
  readonly screen = { x: 0, y: 0, width: 0, height: 0 }

  /**
   * Device pixel ratio
   */
  pixelRatio = DEVICE_PIXEL_RATIO

  /**
   * Canvas
   */
  view?: HTMLCanvasElement

  /**
   * WebGL context
   */
  gl!: WebGLRenderingContext | WebGL2RenderingContext

  /**
   * WebGL version
   */
  version: 1 | 2 = 1

  /**
   * Extensions
   */
  extensions!: WebGLExtensions

  readonly bindPoints = new Map<number, WebGLTarget>()

  /**
   * Related metadata
   */
  readonly related = new WeakMap<object, any>()

  /**
   * Default viewport (bind null framebuffer)
   */
  viewportNull: WebGLViewport = { x: 0, y: 0, width: 0, height: 0 }

  /**
   * Bound framebuffer
   *
   * TODO blit
   */
  framebuffer: WebGLFramebuffer | null = null

  /**
   * Bound program
   */
  program: WebGLProgram | null = null

  /**
   * Active texture unit
   */
  textureUnit: WebGLTextureUnit = 0

  /**
   * Last activated texture target
   */
  textureTarget: WebGLTextureTarget = 'texture_2d'

  /**
   * Bound texture units
   */
  textureUnits: Record<WebGLTextureTarget, WebGLTexture | null>[] = []

  /**
   * Bound array buffer
   */
  arrayBuffer: WebGLBuffer | null = null

  /**
   * Last activated array buffer target
   */
  arrayBufferTarget: WebGLBufferTarget = 'array_buffer'

  /**
   * Default vertex array (bind null)
   */
  vertexArrayNull: WebGLVertexArrayObjectMetadata = {
    attributes: {},
    elementArrayBuffer: null,
  }

  /**
   * Bound vertex array
   */
  vertexArray: WebGLVertexArrayObjectMetadata = this.vertexArrayNull

  /**
   * Bound vertex array object
   */
  vertexArrayObject: WebGLVertexArrayObject | null = null

  /**
   * Max texture image units
   */
  maxTextureImageUnits!: number

  constructor(gl: WebGLRenderingContext | WebGL2RenderingContext)
  constructor(view?: HTMLCanvasElement, options?: WebGLContextAttributes)
  constructor(...args: any[]) {
    if (args[0] === undefined || isCanvasElement(args[0])) {
      this.setupContext(args[0] ?? createHTMLCanvas(), args[1])
    } else {
      this.gl = args[0]
      if (isWebgl2(this.gl)) {
        this.version = 2
      }
    }

    this
      .setupBindPoints()
      .setupExtensions()
      .setupPolyfill()
      .setupTextureUnits()
  }

  /**
   * Setup WebGL context
   *
   * @param view
   * @param options
   * @protected
   */
  protected setupContext(view: HTMLCanvasElement, options?: WebGLContextAttributes): this {
    this.view = view
    let gl = <any>(view.getContext('webgl2', options) || view.getContext('experimental-webgl2', options))
    let version: 1 | 2 = 2

    if (!gl) {
      gl = view.getContext('webgl', options) || view.getContext('experimental-webgl', options)
      version = 1
    }

    if (!gl) {
      throw new Error('Unable to get context')
    }

    this.gl = gl
    this.version = version

    view.addEventListener('webglcontextlost', this.onContextLost as any, false)
    view.addEventListener('webglcontextrestored', this.onContextRestored as any, false)

    return this
  }

  /**
   * Setup extensions
   *
   * @protected
   */
  protected setupExtensions(): this {
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

    this.extensions = extensions

    return this
  }

  /**
   * Setup bind points
   *
   * @protected
   */
  protected setupBindPoints(): this {
    for (const key in this.gl) {
      if (key === key.toUpperCase()) {
        const value = (this.gl as any)[key]
        if (typeof value === 'number') {
          this.bindPoints.set(value, key.toLowerCase() as any)
        }
      }
    }
    return this
  }

  /**
   * Setup polyfill
   *
   * @protected
   */
  protected setupPolyfill(): this {
    if (this.version === 1) {
      const { instancedArrays, vertexArrayObject, drawBuffers } = this.extensions
      const polyfill = this.gl as WebGL2RenderingContext
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
    return this
  }

  /**
   * Setup texture units
   *
   * @protected
   */
  protected setupTextureUnits(): this {
    const maxTextures = this.gl.getParameter(this.gl.MAX_TEXTURE_IMAGE_UNITS)
    this.maxTextureImageUnits = maxTextures

    for (let i = 0; i < maxTextures; i++) {
      this.textureUnits[i] = { texture_2d: null, texture_cube_map: null }
    }
    return this
  }

  protected onContextLost(event: WebGLContextEvent) {
    event.preventDefault()
    setTimeout(() => {
      this.gl.isContextLost() && this.extensions.loseContext?.restoreContext()
    }, 0)
  }

  protected onContextRestored() {}

  /**
   * Get WebGL point (target)
   *
   * @param target
   */
  getBindPoint(target: WebGLTarget): number {
    return (this.gl as any)[target.toUpperCase()] as number
  }

  createShader(source: string, type: 'vertex_shader' | 'fragment_shader'): WebGLShader {
    const shader = this.gl.createShader(this.getBindPoint(type))

    if (!shader) {
      throw new Error('Unable to create shader')
    }

    this.gl.shaderSource(shader, source)
    this.gl.compileShader(shader)

    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      throw new Error(`Unable to compiling shader :\n${ source }\n${ this.gl.getShaderInfoLog(shader) }`)
    }

    return shader
  }

  createProgram(options?: WebGLProgramOptions): WebGLProgram {
    const program = this.gl.createProgram()

    if (!program) {
      throw new Error('Unable to create program')
    }

    if (options) {
      this.updateProgram(program, options)
    }

    return program
  }

  getProgramMetadata(program: WebGLProgram): WebGLProgramMetadata {
    let metadata: WebGLProgramMetadata = this.related.get(program)
    if (!metadata) {
      this.related.set(program, metadata = {
        attributes: new Map(),
        uniforms: new Map(),
        boundUniforms: new WeakMap(),
      })
    }
    return metadata
  }

  updateProgram(options: WebGLProgramOptions): void
  updateProgram(program: WebGLProgram, options: WebGLProgramOptions): void
  updateProgram(...args: any[]): void {
    if (args.length > 1) {
      const oldValue = this.program
      this.program = args[0]
      this.updateProgram(args[1])
      this.program = oldValue
      return
    }

    const options = args[0] as WebGLProgramOptions
    const program = this.program

    if (!program) return

    const metadata = this.getProgramMetadata(program)

    const vert = this.createShader(options.vert, 'vertex_shader')
    const frag = this.createShader(options.frag, 'fragment_shader')

    this.gl.attachShader(program, vert)
    this.gl.attachShader(program, frag)
    this.gl.linkProgram(program)
    this.gl.deleteShader(vert)
    this.gl.deleteShader(frag)

    if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
      throw new Error(`Unable to link program: ${ this.gl.getProgramInfoLog(program) }`)
    }

    metadata.attributes.clear()
    metadata.uniforms.clear()

    for (
      let len = this.gl.getProgramParameter(program, this.gl.ACTIVE_ATTRIBUTES), i = 0;
      i < len;
      i++
    ) {
      const attrib = this.gl.getActiveAttrib(program, i)

      if (!attrib || attrib.name.startsWith('gl_')) continue

      const type = this.bindPoints.get(attrib.type) ?? String(attrib.type) as any

      metadata.attributes.set(attrib.name, {
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

      let location = this.gl.getUniformLocation(program, name)
      if (!location) {
        location = this.gl.getUniformLocation(program, uniform.name)
      }

      metadata.uniforms.set(name, {
        name,
        index: i,
        type: this.bindPoints.get(uniform.type) ?? String(uniform.type) as any,
        size: uniform.size,
        isArray: name !== uniform.name,
        location,
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
    if (changed.value) {
      this.gl.useProgram(program)
      this.program = program
    }

    // rollback change
    if (then?.() === false && changed.value) {
      this.gl.useProgram(oldValue)
      this.program = oldValue
    }
  }

  createFramebuffer(options?: WebGLFramebufferOptions): WebGLFramebuffer {
    const framebuffer = this.gl.createFramebuffer()

    if (!framebuffer) {
      throw new Error('Unable to create framebuffer')
    }

    if (options) {
      this.activeFramebuffer(framebuffer, () => {
        this.updateFramebuffer(options)
        return false
      })
    }

    return framebuffer
  }

  getFramebufferMetadata(framebuffer: WebGLFramebuffer): WebGLFramebufferMetadata {
    let metadata: WebGLFramebufferMetadata = this.related.get(framebuffer)
    if (!metadata) {
      this.related.set(framebuffer, metadata = {
        viewport: { x: 0, y: 0, width: 0, height: 0 },
      })
    }
    return metadata
  }

  updateFramebuffer(options: WebGLFramebufferOptions): void
  updateFramebuffer(framebuffer: WebGLFramebuffer, options: WebGLFramebufferOptions): void
  updateFramebuffer(...args: any[]): void {
    if (args.length > 1) {
      this.activeFramebuffer(args[0])
      return this.updateFramebuffer(args[1])
    }

    const options = args[0] as WebGLFramebufferOptions
    const framebuffer = this.framebuffer

    if (!framebuffer) return

    if (options.colorTextures) {
      for (let len = options.colorTextures.length, i = 0; i < len; i++) {
        const texture = options.colorTextures[i]

        this.activeTexture({
          unit: 0,
          target: 'texture_2d',
          value: texture,
          forceUpdateUnit: true,
        })

        this.gl.framebufferTexture2D(
          this.gl.FRAMEBUFFER,
          this.gl.COLOR_ATTACHMENT0 + i,
          this.gl.TEXTURE_2D,
          texture,
          options.mipLevel ?? 0,
        )
      }
    }

    if (options.colorTextures && options.colorTextures.length > 1 && 'drawBuffers' in this.gl) {
      this.gl.drawBuffers(
        options.colorTextures.map((_, i) => this.gl.COLOR_ATTACHMENT0 + i),
      )
    }

    if (options.depthTexture && (this.version > 1 || this.extensions.depthTexture)) {
      this.activeTexture({
        unit: 0,
        target: 'texture_2d',
        value: options.depthTexture,
        forceUpdateUnit: true,
      })

      this.gl.framebufferTexture2D(
        this.gl.FRAMEBUFFER,
        this.gl.DEPTH_ATTACHMENT,
        this.gl.TEXTURE_2D,
        options.depthTexture,
        options.mipLevel ?? 0,
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
    if (changed.value) {
      this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, framebuffer)
      this.framebuffer = framebuffer
    }

    // rollback change
    if (then?.() === false && changed.value) {
      this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, oldValue)
      this.framebuffer = oldValue
    }
  }

  createTexture(options?: WebGLTextureOptions): WebGLTexture {
    const texture = this.gl.createTexture()

    if (!texture) {
      throw new Error('Unable to create texture')
    }

    if (options) {
      this.activeTexture({
        unit: options.unit,
        target: options.target,
        value: texture,
        forceUpdateUnit: true,
      }, () => {
        this.updateTexture({
          filterMode: 'linear',
          wrapMode: 'repeat',
          ...options,
        })
        return false
      })
    }

    return texture
  }

  getTextureMetadata(texture: WebGLTexture): WebGLTextureMetadata {
    let metadata: WebGLTextureMetadata = this.related.get(texture)
    if (!metadata) {
      this.related.set(texture, metadata = {})
    }
    return metadata
  }

  updateTexture(options: WebGLTextureOptions): void
  updateTexture(texture: WebGLTexture, options: WebGLTextureOptions): void
  updateTexture(...args: any[]): void {
    if (args.length > 1) {
      this.activeTexture({
        unit: args[1].unit,
        target: args[1].target,
        value: args[0] as WebGLTexture,
        forceUpdateUnit: true,
      })

      this.updateTexture(args[1])
      return
    }

    const {
      target = this.textureTarget,
      source,
      filterMode,
      wrapMode,
      anisoLevel,
    } = args[0] as WebGLTextureOptions

    const texture = this.textureUnits[this.textureUnit][target]

    if (!texture) return

    const metadata = this.getTextureMetadata(texture)
    const glTarget = this.getBindPoint(target)

    // TODO lazy texImage2D
    if (source !== undefined) {
      if (source === null) {
        this.gl.texImage2D(glTarget, 0, this.gl.RGBA, 1, 1, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, null)
        metadata.width = 1
        metadata.height = 1
      } else if ('pixels' in source) {
        this.gl.texImage2D(glTarget, 0, this.gl.RGBA, source.width, source.height, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, source.pixels)
        metadata.width = source.width
        metadata.height = source.height
      } else {
        this.gl.texImage2D(glTarget, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, source)
        const any = source as any
        metadata.width = Number(any.naturalWidth || any.videoWidth || any.width || 0)
        metadata.height = Number(any.naturalHeight || any.videoHeight || any.height || 0)
      }
    }

    if (wrapMode && metadata.wrapMode !== wrapMode) {
      metadata.wrapMode = wrapMode
      const glWrapMode = this.getBindPoint(wrapMode)
      this.gl.texParameteri(glTarget, this.gl.TEXTURE_WRAP_S, glWrapMode)
      this.gl.texParameteri(glTarget, this.gl.TEXTURE_WRAP_T, glWrapMode)
    }

    if (filterMode && metadata.filterMode !== filterMode) {
      metadata.filterMode = filterMode
      const glFilterMode = this.getBindPoint(filterMode.split('_')[0] as any)
      if (filterMode.includes('_')) {
        this.gl.texParameteri(glTarget, this.gl.TEXTURE_MIN_FILTER, this.getBindPoint(filterMode))
      } else {
        this.gl.texParameteri(glTarget, this.gl.TEXTURE_MIN_FILTER, glFilterMode)
      }
      this.gl.texParameteri(glTarget, this.gl.TEXTURE_MAG_FILTER, glFilterMode)
    }

    // ext: anisotropicFiltering
    if (
      anisoLevel
      && filterMode === 'linear'
      && this.extensions.anisotropicFiltering
    ) {
      if (metadata.anisoLevel !== anisoLevel) {
        metadata.anisoLevel = anisoLevel

        const {
          MAX_TEXTURE_MAX_ANISOTROPY_EXT,
          TEXTURE_MAX_ANISOTROPY_EXT,
        } = this.extensions.anisotropicFiltering

        this.gl.texParameterf(
          glTarget,
          TEXTURE_MAX_ANISOTROPY_EXT,
          Math.min(
            anisoLevel,
            this.gl.getParameter(MAX_TEXTURE_MAX_ANISOTROPY_EXT),
          ),
        )
      }
    }
  }

  activeTexture(
    texture: WebGLTexture | null | {
      unit?: WebGLTextureUnit
      forceUpdateUnit?: boolean
      target?: WebGLTextureTarget
      value: WebGLTexture | null
    },
    then?: (target: number) => void | false,
  ): void {
    // normalization params
    let value, target: WebGLTextureTarget | undefined, unit, forceUpdateUnit
    if (texture && 'value' in texture) {
      ({ target, value, unit, forceUpdateUnit } = texture)
    } else {
      value = texture
    }
    if (value) {
      const metadata = this.getTextureMetadata(value)
      if (target === undefined) target = metadata.target ?? 'texture_2d'
      if (unit === undefined) unit = metadata.unit ?? 0
      metadata.target = target
      metadata.unit = unit
    } else {
      if (target === undefined) target = 'texture_2d'
      if (unit === undefined) unit = 0
    }

    // get or init texture unit
    let textureUnit = this.textureUnits[unit]
    if (!textureUnit) {
      this.textureUnits[unit] = textureUnit = { texture_2d: null, texture_cube_map: null }
    }

    // changed
    const oldValue = textureUnit[target] ?? null
    const oldUnit = this.textureUnit
    const oldTarget = this.textureTarget
    const changedTexture = value !== oldValue
    const changed = {
      unit: unit !== oldUnit && (changedTexture || forceUpdateUnit),
      texture: changedTexture,
    }

    // active and bind
    const glTarget = this.getBindPoint(target)
    if (changed.unit) {
      this.gl.activeTexture(this.gl.TEXTURE0 + unit)
      this.textureUnit = unit
    }
    if (changed.texture) {
      this.gl.bindTexture(glTarget, value)
      textureUnit[target] = value
    }
    this.textureTarget = target

    // rollback change
    if (then?.(glTarget) === false) {
      if (changed.texture) {
        this.gl.bindTexture(glTarget, oldValue)
        textureUnit[target] = oldValue
      }
      if (changed.unit) {
        this.gl.activeTexture(this.gl.TEXTURE0 + oldUnit)
        this.textureUnit = oldUnit
      }
      this.textureTarget = oldTarget
    }
  }

  createBuffer(options?: WebGLBufferOptions): WebGLBuffer {
    const buffer = this.gl.createBuffer()

    if (!buffer) {
      throw new Error('failed to createBuffer')
    }

    if (options) {
      this.activeBuffer({
        target: options.target,
        value: buffer,
      }, () => {
        this.updateBuffer(options)
        return false
      })
    }

    return buffer
  }

  getBufferMetadata(buffer: WebGLBuffer): WebGLBufferMetadata {
    let metadata: WebGLBufferMetadata = this.related.get(buffer)
    if (!metadata) {
      this.related.set(buffer, metadata = {
        id: uid(buffer),
        length: 0,
        byteLength: 0,
        bytesPerElement: 0,
      })
    }
    return metadata
  }

  updateBuffer(options: WebGLBufferOptions): void
  updateBuffer(buffer: WebGLBuffer, options: WebGLBufferOptions): void
  updateBuffer(...args: any[]): void {
    if (args.length > 1) {
      this.activeBuffer({
        target: args[1].target,
        value: args[0],
      })
      this.updateBuffer(args[1])
      return
    }

    const {
      target = this.arrayBufferTarget,
      usage = 'static_draw',
      data,
    } = args[0] as WebGLBufferOptions

    const buffer = target === 'array_buffer'
      ? this.arrayBuffer
      : this.vertexArray.elementArrayBuffer

    if (!buffer) return

    let source
    if (data instanceof Array) {
      if (target === 'array_buffer') {
        source = new Float32Array(data)
      } else {
        source = new Uint32Array(data)
      }
    } else {
      source = data
    }

    const glTarget = this.getBindPoint(target)
    const metadata = this.getBufferMetadata(buffer)

    if (source && source.byteLength <= metadata.byteLength) {
      this.gl.bufferSubData(glTarget, 0, source)
    } else {
      this.gl.bufferData(glTarget, source, this.getBindPoint(usage))
    }

    metadata.target = target
    metadata.usage = usage
    metadata.length = (source as any)?.length ?? 0
    metadata.byteLength = source?.byteLength ?? 0
    metadata.bytesPerElement = metadata.length ? metadata.byteLength / metadata.length : 0
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
    if (value) {
      const metadata = this.getBufferMetadata(value)
      if (target === undefined) target = metadata.target ?? this.arrayBufferTarget
      metadata.target = target
    } else {
      if (target === undefined) target = this.arrayBufferTarget
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
    if (changed.buffer) {
      this.gl.bindBuffer(glTarget, value)
      if (target === 'array_buffer') {
        this.arrayBuffer = value
      } else {
        this.vertexArray.elementArrayBuffer = value
      }
      this.arrayBufferTarget = target
    }

    // rollback change
    if (then?.() === false && changed.buffer) {
      this.gl.bindBuffer(glTarget, oldValue)
      if (target === 'array_buffer') {
        this.arrayBuffer = oldValue
      } else {
        this.vertexArray.elementArrayBuffer = oldValue
      }
      this.arrayBufferTarget = oldTarget
    }
  }

  activeVertexAttrib(key: string, options: WebGLVertexAttribOptions, location = 0): void {
    this.activeBuffer({
      target: 'array_buffer',
      value: options.buffer,
    })

    this.gl.enableVertexAttribArray(location)
    this.gl.vertexAttribPointer(
      location,
      options.size ?? 0,
      this.getBindPoint(options.type ?? 'float'),
      options.normalized ?? false,
      options.stride ?? 0,
      options.offset ?? 0,
    )

    // ext: instancedArrays
    if (options.divisor) {
      if ('vertexAttribDivisor' in this.gl) {
        this.gl.vertexAttribDivisor(location, options.divisor)
      } else {
        console.warn('Failed to active vertex array object, GPU Instancing is not supported on this device')
      }
    }

    this.vertexArray.attributes[key] = {
      enable: true,
      buffer: options.buffer,
      size: options.size,
      type: options.type,
      normalized: options.normalized,
      stride: options.stride,
      offset: options.offset,
      divisor: options.divisor,
    }
  }

  createVertexArray(options?: WebGLVertexArrayObjectOptions): WebGLVertexArrayObject | null
  createVertexArray(program?: WebGLProgram, options?: WebGLVertexArrayObjectOptions): WebGLVertexArrayObject | null
  createVertexArray(...args: any[]): WebGLVertexArrayObject | null {
    if (!('createVertexArray' in this.gl)) {
      return null
    }

    const vertexArray = this.gl.createVertexArray()

    if (!vertexArray) {
      throw new Error('Unable to create vertex array')
    }

    if (args.length === 2) {
      this.updateVertexArray(args[0], vertexArray, args[1])
    } else if (args.length === 1) {
      this.updateVertexArray(vertexArray, args[0])
    }

    return vertexArray
  }

  getVertexArrayMetadata(vertexArray: WebGLVertexArrayObject): WebGLVertexArrayObjectMetadata {
    let metadata: WebGLVertexArrayObjectMetadata = this.related.get(vertexArray)
    if (!metadata) {
      this.related.set(vertexArray, metadata = {
        attributes: {},
        elementArrayBuffer: null,
      })
    }
    return metadata
  }

  updateVertexArray(options: WebGLVertexArrayObjectOptions): void
  updateVertexArray(vertexArray: WebGLVertexArrayObject, options: WebGLVertexArrayObjectOptions): void
  updateVertexArray(program: WebGLProgram, vertexArray: WebGLVertexArrayObject, options: WebGLVertexArrayObjectOptions): void
  updateVertexArray(...args: any[]): void {
    if (args.length > 2) {
      this.activeProgram(args[0])
      this.updateVertexArray(args[1], args[2])
      return
    } else if (args.length === 2) {
      if (args[0]) {
        const vertexArrayObject = args[0] as WebGLVertexArrayObject
        this.activeVertexArray(vertexArrayObject)
        this.updateVertexArray(args[1] as WebGLVertexArrayObjectOptions)
        const props = this.getVertexArrayMetadata(vertexArrayObject)
        props.attributes = this.vertexArray.attributes
        props.elementArrayBuffer = this.vertexArray.elementArrayBuffer
        this.activeVertexArray(null)
        this.activeBuffer({ target: 'array_buffer', value: null })
        return
      } else {
        return this.updateVertexArray(args[1])
      }
    }

    const program = this.program

    if (!program) return
    const options = args[0] as WebGLVertexArrayObjectOptions

    // active vertex attrib
    if (options.attributes) {
      const programProps = this.related.get(program)
      const stride: Record<number, number> = {}
      const offset: Record<number, number> = {}
      const attribs = new Map<string, WebGLVertexAttribOptions & {
        id: number
        location?: number
        byteLength: number
      }>()

      for (const key in options.attributes) {
        const attrib = options.attributes[key]

        // normalization params
        let buffer, bufferProps: WebGLVertexAttribOptions & WebGLBufferMetadata
        if ('buffer' in attrib) {
          buffer = attrib.buffer
          bufferProps = { ...this.getBufferMetadata(buffer), ...attrib }
        } else {
          buffer = attrib
          bufferProps = { ...this.getBufferMetadata(buffer), buffer }
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
      value: options.elementArrayBuffer ?? null,
    })

    this.vertexArray.elementArrayBuffer = options.elementArrayBuffer ?? null
  }

  activeVertexArray(
    vertexArrayObject: WebGLVertexArrayObject | null | WebGLVertexArrayObjectOptions,
    then?: () => void | false,
  ): void {
    if (vertexArrayObject && 'attributes' in vertexArrayObject) {
      this.updateVertexArray(vertexArrayObject)
      then?.()
    } else if ('bindVertexArray' in this.gl) {
      // changed
      const oldValue = this.vertexArrayObject
      const oldVertexArray = this.vertexArray
      const changed = {
        value: vertexArrayObject !== oldValue,
      }

      // bind vertex array
      if (changed.value) {
        this.gl.bindVertexArray(vertexArrayObject)
        this.vertexArrayObject = vertexArrayObject
        if (vertexArrayObject) {
          this.vertexArray = { ...this.getVertexArrayMetadata(vertexArrayObject) }
        } else {
          this.vertexArray = this.vertexArrayNull
        }
      }

      // rollback change
      if (then?.() === false && changed.value) {
        this.gl.bindVertexArray(oldValue)
        this.vertexArrayObject = oldValue
        this.vertexArray = oldVertexArray
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

    const uniforms = args[0]

    const {
      uniforms: uniformsInfo,
      boundUniforms,
    } = this.getProgramMetadata(program)

    for (const key in uniforms) {
      const value = uniforms[key]
      const info = uniformsInfo.get(key)
      if (!info) continue
      const { type, isArray, location } = info
      if (!location) continue

      const oldValue = boundUniforms.get(location)
      if (oldValue === value) continue
      boundUniforms.set(location, value)

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
    let viewport = this.viewportNull

    if (this.framebuffer) {
      viewport = this.getFramebufferMetadata(this.framebuffer).viewport
    }

    if (
      viewport.x === x
      && viewport.y === y
      && viewport.width === width
      && viewport.height === height
    ) {
      return
    }

    this.gl.viewport(x, y, width, height)

    viewport.x = x
    viewport.y = y
    viewport.width = width
    viewport.height = height
  }

  clear(
    mask = this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT,
  ) {
    this.gl.clear(mask)
  }

  draw(options: WebGLDrawOptions = {}) {
    const {
      mode = 'triangles',
      first = 0,
      instanceCount,
    } = options

    let {
      count = 0,
      bytesPerElement = 0,
    } = options

    if (!count || !bytesPerElement) {
      const buffer = this.vertexArray.elementArrayBuffer ?? Object.values(this.vertexArray.attributes)[0]
      if (buffer) {
        const metadata = this.getBufferMetadata(buffer)
        if (!count) count = metadata.length
        if (!bytesPerElement) bytesPerElement = metadata.bytesPerElement
      }
    }

    const glMode = this.getBindPoint(mode)

    if (bytesPerElement) {
      if (bytesPerElement === 2 || (bytesPerElement === 4 && Boolean(this.extensions.uint32ElementIndex))) {
        const type = bytesPerElement === 2 ? this.gl.UNSIGNED_SHORT : this.gl.UNSIGNED_INT
        if (instanceCount && 'drawElementsInstanced' in this.gl) {
          this.gl.drawElementsInstanced(glMode, count, type, first * bytesPerElement, instanceCount)
        } else {
          this.gl.drawElements(glMode, count, type, first * bytesPerElement)
        }
      } else {
        console.warn('Unsupported index buffer type: uint32')
      }
    } else if (instanceCount && 'drawArraysInstanced' in this.gl) {
      this.gl.drawArraysInstanced(glMode, first, count, instanceCount)
    } else {
      this.gl.drawArrays(glMode, first, count)
    }
  }

  destroy() {
    this.view?.removeEventListener('webglcontextlost', this.onContextLost as any)
    this.view?.removeEventListener('webglcontextrestored', this.onContextRestored as any)
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
    const viewWidth = Math.round(width * this.pixelRatio)
    const viewHeight = Math.round(height * this.pixelRatio)
    const screenWidth = viewWidth / this.pixelRatio
    const screenHeight = viewHeight / this.pixelRatio
    if (this.view) {
      this.view.width = viewWidth
      this.view.height = viewHeight
    }
    this.screen.width = screenWidth
    this.screen.height = screenHeight
    if (updateCss && this.view) {
      this.view.style.width = `${ screenWidth }px`
      this.view.style.height = `${ screenHeight }px`
    }
  }
}
