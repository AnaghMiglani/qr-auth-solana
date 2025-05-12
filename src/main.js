import { createMetaplexNft } from "../dist/create-metaplex-nft.js";
import { createCollection } from "../dist/create-metaplex-nft-collection.js";
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
app.use("/dist", express.static(path.join(__dirname, "../dist")));

// Serve the home page with two buttons
app.get("/", (req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Home</title>
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
      text-align: center;
    }
    button {
      padding: 10px 20px;
      margin: 10px;
      font-size: 16px;
      background-color: #4b0082;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    button:hover {
      background-color: #6a0dad;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Welcome</h1>
    <button onclick="location.href='/create-nft'">Create NFT</button>
    <button onclick="location.href='/create-collection'">Create Collection</button>
  </div>
</body>
</html>`);
});

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
        <label for="collectionAddress">Collection Address</label>
        <input id="collectionAddress" name="collectionAddress" type="text" required>
      </div>
      <div class="form-group">
        <label for="imgurLink">Image URL (Optional)</label>
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
  const { serialNumber, productType, collectionAddress, imgurLink } = req.body;

  if (!serialNumber || !productType || !collectionAddress) {
    return res
      .status(400)
      .send(
        "Serial Number, Product Type, and Collection Address are required."
      );
  }

  try {
    const nftLink = await createMetaplexNft(
      serialNumber,
      productType,
      collectionAddress,
      imgurLink || "https://i.imgur.com/GB3znw2.png"
    );
    res.send(`
      <title>Mint Successful</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          margin: 0;
          background-color: #f0f0f0;
        }
        .container {
          text-align: center;
          background: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
          max-width: 500px;
          width: 100%;
        }
        a {
          color: #4b0082;
          text-decoration: none;
          font-weight: bold;
        }
        a:hover {
          text-decoration: underline;
        }
        .button-link {
          display: inline-block;
          margin-top: 10px;
          padding: 10px 20px;
          background-color: #4b0082;
          color: white;
          text-decoration: none;
          border-radius: 4px;
          font-weight: bold;
          font-size: 16px;
          cursor: pointer;
        }
        .button-link:hover {
          background-color: #6a0dad;
        }
        .button-link::after {
          content: " \u2197"; /* Unicode for arrow icon */
        }
        .qr-code {
          margin-top: 20px;
        }
      </style>
      <body>
        <div class="container">
          <h1>Mint Successful!</h1>
          <p>Your NFT has been minted successfully.</p>
          <div>
            <h2>View Your NFT:</h2>
            <a href="${nftLink}" target="_blank" class="button-link">Click Here</a>
          </div>
          <div class="qr-code" style="margin-top: 20px;">
            <h2>QR Code:</h2>
            <img src="/dist/nft_qr_code.png" alt="NFT QR Code">
          </div>
        </div>
      </body>
    `);
  } catch (err) {
    console.error("Error minting NFT:", err);
    res.status(500).send("Failed to mint NFT. Please try again.");
  }
});

// Serve the HTML form for creating a collection
app.get("/create-collection", (req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Create Collection</title>
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
  </style>
</head>
<body>
  <div class="container">
    <h1>Create a Collection</h1>
    <form id="collectionForm" method="POST" action="/create-collection">
      <div class="form-group">
        <label for="productType">Product Type</label>
        <input id="productType" name="productType" type="text" required>
      </div>
      <button type="submit">Create Collection</button>
    </form>
    <div id="message" class="error" style="display: none;"></div>
  </div>
</body>
</html>`);
});

// Handle the form submission and create the collection
app.post("/create-collection", async (req, res) => {
  const { productType } = req.body;

  if (!productType) {
    return res.status(400).send("Product Type is required.");
  }

  try {
    const collectionLink = await createCollection(productType);
    const collectionAddress = collectionLink
      .split("/address/")[1]
      .split("?cluster=devnet")[0];
    res.send(`
      <title>Collection Created</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          margin: 0;
          background-color: #f0f0f0;
        }
        .container {
          text-align: center;
          background: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
          max-width: 500px;
          width: 100%;
        }
        .button-link {
          display: inline-block;
          margin-top: 10px;
          padding: 10px 20px;
          background-color: #4b0082;
          color: white;
          text-decoration: none;
          border-radius: 4px;
          font-weight: bold;
          font-size: 16px;
          cursor: pointer;
        }
        .button-link:hover {
          background-color: #6a0dad;
        }
        .button-link::after {
          content: " \u2197"; /* Unicode for arrow icon */
        }
        .collection-address {
          margin-top: 20px;
          padding: 10px;
          border: 1px solid #4b0082;
          border-radius: 4px;
          background-color: #f9f9f9;
        }
        .collection-address h3 {
          color: #4b0082;
        }
        .collection-address p {
          font-size: 14px;
          color: #555;
        }
        .qr-code {
          margin-top: 20px;
        }
      </style>
      <body>
        <div class="container">
          <h1>Collection Created Successfully!</h1>
          <p>Your collection has been created successfully.</p>
          <div>
            <h2>View Your Collection:</h2>
            <a href="${collectionLink}" target="_blank" class="button-link">Click Here</a>
          </div>
          <div class="collection-address">
            <h3>Collection Address:</h3>
            <p style="font-weight: bold;">${collectionAddress}</p>
            <p>Note: Please copy this address for creating NFTs in this collection.</p>
          </div>
          <div class="qr-code">
            <h2>QR Code:</h2>
            <img src="/dist/collection_qr_code.png" alt="Collection QR Code">
          </div>
        </div>
      </body>
    `);
  } catch (err) {
    console.error("Error creating collection:", err);
    res.status(500).send("Failed to create collection. Please try again.");
  }
});

// Start the server
app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000/create-nft");
});
