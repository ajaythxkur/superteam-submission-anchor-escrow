import { ActionGetResponse, ActionPostRequest, ActionPostResponse, ACTIONS_CORS_HEADERS } from "@solana/actions"
import { clusterApiUrl, Connection, PublicKey, Transaction } from "@solana/web3.js";
export async function GET(request: Request){
    const response: ActionGetResponse = {
        icon: "https://pbs.twimg.com/profile_images/1472933274209107976/6u-LQfjG_400x400.jpg",
        description: "This is anchor escrow blink",
        title: "Do Blink!",
        label: "Click Me!",
        // error: {
        //     message: "This blink is not implemented yet"
        // }
    }
    return Response.json(response, { headers: ACTIONS_CORS_HEADERS })
}

export async function POST(request: Request){
    const postRequest: ActionPostRequest = await request.json();
    const userPubkey = postRequest.account;

  
    const connection = new Connection(clusterApiUrl("devnet"));
    const tx = new Transaction();
    tx.feePayer = new PublicKey(userPubkey);
    tx.recentBlockhash = (await connection.getLatestBlockhash({ commitment: "finalized" })).blockhash
    const serialTx = tx.serialize({ requireAllSignatures: true, verifySignatures: false }).toString("base64");
    const response: ActionPostResponse = {
        transaction: serialTx,
        message: "hello "+userPubkey
    }
    return Response.json(response, { headers: ACTIONS_CORS_HEADERS })
}

export async function OPTIONS(request: Request){
    return Response.json(null, { headers: ACTIONS_CORS_HEADERS });
}