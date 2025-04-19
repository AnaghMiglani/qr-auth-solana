import "dotenv/config";
import QRCode from "qrcode"
import {
    createNft,
    findMetadataPda,
    mplTokenMetadata,
    verifyCollectionV1,
  } from "@metaplex-foundation/mpl-token-metadata";
  import {
    createGenericFile,
    generateSigner,
    keypairIdentity,
    percentAmount,
    publicKey as UMIPublicKey,
  } from "@metaplex-foundation/umi";
  import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
  import { irysUploader } from "@metaplex-foundation/umi-uploader-irys";
  import {
    airdropIfRequired,
    getExplorerLink,
    getKeypairFromFile,
  } from "@solana-developers/helpers";
  import { clusterApiUrl, Connection, Keypair, LAMPORTS_PER_SOL } from "@solana/web3.js";
  import { promises as fs } from "fs";
  import * as path from "path";
  // create a new connection to Solana's devnet cluster
  const connection = new Connection(clusterApiUrl("devnet"));
  
  // load keypair from local file system
  // assumes that the keypair is already generated using `solana-keygen new`
  const secretKey = process.env.SECRET_KEY || "[167,155,162,56,71,255,79,223,18,77,215,192,2,197,59,86,82,117,199,112,239,241,226,136,87,91,59,167,51,220,80,168,162,176,3,226,250,35,207,63,63,172,0,54,246,133,99,78,127,183,18,61,27,167,137,52,130,118,208,193,103,227,232,30]";
  if (!secretKey) {
    throw new Error("SECRET_KEY is not defined in the environment variables.");
  }
  
  const user = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(secretKey)));
  console.log("Loaded user:", user.publicKey.toBase58());
  
  await airdropIfRequired(
    connection,
    user.publicKey,
    1 * LAMPORTS_PER_SOL,
    0.1 * LAMPORTS_PER_SOL,
  );
  
  const umi = createUmi(connection);
  
  // convert to umi compatible keypair
  const umiKeypair = umi.eddsa.createKeypairFromSecretKey(user.secretKey);
  
  // load our plugins and signer
  umi
    .use(keypairIdentity(umiKeypair))
    .use(mplTokenMetadata())
    .use(irysUploader());
// Substitute in your collection NFT address from create-metaplex-nft-collection.ts
const collectionNftAddress = UMIPublicKey("AuU7XLbwyoNsFMnAEfzbLtekL4GjFAydXxfsd5YTBrtC");

// example data and metadata for our NFT
const nftData = {
  name: "My NFT",
  symbol: "MN",
  description: "My NFT Description",
  sellerFeeBasisPoints: 0,
  imageFile: "nft.png",
};

const uri = await umi.uploader.uploadJson({
    name: "123456",
    symbol: "phone-1",
    description: "My NFT Description",
  });
console.log("NFT offchain metadata URI:", uri);

const mint = generateSigner(umi);

// create and mint NFT
await createNft(umi, {
  mint,
  name: "123456",
  symbol: "phone-1",
  uri,
  updateAuthority: umi.identity.publicKey,
  sellerFeeBasisPoints: percentAmount(0),
  collection: {
    key: collectionNftAddress,
    verified: false,
  },
}).sendAndConfirm(umi, { send: { commitment: "finalized" } });

let explorerLink = getExplorerLink("address", mint.publicKey, "devnet");
console.log(`Token Mint:  ${explorerLink}`);

QRCode.toDataURL(explorerLink, { width: 300, margin: 1 })
  .then(qrCode => {
    const qrCodePath = path.join(__dirname, "nft_qr_code.png");
    return fs.writeFile(qrCodePath, qrCode.replace(/^data:image\/png;base64,/, ""), "base64")
      .then(() => qrCodePath); // Return the path after writing the file
  })
  .then(url => {
    console.log("QR Code saved at:", url);
  })
  .catch(err => {
    console.error("Error generating QR Code:", err);
  });