import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import { resolveAsset } from '../src/live2d/asset-url.js';

const source = await readFile(new URL('../Portfolio/wwwroot/js/live2d-demo.js', import.meta.url), 'utf8');
const modelUrl = 'https://example.com/api/live2d/penguin/1254.model3.json';
const tick = () => new Promise(resolve => setTimeout(resolve, 0));

async function harness(createViewer) {
    const states = [], observers = [];
    const context = vm.createContext({
        console: { error() {} }, AbortController, setTimeout, clearTimeout,
        Live2DCubismCore: {},
        document: { body: {} },
        MutationObserver: class {
            constructor(callback) { this.callback = callback; observers.push(this); }
            observe() {} disconnect() { this.disconnected = true; }
        }
    });
    const runtime = new vm.SyntheticModule(['createViewer'], function () { this.setExport('createViewer', createViewer); }, { context });
    await runtime.link(() => {}); await runtime.evaluate();
    const module = new vm.SourceTextModule(source, { context, importModuleDynamically: () => runtime });
    await module.link(() => {}); await module.evaluate();
    return {
        api: module.namespace, states, observers, canvas: { isConnected: true },
        callback: { invokeMethodAsync(method, ...args) { states.push([method, ...args]); return Promise.resolve(); } }
    };
}

test('relative model files preserve their names and nested API path', () => {
    assert.equal(resolveAsset('1254.2048/texture_00.png', modelUrl), 'https://example.com/api/live2d/penguin/1254.2048/texture_00.png');
    assert.equal(resolveAsset('1254.physics3.json', modelUrl), 'https://example.com/api/live2d/penguin/1254.physics3.json');
});

test('model references cannot escape to another model, origin or protocol', () => {
    for (const reference of ['../other/file', '/outside/file', 'https://other.example/file', '//other.example/file', 'data:text/plain,hello', '%2e%2e/file', 'textures\\file', '', null]) {
        assert.throws(() => resolveAsset(reference, modelUrl), undefined, String(reference));
    }
});

test('closing after ready destroys the viewer once and disconnects DOM observation', async () => {
    let destroyed = 0, resets = 0;
    const h = await harness(async () => ({ destroy() { destroyed++; }, reset() { resets++; } }));
    h.api.mount('a', h.canvas, modelUrl, h.callback);
    await tick();
    assert.equal(h.states[0][1], 'ready');
    h.api.reset('a'); assert.equal(resets, 1);
    h.api.unmount('a'); h.api.unmount('a'); h.api.reset('a');
    assert.equal(destroyed, 1); assert.equal(resets, 1); assert.equal(h.observers[0].disconnected, true);
});

test('closing while loading aborts IO and disposes a late result without ready callback', async () => {
    let finish, signal, destroyed = 0;
    const h = await harness((canvas, url, token) => { signal = token; return new Promise(resolve => { finish = resolve; }); });
    h.api.mount('a', h.canvas, modelUrl, h.callback);
    await tick(); h.api.unmount('a');
    assert.equal(signal.aborted, true);
    finish({ destroy() { destroyed++; } }); await tick();
    assert.equal(destroyed, 1); assert.equal(h.states.length, 0);
});

test('failure is recoverable by mounting a fresh viewer', async () => {
    let calls = 0;
    const h = await harness(async () => { if (++calls === 1) throw new Error('HTTP 404'); return { destroy() {}, reset() {} }; });
    h.api.mount('a', h.canvas, modelUrl, h.callback); await tick();
    assert.equal(h.states[0][1], 'error');
    h.api.mount('a', h.canvas, modelUrl, h.callback); await tick();
    assert.equal(h.states[1][1], 'ready');
    h.api.unmount('a');
});

test('DOM removal cleans up even when the .NET disposal callback is unavailable', async () => {
    let destroyed = 0;
    const h = await harness(async () => ({ destroy() { destroyed++; } }));
    h.api.mount('a', h.canvas, modelUrl, h.callback); await tick();
    h.canvas.isConnected = false; h.observers[0].callback();
    assert.equal(destroyed, 1); assert.equal(h.observers[0].disconnected, true);
});

test('closing before runtime import completes never creates a viewer', async () => {
    let created = 0;
    const h = await harness(async () => { created++; return { destroy() {} }; });
    h.api.mount('a', h.canvas, modelUrl, h.callback); h.api.unmount('a'); await tick();
    assert.equal(created, 0); assert.equal(h.states.length, 0);
});
