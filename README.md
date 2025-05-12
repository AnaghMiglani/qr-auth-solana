# QR Auth – NFT-Based Serial Number Verification via QR Code

**QR Auth** is a blockchain-powered service that uses NFTs to register and verify serial numbers of high-value devices. After minting, a unique QR code is generated that can be placed on physical products. Scanning the QR allows public verification of the product’s authenticity and ownership history.

## 🔗 Live Demo

**[Visit Deployed App →](https://qr-auth-solana.onrender.com/)**

## Features

- Mint serial numbers as NFTs on-chain
- Generate a unique QR code for each NFT
- Enable public verification of product authenticity via QR scan
- Record immutable ownership and transfer history
- Prevent use of fake, duplicate, or stolen serial numbers

## Real-World Problem

QR Auth is inspired by real-world fraud cases that caused significant losses:

- **Apple iPhone Scam (Maryland, 2024)**  
  Counterfeit iPhones with valid serial numbers defrauded Apple of $2.5 million  
  [Read more](https://www.usatoday.com/story/news/nation/2024/10/04/counterfeit-iphone-scammers-apple/75518287007)

- **Amazon Returns & Resale Scam**  
  Fake items were returned or resold using cloned serial numbers  
  [Read more](https://storage.courtlistener.com/recap/gov.uscourts.wawd.329310/gov.uscourts.wawd.329310.1.0.pdf)

- **Sale of Fake or Stolen Goods**  
  Unauthorized sellers list counterfeit or stolen items online that appear genuine due to reused serials.

- **Pre-Owned Sold as New**  
  Previously used products are repackaged and sold as new, misleading customers and violating warranties.

These cases reveal the need for secure, verifiable, and tamper-proof product identifiers.

## Who It's For

- **Consumers** – Scan and verify before buying any high-value item
- **Manufacturers** – Prevent warranty fraud and track original devices
- **Retailers & Resellers** – Prove authenticity of pre-owned or refurbished goods

## Why NFTs and QR Codes?

- **Immutable** – NFTs guarantee that serials cannot be altered or reused
- **Verifiable** – Anyone can scan the QR and check authenticity
- **Decentralized** – No reliance on a single database or authority

## How to Run Locally

```bash
npm install
npm start
```

> 📄 Create a `.env` file in the project root with the following:

```
SECRET_KEY=your_wallet_private_key_here
```

## Example of NFT Created for Phone

![QR Auth Demo](https://github.com/user-attachments/assets/93fbef6c-bf3f-480a-873c-9358eb2b1359)

## License

MIT License
