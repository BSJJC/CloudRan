<template>
  <div class="view-full p-4">
    <!-- 瀑布流容器 (Masonry Container) -->
    <div
      ref="masonryContainerRef"
      class="view-full flex justify-center items-center space-x-2 overflow-hidden"
    >
      <!-- 瀑布流列容器 (Masonry Columns) -->
      <div
        v-for="(column, colIndex) in masonryColumns"
        :key="colIndex"
        class="w-[200px] h-[150%] relative overflow-hidden"
      >
        <!-- 列内垂直布局容器 -->
        <div class="w-full h-full flex flex-col bg-red-300 space-y-2 absolute">
          <!-- 瀑布流项 (Masonry Items) -->
          <div
            ref="imageRefs"
            v-for="(item, rowIndex) in column"
            :key="rowIndex"
            class="h-[250px] w-full rounded-xl shadow-xl overflow-hidden transition duration-1000 ease-linear"
            style="transform: translateY(0px)"
          >
            <img
              :src="
                item.imageId
                  ? `/src/assets/interestImages/test${item.imageId}.webp`
                  : `/src/assets/interestImages/default.webp`
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
import { v4 as uuidv4 } from "uuid";

// 瀑布流容器 DOM 引用
const masonryContainerRef = ref<HTMLDivElement>();
// 瀑布流项的 DOM 引用（v-for 多个元素会形成数组）
const imageRefs = ref<HTMLElement[]>([]);

// 定义瀑布流项的数据类型
type MasonryItem = {
  imageId: number;
  uuid: string;
  moveDirection: "up" | "down";
};

// 用二维数组存储瀑布流的列，每一列包含多个瀑布流项
const masonryColumns: Ref<MasonryItem[][]> = ref([]);

/**
 * 根据容器尺寸初始化瀑布流列及项
 */
function initializeMasonryGrid() {
  const containerWidth = masonryContainerRef.value?.clientWidth;
  const containerHeight = masonryContainerRef.value?.clientHeight;

  if (containerWidth && containerHeight) {
    const columnCount = Math.floor(containerWidth / 200);
    const rowCount = Math.floor(containerHeight / 250) + 2;

    const interestImages = import.meta.glob(
      "../../../assets/interestImages/*.webp"
    );
    const maxImageId = Object.keys(interestImages).length;

    let currentImageId = 0;
    let directionIndex = -1;

    masonryColumns.value = Array.from({ length: columnCount }, () =>
      Array.from({ length: rowCount }, () => {
        let imageIdForItem = currentImageId;
        if (imageIdForItem + 1 > maxImageId) {
          imageIdForItem = 1;
          currentImageId = 1;
        } else {
          imageIdForItem++;
          currentImageId++;
        }

        directionIndex++;

        return {
          imageId: imageIdForItem,
          uuid: uuidv4(),
          moveDirection:
            Math.floor(directionIndex / rowCount) % 2 === 0 ? "up" : "down",
        };
      })
    );
  }
}

/**
 * 更新瀑布流项的垂直位移，实现动画效果
 */
function updateImagePositions() {
  imageRefs.value.forEach((element: HTMLElement, index: number) => {
    let transformValue = element.style.getPropertyValue("transform");
    const start = transformValue.indexOf("(") + 1;
    const end = transformValue.indexOf("p");
    const currentOffset = transformValue.slice(start, end);
    let offsetValue = parseInt(currentOffset);

    const direction = masonryColumns.value.flat()[index].moveDirection;
    if (direction === "up") {
      offsetValue -= 50; // 向上移动
    } else {
      offsetValue += 50; // 向下移动
    }
    element.style.setProperty("transform", `translateY(${offsetValue}px)`);
  });

  debouncedPositionUpdate();
}

const debouncedGridInitialization = useDebounceFn(initializeMasonryGrid, 100);
const debouncedPositionUpdate = useDebounceFn(updateImagePositions, 1000);

onMounted(() => {
  initializeMasonryGrid();

  const { width } = useWindowSize();
  watch(width, () => {
    debouncedGridInitialization();
  });

  setTimeout(() => {
    debouncedPositionUpdate();
  }, 500);
});
</script>

<style scoped></style>
