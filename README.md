# Image Mystery Vault 🔐

A secure, minimalist Next.js 15 application designed to transform your images into "unreadable mystery files" and store them in a protected vault.

## 🌟 Overview

This project provides a simple yet robust way to encrypt images locally. Instead of standard image formats, your files are converted into encrypted binary blobs (Mystery Blobs) that can only be unlocked with the correct password.

## 🚀 Key Features

- **Direct-to-Binary Encryption:** Converts images directly to raw Buffers, avoiding the 33% size bloat associated with Base64 encoding.
- **Secure Key Derivation:** Uses `scryptSync` with a unique 16-byte random salt for every file to derive a 256-bit key.
- **Military-Grade Encryption:** Employs `AES-256-CBC` with a random Initialization Vector (IV) for each encryption operation.
- **The Vault:** A dedicated route (`/vault`) to browse your collection of mystery files and decrypt them on-demand.
- **Modern Tech Stack:** Built with Next.js 15 (App Router), TypeScript, and Tailwind CSS.

## 🛠️ Tech Stack

- **Framework:** [Next.js 15 (App Router)](https://nextjs.org/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Encryption:** Node.js native `crypto` module
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Storage:** Local file system (`/encrypted-storage`)

## 🔐 Security Specification

Our "Mystery Blob" packaging format is designed for both security and simplicity:

| Offset | Length | Content |
| :--- | :--- | :--- |
| 0 | 16 Bytes | Random Salt |
| 16 | 16 Bytes | Random IV |
| 32 | Variable | AES-256-CBC Encrypted Data |

For more technical details, see [ENCRYPTION_ALGO.md](./ENCRYPTION_ALGO.md).

## 🏃 Getting Started

1. **Install Dependencies:**
   ```bash
   pnpm install
   ```

2. **Run Development Server:**
   ```bash
   pnpm dev
   ```

3. **Encrypt an Image:**
   - Go to the home page.
   - Select an image and enter a strong password.
   - Click "Encrypt to Mystery File".

4. **Access the Vault:**
   - Click "View Vault" or navigate to `/vault`.
   - Enter your password to reveal the hidden images.

## ⚠️ Important Note

This project is a prototype. Encrypted files are stored locally in the `/encrypted-storage` directory. If you lose your password, there is **no way to recover** the original image.
