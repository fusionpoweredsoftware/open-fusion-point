import ofp from 'open-fusion-point';
import crypto from 'crypto';

const password = crypto.randomBytes(16).toString('utf-8');
const dataToEncrypt = crypto.randomBytes(1234567);
const password2 = crypto.randomBytes(16).toString('utf-8');
const dataToEncrypt2 = crypto.randomBytes(1234567);

const encryptionData = await ofp.encryptData(dataToEncrypt, password, {
    outputFilePath: './testing/encrypted_output/decrypt_me',
});

const encryptionData2 = await ofp.encryptData(dataToEncrypt2, password2, {
    outputFilePath: './testing/encrypted_output/decrypt_me.fp.test',
});


//Encrypt twice to test backup process
await ofp.backupAndEncryptData(dataToEncrypt, password, {
    outputFilePath: './testing/encrypted_output/decrypt_me'
});

if (encryptionData) {
    const decryptedOutput = await ofp.decryptFile('./testing/encrypted_output/decrypt_me', password);
    const decryptedOutput2 = await ofp.decryptFile('./testing/encrypted_output/decrypt_me.fp.test', password2);
    
    if (Buffer.compare(decryptedOutput,dataToEncrypt)==0 && Buffer.compare(dataToEncrypt2,decryptedOutput2)==0) {
        console.log("\nTEST SUCCESSFUL: No mismatch detected.\n");
    } else {
        console.error("\nTEST FAILED: Mismatch detected.\n");
    }
} else {
    console.error("\nTEST FAILED: No encryption data found.\n");
}