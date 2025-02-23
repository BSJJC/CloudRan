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

const waterfallWidth: Ref<number | undefined> = ref(0);
const waterfallHeight: Ref<number | undefined> = ref(0);
const cols = ref(0);
const rows = ref(0);

type TItemArray = {
  imgID: number;
  initialVisibility: boolean;
  visibility: boolean;
};

const itemArrays: Ref<TItemArray[][]> = ref([]);

/**
 * 计算布局参数的核心函数
 * 1. 根据容器宽度计算可显示的列数
 * 2. 根据容器高度计算每列可显示的项目数
 */
function calculateColumns() {
  waterfallWidth.value = waterfallRef.value?.clientWidth;
  waterfallHeight.value = waterfallRef.value?.clientHeight;

  if (waterfallWidth.value && waterfallHeight.value) {
    cols.value = Math.floor(waterfallWidth.value / 200);
    rows.value = Math.floor(waterfallHeight.value / 250) + 2;

    const imgIDs = generateRandomSequence(18, 3, cols.value * rows.value);
    let index = 0;

    itemArrays.value = Array.from({ length: cols.value }, () =>
      Array.from({ length: rows.value }, () => {
        return {
          imgID: imgIDs[index++],
          initialVisibility: false,
          visibility: false,
        };
      })
    );
  }
}

function initialItemArrays() {
  new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        const [indexCol, indexRow] = [
          Math.floor(index / rows.value),
          Math.floor(index % rows.value),
        ];

        itemArrays.value[indexCol][indexRow].initialVisibility = true;
        itemArrays.value[indexCol][indexRow].visibility = true;
      } else {
      }
    });
  });
}

function monitorImgs() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        /**
         *    col 2   row 5
         *
         *    index === 7
         *    1 Math.floor(index / row)
         *      Math.floor(7 / 5) === 1
         *      indexCol === 1
         *    2 Math.floor(index % col)
         *      Math.floor(7 % 5) === 2
         *      indexRow === 2
         *    当index为7时，在二维数组itemArrays中的坐标是itemArrays[1][2]
         */
        const [indexCol, indexRow] = [
          Math.floor(index / rows.value),
          Math.floor(index % rows.value),
        ];

        itemArrays.value[indexCol][indexRow].initialVisibility = true;
        itemArrays.value[indexCol][indexRow].visibility = true;
      } else {
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

  const { width } = useWindowSize();

  watch(width, () => {
    debouncedCalculate();
  });

  setTimeout(() => {
    initialItemArrays();
    // monitorImgs();
  }, 50);
});
</script>

<style scoped></style>
