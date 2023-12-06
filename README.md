# Open Fusion Point

Open Fusion Point is an AES-based encryption tool designed for beginners. It provides a user-friendly approach to securing data, with features tailored for ease of use and effective data protection.

## Features

- **Directory Encryption**: Secures entire directories with robust encryption.
- **Backup Functionality**: Automatically creates backups, safeguarding against data loss.
- **Simplified Encryption Types**: Automatically assigns a file extension to indicate the encryption algorithm used.
- **Quick Test Feature**: Enables rapid testing of encryption and decryption functionality.
- **Hex96 Custom Salt Generation**: Installs with a unique layer of encryption using [hex96](https://github.com/fusionpoweredsoftware/hex96).

## Getting Started

### Installation
To install Open Fusion Point, follow these steps:

1. Clone the repository to your local machine.
2. Navigate to the root directory of the project.
3. Run the following command: `sudo make install`

## Usage

### Handling Encrypted File Extensions
The tool uses a consistent file extension (e.g., `.fp00`) for all encrypted files, serving as a marker for the encryption scheme used. If the encryption scheme is updated, this extension can be changed (e.g., to `.fp01`) to reflect the new version. The `file-extension.info` file contains only the current extension in use, making it easy to identify the encryption type applied across all files.

### Get File Extension Info
To get the file extension currently applied to all files,:
```javascript
import ofp from 'open-fusion-point';

await ofp.getFileExtension();
```


### Safely Encrypting Data
To safely encrypt data with a backup, use the following code example:
```javascript
import ofp from 'open-fusion-point';

await ofp.backupAndEncryptData("<utf-8 string to encrypt>", "<safe password here>", {
    outputFilePath: "<file path to store encrypted data>"
});
```

This will backup generate up to 5 backups in `~/.fp_bak`. When the limit is reached, the oldest backup will be removed to maintain the 5 backup limit.

### Decrypting a File
To decrypt a file once it has been encrypted, use the following code example:
```javascript
import ofp from 'open-fusion-point';

const decryptedData = await ofp.decryptFile("<path to encrypted file>", "<safe password here>");
```

### Setting a Custom Backup Path and Backup Limit
When encrypting, you can set a custom `backup path`. If not specified, it defaults to `~/.fp_bak`. The default `limit` for the number of backups to keep is always `5`. Here's an example of setting a custom backup path and backup limit:
```javascript
import ofp from 'open-fusion-point';

await ofp.backupAndEncryptData("<utf-8 string to encrypt>", "<safe password here>", {
    outputFilePath: "<file path to store encrypted data>",
    backupPath: '~/my/backup/path',
    limit: <number of backups to keep>
});
```

### Encrypt Without Backup (Unsafe)
Using the `encrypt` action alone will encrypt the directory without creating a backup:
```javascript
import ofp from 'open-fusion-point';

await ofp.insecure.encryptData("<utf-8 string to encrypt>", "<safe password here>", {
    outputFilePath: "<path to output data>"
});
```

NOTE: This is considered unsafe since it will overwrite the previously encrypted file without making a backup of what was replaced.

### Encrypt With Backup
When using the `encrypt` action, a backup will not be created by default. However, if you specify a `backup path`, this setting will override the action's default behavior and proceed with the backup generation:

```javascript
import ofp from 'open-fusion-point';

await ofp.insecure.encryptData("<utf-8 string to encrypt>", "<safe password here>", {
    outputFilePath: '<path to output data>,
    backupPath: '~/backup/path/to/use'
});
```

### Get Decrypted Data
Decrypting the data back to its original file format is generally insecure, since it will make the data available from the drive where it was encrypted. To more securely decrypt the data, it is generally recommended to use the `getDecryptedData` function:

```javascript
import ofp from 'open-fusion-point';

const decryptedData = await ofp.decryptData("<utf-8 string to encrypt>", "<safe password here>");
```

### Get Encrypted Data
In some cases, it may be necessary to only get the encrypted data directly, without saving it to a file. In this case, you can
use the output of the `encryptData` function as follows:

```javascript
import ofp from 'open-fusion-point';

let encryptedData = await ofp.encryptData("<utf-8 string to encrypt>", {
    password: <utf-8 password>
});
```

Technically, you can always get the decrypted data from the function in this manner, but when the output file is not specified,
no encrypted output file will be generated.

### Suppressing Output
The `verboseMode` can be set to `false` to suppress all output from the tool, providing a quieter operation:
```javascript
import ofp from 'open-fusion-point';

let encryptionSuccess = await ofp.setVerboseMode(false);
```

## Updating Encryption Scheme

To renew the encryption scheme, type:

```
make renew
```

This will prompt you to re-generate the salt.hex file and bump up the current file extension iteration automatically.


## Testing

To test the functionality of Open Fusion Point, run the following command in the root directory of the project:

```
make test
```

Upon successful execution, you should see output similar to this:

```terminal
Directory compressed successfully.
Backup created: /home/root/.fp_bak/decrypt_me.fp00.2023-12-06T15-26-53.593Z.bak
File decompressed successfully.
Directory compressed successfully.
File decompressed successfully.

TEST SUCCESSFUL: No mismatch detected.
```

## License

Open Fusion Point is licensed under [MIT License](https://opensource.org/license/mit/)

This ensures that all users have the freedom to share and change the software under the same terms as the original license, promoting software freedom and collaboration.
