import { ActionGetResponse, ActionPostRequest, ActionPostResponse, ACTIONS_CORS_HEADERS } from "@solana/actions"
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { clusterApiUrl, Connection, PublicKey, Transaction, TransactionInstruction } from "@solana/web3.js";
import * as borsh from "@coral-xyz/borsh"
const connection = new Connection(clusterApiUrl(WalletAdapterNetwork.Devnet));

const borshAccountSchema = borsh.struct([
    borsh.u64('seed'),
    borsh.publicKey('maker'),
    borsh.publicKey('mint_a'),
    borsh.publicKey('mint_b'),
    borsh.u64('receive'),
    borsh.u8('bump'),
])

import IDL from "@/utils/idl.json"

export async function GET(request: Request, context: any){
    const pubkey = new PublicKey(context.params.pubkey);
    const progAcc = await connection.getProgramAccounts(new PublicKey(IDL.address));
    progAcc.map(({account})=>{
        console.log(borshAccountSchema.decode(account.data))
    })
    const accountInfo = await connection.getAccountInfo(pubkey);
    if(!accountInfo){
        throw new Error("Account data not found")
    }
    const deserializedData = borshAccountSchema.decode(accountInfo.data);
    
    const response: ActionGetResponse = {
        icon: "https://pbs.twimg.com/profile_images/1472933274209107976/6u-LQfjG_400x400.jpg",
        description: "This is anchor escrow blink",
        title: "Escrow Offer",
        label: "Take",
        // error: {
        //     message: "This blink is not implemented yet"
        // }
    }
    return Response.json(response, { headers: ACTIONS_CORS_HEADERS })
}

export async function POST(request: Request, context: any){
    const postRequest: ActionPostRequest = await request.json();
    const userPubkey = postRequest.account;
    const user = new PublicKey(userPubkey);
    const pubkey = new PublicKey(context.params.pubkey);
    const tx = new Transaction();
    tx.feePayer = new PublicKey(userPubkey);
    tx.recentBlockhash = (await connection.getLatestBlockhash({ commitment: "finalized" })).blockhash;
    const instruction = new TransactionInstruction({
        keys: [
            {
                pubkey: user,
                isSigner: true,
                isWritable: false
            },
        ],
        data: Buffer.alloc(0),
        programId: new PublicKey(IDL.address)
    });
    tx.add(instruction);
    const serialTx = tx.serialize({ requireAllSignatures: true, verifySignatures: false }).toString("base64");
    const response: ActionPostResponse = {
        transaction: serialTx,
        message: "Confirm Your Order"
    }
    return Response.json(response, { headers: ACTIONS_CORS_HEADERS })
}

export async function OPTIONS(request: Request){
    return Response.json(null, { headers: ACTIONS_CORS_HEADERS });
}