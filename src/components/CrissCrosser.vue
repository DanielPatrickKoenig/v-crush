<script setup>
import colorConfig from '../config/colorsConfig';
import { initGame } from '../engine/index';
import { reactive } from "vue";
import { processEvent } from '../utils/Utilities';

const config = JSON.parse(colorConfig);

const crissCrossData = reactive({
    game: initGame(config),
    pieceWidth: config.width / config.pieces.length,
    pieceHeight: config.height / config.pieces.length,
    boardWidth: config.width,
    boardHeight: config.height,
    useContainer: false,
    gameState: null
    
});
const getOverlayElement = (el) => {
    return crissCrossData.useContainer ? el.parentNode : window;
}
const down = (e) => {
    crissCrossData.game.down(Number(e.currentTarget.getAttribute('column')), Number(e.currentTarget.getAttribute('row')), processEvent(e));
    if (e.type === 'touchstart') {
        getOverlayElement(e.currentTarget).addEventListener('touchmove', move);
        getOverlayElement(e.currentTarget).addEventListener('touchend', up);
    }
    else if (e.type === 'mousedown') {
        getOverlayElement(e.currentTarget).addEventListener('mousemove', move);
        getOverlayElement(e.currentTarget).addEventListener('mouseup', up);
    }
};

const move = (e) => {
    if (crissCrossData.game.dragging) {
        crissCrossData.game.move(processEvent(e));
    }
}

const up = (e) => {
    crissCrossData.gameState = crissCrossData.game.up();
    // this.$emit('user-move', { state: this.gameState, game: this.game });
    if (e.type === 'touchend') {
        getOverlayElement(e.currentTarget).removeEventListener('touchmove', move);
        getOverlayElement(e.currentTarget).removeEventListener('touchend', up);
    }
    else if (e.type === 'mouseup') {
        getOverlayElement(e.currentTarget).removeEventListener('mousemove', move);
        getOverlayElement(e.currentTarget).removeEventListener('mouseup', up);
    }
}

</script>

<template>
    <div
        class="criss-cross"
        :style="{ width: `${crissCrossData.boardWidth}px`, height: `${crissCrossData.boardWidth}px` }"
    >
        <div 
            v-for="piece in crissCrossData.game.pieces"
            :key="piece"
            class="block"
            :class="`block-${piece.data}`"
            :style="{ left: `${piece.x}px`, top: `${piece.y}px`, width: `${crissCrossData.pieceWidth}px`, height: `${crissCrossData.pieceHeight}px` }"
            :column="piece.column"
            :row="piece.row"
            @mousedown="down"
            @touchstart="down"
        >
        </div>
    </div>
</template>

<style lang="scss" scoped>
.criss-cross{
    margin: 0 auto;
    position: relative;
    .block{
        position: absolute;
        width: 20px;
        height: 20px;
        
        box-shadow: 0 0 0 1px #000000 inset;
        &-1{
            background-color: red;
        }
        &-2{
            background-color: blue;
        }
        &-3{
            background-color: green;
        }
        &-4{
            background-color: orange;
        }
        &-0{
            background-color: purple;
        }
    }
}
</style>