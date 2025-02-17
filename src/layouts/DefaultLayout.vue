<template>
  <div class="relative view-full">
    <nav class="absolute z-[+1]">
      <router-view name="navRouterView" />
    </nav>

    <main class="relative bg-red-300 view-full">
      <router-view name="mainRouterView" />
    </main>
  </div>
</template>

<script setup lang="ts"></script>

<style></style>
