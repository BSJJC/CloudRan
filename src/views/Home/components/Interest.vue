<template>
  <div class="view-full p-4">
    <!-- 瀑布流容器 (Masonry Container) -->
    <div
      ref="containerRef"
      class="view-full flex justify-center items-center space-x-4 overflow-hidden rounded-xl"
    >
      <!-- 瀑布流列容器 (Masonry Columns) -->
      <div
        v-for="(column, colIndex) in columns"
        :key="colIndex"
        class="w-[200px] h-full overflow-hidden rounded-xl"
      >
        <!-- 列内垂直布局容器 -->
        <ul ref="scrollContainerRefs" class="h-full overflow-hidden">
          <transition-group tag="ul" name="list" class="space-y-4 relative">
            <li
              v-for="item in column"
              :key="item.uuid"
              class="h-[250px] w-full rounded-xl shadow-xl overflow-hidden"
            >
              <img
                :src="getImageUrl(item.imageId)"
                class="opacity-30"
                alt="interest image"
              />
            </li>
          </transition-group>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  ref,
  type Ref,
  watch,
  nextTick,
  onMounted,
  onBeforeUnmount,
} from "vue";
import { useWindowSize, useDebounceFn } from "@vueuse/core";
import { v4 as uuidv4 } from "uuid";

const COLUMN_WIDTH: number = 200;
const ITEM_HEIGHT: number = 250;
const SCROLL_DURATION: number = 10000;
const SCROLL_DISTANCE: number = 500;
const INITIAL_BUFFER: number = 5;

/**
 * @typedef {Object} MasonryItem
 * @property {number} imageId
 * @property {string} uuid
 */
type MasonryItem = {
  imageId: number;
  uuid: string;
};

/**
 * @typedef {MasonryItem[]} MasonryColumn
 */
type MasonryColumn = MasonryItem[];

const containerRef = ref<HTMLDivElement>();
const scrollContainerRefs = ref<HTMLElement[]>([]);
const columns: Ref<MasonryColumn[]> = ref([]);
const scrollIntervals: number[] = [];
const contentUpdateInterval = ref<number | null>(null);

const imageFiles = import.meta.glob("../../../assets/interestImages/*.webp");
const maxImageId: number = Object.keys(imageFiles).length;
const defaultImageUrl: string = new URL(
  "../../assets/interestImages/default.webp",
  import.meta.url
).href;

/**
 * 获取图片 URL
 *
 * @param {number} id 图片的 ID
 * @returns {string} 返回对应的图片 URL，如果 id 无效则返回默认图片 URL
 */
function getImageUrl(id: number): string {
  const isValid: boolean = id > 0 && id <= maxImageId;

  return isValid
    ? new URL(`../../../assets/interestImages/test${id}.webp`, import.meta.url)
        .href
    : defaultImageUrl;
}

/**
 * 创建一个瀑布流项
 *
 * @param {number} imageId 图片ID
 * @returns {MasonryItem} 返回一个带有图片ID和唯一标识的瀑布流项
 */
function createItem(imageId: number): MasonryItem {
  return { imageId, uuid: uuidv4() };
}

/**
 * 根据容器尺寸计算瀑布流的布局
 *
 * @returns {void}
 */
function calculateLayout(): void {
  if (!containerRef.value) return;

  const containerWidth: number = containerRef.value.clientWidth;
  const containerHeight: number = containerRef.value.clientHeight;

  const colCount: number = Math.floor(containerWidth / COLUMN_WIDTH);
  const rowCount: number =
    Math.floor(containerHeight / ITEM_HEIGHT) + INITIAL_BUFFER;

  columns.value = Array.from({ length: colCount }, (_, colIndex) =>
    Array.from({ length: rowCount }, (_, rowIndex) => {
      const imageId: number =
        ((colIndex * rowCount + rowIndex) % maxImageId) + 1;
      return createItem(imageId);
    })
  );
}

/**
 * 平滑滚动容器
 *
 * @param {HTMLElement} element 滚动的容器元素
 * @param {number} duration 滚动持续时间（毫秒）
 * @param {number} scrollAmount 滚动距离
 * @returns {void}
 */
function smoothScroll(
  element: HTMLElement,
  duration: number,
  scrollAmount: number
): void {
  const start: number = element.scrollTop;
  const startTime: number = performance.now();

  function scrollStep(timestamp: number): void {
    const currentTime: number = timestamp - startTime;
    const progress: number = Math.min(currentTime / duration, 1);
    const newScrollPosition: number = start + scrollAmount * progress;

    element.scrollTop = newScrollPosition;

    if (currentTime < duration) {
      requestAnimationFrame(scrollStep);
    }
  }

  requestAnimationFrame(scrollStep);
}

/**
 * 为指定的列设置定时滚动
 *
 * @param {number} columnIndex 列的索引
 * @param {number} direction 滚动方向，1 为向下滚动，-1 为向上滚动
 * @returns {void}
 */
function setupColumnScroll(columnIndex: number, direction: number): void {
  const container: HTMLElement | undefined =
    scrollContainerRefs.value[columnIndex];
  if (!container) return;

  /**
   * 滚动处理函数
   */
  function scrollHandler(): void {
    smoothScroll(container!, SCROLL_DURATION, direction * SCROLL_DISTANCE);
  }

  const interval: number = setInterval(scrollHandler, SCROLL_DURATION);
  scrollIntervals.push(interval);
}

/**
 * 更新所有列的内容，交替追加或前置新项
 *
 * @returns {void}
 */
function updateColumnsContent(): void {
  columns.value.forEach((column: MasonryColumn, index: number): void => {
    const isEvenColumn: boolean = index % 2 === 0;
    isEvenColumn ? appendNewItem(column) : prependNewItem(column);
  });
}

/**
 * 在列末尾添加新项，并移除第一项
 *
 * @param {MasonryColumn} column 需要更新的列
 * @returns {void}
 */
function appendNewItem(column: MasonryColumn): void {
  const lastItem: MasonryItem = column[column.length - 1];
  const newId: number = (lastItem?.imageId % maxImageId) + 1;

  column.push(createItem(newId));
  column.shift();
}

/**
 * 在列开头添加新项，并移除最后一项
 *
 * @param {MasonryColumn} column 需要更新的列
 * @returns {void}
 */
function prependNewItem(column: MasonryColumn): void {
  const firstItem: MasonryItem = column[0];
  const newId: number =
    firstItem?.imageId > 1 ? firstItem.imageId - 1 : maxImageId;

  column.unshift(createItem(newId));
  column.pop();
}

/**
 * 处理页面可见性变化
 *
 * @returns {void}
 */
function handleVisibilityChange(): void {
  if (document.visibilityState === "hidden") {
    // 清除所有定时器
    scrollIntervals.forEach(clearInterval);
    scrollIntervals.length = 0;
    if (contentUpdateInterval.value !== null) {
      clearInterval(contentUpdateInterval.value);
      contentUpdateInterval.value = null;
    }
  } else {
    // 重新启动滚动定时器
    columns.value.forEach((_, index: number) => {
      const direction: number = index % 2 === 0 ? 1 : -1;
      setupColumnScroll(index, direction);
    });
    // 重新启动内容更新定时器
    if (contentUpdateInterval.value === null) {
      contentUpdateInterval.value = setInterval(
        updateColumnsContent,
        SCROLL_DURATION
      );
    }
  }
}

const debouncedGridInitialization = useDebounceFn(calculateLayout, 100);

onMounted((): void => {
  calculateLayout();

  const { width } = useWindowSize();
  watch(width, debouncedGridInitialization);

  document.addEventListener("visibilitychange", handleVisibilityChange);

  nextTick((): void => {
    columns.value.forEach((_, index: number): void => {
      const direction: number = index % 2 === 0 ? 1 : -1;
      setupColumnScroll(index, direction);
    });

    updateColumnsContent();
    setInterval(updateColumnsContent, SCROLL_DURATION);
  });
});

onBeforeUnmount((): void => {
  document.removeEventListener("visibilitychange", handleVisibilityChange);

  scrollIntervals.forEach(clearInterval);
  if (contentUpdateInterval.value !== null) {
    clearInterval(contentUpdateInterval.value);
  }
});
</script>

<style scoped>
.list-enter-active,
.list-leave-active {
  transition: all 10s linear;
}

.list-enter-from,
.list-leave-to {
  height: 0px;
  margin: 0px;
}
</style>
