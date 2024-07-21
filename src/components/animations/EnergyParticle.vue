<template>
    <div
        class="block-particle"
        :style="particleStyle"
    />
</template>

<script>
export default {
    props: {
        angle: {
            type: Number,
            default: 0,
        },
    },
    computed:{
        particleStyle () {
            return `transform: rotate(${this.angle}deg) scale(${.75 + (Math.random() * .5)})`;
        },
    },
};
</script>
