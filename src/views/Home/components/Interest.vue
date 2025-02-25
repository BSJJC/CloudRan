<template>
  <div class="view-full p-4">
    <!-- 瀑布流容器 -->
    <div
      ref="masonryContainerRef"
      class="view-full flex justify-center items-center space-x-2"
    >
      <!-- 瀑布流列容器 -->
      <div
        v-for="(col, colIndex) in masonryColumns"
        :key="colIndex"
        class="w-[200px] h-full relative overflow-hidden"
      >
        <!-- 列内垂直布局容器 -->
        <div class="w-full h-[150%] flex flex-col space-y-2 absolute">
          <!-- 瀑布流项 -->
          <div
            ref="imageRefs"
            v-for="(_, rowIndex) in col"
            :key="rowIndex"
            class="h-[250px] w-full rounded-xl shadow-xl overflow-hidden transition duration-1000 ease-linear"
            style="transform: translateY(0px)"
          >
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
import { v4 as uuidv4 } from "uuid";

const masonryContainerRef = ref<HTMLDivElement>();
const imageRefs = ref();

type TItemArray = {
  imgID: number;
  uuid: string;
  moveDirection: "up" | "down";
};

const masonryColumns: Ref<TItemArray[][]> = ref([]);

function initializeMasonryGrid() {
  const waterfallWidth = masonryContainerRef.value?.clientWidth;
  const waterfallHeight = masonryContainerRef.value?.clientHeight;

  if (waterfallWidth && waterfallHeight) {
    const cols = Math.floor(waterfallWidth / 200);
    const rows = Math.floor(waterfallHeight / 250) + 1;

    const maxImgNum = 18;
    let imgIDCount = 0;
    let directionJudge = -1;

    masonryColumns.value = Array.from({ length: cols }, () =>
      Array.from({ length: rows }, () => {
        let _imgIDCount = imgIDCount;
        if (_imgIDCount + 1 > maxImgNum) {
          _imgIDCount = 1;
          imgIDCount = 1;
        } else {
          _imgIDCount++;
          imgIDCount++;
        }

        directionJudge++;

        return {
          imgID: _imgIDCount,
          uuid: uuidv4(),
          moveDirection:
            Math.floor(directionJudge / rows) % 2 === 0 ? "up" : "down",
        };
      })
    );
  }
}

function updateImagePositions() {
  imageRefs.value.forEach((element: HTMLElement, index: number) => {
    let offSet = element.style.getPropertyValue("transform");
    const l = offSet.indexOf("(") + 1;
    const r = offSet.indexOf("p");
    offSet = offSet.slice(l, r);
    let offsetNum = parseInt(offSet);

    const direction = masonryColumns.value.flat()[index].moveDirection;

    if (direction === "up") {
      offsetNum -= 50; // 向上平移
    } else {
      offsetNum += 50; // 向下平移
    }

    element.style.setProperty("transform", `translateY(${offsetNum}px)`);
  });

  debouncedUpdate();
}

const debouncedCalculate = useDebounceFn(initializeMasonryGrid, 100);
const debouncedUpdate = useDebounceFn(updateImagePositions, 1000);

onMounted(() => {
  initializeMasonryGrid();

  const { width } = useWindowSize();

  watch(width, () => {
    debouncedCalculate();
  });

  setTimeout(() => {
    debouncedUpdate();
  }, 500);
});
</script>

<style scoped></style>
