<script setup>
import { uniq, flatten } from 'lodash';
import { transpose } from 'lodash-transpose';
import gsap, { Sine } from 'gsap';
import BlockExplosion from './animations/BlockExplosion.vue';
import colorConfig from '../config/crushConfig';
import { initGame } from '../engine/index';
import { reactive } from "vue";
import { processEvent } from '../utils/Utilities';

const config = JSON.parse(colorConfig);

const props = defineProps({
    dropDuration: {
        type: Number,
        default: .25,
        required: false,
    }
});

const crissCrossData = reactive({
    game: initGame(config),
    pieceWidth: config.width / config.pieces.length,
    pieceHeight: config.height / config.pieces.length,
    boardWidth: config.width,
    boardHeight: config.height,
    useContainer: false,
    gameState: null,

    boardState: [],
    // dropDuration: .5,
    completeHandler: null,
    processingMove: false,
    validValues: [],
    currentRemovals: [],
    bonusPattern: [],
    patterns: [],
    basePatterns: [],
    movesRemaining: 20,
    points: 0,
    pointsPerBlock: 10,
    
});
crissCrossData.validValues = uniq(crissCrossData.game.pieces.map(item => item.data));

const getOverlayElement = (el) => {
    return crissCrossData.useContainer ? el.parentNode : window;
}
const down = (e) => {
    crissCrossData.boardState = crissCrossData.game.pieces.map(item => item.data);
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
    onUserMove({ state: crissCrossData.gameState, game: crissCrossData.game })
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

const onUserMove = (data) => {
    const evaluation = evaluate(crissCrossData.game.matrix);
    if (isValidMove() && crissCrossData.movesRemaining > 0) {
        crissCrossData.movesRemaining--;
    }
    if (crissCrossData.movesRemaining === 0) {
        console.log('you lose');
    }
}







const getBonuses = (foundPatterns) => {
    const bonusPatternString = crissCrossData.bonusPattern.join('-');
    return foundPatterns.filter(item => item.join('-') === bonusPatternString).length;
}



const evaluate = (matrix) => {
    crissCrossData.processingMove = true;
    const { results, foundPatterns } = scanBoard(matrix.map(item => item.map(_item => _item.data)));
    console.log(foundPatterns);
    resetValues();
    // console.log(transpose(matrix));
    const removals = updateBlocks(results);
    crissCrossData.points += flatten(results).length * crissCrossData.pointsPerBlock;
    const bonuses = getBonuses(foundPatterns);
    if (bonuses) {
        awardBonus();
    }
    console.log(removals);
    console.log(crissCrossData.currentRemovals);
    console.log(results);
    addRemovalAnimations(removals);
    return { foundPatterns, results, removals, bonuses };
}

const awardBonus = () => {
    console.log('AWARD BONUSES');
    crissCrossData.movesRemaining += 2;
}

const isValidMove = () => {
    const currentState = crissCrossData.game.pieces.map(item => item.data);
    return JSON.stringify(currentState) !== JSON.stringify(crissCrossData.boardState);
}


const resetValues = () => {
    crissCrossData.game.matrix.map((item, index) => item.forEach(_item => {
        _item.y = (crissCrossData.game.height / crissCrossData.game.matrix.length) * index;
        console.log(_item.y);
    }));
}

const findPattern = (pattern, structure, value) => {
    const remappedStructure = structure.map(row => row.map(item => item === value));
    const flattedStructure = flatten(remappedStructure.map((item, i) => item.map((value, j) => ({ value, i, j }))));
    return flattedStructure
        .filter(item => patternMatch(remappedStructure, pattern, item.i, item.j))
        .map(item => cellsToRemove(item.i, item.j, pattern));
}


const patternMatch = (structure, patternRows, row, column) => {
    // let checks = []
    if (patternRows.length + row > structure.length) {
        return false;
    }
    if (patternRows.filter((item, i) => !rowCheck(structure, row + i, item, column)).length > 0) {
        return false;
    }
    return true;
}

const rowCheck = (structure, row, slots, offset) => {
    const maxFill = offset + slots.length;
    if (maxFill > structure.length) {
        return false;
    }
    const newRow = structure[row];
    for (let i = offset; i < slots.length + offset; i++) {
        if (!newRow[i] && slots[i - offset]) {
            return false;
        }
    }
    return newRow;
}


const cellsToRemove = (row, column, pattern) => {
    return flatten(pattern.map((item, i) => item.map((_item, j) => ({ row: i + row, column: j + column, valid: _item }))))
        .filter(item => item.valid)
        .map(item => ({ row: item.row, column: item.column }));
}

const scanBoard = (structure) => {
    const patternsWithMatches = crissCrossData.patterns.map(pattern => (
        {
            match: flatten([...Array(structure.length).keys()].map(item => findPattern(pattern, structure, item.toString()))),
            pattern,
        }
    ));
    const matches = patternsWithMatches.map(item => item.match);
    const foundPatterns = patternsWithMatches
        .filter(item => item.match.length > 0)
        .map(item => item.pattern);
    const results = uniq(flatten(matches).map(item => JSON.stringify(item))).map(item => JSON.parse(item));
    return { results, foundPatterns };
}

const setPatterns = (patterns) => {
    crissCrossData.basePatterns = patterns;
    crissCrossData.patterns = crissCrossData.bonusPattern.length ? [...crissCrossData.basePatterns, ...[this.bonusPattern]] : crissCrossData.basePatterns;
}

const setBonusPattern = (pattern) => {
    crissCrossData.bonusPattern = pattern;
    crissCrossData.patterns = crissCrossData.bonusPattern.length ? [...crissCrossData.basePatterns, ...[crissCrossData.bonusPattern]] : crissCrossData.basePatterns;
}

const addRemovalAnimations = (removals) => {
    const sig = `block-${Math.random().toString().split('.').join('')}-${Math.random().toString().split('.').join('')}-${Math.random().toString().split('.').join('')}`;
    removals.forEach(item => crissCrossData.currentRemovals.push({ ...item, sig }));
}


const updateBlocks = (results) => {
    const shouldAnimate = results.length;
    console.log(shouldAnimate);
    const transposedMatrix = transpose(crissCrossData.game.matrix);
    const flattenedResults = flatten(results);
    const removalPositions = flattenedResults.map(item => ({
        x: item.column * (crissCrossData.game.width / crissCrossData.game.matrix[0].length),
        y: item.row * (crissCrossData.game.height / crissCrossData.game.matrix[0].length),
        data: crissCrossData.game.pieces.find(_item => _item.column === item.column && _item.row === item.row).data,
    }));
    const mappedResults = new Set(flattenedResults.map(item => `${item.column}_${item.row}`));
    const removeMarked = transposedMatrix.map(item => item.map((_item, index) => {
        const shouldRemove = mappedResults.has(`${_item.column}_${_item.row}`);
        _item.order = shouldRemove ? 0 : index + 1;
        if (shouldRemove) {
            _item.y = -1000;
        }
        return _item;
    })).map(item => {
        const remove = item.filter(_item => _item.order === 0);
        const keep = item.filter(_item => _item.order !== 0);
        return [...remove, ...keep];
    });
    const reordered = removeMarked.map(item => {
        item.reverse();
        item.map((_item, index) => {
            if (_item.order === 0) {
                if (index === 0) {
                    _item.order = -1;
                }
                else if (item[index - 1].order <= 0) {
                    _item.order = item[index - 1].order - 1;
                }
                else {
                    _item.order = -1;
                }
            }
            return _item;
        });
        item.reverse();
        return item;
    })
        .map(item => item.map((_item, index) => {
            _item.row = index;
            if (shouldAnimate) {
                _item.drop = (crissCrossData.game.height / crissCrossData.game.matrix.length) * index;
            }
            else {
                _item.y = (crissCrossData.game.height / crissCrossData.game.matrix.length) * index;
            }
            if (_item.order && _item.order <= 0) {
                if (shouldAnimate) {
                    _item.y = _item.order * (crissCrossData.game.height / crissCrossData.game.matrix.length);
                }
                _item.data = crissCrossData.validValues[Math.floor(Math.random() * crissCrossData.validValues.length)];
            }
            console.log(_item.y);
            return _item;
        }));
    crissCrossData.game.matrix = transpose(reordered);
    crissCrossData.game.pieces = flatten(crissCrossData.game.matrix);
    if (shouldAnimate) {
        for (let i = 0; i < crissCrossData.game.pieces.length; i++) {
            const targetY = crissCrossData.game.pieces[i].drop;
            gsap.to(crissCrossData.game.pieces[i], {
                duration: props.dropDuration,
                y: targetY,
                ease: Sine.easeIn,
                onUpdate: () => {
                    // this.$forceUpdate();
                },
                onComplete: () => {
                    if (i === crissCrossData.game.pieces.length - 1) {
                        if (crissCrossData.completeHandler) {
                            crissCrossData.completeHandler();
                        }
                        const evaluation = evaluate(crissCrossData.game.matrix);
                        if (crissCrossData.completeHandler) {
                            crissCrossData.completeHandler(evaluation);
                        }
                        // this.currentRemovals = [...evaluation.removals];
                    }
                },
            });
            crissCrossData.game.pieces[i].drop = null;
            crissCrossData.game.pieces[i].order = null;
        }
    }
    else {
        crissCrossData.processingMove = false;
    }
    return removalPositions;
}

setPatterns(config.patterns.primary);

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
        &-0{
            background-color: purple;
        }
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
        &-5{
            background-color: yellow;
        }
        &-6{
            background-color: magenta;
        }
        &-7{
            background-color: cyan;
        }
    }
}
</style>