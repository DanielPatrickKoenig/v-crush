<template>
    <div
        class="block-explosiion"
        :style="{ left: `${explosionOrigin.x}px`, top: `${explosionOrigin.y}px` }"
    >
        <EnergyParticle
            v-for="p in particles"
            :key="`particle-${p}`"
            :angle="angle(p)"
        />
    </div>
</template>

<script>
import EnergyParticle from './EnergyParticle.vue';
const particleCount = 20;
export default {
    components:{
        EnergyParticle,
    },
    props: {
        position: Object,
        sig: String,
    },
    data () {
        return {
            particles: new Array(particleCount).keys(),
            explosionOrigin: this.position ? this.position : { x: 0, y: 0 },
        };
    },
    async mounted () {
        await new Promise(resolve => setTimeout(resolve, 2000));
        this.$emit('complete', this.sig);
    },
    computed:{
        angle () {
            return index => index * (360 / particleCount);
        },
    },
};
</script>

<style>
.block-explosiion .trail{
    transform-origin: left center;
}
.block-explosiion .trail-1{
    transform: rotate(0deg);
}
.block-explosiion .trail-2{
    transform: rotate(1200deg);
}
.block-explosiion .trail-3{
    transform: rotate(240deg);
}
</style>
