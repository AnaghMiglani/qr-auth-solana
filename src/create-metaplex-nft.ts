import { fileURLToPath } from "url";
import { dirname, join as pathJoin } from "path";
import "dotenv/config";
import QRCode from "qrcode";
import {
  collect,
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
import { airdropIfRequired, getExplorerLink } from "@solana-developers/helpers";
import {
  clusterApiUrl,
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import { promises as fs } from "fs";

// Fix for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function createMetaplexNft(
  serialNumber: string,
  productName: string,
  collectionAddress: string,
  imgurLink: string = "https://i.imgur.com/GB3znw2.png"
): Promise<string> {
  try {
    // Create a new connection to Solana's devnet cluster
    const connection = new Connection(clusterApiUrl("devnet"));

    // Load keypair from local file system or environment variable
    const secretKey = process.env.SECRET_KEY;
    if (!secretKey) {
      throw new Error(
        "SECRET_KEY is not defined in the environment variables."
      );
    }

    const user = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(secretKey)));
    console.log("Loaded user:", user.publicKey.toBase58());

    // Airdrop SOL if required
    await airdropIfRequired(
      connection,
      user.publicKey,
      1 * LAMPORTS_PER_SOL,
      0.1 * LAMPORTS_PER_SOL
    );

    const umi = createUmi(connection);

    // Convert to UMI-compatible keypair
    const umiKeypair = umi.eddsa.createKeypairFromSecretKey(user.secretKey);

    // Load plugins and signer
    umi
      .use(keypairIdentity(umiKeypair))
      .use(mplTokenMetadata())
      .use(irysUploader());

    // Substitute in your collection NFT address
    const collectionNftAddress = UMIPublicKey(collectionAddress);

    // Upload metadata to off-chain storage
    const uri = await umi.uploader.uploadJson({
      name: serialNumber,
      symbol: productName,
      image: imgurLink,
      description: "My NFT Description",
    });
    console.log("NFT offchain metadata URI:", uri);

    const mint = generateSigner(umi);

    // Create and mint NFT
    await createNft(umi, {
      mint,
      name: serialNumber,
      symbol: productName,
      uri,
      updateAuthority: umi.identity.publicKey,
      sellerFeeBasisPoints: percentAmount(0),
      collection: {
        key: collectionNftAddress,
        verified: false,
      },
    }).sendAndConfirm(umi, { send: { commitment: "finalized" } });

    const explorerLink = getExplorerLink("address", mint.publicKey, "devnet");
    console.log(`Token Mint:  ${explorerLink}`);

    // Generate QR Code
    const qrCodePath = pathJoin(__dirname, "nft_qr_code.png");
    const qrCode = await QRCode.toDataURL(explorerLink, {
      width: 300,
      margin: 1,
    });
    await fs.writeFile(
      qrCodePath,
      qrCode.replace(/^data:image\/png;base64,/, ""),
      "base64"
    );
    console.log("QR Code saved at:", qrCodePath);
    return explorerLink;
  } catch (error) {
    console.error("Error creating NFT:", error);
    throw error;
  }
}
