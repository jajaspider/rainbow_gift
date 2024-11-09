<template>
  <div>
    <q-btn flat>{{ btnTitle }}</q-btn>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue';
interface Props {
  btnTitle: string;
}
defineProps<Props>();
</script>
