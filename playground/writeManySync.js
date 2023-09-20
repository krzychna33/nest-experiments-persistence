const fs = require('node:fs')

const main = async () => {
  console.time('writeMany');

  fs.open('test.txt', 'w', (err, fd) => {
    if (err) throw err;
    for (let i = 0; i < 1000000; i++) {
      fs.writeSync(fd, ` ${i} `);
    }
    console.timeEnd('writeMany');
  });
};

main();
