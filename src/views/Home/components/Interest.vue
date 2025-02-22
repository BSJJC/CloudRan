<template>
  <div class="view-full p-4">
    <!-- 瀑布流容器 -->
    <div
      ref="waterfallRef"
      class="view-full flex justify-center items-center space-x-2"
    >
      <!-- 瀑布流列容器：动态生成指定数量的列 -->
      <div
        v-for="(col, colIndex) in itemArrays"
        :key="colIndex"
        class="w-[200px] h-full relative overflow-hidden"
      >
        <!-- 列内垂直布局容器：实现交错排列效果 -->
        <div
          class="w-full h-[150%] flex flex-col space-y-2 absolute"
          :style="{
            justifyContent: colIndex % 2 === 1 ? 'flex-start' : 'flex-end',
          }"
        >
          <!-- 瀑布流项：生成指定数量的子元素 -->
          <div
            v-for="(_, rowIndex) in col"
            :key="rowIndex"
            class="h-[250px] w-full rounded-xl shadow-xl overflow-hidden"
            :class="colIndex % 2 === 1 ? 'to-down' : 'to-up'"
          >
            <!-- 图片占位符（实际项目应替换为动态内容） -->
            <img
              ref="imgRef"
              :src="`/src/assets/test${col[rowIndex].imgID}.webp`"
              alt=""
              class="opacity-40"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, type Ref, watch } from "vue";
import { useWindowSize, useDebounceFn } from "@vueuse/core";
import generateRandomSequence from "../../../utils/generateRandomSequence";

const waterfallRef = ref<HTMLDivElement>();
const imgRef = ref();

type TItemArray = {
  imgID: number;
  initialVisibility: false;
  visibility: false;
};

const itemArrays: Ref<TItemArray[][]> = ref([]);

/**
 * 计算布局参数的核心函数
 * 1. 根据容器宽度计算可显示的列数
 * 2. 根据容器高度计算每列可显示的项目数
 */
function calculateColumns() {
  const waterfallWidth = waterfallRef.value?.clientWidth;
  const waterfallHeight = waterfallRef.value?.clientHeight;

  if (waterfallWidth && waterfallHeight) {
    const cols = Math.floor(waterfallWidth / 200);
    const rows = Math.floor(waterfallHeight / 250) + 2;

    const imgIDs = generateRandomSequence(18, 3, cols * rows);
    let index = 0;

    itemArrays.value = Array.from({ length: cols }, () =>
      Array.from({ length: rows }, () => {
        return {
          imgID: imgIDs[index++],
          initialVisibility: false,
          visibility: false,
        };
      })
    );
  }
}

function monitorImgs() {
  // 配置观察器的选项

  // 创建观察器实例
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        console.log(`元素 ${entry.target.id} 可见`);
        console.log(entry.target);
        console.log(index);
        console.log(imgRef.value[index]);
      } else {
        console.log(`元素 ${entry.target.id} 不可见`);
        console.log(entry.target);
      }
    });
  });

  imgRef.value.forEach((element: Element) => {
    observer.observe(element);
  });
}

const debouncedCalculate = useDebounceFn(calculateColumns, 100);

onMounted(() => {
  calculateColumns();

  setTimeout(() => {
    monitorImgs();
  }, 50);

  const { width } = useWindowSize();

  watch(width, () => {
    debouncedCalculate();
  });
});
</script>

<style scoped>
.to-down {
  animation: to-down 3s linear infinite;
}

.to-up {
  /* animation: to-up 3s linear infinite; */
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
