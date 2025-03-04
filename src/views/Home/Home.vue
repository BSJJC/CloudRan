<template>
  <div class="view-full relative overflow-hidden">
    <!-- 介绍 -->
    <div class="view-full absolute flex justify-center items-center z-[+1]">
      <transition name="intro">
        <Intro></Intro>
      </transition>
    </div>

    <!-- 成分 -->
    <div class="view-full">
      <transition name="interest">
        <Interest></Interest>
      </transition>
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

<style scoped>
.intro-enter-active,
.intro-leave-active {
  transition: all 1.5s;
}

.intro-enter-from,
.intro-leave-to {
  opacity: 0;
  transform: translateY(100px);
}

.interest-enter-active,
.interest-leave-active {
  transition: all 1.5s;
  transition-delay: 1s;
}

.interest-enter-from,
.interest-leave-to {
  opacity: 0;
  transform: translateY(100px);
}
</style>
