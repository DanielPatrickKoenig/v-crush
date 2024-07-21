<script setup>
import { reactive } from 'vue';
import TotoMaker from '../components/TodoMaker.vue';
import DragTest from '../components/DragTest.vue';
import CrissCrusher from '../components/CrissCrusher.vue';

const todoListState = reactive({
  list: []
});

const todoCreated = (e) => {
  console.log(e);
  todoListState.list.push(e)
}
</script>

<template>
  <main>
    <h1>Create Todo</h1>
    <TotoMaker @create-todo="todoCreated" />
    <ul>
            <li
                v-for="t in todoListState.list"
                :key="t"
            >
                {{ t }}
            </li>
        </ul>
        <DragTest/>
        <CrissCrusher :dropDuration=".5" />
  </main>
</template>
