import readline from 'readline';
import crypto from 'crypto';
import fs from 'fs/promises';
import _fs from 'fs';

const args = process.argv.slice(2);

readline.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);

let lastTime = process.hrtime.bigint();
let keystrokeData = [];
let keystrokeCount = 0;

console.log('\nType some random characters. Press Enter after a MINIMUM of  keystrokes are entered:\n');

let encryptionFileExtensionPrefix = ".fp";
let currentSaltIteration = '00';
let hexFile = 'salt.hex';
if (args.length > 0)
    hexFile = args[0];

if (hexFile == 'salt.hex' && _fs.existsSync('file-extension.info')) {
  const fileExt = await fs.readFile('file-extension.info', 'utf-8');
  encryptionFileExtensionPrefix = fileExt.replace(/^([^0-9]+)[0-9]+$/g,'$1');
  currentSaltIteration = (Number(fileExt.replace(encryptionFileExtensionPrefix,''))+1).toString().padStart(2,'0').slice(-2);
  if (currentSaltIteration>99) {
    console.error("In file-extension.info, you must reset the iteration count. To keep it unique, consider modifying the file extension prefix.")
    process.exit(0);
  }
}

process.stdin.on('keypress', async (str, key) => {
    if (key && key.ctrl && key.name === 'c') {
        throw 'Salt generation process interrupted!'
    } if (key && key.name === 'return' && keystrokeCount>6) {
    process.stdin.setRawMode(false);
    process.stdin.pause();
    let dataString = keystrokeData.join('');
    let hash = Buffer.from(crypto.createHash('sha512').update(dataString).digest('hex').slice(0,64),'hex');
    process.stdout.write('\r');
    console.log('Unique salt generated.\n');
    await fs.writeFile(hexFile, hash);
    if (hexFile=='salt.hex') {
      await fs.writeFile(`salt${encryptionFileExtensionPrefix+currentSaltIteration}.hex`, hash);
      await fs.writeFile('file-extension.info', encryptionFileExtensionPrefix+currentSaltIteration);
    }
  } else {
    if (key && key.name === 'return') {
      str='';
    }
    keystrokeCount++;
    let currentTime = process.hrtime.bigint();
    let delta = currentTime - lastTime; // Delta in nanoseconds
    lastTime = currentTime;
    process.stdout.write('*');
    keystrokeData.push(str + delta);
  }
});