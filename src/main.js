import { createMetaplexNft } from "./create-metaplex-nft.js";
import express from "express";
import bodyParser from "body-parser";
import path from "path";
import { fileURLToPath } from "url";

// Fix for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware to parse JSON and URL-encoded data
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Serve static files (e.g., QR code)
console.log("Serving static files from:", __dirname);
app.use("/static", express.static(__dirname));

// Serve the HTML form
app.get("/create-nft", (req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Mint NFT</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background-color: #f0f0f0;
      margin: 0;
    }
    .container {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 0 10px rgba(0,0,0,0.1);
      width: 100%;
      max-width: 400px;
    }
    .form-group { margin-bottom: 15px; }
    label { display: block; margin-bottom: 5px; }
    input {
      width: 100%;
      padding: 8px;
      border: 1px solid #ccc;
      border-radius: 4px;
      box-sizing: border-box;
    }
    button {
      width: 100%;
      padding: 10px;
      background: #4b0082;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    button:hover { background: #6a0dad; }
    .error { color: red; margin-bottom: 10px; }
    .success { color: green; margin-bottom: 10px; }
    .qr-code { margin-top: 20px; text-align: center; }
    .qr-code img { width: 200px; height: 200px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Mint Your NFT</h1>
    <form id="nftForm" method="POST" action="/create-nft">
      <div class="form-group">
        <label for="serialNumber">Serial Number</label>
        <input id="serialNumber" name="serialNumber" type="text" required>
      </div>
      <div class="form-group">
        <label for="productType">Product Type</label>
        <input id="productType" name="productType" type="text" required>
      </div>
      <div class="form-group">
        <label for="imgurLink">Imgur Link (Optional)</label>
        <input id="imgurLink" name="imgurLink" type="url">
      </div>
      <button type="submit">Mint NFT</button>
    </form>
    <div id="message" class="error" style="display: none;"></div>
  </div>
</body>
</html>`);
});

// Handle the form submission and create the NFT
app.post("/create-nft", async (req, res) => {
  const { serialNumber, productType, imgurLink } = req.body;

  if (!serialNumber || !productType) {
    return res.status(400).send("Serial Number and Product Type are required.");
  }

  try {
    await createMetaplexNft(serialNumber, productType, imgurLink || "https://i.imgur.com/GB3znw2.png");
    res.send(`
      <h1>Mint Successful!</h1>
      <p>Your NFT has been minted successfully.</p>
      <div class="qr-code">
        <h2>QR Code:</h2>
        <img src="/static/nft_qr_code.png" alt="NFT QR Code">
      </div>
    `);
  } catch (err) {
    console.error("Error minting NFT:", err);
    res.status(500).send("Failed to mint NFT. Please try again.");
  }
});

// Start the server
app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000/create-nft");
});