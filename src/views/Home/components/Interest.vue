<template>
  <div class="view-full p-4">
    <!-- 瀑布流容器 -->
    <div
      ref="waterfallRef"
      class="view-full flex justify-center items-center space-x-2"
    >
      <!-- 瀑布流列容器 -->
      <div
        v-for="(col, colIndex) in itemArrays"
        :key="colIndex"
        class="w-[200px] h-full relative overflow-hidden"
      >
        <!-- 列内垂直布局容器 -->
        <div class="w-full h-[150%] flex flex-col space-y-2 absolute">
          <!-- 瀑布流项 -->
          <div
            ref="imgRef"
            v-for="(_, rowIndex) in col"
            :key="rowIndex"
            class="h-[250px] w-full rounded-xl shadow-xl overflow-hidden transition duration-1000 ease-linear"
            style="transform: translateY(0px)"
          >
            <img
              :src="
                col[rowIndex].imgID >= 0
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

const waterfallRef = ref<HTMLDivElement>();
const imgRef = ref();

type TItemArray = {
  imgID: number;
  uuid: string;
  moveDirection: "up" | "down";
};

const itemArrays: Ref<TItemArray[][]> = ref([]);

function calculateColumns() {
  const waterfallWidth = waterfallRef.value?.clientWidth;
  const waterfallHeight = waterfallRef.value?.clientHeight;

  if (waterfallWidth && waterfallHeight) {
    const cols = Math.floor(waterfallWidth / 200);
    const rows = Math.floor(waterfallHeight / 250) + 1;

    const maxImgNum = 18;
    let index = -1;

    itemArrays.value = Array.from({ length: cols }, () =>
      Array.from({ length: rows }, () => {
        let _index = index;
        if (_index + 1 > maxImgNum) {
          _index = 0;
          index = 0;
        } else {
          _index++;
          index++;
        }

        return {
          imgID: _index,
          uuid: uuidv4(),
          moveDirection: Math.floor(index / rows) % 2 === 0 ? "up" : "down",
        };
      })
    );
  }
}

function continuousUpdate() {
  imgRef.value.forEach((element: HTMLElement, index: number) => {
    let offSet = element.style.getPropertyValue("transform");
    const l = offSet.indexOf("(") + 1;
    const r = offSet.indexOf("p");
    offSet = offSet.slice(l, r);
    let offsetNum = parseInt(offSet) || 0;

    // 根据列的奇偶性决定更新方向
    // const indexCol = Math.floor(
    //   index / Math.floor(waterfallRef.value!.clientHeight / 250) + 2
    // );
    // if (indexCol % 2 === 0) {
    //   offsetNum -= 10; // 向上平移
    // } else {
    //   offsetNum += 10; // 向下平移
    // }

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
    const flatArr = itemArrays.value.flat();
    console.log(flatArr);

    // debouncedUpdate();
  }, 50);
});
</script>

<style scoped></style>
