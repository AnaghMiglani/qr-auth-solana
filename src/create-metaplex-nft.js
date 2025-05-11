var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
var __generator =
  (this && this.__generator) ||
  function (thisArg, body) {
    var _ = {
        label: 0,
        sent: function () {
          if (t[0] & 1) throw t[1];
          return t[1];
        },
        trys: [],
        ops: [],
      },
      f,
      y,
      t,
      g = Object.create(
        (typeof Iterator === "function" ? Iterator : Object).prototype
      );
    return (
      (g.next = verb(0)),
      (g["throw"] = verb(1)),
      (g["return"] = verb(2)),
      typeof Symbol === "function" &&
        (g[Symbol.iterator] = function () {
          return this;
        }),
      g
    );
    function verb(n) {
      return function (v) {
        return step([n, v]);
      };
    }
    function step(op) {
      if (f) throw new TypeError("Generator is already executing.");
      while ((g && ((g = 0), op[0] && (_ = 0)), _))
        try {
          if (
            ((f = 1),
            y &&
              (t =
                op[0] & 2
                  ? y["return"]
                  : op[0]
                  ? y["throw"] || ((t = y["return"]) && t.call(y), 0)
                  : y.next) &&
              !(t = t.call(y, op[1])).done)
          )
            return t;
          if (((y = 0), t)) op = [op[0] & 2, t.value];
          switch (op[0]) {
            case 0:
            case 1:
              t = op;
              break;
            case 4:
              _.label++;
              return { value: op[1], done: false };
            case 5:
              _.label++;
              y = op[1];
              op = [0];
              continue;
            case 7:
              op = _.ops.pop();
              _.trys.pop();
              continue;
            default:
              if (
                !((t = _.trys), (t = t.length > 0 && t[t.length - 1])) &&
                (op[0] === 6 || op[0] === 2)
              ) {
                _ = 0;
                continue;
              }
              if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                _.label = op[1];
                break;
              }
              if (op[0] === 6 && _.label < t[1]) {
                _.label = t[1];
                t = op;
                break;
              }
              if (t && _.label < t[2]) {
                _.label = t[2];
                _.ops.push(op);
                break;
              }
              if (t[2]) _.ops.pop();
              _.trys.pop();
              continue;
          }
          op = body.call(thisArg, _);
        } catch (e) {
          op = [6, e];
          y = 0;
        } finally {
          f = t = 0;
        }
      if (op[0] & 5) throw op[1];
      return { value: op[0] ? op[1] : void 0, done: true };
    }
  };
import { fileURLToPath } from "url";
import { dirname, join as pathJoin } from "path";
import "dotenv/config";
import QRCode from "qrcode";
import {
  createNft,
  mplTokenMetadata,
} from "@metaplex-foundation/mpl-token-metadata";
import {
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
var __filename = fileURLToPath(import.meta.url);
var __dirname = dirname(__filename);
export function createMetaplexNft(serialNumber_1, productName_1) {
  return __awaiter(
    this,
    arguments,
    void 0,
    function (serialNumber, productName, imgurLink) {
      var connection,
        secretKey,
        user,
        umi,
        umiKeypair,
        collectionNftAddress,
        uri,
        mint,
        explorerLink,
        qrCodePath,
        qrCode,
        error_1;
      if (imgurLink === void 0) {
        imgurLink = "https://i.imgur.com/GB3znw2.png";
      }
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 6, , 7]);
            connection = new Connection(clusterApiUrl("devnet"));
            secretKey = process.env.SECRET_KEY;
            if (!secretKey) {
              throw new Error(
                "SECRET_KEY is not defined in the environment variables."
              );
            }
            user = Keypair.fromSecretKey(
              Uint8Array.from(JSON.parse(secretKey))
            );
            console.log("Loaded user:", user.publicKey.toBase58());
            // Airdrop SOL if required
            return [
              4 /*yield*/,
              airdropIfRequired(
                connection,
                user.publicKey,
                1 * LAMPORTS_PER_SOL,
                0.1 * LAMPORTS_PER_SOL
              ),
            ];
          case 1:
            // Airdrop SOL if required
            _a.sent();
            umi = createUmi(connection);
            umiKeypair = umi.eddsa.createKeypairFromSecretKey(user.secretKey);
            // Load plugins and signer
            umi
              .use(keypairIdentity(umiKeypair))
              .use(mplTokenMetadata())
              .use(irysUploader());
            collectionNftAddress = UMIPublicKey(
              "AuU7XLbwyoNsFMnAEfzbLtekL4GjFAydXxfsd5YTBrtC"
            );
            return [
              4 /*yield*/,
              umi.uploader.uploadJson({
                name: serialNumber,
                symbol: productName,
                image: imgurLink,
                description: "My NFT Description",
              }),
            ];
          case 2:
            uri = _a.sent();
            console.log("NFT offchain metadata URI:", uri);
            mint = generateSigner(umi);
            // Create and mint NFT
            return [
              4 /*yield*/,
              createNft(umi, {
                mint: mint,
                name: serialNumber,
                symbol: productName,
                uri: uri,
                updateAuthority: umi.identity.publicKey,
                sellerFeeBasisPoints: percentAmount(0),
                collection: {
                  key: collectionNftAddress,
                  verified: false,
                },
              }).sendAndConfirm(umi, { send: { commitment: "finalized" } }),
            ];
          case 3:
            // Create and mint NFT
            _a.sent();
            explorerLink = getExplorerLink("address", mint.publicKey, "devnet");
            console.log("Token Mint:  ".concat(explorerLink));
            qrCodePath = pathJoin(__dirname, "nft_qr_code.png");
            return [
              4 /*yield*/,
              QRCode.toDataURL(explorerLink, { width: 300, margin: 1 }),
            ];
          case 4:
            qrCode = _a.sent();
            return [
              4 /*yield*/,
              fs.writeFile(
                qrCodePath,
                qrCode.replace(/^data:image\/png;base64,/, ""),
                "base64"
              ),
            ];
          case 5:
            _a.sent();
            console.log("QR Code saved at:", qrCodePath);
            return [3 /*break*/, 7];
          case 6:
            error_1 = _a.sent();
            console.error("Error creating NFT:", error_1);
            throw error_1;
          case 7:
            return [2 /*return*/];
        }
      });
    }
  );
}
