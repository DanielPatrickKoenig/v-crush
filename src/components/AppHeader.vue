<script setup>
    import { RouterLink } from 'vue-router';
</script>

<template>
    <header>
        <nav>
            <div>LOGO</div>
            <ul>
                <li><RouterLink to="/">HOME</RouterLink></li>
                <li><RouterLink to="/about">About</RouterLink></li>
            </ul>
        </nav>
    </header>
</template>

<style scoped lang="scss">
header{
    nav{
        display: flex;
        justify-content: space-between;
        ul{
            display: flex;
            li{
                padding: 10px;
                display: block;
            }
        }
    }
}
</style>
