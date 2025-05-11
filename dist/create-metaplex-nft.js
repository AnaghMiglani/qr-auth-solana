var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { fileURLToPath } from "url";
import { dirname, join as pathJoin } from "path";
import "dotenv/config";
import QRCode from "qrcode";
import { createNft, mplTokenMetadata, } from "@metaplex-foundation/mpl-token-metadata";
import { generateSigner, keypairIdentity, percentAmount, publicKey as UMIPublicKey, } from "@metaplex-foundation/umi";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { irysUploader } from "@metaplex-foundation/umi-uploader-irys";
import { airdropIfRequired, getExplorerLink } from "@solana-developers/helpers";
import { clusterApiUrl, Connection, Keypair, LAMPORTS_PER_SOL, } from "@solana/web3.js";
import { promises as fs } from "fs";
// Fix for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
export function createMetaplexNft(serialNumber_1, productName_1, collectionAddress_1) {
    return __awaiter(this, arguments, void 0, function* (serialNumber, productName, collectionAddress, imgurLink = "https://i.imgur.com/GB3znw2.png") {
        try {
            // Create a new connection to Solana's devnet cluster
            const connection = new Connection(clusterApiUrl("devnet"));
            // Load keypair from local file system or environment variable
            const secretKey = process.env.SECRET_KEY;
            if (!secretKey) {
                throw new Error("SECRET_KEY is not defined in the environment variables.");
            }
            const user = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(secretKey)));
            console.log("Loaded user:", user.publicKey.toBase58());
            // Airdrop SOL if required
            yield airdropIfRequired(connection, user.publicKey, 1 * LAMPORTS_PER_SOL, 0.1 * LAMPORTS_PER_SOL);
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
            const uri = yield umi.uploader.uploadJson({
                name: serialNumber,
                symbol: productName,
                image: imgurLink,
                description: "My NFT Description",
            });
            console.log("NFT offchain metadata URI:", uri);
            const mint = generateSigner(umi);
            // Create and mint NFT
            yield createNft(umi, {
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
            const qrCode = yield QRCode.toDataURL(explorerLink, {
                width: 300,
                margin: 1,
            });
            yield fs.writeFile(qrCodePath, qrCode.replace(/^data:image\/png;base64,/, ""), "base64");
            console.log("QR Code saved at:", qrCodePath);
            return explorerLink;
        }
        catch (error) {
            console.error("Error creating NFT:", error);
            throw error;
        }
    });
}
