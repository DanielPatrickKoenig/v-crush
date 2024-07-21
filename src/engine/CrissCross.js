import { shuffle, flatten } from 'lodash';
export default class CrissCross {
    constructor ({ columns, rows, width, height, random, dataMatrix, swapping }) {
        this.dragging = false;
        this.selectedBlock = undefined;
        this.minMovement = 20;
        this.moveCount = 0;
        this.group = [];
        this.dragStartPosition = { x: 0, y: 0 };
        this.shiftingVertically = false;
        this.columns = columns ? columns : dataMatrix[0].length;
        this.rows = rows ? rows : dataMatrix.length;
        this.swapping = swapping;
        this.selectedIndex = 0;
        this.width = width;
        this.height = height;
        this.updateHandler = null;
        this.completeHandler = null;
        this.pair = -1;
        this.matrix = [...Array(this.rows).keys()].map(
            (item, r) => [...Array(this.columns).keys()].map((item, c) => new Piece({ x: (width / this.columns) * c, y: (height / this.rows) * r, width: width / this.columns, height: height / this.rows, column: c, row: r, data: dataMatrix ? dataMatrix[r][c] : null })),
        );
        this.baseState = flatten(dataMatrix);
        this.pieces = flatten(this.matrix);
        if (random) {
            this.randomize();
        }
    }
    down (column, row, position) {
        this.selectedBlock = this.matrix[row][column];
        this.dragging = true;
        this.moveCount = 0;
        this.dragStartPosition = position;
    }
    move (position) {

        if (this.dragging) {
            if (this.moveCount < this.minMovement) {
                const xDistance = Math.abs(position.x - this.dragStartPosition.x);
                const yDistance = Math.abs(position.y - this.dragStartPosition.y);
                this.shiftingVertically = xDistance < yDistance;

                this.moveCount++;
            }
            else {
                if (!this.group || this.group.length === 0) {
                    this.selectedIndex = this.shiftingVertically ? this.selectedBlock.column : this.selectedBlock.row;
                    let pairing = [];
                    if (this.swapping) {
                        const motionProperty = this.shiftingVertically ? 'y' : 'x';
                        const pairIndex = position[motionProperty] > this.dragStartPosition[motionProperty] ? 1 : -1;
                        pairing = this.shiftingVertically ?
                            [this.selectedBlock.row, this.selectedBlock.row + pairIndex] :
                            [this.selectedBlock.column, this.selectedBlock.column + pairIndex];
                    }
                    const size = this.shiftingVertically ? this.height / this.rows : this.width / this.columns;
                    this.group = pairing.filter(item => item < 0).length === 0 ?
                        new PieceGroup({ matrix: this.matrix, index: this.selectedIndex, isColumn: this.shiftingVertically, pairing, size }) :
                        {};
                }
                const offsetProperty = this.shiftingVertically ? 'y' : 'x';
                if (this.group.shift) {
                    this.group.shift(position[offsetProperty] - this.dragStartPosition[offsetProperty]);
                }
            }
            this.pieces = flatten(this.matrix);
        }


    }
    up () {
        if (this.dragging && this.moveCount >= this.minMovement) {
            const properties = this.shiftingVertically ? { index: 'row', sorter: 'y' } : { index: 'column', sorter: 'x' };
            if (this.group.group) {
                const dataPositions = this.group.group.map(item => ({ data: item.data, x: item.x, y: item.y }));
                if (!this.swapping || this.group.switch) {
                    dataPositions.sort((a, b) => {
                        if (a[properties.sorter] > b[properties.sorter]) {
                            return 1;
                        }
                        else {
                            return -1;
                        }
                    });
                    if (this.group.switch === -1) {
                        dataPositions.reverse();
                    }
                }

                // reverse if swapped and switched behind
                for (let i = 0; i < this.group.group.length; i++) {
                    this.group.group[i].data = dataPositions[i].data;
                }
                this.resetPositions();
                this.pieces = flatten(this.matrix);
            }
        }
        this.dragging = false;
        this.group = [];
        this.moveCount = 0;
        return this.evaluate(this.pieces, this.matrix);

    }
    resetPositions () {
        this.matrix.map(item => item.map(_item => _item.resetPosition()));
    }
    randomize () {
        const dataManifest = shuffle(this.pieces.map(item => item.data));
        this.pieces.map((item, index) => item.data = dataManifest[index]);
    }
    evaluate (pieces, matrix) {
        return {};
    }
}

class PieceGroup {
    constructor ({ matrix, index, isColumn, pairing, size }) {
        this.offset = 0;
        this.group = [];
        this.groupValues = [];
        this.isColumn = isColumn;
        this.baseValue = 0;
        this.pairing = pairing;
        this.size = size;
        const matches = this.isColumn ? matrix.map(item => item[index]) : matrix[index];
        this.group = pairing.length ? [matches[pairing[0]], matches[pairing[1]]] : matches;
        const validGroup = this.group.length === this.group.filter(item => item !== undefined).length;
        this.group = validGroup ? this.group : [];
        const values = this.group.map(item => item[this.isColumn ? 'y' : 'x']);
        this.groupValues = pairing.length ? [values[pairing[0]], values[pairing[1]]] : values;
        this.switch = 0;
    }
    shift (value) {
        // console.log(value);
        this.offset = value;
        const dimensionProperties = this.isColumn ? { position: 'y', size: 'height' } : { position: 'x', size: 'width' };
        if (this.pairing.length) {
            if (this.group.length < 2) {
                return;
            }
            if (this.pairing[0] > this.pairing[1]) {
                if (value < this.size * -1) {
                    value = this.size * -1;
                }
            }
            if (this.pairing[0] < this.pairing[1]) {
                if (value > this.size) {
                    value = this.size;
                }

            }
            this.group[0][dimensionProperties.position] = value + (this.size * this.pairing[0]);
            this.group[1][dimensionProperties.position] = (value * -1) + (this.size * this.pairing[1]);
            if (this.pairing[0] > this.pairing[1] && this.group[0][dimensionProperties.position] < this.group[1][dimensionProperties.position]) {
                this.switch = -1;
            }
            if (this.pairing[0] < this.pairing[1] && this.group[0][dimensionProperties.position] > this.group[1][dimensionProperties.position]) {
                this.switch = 1;
            }
        }
        else {
            for (let i = 0; i < this.groupValues.length; i++) {
                const newPosition = this.groupValues[i] + this.offset;
                if (newPosition < this.group[i][dimensionProperties.size] * -.5) {
                    this.groupValues[i] += this.groupValues.length * this.group[i][dimensionProperties.size];
                }
                if (newPosition > (this.groupValues.length - .5) * this.group[i][dimensionProperties.size]) {
                    this.groupValues[i] -= this.groupValues.length * this.group[i][dimensionProperties.size];
                }

                this.group[i][dimensionProperties.position] = newPosition;
            }
        }
    }
}

class Piece {

    constructor ({ x, y, width, height, column, row, data }) {
        this.x = x;
        this.y = y;
        this.origin = {
            x,
            y,
        };
        this.width = width;
        this.height = height;
        this.row = row;
        this.column = column;
        this.data = data ? data : `${row} : ${column}`;
    }

    resetPosition () {
        this.x = this.origin.x;
        this.y = this.origin.y;
    }
}
