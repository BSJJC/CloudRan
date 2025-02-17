<template>
  <div class="relative view-full">
    <nav class="absolute z-[+1]">
      <router-view name="navRouterView" />
    </nav>

    <main class="relative view-full">
      <router-view name="mainRouterView" />
    </main>
  </div>
</template>

<script setup lang="ts"></script>

<style></style>
