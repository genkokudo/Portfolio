const coreUrl = 'https://cubism.live2d.com/sdk-web/core/06/live2dcubismcore.min.js';
let corePromise;
const sessions = new Map();

function loadCore() {
    if (globalThis.Live2DCubismCore) return Promise.resolve();
    if (!corePromise) {
        corePromise = new Promise((resolve, reject) => {
            const script = document.createElement('script');
            const finish = error => {
                clearTimeout(timer);
                script.onload = script.onerror = null;
                if (error) { script.remove(); reject(error); } else resolve();
            };
            const timer = setTimeout(() => finish(new Error('Cubism Core timeout')), 20000);
            script.src = coreUrl;
            script.crossOrigin = 'anonymous';
            script.onload = () => finish(globalThis.Live2DCubismCore ? null : new Error('Cubism Core missing'));
            script.onerror = () => finish(new Error('Cubism Core unavailable'));
            document.head.append(script);
        }).catch(error => { corePromise = null; throw error; });
    }
    return corePromise;
}

function report(session, state, message = null) {
    if (!session.disposed) session.callback.invokeMethodAsync('SetViewerState', state, message).catch(() => {});
}

export function mount(id, canvas, modelUrl, callback) {
    unmount(id);
    const session = { controller: new AbortController(), callback, disposed: false, viewer: null, observer: null, timer: null };
    sessions.set(id, session);
    session.observer = new MutationObserver(() => { if (!canvas.isConnected) unmount(id); });
    session.observer.observe(document.body, { childList: true, subtree: true });
    session.timer = setTimeout(() => session.controller.abort(new Error('Live2D load timeout')), 45000);
    // Return immediately so closing the modal can cancel a pending load.
    session.pending = (async () => {
        try {
            await loadCore();
            session.controller.signal.throwIfAborted();
            const runtime = await import('./live2d-runtime.js');
            session.controller.signal.throwIfAborted();
            session.viewer = await runtime.createViewer(canvas, modelUrl, session.controller.signal, error => {
                console.error('Live2D rendering failed', error);
                report(session, 'error', '表示を続けられませんでした。もう一度読み込んでください。');
            });
            if (session.disposed) { session.viewer.destroy(); return; }
            report(session, 'ready');
        } catch (error) {
            if (session.disposed) return;
            console.error('Live2D loading failed', error);
            report(session, 'error', error.message === 'WEBGL_UNAVAILABLE'
                ? 'この環境では3D描画を利用できません。別のブラウザでお試しください。'
                : 'モデルを読み込めませんでした。通信環境を確認して、もう一度お試しください。');
        } finally { clearTimeout(session.timer); }
    })();
}

export function reset(id) { sessions.get(id)?.viewer?.reset(); }

export function unmount(id) {
    const session = sessions.get(id);
    if (!session) return;
    session.disposed = true;
    session.controller.abort();
    clearTimeout(session.timer);
    session.observer?.disconnect();
    session.viewer?.destroy();
    sessions.delete(id);
}
