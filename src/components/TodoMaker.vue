<script setup>
import { reactive, ref, defineEmits } from "vue";
const todo = ref("");

const emit = defineEmits(["create-todo"]);

const todoState = reactive({
    todo: "",
    error: "",
    // todoList: []
});


const createTodo = () => {
    // todoState.todoList.push(todoState.todo);
    if (todoState.todo) {
        todoState.error = "";
        emit("create-todo", todoState.todo);
        todoState.todo = "";
    }
    else {
        todoState.error = "No Todo Defiled";
    }
};

</script>

<template>
    <div>
        <input type="text" v-model="todoState.todo" />
        <button @click="createTodo()">Create</button>
        <p>Todo State Todo = {{ todoState.todo }}</p>
        <p v-if="todoState.error">{{ todoState.error }}</p>
        <!-- <ul>
            <li
                v-for="t in todoState.todoList"
                :key="t"
            >
                {{ t }}
            </li>
        </ul> -->
    </div>
</template>

<style lang="sass" scoped>

</style>
