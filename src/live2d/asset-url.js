// Resolve references relative to model3.json, without leaving its API directory.
export function resolveAsset(reference, modelUrl) {
    if (typeof reference !== 'string' || !reference || reference.includes('\\')) throw new Error('Invalid model asset reference');
    const root = new URL('.', modelUrl);
    const url = new URL(reference, root);
    if (url.origin !== root.origin || !url.pathname.startsWith(root.pathname) || url.search || url.hash) {
        throw new Error('Model asset must stay in its API directory');
    }
    return url.href;
}
