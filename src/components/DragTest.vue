<script setup>
import { reactive } from "vue";

const posState = reactive({
    x: 0,
    y: 0,
    dragging: false,
});

const dragStart = (e) => {
    posState.dragging = true;
}
const dragStop = () => {
    posState.dragging = false;
}
const dragMove = (e) => {
    if (posState.dragging) {
        posState.x = e.pageX;
        posState.y = e.pageY;
    }
}

</script>

<template>
<div
    class="shell"
    :style="{left: `${posState.x}px`, top: `${posState.y}px`}"
>
    <div @mousedown="dragStart" class="content">
    </div>
    <div
        v-if="posState.dragging"
        class="drag-surface"
        @mouseup="dragStop"
        @mousemove="dragMove"
    ></div>
</div>

</template>

<style scoped lang="scss">

.shell{
    position: absolute;
    width: 0;
    height: 0;
    .content{
        position: relative;
        width: 200px;
        height: 200px;
        left: -100px;
        top: - 100px;
        background-color: red;
    }
    .drag-surface{
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0,0,0,.1);
    }
}

</style>