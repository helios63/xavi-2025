<template>
    <div
        ref="wrapEl"
        class="webgl-image-wrap"
        :data-fallback="useFallback || null"
    >
        <CommonMediaImage
            ref="imgRoot"
            :image="image"
            :width="width"
            :height="height"
            :mobileWidth="mobileWidth"
            :mobileHeight="mobileHeight"
            :useLazy="useLazy"
            :quality="quality"
            :format="format"
            :alt="alt"
            class="webgl-image-img"
        />
        <canvas
            v-show="!useFallback"
            ref="canvasEl"
            aria-hidden="true"
            class="webgl-image-canvas"
        />
    </div>
</template>

<script setup>
const props = defineProps({
    image: { type: Object, required: true },
    width: { type: String, required: true },
    height: { type: String, default: undefined },
    mobileWidth: { type: String, required: true },
    mobileHeight: { type: String, default: undefined },
    useLazy: { type: Boolean, default: true },
    quality: { type: String, default: '85' },
    format: { type: String, default: 'auto' },
    alt: { type: String, default: '' },
    duration: { type: Number, default: 1800 },
})

const wrapEl = ref(null)
const imgRoot = ref(null)
const canvasEl = ref(null)
const useFallback = ref(false)

let gl = null
let program = null
let texture = null
let bufferQuad = null
let progressLoc = null
let coverLoc = null
let resLoc = null
let canvasPxW = 1
let canvasPxH = 1
let rafId = null
let resizeObs = null
let interObs = null
let textureReady = false
let coverScale = [1, 1]
let texW = 1
let texH = 1

// Hover-driven progress: 0 = fully pixelated, 1 = clear.
let currentProgress = 0
let targetProgress = 0
let lastFrameTime = 0
let hostEl = null
let hoverListeners = null

const VERT = `
attribute vec2 aPos;
varying vec2 vUv;
void main() {
  vUv = aPos * 0.5 + 0.5;
  vUv.y = 1.0 - vUv.y;
  gl_Position = vec4(aPos, 0.0, 1.0);
}`

const FRAG = `
precision mediump float;
uniform sampler2D uTex;
uniform float uProgress;
uniform vec2 uCover;
uniform vec2 uResolution;
varying vec2 vUv;

void main() {
  vec2 baseUv = (vUv - 0.5) * uCover + 0.5;

  // Step through 7 discrete LOD levels with equal time slices.
  // Block size: 64 → 32 → 16 → 8 → 4 → 2 → 1 screen-px per block.
  // Reads as a texture mip streaming in rather than a smooth blur.
  float numLevels = 7.0;
  float idx = clamp(floor(uProgress * numLevels), 0.0, numLevels - 1.0);
  float blockPx = pow(2.0, numLevels - 1.0 - idx);

  vec2 grid = uResolution / blockPx;
  vec2 quantUv = (floor(baseUv * grid) + 0.5) / grid;

  vec4 tex = texture2D(uTex, clamp(quantUv, 0.0, 1.0));
  gl_FragColor = vec4(tex.rgb, tex.a);
}`

const compileShader = (type, src) => {
    const sh = gl.createShader(type)
    gl.shaderSource(sh, src)
    gl.compileShader(sh)
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
        gl.deleteShader(sh)
        return null
    }
    return sh
}

const setupGL = () => {
    if (!canvasEl.value) return false
    const ctx =
        canvasEl.value.getContext('webgl', {
            alpha: true,
            premultipliedAlpha: true,
            antialias: false,
        }) || canvasEl.value.getContext('experimental-webgl', { alpha: true })
    if (!ctx) return false
    gl = ctx

    const vs = compileShader(gl.VERTEX_SHADER, VERT)
    const fs = compileShader(gl.FRAGMENT_SHADER, FRAG)
    if (!vs || !fs) return false

    program = gl.createProgram()
    gl.attachShader(program, vs)
    gl.attachShader(program, fs)
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return false
    gl.deleteShader(vs)
    gl.deleteShader(fs)
    gl.useProgram(program)

    bufferQuad = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferQuad)
    gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
        gl.STATIC_DRAW,
    )
    const posLoc = gl.getAttribLocation(program, 'aPos')
    gl.enableVertexAttribArray(posLoc)
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0)

    progressLoc = gl.getUniformLocation(program, 'uProgress')
    coverLoc = gl.getUniformLocation(program, 'uCover')
    resLoc = gl.getUniformLocation(program, 'uResolution')
    const texLoc = gl.getUniformLocation(program, 'uTex')

    texture = gl.createTexture()
    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        1,
        1,
        0,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        new Uint8Array([0, 0, 0, 0]),
    )
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    gl.uniform1i(texLoc, 0)
    gl.uniform2f(coverLoc, 1, 1)

    gl.enable(gl.BLEND)
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)
    gl.clearColor(0, 0, 0, 0)

    return true
}

const computeCover = () => {
    if (!wrapEl.value || !textureReady) return
    const rect = wrapEl.value.getBoundingClientRect()
    if (rect.width === 0 || rect.height === 0) return
    const viewRatio = rect.width / rect.height
    const texRatio = texW / texH
    if (texRatio > viewRatio) {
        coverScale = [viewRatio / texRatio, 1]
    } else {
        coverScale = [1, texRatio / viewRatio]
    }
}

const resizeCanvas = () => {
    if (!canvasEl.value || !wrapEl.value || !gl) return
    const rect = wrapEl.value.getBoundingClientRect()
    if (rect.width === 0 || rect.height === 0) return
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const w = Math.max(1, Math.round(rect.width * dpr))
    const h = Math.max(1, Math.round(rect.height * dpr))
    if (canvasEl.value.width !== w || canvasEl.value.height !== h) {
        canvasEl.value.width = w
        canvasEl.value.height = h
        gl.viewport(0, 0, w, h)
    }
    canvasPxW = w
    canvasPxH = h
    computeCover()
}

const uploadTexture = imageEl => {
    if (!gl || !texture) return
    texW = imageEl.naturalWidth || 1
    texH = imageEl.naturalHeight || 1
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true)
    gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        imageEl,
    )
    textureReady = true
    computeCover()
    draw(currentProgress)
    // Trigger may have fired (hover / viewport entry) before the texture was
    // ready — kick off the lerp now if there's a pending target.
    if (targetProgress !== currentProgress && rafId == null) {
        lastFrameTime = 0
        rafId = requestAnimationFrame(tickProgress)
    }
}

const draw = p => {
    if (!gl) return
    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.uniform1f(progressLoc, p)
    gl.uniform2f(coverLoc, coverScale[0], coverScale[1])
    gl.uniform2f(resLoc, canvasPxW, canvasPxH)
    gl.drawArrays(gl.TRIANGLES, 0, 6)
}

const dispose = () => {
    if (rafId) {
        cancelAnimationFrame(rafId)
        rafId = null
    }
    if (resizeObs) {
        resizeObs.disconnect()
        resizeObs = null
    }
    if (interObs) {
        interObs.disconnect()
        interObs = null
    }
    if (hostEl && hoverListeners) {
        hostEl.removeEventListener('mouseenter', hoverListeners.enter)
        hostEl.removeEventListener('mouseleave', hoverListeners.leave)
        hostEl.removeEventListener('focusin', hoverListeners.enter)
        hostEl.removeEventListener('focusout', hoverListeners.leave)
        hoverListeners = null
        hostEl = null
    }
    if (gl) {
        if (texture) gl.deleteTexture(texture)
        if (program) gl.deleteProgram(program)
        if (bufferQuad) gl.deleteBuffer(bufferQuad)
        const ext = gl.getExtension('WEBGL_lose_context')
        if (ext) ext.loseContext()
        gl = null
    }
}

const tickProgress = () => {
    if (!gl || !textureReady) {
        rafId = null
        return
    }
    const now = performance.now()
    const dt = lastFrameTime ? (now - lastFrameTime) / 1000 : 1 / 60
    lastFrameTime = now
    // Speed: a full 0↔1 swing takes `duration` ms.
    const speed = 1000 / Math.max(1, props.duration)
    const diff = targetProgress - currentProgress
    const step = Math.sign(diff) * Math.min(Math.abs(diff), speed * dt)
    currentProgress += step
    resizeCanvas()
    draw(currentProgress)
    if (Math.abs(targetProgress - currentProgress) > 0.001) {
        rafId = requestAnimationFrame(tickProgress)
    } else {
        currentProgress = targetProgress
        draw(currentProgress)
        rafId = null
        lastFrameTime = 0
    }
}

const setTarget = next => {
    targetProgress = next
    if (rafId == null && gl && textureReady) {
        lastFrameTime = 0
        rafId = requestAnimationFrame(tickProgress)
    }
}

const fallback = () => {
    useFallback.value = true
    dispose()
}

const loadTextureImage = () => {
    const pictureEl = imgRoot.value?.$el || imgRoot.value
    const imgEl = pictureEl?.querySelector?.('img')
    if (!imgEl) {
        fallback()
        return
    }
    const fetchSrc = () => imgEl.currentSrc || imgEl.src
    if (!fetchSrc()) {
        imgEl.addEventListener('load', loadTextureImage, { once: true })
        return
    }
    const tex = new Image()
    tex.crossOrigin = 'anonymous'
    tex.decoding = 'async'
    tex.onload = () => uploadTexture(tex)
    tex.onerror = fallback
    tex.src = fetchSrc()
}

const attachHover = () => {
    // Listen on the nearest .group ancestor so hover/focus on the whole card
    // (link + title area) triggers the reveal — matches the existing
    // group-hover:scale-[1.03] behavior. Falls back to the wrap itself.
    hostEl = wrapEl.value.closest('.group') || wrapEl.value
    hoverListeners = {
        enter: () => setTarget(1),
        leave: () => setTarget(0),
    }
    hostEl.addEventListener('mouseenter', hoverListeners.enter)
    hostEl.addEventListener('mouseleave', hoverListeners.leave)
    hostEl.addEventListener('focusin', hoverListeners.enter)
    hostEl.addEventListener('focusout', hoverListeners.leave)
}

const attachReveal = () => {
    // Touch path: one-shot reveal when the card enters viewport, no
    // re-pixelation on exit. Disconnect after the first intersection.
    interObs = new IntersectionObserver(
        entries => {
            entries.forEach(e => {
                if (e.isIntersecting) {
                    setTarget(1)
                    if (interObs) {
                        interObs.disconnect()
                        interObs = null
                    }
                }
            })
        },
        { threshold: 0.3 },
    )
    interObs.observe(wrapEl.value)
}

onMounted(() => {
    if (typeof window === 'undefined') return
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (reducedMotion.matches) {
        useFallback.value = true
        return
    }
    const hasHover = window.matchMedia('(hover: hover)').matches

    nextTick(() => {
        if (!wrapEl.value || !canvasEl.value) return
        if (!setupGL()) {
            fallback()
            return
        }
        resizeCanvas()
        draw(currentProgress)
        resizeObs = new ResizeObserver(() => {
            resizeCanvas()
            if (rafId == null && gl && textureReady) draw(currentProgress)
        })
        resizeObs.observe(wrapEl.value)
        if (hasHover) {
            attachHover()
        } else {
            attachReveal()
        }
        loadTextureImage()
    })
})

onBeforeUnmount(dispose)
</script>

<style scoped>
.webgl-image-wrap {
    position: relative;
    width: 100%;
    height: 100%;
}
.webgl-image-wrap :deep(.webgl-image-img) {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    opacity: 0;
}
/* Fallback: WebGL skipped (touch, reduced motion, setup failure) → show img. */
.webgl-image-wrap[data-fallback='true'] :deep(.webgl-image-img) {
    opacity: 1;
}
.webgl-image-canvas {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
}
</style>
