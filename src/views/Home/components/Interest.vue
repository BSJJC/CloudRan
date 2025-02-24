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
            ref="imgRef"
            v-for="(_, rowIndex) in col"
            :key="rowIndex"
            class="h-[250px] w-full rounded-xl shadow-xl overflow-hidden transition duration-1000 ease-linear"
            style="transform: translateY(0px)"
          >
            <!-- 图片占位符（实际项目应替换为动态内容） -->
            <img
              :src="
                col[rowIndex].imgID
                  ? `/src/assets/test${col[rowIndex].imgID}.webp`
                  : `/src/assets/default.webp`
              "
              class="opacity-40"
              alt=""
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
  initialVisibility: boolean | null; // 生成时是否可见
  visibility: boolean | null; // 当前是否可见
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
          initialVisibility: null,
          visibility: null,
        };
      })
    );
  }
}

function monitorImgs() {
  /**
   * 先判断initialVisibility，如果为null，证明这是第一次检查
   * 根据是否可见将initialVisibility和visibility修改为true或false，随后跳过
   *
   * 如果visibility和initialVisibility为false，entry.isIntersecting为false
   * 证明元素尚未出现在屏幕中，向上或向下移动后跳过
   *
   * 如果visibility和initialVisibility为false，entry.isIntersecting为true
   * 证明这是元素第一次出现在屏幕中，将visibility修改为true，向上或向下移动后跳过
   *
   * 如果visibility为true，initialVisibility为true或false，entry.isIntersecting为true
   * 证明元素正在屏幕中，向上或向下移动后跳过
   *
   * 如果visibility为true，initialVisibility为true或false，entry.isIntersecting为false，
   * 证明元素已经离开屏幕，移除元素
   */
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      const [indexCol, indexRow] = [
        Math.floor(index / rows.value),
        Math.floor(index % rows.value),
      ];

      const initialVisibility =
        itemArrays.value[indexCol][indexRow].initialVisibility;
      const visibility = itemArrays.value[indexCol][indexRow].visibility;
      const isIntersecting = entry.isIntersecting;

      // 初始化
      if (itemArrays.value[indexCol][indexRow].initialVisibility === null) {
        const isIntersecting = entry.isIntersecting;
        itemArrays.value[indexCol][indexRow].initialVisibility = isIntersecting;
        itemArrays.value[indexCol][indexRow].visibility = isIntersecting;

        console.log("元素已初始化", imgRef.value[index]);
        // 不 return，这样后续 frame 更新时依然可以修改 transform
        return;
      } else {
        itemArrays.value[indexCol][indexRow].visibility = false;
        console.log("元素离开屏幕", imgRef.value[index]);
        console.log(index);
      }
    });
  });

  imgRef.value.forEach((element: Element) => {
    observer.observe(element);
  });
}

function continuousUpdate() {
  imgRef.value.forEach((element: HTMLElement, index: number) => {
    let offSet = element.style.getPropertyValue("transform");
    const l = offSet.indexOf("(") + 1;
    const r = offSet.indexOf("p");
    offSet = offSet.slice(l, r);
    let offsetNum = parseInt(offSet) || 0;

    // 根据列的奇偶性决定更新方向（示例逻辑）
    const indexCol = Math.floor(index / rows.value);
    if (indexCol % 2 === 0) {
      offsetNum -= 10; // 向上平移
    } else {
      offsetNum += 10; // 向下平移
    }

    element.style.setProperty("transform", `translateY(${offsetNum}px)`);
  });

  debouncedUpdate();
}

const debouncedCalculate = useDebounceFn(calculateColumns, 100);
const debouncedUpdate = useDebounceFn(continuousUpdate, 100);

onMounted(() => {
  calculateColumns();

  const { width } = useWindowSize();

  watch(width, () => {
    debouncedCalculate();
  });

  setTimeout(() => {
    monitorImgs();
    debouncedUpdate();
  }, 50);
});
</script>

<style scoped></style>
