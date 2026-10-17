import { access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { snacks } from '../apps/web/src/data/snacks.ts';
import { cashCatalog } from '../apps/web/src/data/cash.ts';
import { isImagePath } from '../apps/web/src/data/imagePath.ts';

const publicRoot = new URL('../apps/web/public/', import.meta.url);
const entries = [...snacks, ...cashCatalog];
let present = 0;
let missing = 0;
let invalid = 0;

for (const entry of entries) {
  if (!isImagePath(entry.imageSrc)) {
    invalid += 1;
    console.error(`[잘못된 경로] ${entry.id}: ${entry.imageSrc}`);
    continue;
  }

  const file = fileURLToPath(new URL(entry.imageSrc.slice(1), publicRoot));
  try {
    await access(file);
    present += 1;
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    missing += 1;
    console.warn(`[이미지 누락] ${entry.id}: ${entry.imageSrc}`);
  }
}

console.log(`이미지 ${entries.length}개: 존재 ${present}, 누락 ${missing}, 잘못된 경로 ${invalid}`);
if (missing > 0) console.log('누락된 이미지는 화면에서 플레이스홀더로 표시됩니다.');
if (invalid > 0) process.exitCode = 1;
