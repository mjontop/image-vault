# Encryption Algorithm & Specification

This document describes the secure encryption workflow used for creating "Mystery Blobs" from image files.

## Algorithm Details
- **Type:** AES-256-CBC
- **Key Derivation:** `crypto.scryptSync`
- **Key Size:** 256-bit (32 bytes)
- **Salt:** 16-byte random salt per file
- **IV:** 16-byte random Initialization Vector per file

## Packaging Format
The final output is a single binary blob concatenated as follows:
`[SALT (16 bytes)][IV (16 bytes)][ENCRYPTED_DATA (remainder)]`

## Decryption Slice Guide
To decrypt a mystery file later:
1. **Read** the file into a Buffer.
2. **Extract Salt:** `const salt = buffer.subarray(0, 16);`
3. **Extract IV:** `const iv = buffer.subarray(16, 32);`
4. **Extract Data:** `const encryptedData = buffer.subarray(32);`
5. **Re-derive Key:** `const key = crypto.scryptSync(password, salt, 32);`
6. **Decipher:** Use `aes-256-cbc` with the derived key and extracted IV.
