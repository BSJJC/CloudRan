/**
 * 生成一个随机数序列，确保任意 m 个相邻的数不相同
 * @param {number} n - 随机数的范围（1 到 n）
 * @param {number} m - 相邻数不能重复的个数范围
 * @param {number} length - 生成的序列长度
 * @returns {number[]} - 生成的随机数序列
 * @throws {Error} - 如果参数不合法，抛出错误
 */
export default function generateRandomSequence(
  n: number,
  m: number,
  length: number
): number[] {
  if (m < 1) {
    throw new Error("m 必须至少为 1");
  }

  if (m > length) {
    throw new Error("m 不能大于序列长度");
  }

  if (m > n) {
    throw new Error("m 不能大于 n，否则无法保证唯一性");
  }

  const sequence: number[] = [];

  for (let i = 0; i < length; i++) {
    let randomNumber: number;
    let attempts = 0;
    const maxAttempts = 100; // 防止无限循环

    do {
      if (attempts++ >= maxAttempts) {
        throw new Error("无法生成符合条件的随机数，可能参数设置不当");
      }

      randomNumber = Math.floor(Math.random() * n) + 1;
    } while (sequence.slice(Math.max(0, i - m + 1), i).includes(randomNumber));

    sequence.push(randomNumber);
  }

  return sequence;
}

// 示例用法
const n: number = 5;
const m: number = 3;
const length: number = 10;
const randomSequence: number[] = generateRandomSequence(n, m, length);
console.log(randomSequence);
// [2, 5, 3, 1, 2, 3, 5, 2, 1, 3]
