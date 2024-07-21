import CrissCross from './CrissCross.js';
function initGame (config) {
    const data = {
        width: config.width,
        height: config.height,
        random: config.randomizeOnStart,
        dataMatrix: config.pieces,
        swapping: config.swapping,
    };
    return new CrissCross(data);
}
export { initGame };
