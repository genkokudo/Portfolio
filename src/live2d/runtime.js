import { CubismFramework } from 'cubism-framework/src/live2dcubismframework';
import { CubismUserModel } from 'cubism-framework/src/model/cubismusermodel';
import { CubismMatrix44 } from 'cubism-framework/src/math/cubismmatrix44';
import { CubismShaderManager_WebGL } from 'cubism-framework/src/rendering/cubismshader_webgl';
import { resolveAsset } from './asset-url.js';

let activeViewers = 0;

async function fetchAsset(url, signal, type = 'arrayBuffer') {
    const response = await fetch(url, { signal, credentials: 'omit' });
    if (!response.ok) throw new Error(`Live2D asset HTTP ${response.status}: ${new URL(url).pathname}`);
    return response[type]();
}

export async function createViewer(canvas, modelUrl, signal, onError) {
    if (!CubismFramework.isInitialized()) {
        if (!CubismFramework.startUp()) throw new Error('Cubism initialization failed');
        CubismFramework.initialize();
    }
    activeViewers++;
    const user = new CubismUserModel();
    const textures = [];
    const events = new AbortController();
    let gl, resizeObserver, frame = 0, destroyed = false, shader;
    let x = 0, y = 0, targetX = 0, targetY = 0, pointer = null, previousTime = 0;
    const destroy = () => {
        if (destroyed) return;
        destroyed = true;
        cancelAnimationFrame(frame);
        events.abort();
        resizeObserver?.disconnect();
        user.release();
        for (const texture of textures) gl.deleteTexture(texture);
        if (--activeViewers === 0) CubismShaderManager_WebGL.deleteInstance();
        gl?.getExtension('WEBGL_lose_context')?.loseContext();
    };
    try {
        const settings = await fetchAsset(modelUrl, signal, 'json');
        const refs = settings.FileReferences;
        if (!refs?.Moc || !Array.isArray(refs.Textures) || !refs.Textures.length) throw new Error('Missing model or textures');
        const moc = await fetchAsset(resolveAsset(refs.Moc, modelUrl), signal);
        signal.throwIfAborted();
        user.loadModel(moc, true);
        const model = user.getModel();
        if (!model) throw new Error('Invalid or unsupported moc3 model');
        if (refs.Physics) {
            const physics = await fetchAsset(resolveAsset(refs.Physics, modelUrl), signal);
            user.loadPhysics(physics, physics.byteLength);
        }
        if (refs.Pose) {
            const pose = await fetchAsset(resolveAsset(refs.Pose, modelUrl), signal);
            user.loadPose(pose, pose.byteLength);
        }
        signal.throwIfAborted();
        gl = canvas.getContext('webgl2', { alpha: true, antialias: true, premultipliedAlpha: true });
        if (!gl) throw new Error('WEBGL_UNAVAILABLE');
        user.createRenderer(Math.max(canvas.width, 1), Math.max(canvas.height, 1));
        const renderer = user.getRenderer();
        renderer.startUp(gl);
        renderer.setIsPremultipliedAlpha(true);
        renderer.loadShaders();
        shader = CubismShaderManager_WebGL.getInstance().getShader(gl);
        // R5 compiles shaders asynchronously; the build embeds their official source.
        while (shader._isShaderLoading) await new Promise(resolve => setTimeout(resolve, 10));
        signal.throwIfAborted();
        // R5 reserves unused blend slots; only failed (null) programs and the
        // required normal/mask/copy programs indicate compilation failure.
        if (!shader._isShaderLoaded || shader._shaderSets.slice(0, 11).some(set => !set.shaderProgram)
            || shader._shaderSets.some(set => set.shaderProgram === null)) throw new Error('Shader compilation failed');

        for (let index = 0; index < refs.Textures.length; index++) {
            const blob = await fetchAsset(resolveAsset(refs.Textures[index], modelUrl), signal, 'blob');
            const bitmap = await createImageBitmap(blob, { premultiplyAlpha: 'premultiply', colorSpaceConversion: 'none' });
            try {
                signal.throwIfAborted();
                if (bitmap.width > gl.getParameter(gl.MAX_TEXTURE_SIZE) || bitmap.height > gl.getParameter(gl.MAX_TEXTURE_SIZE)) throw new Error('Texture is too large for this device');
                const texture = gl.createTexture();
                if (!texture) throw new Error('Cannot create texture');
                textures.push(texture);
                gl.bindTexture(gl.TEXTURE_2D, texture);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, bitmap);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                renderer.bindTexture(index, texture);
            } finally { bitmap.close(); }
        }

        // Fit the actual artwork rather than assuming the exported canvas is square.
        let left = Infinity, right = -Infinity, bottom = Infinity, top = -Infinity;
        for (let drawable = 0; drawable < model.getDrawableCount(); drawable++) {
            const vertices = model.getDrawableVertices(drawable);
            for (let i = 0; i < vertices.length; i += 2) {
                left = Math.min(left, vertices[i]); right = Math.max(right, vertices[i]);
                bottom = Math.min(bottom, vertices[i + 1]); top = Math.max(top, vertices[i + 1]);
            }
        }
        if (![left, right, bottom, top].every(Number.isFinite) || right <= left || top <= bottom) throw new Error('Empty model geometry');
        const matrix = new CubismMatrix44();
        const resize = () => {
            const rect = canvas.getBoundingClientRect();
            const ratio = Math.min(window.devicePixelRatio || 1, 2);
            canvas.width = Math.max(1, Math.round(rect.width * ratio));
            canvas.height = Math.max(1, Math.round(rect.height * ratio));
            user.setRenderTargetSize(canvas.width, canvas.height);
            const aspect = canvas.width / canvas.height;
            const scale = Math.min(1.7 * aspect / (right - left), 1.7 / (top - bottom));
            matrix.loadIdentity();
            matrix.scale(scale / aspect, scale);
            matrix.translate(-(left + right) / 2 * scale / aspect, -(bottom + top) / 2 * scale);
        };
        resize();
        resizeObserver = new ResizeObserver(resize);
        resizeObserver.observe(canvas);
        const ids = new Map();
        for (const id of ['ParamAngleX', 'ParamAngleY', 'ParamAngleZ', 'ParamBodyAngleX', 'ParamEyeBallX', 'ParamEyeBallY']) {
            const index = model.getParameterIndex(CubismFramework.getIdManager().getId(id));
            if (index < model.getParameterCount()) ids.set(id, index);
        }
        const set = (id, value) => { if (ids.has(id)) model.setParameterValueByIndex(ids.get(id), value); };
        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
        const render = time => {
            if (destroyed || signal.aborted) return;
            try {
                const dt = previousTime ? Math.min((time - previousTime) / 1000, .05) : 1 / 60;
                previousTime = time;
                const blend = reducedMotion.matches ? 1 : 1 - Math.exp(-dt * 14);
                x += (targetX - x) * blend; y += (targetY - y) * blend;
                model.loadParameters();
                set('ParamAngleX', x * 30); set('ParamAngleY', y * 30);
                set('ParamAngleZ', -x * y * 10); set('ParamBodyAngleX', x * 10);
                set('ParamEyeBallX', x); set('ParamEyeBallY', y);
                if (!reducedMotion.matches) user._physics?.evaluate(model, dt);
                user._pose?.updateParameters(model, dt);
                model.update();
                gl.viewport(0, 0, canvas.width, canvas.height);
                gl.clearColor(0, 0, 0, 0);
                gl.clear(gl.COLOR_BUFFER_BIT);
                renderer.setMvpMatrix(matrix);
                renderer.setRenderState(null, [0, 0, canvas.width, canvas.height]);
                renderer.drawModel();
                frame = requestAnimationFrame(render);
            } catch (error) { destroy(); onError(error); }
        };
        const listen = (target, event, handler) => target.addEventListener(event, handler, { signal: events.signal });
        const move = event => {
            const rect = canvas.getBoundingClientRect();
            targetX = Math.max(-1, Math.min(1, (event.clientX - rect.left) / rect.width * 2 - 1));
            targetY = Math.max(-1, Math.min(1, 1 - (event.clientY - rect.top) / rect.height * 2));
        };
        listen(canvas, 'pointerdown', event => {
            if (pointer !== null || event.button !== 0) return;
            pointer = event.pointerId; canvas.setPointerCapture(pointer); canvas.focus({ preventScroll: true }); move(event);
        });
        listen(canvas, 'pointermove', event => { if (pointer === event.pointerId) move(event); });
        const releasePointer = event => { if (pointer === event.pointerId) pointer = null; };
        listen(canvas, 'pointerup', releasePointer);
        listen(canvas, 'pointercancel', releasePointer);
        listen(canvas, 'lostpointercapture', releasePointer);
        listen(canvas, 'keydown', event => {
            const moves = { ArrowLeft: [-.15, 0], ArrowRight: [.15, 0], ArrowUp: [0, .15], ArrowDown: [0, -.15] };
            if (moves[event.key]) {
                event.preventDefault();
                targetX = Math.max(-1, Math.min(1, targetX + moves[event.key][0]));
                targetY = Math.max(-1, Math.min(1, targetY + moves[event.key][1]));
            } else if (event.key === 'Home') { event.preventDefault(); targetX = targetY = 0; }
        });
        listen(document, 'visibilitychange', () => {
            cancelAnimationFrame(frame); previousTime = 0;
            if (!document.hidden) frame = requestAnimationFrame(render);
        });
        listen(canvas, 'webglcontextlost', event => {
            event.preventDefault(); destroy(); onError(new Error('WebGL context lost'));
        });
        signal.throwIfAborted();
        if (!document.hidden) frame = requestAnimationFrame(render);
        return { destroy, reset() { x = y = targetX = targetY = 0; model.loadParameters(); user._physics?.stabilization(model); } };
    } catch (error) {
        destroy();
        throw error;
    }
}
