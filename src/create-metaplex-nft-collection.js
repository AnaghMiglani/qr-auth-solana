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
import path, { dirname } from "path";
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
} from "@metaplex-foundation/umi";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { irysUploader } from "@metaplex-foundation/umi-uploader-irys";
import { airdropIfRequired, getExplorerLink } from "@solana-developers/helpers";
import {
  clusterApiUrl,
  Connection,
  LAMPORTS_PER_SOL,
  Keypair,
} from "@solana/web3.js";
import { promises as fs } from "fs";
// Fix for __dirname in ES modules
var __filename = fileURLToPath(import.meta.url);
var __dirname = dirname(__filename);
export function createCollection(product_type) {
  return __awaiter(this, void 0, void 0, function () {
    var connection,
      umi,
      secretKey,
      user,
      umiKeypair,
      collectionMint,
      uri,
      explorerLink,
      qrCodePath,
      qrCode,
      error_1;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          _a.trys.push([0, 5, , 6]);
          connection = new Connection(clusterApiUrl("devnet"));
          umi = createUmi(connection);
          secretKey = process.env.SECRET_KEY;
          if (!secretKey) {
            throw new Error(
              "SECRET_KEY is not defined in the environment variables."
            );
          }
          user = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(secretKey)));
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
          _a.sent();
          console.log("Loaded user:", user.publicKey.toBase58());
          umiKeypair = umi.eddsa.createKeypairFromSecretKey(user.secretKey);
          // Assign a signer to our umi instance and load the MPL metadata program and Irys uploader plugins
          umi
            .use(keypairIdentity(umiKeypair))
            .use(mplTokenMetadata())
            .use(irysUploader());
          collectionMint = generateSigner(umi);
          uri = "{product_type=".concat(product_type, "}");
          // Create and mint NFT
          return [
            4 /*yield*/,
            createNft(umi, {
              mint: collectionMint,
              name: product_type,
              uri: uri,
              updateAuthority: umi.identity.publicKey,
              sellerFeeBasisPoints: percentAmount(0),
              isCollection: true,
            }).sendAndConfirm(umi, { send: { commitment: "finalized" } }),
          ];
        case 2:
          // Create and mint NFT
          _a.sent();
          explorerLink = getExplorerLink(
            "address",
            collectionMint.publicKey,
            "devnet"
          );
          console.log("Collection NFT:  ".concat(explorerLink));
          console.log("Collection NFT address is:", collectionMint.publicKey);
          console.log("✅ Finished successfully!");
          qrCodePath = path.join(__dirname, "collection_qr_code.png");
          return [
            4 /*yield*/,
            QRCode.toDataURL(explorerLink, { width: 300, margin: 1 }),
          ];
        case 3:
          qrCode = _a.sent();
          return [
            4 /*yield*/,
            fs.writeFile(
              qrCodePath,
              qrCode.replace(/^data:image\/png;base64,/, ""),
              "base64"
            ),
          ];
        case 4:
          _a.sent();
          console.log("QR Code saved at:", qrCodePath);
          return [3 /*break*/, 6];
        case 5:
          error_1 = _a.sent();
          console.error("Error creating collection:", error_1);
          throw error_1;
        case 6:
          return [2 /*return*/];
      }
    });
  });
}
