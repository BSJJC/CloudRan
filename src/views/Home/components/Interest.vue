<template>
  <div class="view-full p-4">
    <!-- waterfall container -->
    <div
      ref="waterfallRef"
      class="view-full flex justify-center items-center space-x-2"
    >
      <!-- list -->
      <div
        v-for="_ in listNum"
        class="w-[200px] h-full flex flex-col space-y-2"
        :style="{ justifyContent: _ % 2 === 1 ? 'flex-start' : 'flex-end' }"
      >
        <!-- item -->
        <div
          v-for="_ in listItemNum"
          class="h-[250px] w-full rounded-xl shadow-xl overflow-hidden opacity-20"
        >
          <img src="../../../assets/test.jpg" alt="" class="" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { useWindowSize, useDebounceFn } from "@vueuse/core";

const waterfallRef = ref<HTMLDivElement>();
const listNum = ref(0);
const listItemNum = ref(0);

function calculateColumns() {
  const waterfallWidth = waterfallRef.value?.clientWidth;
  const waterfallHeight = waterfallRef.value?.clientHeight;

  if (waterfallWidth && waterfallHeight) {
    listNum.value = Math.floor(waterfallWidth / 200);
    listItemNum.value = Math.floor(waterfallHeight / 250);

    console.log(listItemNum.value);
  }
}

const debouncedCalculate = useDebounceFn(calculateColumns, 100);

onMounted(() => {
  calculateColumns();

  const { width } = useWindowSize();

  watch(width, () => {
    debouncedCalculate();
  });
});
</script>

<style></style>
