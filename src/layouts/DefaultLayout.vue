<template>
  <div class="view-full relative">
    <nav class="absolute">
      <router-view name="navRouterView" />
    </nav>

    <main class="view-full">
      <router-view name="mainRouterView" />
    </main>
  </div>
</template>

<script setup lang="ts"></script>

<style></style>
