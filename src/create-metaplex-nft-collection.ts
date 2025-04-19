import "dotenv/config";
import QRCode from "qrcode";
import {
    createNft,
    mplTokenMetadata,
  } from "@metaplex-foundation/mpl-token-metadata";
  import {
    createGenericFile,
    generateSigner,
    keypairIdentity,
    percentAmount,
  } from "@metaplex-foundation/umi";
  import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
  import { irysUploader } from "@metaplex-foundation/umi-uploader-irys";
  import {
    airdropIfRequired,
    getExplorerLink,
    getKeypairFromFile,
  } from "@solana-developers/helpers";
  import { clusterApiUrl, Connection, LAMPORTS_PER_SOL, Keypair } from "@solana/web3.js";
  import { promises as fs } from "fs";
  import * as path from "path";

  // create a new connection to Solana's devnet cluster
const connection = new Connection(clusterApiUrl("devnet"));
const umi = createUmi(connection);


// load keypair from local file system
// assumes that the keypair is already generated using `solana-keygen new`
const secretKey = process.env.SECRET_KEY || "[167,155,162,56,71,255,79,223,18,77,215,192,2,197,59,86,82,117,199,112,239,241,226,136,87,91,59,167,51,220,80,168,162,176,3,226,250,35,207,63,63,172,0,54,246,133,99,78,127,183,18,61,27,167,137,52,130,118,208,193,103,227,232,30]";
if (!secretKey) {
  throw new Error("SECRET_KEY is not defined in the environment variables.");
}

const user = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(secretKey)));

await airdropIfRequired(
  connection,
  user.publicKey,
  1 * LAMPORTS_PER_SOL,
  0.1 * LAMPORTS_PER_SOL,
);

console.log("Loaded user:", user.publicKey.toBase58());

const umiKeypair = umi.eddsa.createKeypairFromSecretKey(user.secretKey);

// assigns a signer to our umi instance, and loads the MPL metadata program and Irys uploader plugins.
umi
  .use(keypairIdentity(umiKeypair))
  .use(mplTokenMetadata())
  .use(irysUploader());

  // generate mint keypair
const collectionMint = generateSigner(umi);

const uri = `{product_type="phone"}`; // replace with your actual URI

// create and mint NFT
await createNft(umi, {
  mint: collectionMint,
  name: "anagh phone company",
  uri,
  updateAuthority: umi.identity.publicKey,
  sellerFeeBasisPoints: percentAmount(0),
  isCollection: true,
}).sendAndConfirm(umi, { send: { commitment: "finalized" } });

let explorerLink = getExplorerLink(
  "address",
  collectionMint.publicKey,
  "devnet",
);
console.log(`Collection NFT:  ${explorerLink}`);
console.log(`Collection NFT address is:`, collectionMint.publicKey);
console.log("✅ Finished successfully!");


QRCode.toDataURL(explorerLink, { width: 300, margin: 1 })
    .then(qrCode => {
        const qrCodePath = path.join(__dirname, "collection_qr_code.png");
        return fs.writeFile(qrCodePath, qrCode.replace(/^data:image\/png;base64,/, ""), "base64");
    })
    .then(url => {
        console.log(url)
    })
    .catch(err => {
        console.error(err)
    })