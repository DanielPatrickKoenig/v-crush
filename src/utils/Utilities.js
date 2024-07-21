function processEvent (e) {
    if (e.touches) {
        e.preventDefault();
        return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
    return { x: e.clientX, y: e.clientY };
}

export { processEvent };