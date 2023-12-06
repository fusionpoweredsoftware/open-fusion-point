import crypto from 'crypto';
import fs from 'fs/promises';
import _fs from 'fs';
import os from 'os';
import { encryptHex96, decryptHex96 } from 'hex96';
import { basename } from 'path';
import path from 'path';

let verboseMode=true;
const ofpRoot = path.dirname(new URL(import.meta.url).pathname);
const currentFileExtension = await fs.readFile(`${ofpRoot}/file-extension.info`, "utf-8");
const saltHexPath = `${ofpRoot}//salt.hex`;
if (!_fs.existsSync(saltHexPath))
    throw "ERROR: No 'salt.hex' found. Did you run 'make unique'?"
export function getFileExtension() {
    return currentFileExtension;
}
const currentSaltBytes = await fs.readFile(saltHexPath);
const salt = (pepperBytes, saltBytes = currentSaltBytes) => {
    return Buffer.concat([pepperBytes,saltBytes]);
}

function utf8ToHex(input) {
    return Buffer.from(input, 'utf-8');
}

function getHash(utf8String) {
    return Buffer.from(crypto.createHash('md5').update(utf8String, 'utf-8').digest('hex'),'hex');
}

function getHex32fromUTF8(utf8String) {
    const hex32 = Buffer.concat([getHash(utf8String),utf8ToHex(utf8String)]);
    return Buffer.from(hex32.slice(-32));
}

async function cleanupBackups(backupPath, limit) {
    const files = await fs.readdir(backupPath);
    const sortedFiles = files
        .filter(file => file.endsWith('.bak'))
        .sort((a, b) => _fs.statSync(`${backupPath}/${b}`).mtime - _fs.statSync(`${backupPath}/${a}`).mtime);

    const filesToDelete = sortedFiles.slice(limit);
    for (const file of filesToDelete) {
        await fs.unlink(`${backupPath}/${file}`);
    }
};

async function backupFile(filePath, backupPath, limit = 5) {
    backupPath = backupPath.replace(/^\~/g, os.homedir());
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    await fs.mkdir(backupPath, { recursive: true });
    const backupFilePath = `${backupPath}/${basename(filePath)}.${timestamp}.bak`;
    await fs.copyFile(filePath, backupFilePath);
    if (verboseMode) console.log(`Backup created: ${backupFilePath}`);
    await cleanupBackups(backupPath, limit);
};

export async function encryptData(utf8String, password, {outputFilePath, backupPath, limit, saltBytes} = {}) {
    let fileExtension = currentFileExtension;
    const hex32pass = getHex32fromUTF8(password);
    const byteData = Buffer.from(utf8String, 'utf-8');
    if (basename(outputFilePath).includes(".")) {
        fileExtension = basename(outputFilePath).replace(/^[^\.]+(\..*)$/g,'$1');
        if (fileExtension && fileExtension.length!=basename(outputFilePath).length)
            saltBytes=await fs.readFile(`salt${fileExtension}.hex`)
        if (saltBytes)
            fileExtension = '';
        else
            fileExtension = currentFileExtension;
    }
    if (backupPath && outputFilePath && _fs.existsSync(outputFilePath+fileExtension)) {
        await backupFile(outputFilePath+fileExtension, backupPath, limit);
    }
    const fullEncryptedFilePath = outputFilePath+fileExtension;
    const encryptedData = await encryptHex96(salt(hex32pass,saltBytes), byteData);
    if (outputFilePath) {
        await fs.writeFile(fullEncryptedFilePath, encryptedData);
        if (verboseMode) 
            console.log('File encrypted successfully.');
    }
    return encryptData;
};

export async function decryptFile(inputFilePath, password, {saltBytes} = {}) {
    let fileExtension = currentFileExtension;
    if (basename(inputFilePath).includes(".")) {
        fileExtension = basename(inputFilePath).replace(/^[^\.]+(\..*)$/g,'$1');
        if (fileExtension && fileExtension.length!=basename(inputFilePath).length)
            saltBytes=await fs.readFile(`salt${fileExtension}.hex`)
        if (saltBytes)
            fileExtension = '';
        else
            fileExtension = currentFileExtension;
    }
    const hex32pass = getHex32fromUTF8(password);
    const fullEncryptedFilePath = inputFilePath+fileExtension;
    const decryptedData = await decryptHex96(salt(hex32pass, saltBytes), await fs.readFile(fullEncryptedFilePath));
    return decryptedData;
}

export async function backupAndEncryptData(utf8String, password, {outputFilePath, backupPath='~/.fp_bak', limit}={}) {
    await encryptData(utf8String, password, {outputFilePath, backupPath, limit});
}

export const decryptData = async(byteData, password, {saltBytes}={}) => {
    const hex32pass = getHex32fromUTF8(password);
    return await decryptHex96(salt(hex32pass, saltBytes), byteData);
}

const setVerboseMode = (isVerbose) => {
    verboseMode=isVerbose;
}

export default {
    setVerboseMode,
    decryptFile,
    decryptData,
    encryptData,
    backupAndEncryptData,
    getFileExtension
};