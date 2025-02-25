<template>
  <div class="view-full relative">
    <!-- 介绍 -->
    <!-- <div class="view-full absolute flex justify-center items-center z-[+1]"> -->
    <!-- <Intro></Intro> -->
    <!-- </div> -->

    <!-- 成分 -->
    <div class="view-full">
      <Interest></Interest>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineAsyncComponent } from "vue";

const Intro = defineAsyncComponent(() => import("./components/Intro.vue"));
const Interest = defineAsyncComponent(
  () => import("./components/Interest.vue")
);
</script>

<style></style>
