<template>
  <div class="view-full relative">
    <!-- 介绍 -->
    <div class="view-full absolute flex justify-center items-center">
      <Intro></Intro>
    </div>

    <!-- 成分 -->
    <div class="view-full bg-sky-300">asd</div>
  </div>
</template>

<script setup lang="ts">
import { defineAsyncComponent } from "vue";

const Intro = defineAsyncComponent(() => import("./components/Intro.vue"));
</script>

<style></style>
