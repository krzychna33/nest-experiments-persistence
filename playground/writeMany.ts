import * as fs from 'node:fs/promises';

const main = async () => {
  console.time('writeMany');

  const fileHandle = await fs.open('playground/test.txt', 'w');

  for (let i = 0; i < 1000000; i++) {
    await fileHandle.writeFile(` ${i} `);
  }
  console.timeEnd('writeMany');
};

main();
