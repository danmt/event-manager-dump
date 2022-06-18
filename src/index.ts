import { AnchorProvider, Program, Wallet } from "@project-serum/anchor";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { EventManager, IDL } from "./event_manager";
import * as fs from "fs/promises";
import * as path from "path";

const EVENT_MANAGER_PROGRAM_ID = new PublicKey(
  "915QrkcaL8SVxn3DPnsNXgexddZbiXUhKtJPksEgNjRF"
);

const wearableToString = () => {};

const main = async () => {
  const connection = new Connection("https://api.devnet.solana.com");
  const wallet = new Wallet(Keypair.generate());
  const provider = new AnchorProvider(
    connection,
    wallet,
    AnchorProvider.defaultOptions()
  );
  const program = new Program<EventManager>(
    IDL,
    EVENT_MANAGER_PROGRAM_ID,
    provider
  );

  await fs.rmdir(path.join(__dirname, "outDir"), { recursive: true });

  await fs.mkdir(path.join(__dirname, "outDir"));

  const wearables = (await program.account.wearable.all()).reduce(
    (output, wearable) =>
      `${output}\n${wearable.publicKey.toBase58()}, ${wearable.account.authority.toBase58()}, ${wearable.account.wearableId.toString()}, ${wearable.account.wearableVault.toBase58()}`,
    "publicKey, authority, wearableId, wearableVault"
  );

  await fs.writeFile(
    path.join(__dirname, "outDir", "wearables.txt"),
    wearables
  );

  /* 
  
  pub authority: Pubkey,                    // 32
  pub certifier: Pubkey,                    // 32
  pub name: String,                         // (40 + 4)
  pub accepted_mint: Pubkey,                // 32
  pub event_mint: Pubkey,                   // 32
  pub ticket_mint: Pubkey,                  // 32
  pub gain_vault: Pubkey,                   // 32
  pub temporal_vault: Pubkey,               // 32
  
  */

  const events = (await program.account.event.all()).reduce(
    (output, event) =>
      `${output}\n${event.publicKey.toBase58()}, ${event.account.authority.toBase58()}, ${event.account.certifier.toBase58()}, ${
        event.account.name
      }, ${event.account.acceptedMint.toBase58()}, ${event.account.eventMint.toBase58()}, ${event.account.ticketMint.toBase58()}, ${event.account.gainVault.toBase58()}, ${event.account.temporalVault.toBase58()}`,
    "publicKey, authority, certifier, name, acceptedMint, eventMint, ticketMint, gainVault, temporalVault"
  );

  await fs.writeFile(path.join(__dirname, "outDir", "events.txt"), events);
  console.log({ wearables, events });
};

main();
