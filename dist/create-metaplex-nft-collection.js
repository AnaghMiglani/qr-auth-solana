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
import path, { dirname } from "path";
import "dotenv/config";
import QRCode from "qrcode";
import { createNft, mplTokenMetadata, } from "@metaplex-foundation/mpl-token-metadata";
import { generateSigner, keypairIdentity, percentAmount, } from "@metaplex-foundation/umi";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { irysUploader } from "@metaplex-foundation/umi-uploader-irys";
import { airdropIfRequired, getExplorerLink } from "@solana-developers/helpers";
import { clusterApiUrl, Connection, LAMPORTS_PER_SOL, Keypair, } from "@solana/web3.js";
import { promises as fs } from "fs";
// Fix for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
export function createCollection(product_type) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Create a new connection to Solana's devnet cluster
            const connection = new Connection(clusterApiUrl("devnet"));
            const umi = createUmi(connection);
            // Load keypair from local file system
            const secretKey = process.env.SECRET_KEY;
            if (!secretKey) {
                throw new Error("SECRET_KEY is not defined in the environment variables.");
            }
            const user = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(secretKey)));
            yield airdropIfRequired(connection, user.publicKey, 1 * LAMPORTS_PER_SOL, 0.1 * LAMPORTS_PER_SOL);
            console.log("Loaded user:", user.publicKey.toBase58());
            const umiKeypair = umi.eddsa.createKeypairFromSecretKey(user.secretKey);
            // Assign a signer to our umi instance and load the MPL metadata program and Irys uploader plugins
            umi
                .use(keypairIdentity(umiKeypair))
                .use(mplTokenMetadata())
                .use(irysUploader());
            // Generate mint keypair
            const collectionMint = generateSigner(umi);
            const uri = `{product_type=${product_type}}`; // Replace with your actual URI
            // Create and mint NFT
            yield createNft(umi, {
                mint: collectionMint,
                name: product_type,
                uri,
                updateAuthority: umi.identity.publicKey,
                sellerFeeBasisPoints: percentAmount(0),
                isCollection: true,
            }).sendAndConfirm(umi, { send: { commitment: "finalized" } });
            const explorerLink = getExplorerLink("address", collectionMint.publicKey, "devnet");
            console.log(`Collection NFT:  ${explorerLink}`);
            console.log(`Collection NFT address is:`, collectionMint.publicKey);
            console.log("✅ Finished successfully!");
            // Generate QR Code
            const qrCodePath = path.join(__dirname, "collection_qr_code.png");
            const qrCode = yield QRCode.toDataURL(explorerLink, {
                width: 300,
                margin: 1,
            });
            yield fs.writeFile(qrCodePath, qrCode.replace(/^data:image\/png;base64,/, ""), "base64");
            console.log("QR Code saved at:", qrCodePath);
            return explorerLink;
        }
        catch (error) {
            console.error("Error creating collection:", error);
            throw error;
        }
    });
}
