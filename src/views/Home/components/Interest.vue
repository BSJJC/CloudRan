<template>
  <div class="view-full p-4">
    <!-- 瀑布流容器 -->
    <div
      ref="waterfallRef"
      class="view-full flex justify-center items-center space-x-2"
    >
      <!-- 瀑布流列容器：动态生成指定数量的列 -->
      <div
        v-for="listNumber in listNum"
        class="w-[200px] h-full relative overflow-hidden"
      >
        <!-- 列内垂直布局容器：实现交错排列效果 -->
        <div
          class="w-full h-[150%] flex flex-col space-y-2 absolute"
          :style="{
            justifyContent: listNumber % 2 === 1 ? 'flex-start' : 'flex-end',
          }"
        >
          <!-- 瀑布流项：生成指定数量的子元素 -->
          <div
            v-for="_ in listItemNum"
            class="h-[250px] w-full rounded-xl shadow-xl overflow-hidden"
            :class="listNumber % 2 === 1 ? 'to-down' : 'to-up'"
          >
            <!-- 图片占位符（实际项目应替换为动态内容） -->
            <img src="../../../assets/test.jpg" alt="" class="opacity-20" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { useWindowSize, useDebounceFn } from "@vueuse/core";

const waterfallRef = ref<HTMLDivElement>();

const listNum = ref(0); // 瀑布流列数
const listItemNum = ref(0); // 每列显示的项目数量

/**
 * 计算布局参数的核心函数
 * 1. 根据容器宽度计算可显示的列数
 * 2. 根据容器高度计算每列可显示的项目数
 */
function calculateColumns() {
  const waterfallWidth = waterfallRef.value?.clientWidth;
  const waterfallHeight = waterfallRef.value?.clientHeight;

  if (waterfallWidth && waterfallHeight) {
    listNum.value = Math.floor(waterfallWidth / 200); // 每列 200px 宽度
    listItemNum.value = Math.floor(waterfallHeight / 250); // 每个项目 250px 高度
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

<style scoped>
.to-down {
  animation: to-down 5s linear infinite;
}

.to-up {
  animation: to-up 5s linear infinite;
}

@keyframes to-down {
  to {
    transform: translateY(200%);
  }
}

@keyframes to-up {
  to {
    transform: translateY(-200%);
  }
}
</style>
