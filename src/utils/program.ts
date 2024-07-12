import { AnchorProvider, Program, Wallet, web3, Idl, setProvider } from "@coral-xyz/anchor";
import { AnchorWallet } from "@solana/wallet-adapter-react";
import IDL from "./idl.json";
import { AnchorEscrow } from "./anchor_escrow";

export const getProgram = (connection: web3.Connection, wallet: AnchorWallet | Wallet ) => {
    const provider = new AnchorProvider(connection, wallet, {
        commitment: "confirmed"
    });
    setProvider(provider);
    const escrowProgram: any = new Program(IDL as Idl);
    return escrowProgram as Program<AnchorEscrow>;
}
export const confirmTxn = async (connection: web3.Connection, signature: string): Promise<string> => {
    const block = await connection.getLatestBlockhash();
    await connection.confirmTransaction({
        signature,
        ...block,
    });
    return signature;
};