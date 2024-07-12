"use client"

import { confirmTxn, getProgram } from "@/utils/program";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import { randomBytes } from "crypto";
import { BN, web3 } from "@coral-xyz/anchor";
import { ASSOCIATED_TOKEN_PROGRAM_ID, createAssociatedTokenAccountIdempotentInstruction, getAssociatedTokenAddressSync, getMint, TOKEN_2022_PROGRAM_ID, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import toast from "react-hot-toast";
import { devnetMints } from "@/utils/constant";

interface AppContextType {
    onMake: (a: string, b: string, aAmount: number, bAmount: number) => Promise<void>,
    onTake: (escrowString: string) => Promise<void>,
    onRefund: (escrowString: string) => Promise<void>,
    escrows: any[],
    myEscrows: any[],
    getEscrowOffers: () => Promise<void>
}
const AppContext = createContext<AppContextType | undefined>(undefined);
const balanceLimitCheck = async(connection: web3.Connection, ata: web3.PublicKey, minBalance: number) => {
    try{
        const balance = await connection.getTokenAccountBalance(ata);
        if(Number(balance.value.amount) < minBalance){
            throw new Error("Not enough balance")
        }
        return false
    }catch(err){
        return true
    }
}
export const AppProvider = ({ children }: { children: React.ReactNode }) => {

    const { connection } = useConnection();
    const wallet = useAnchorWallet();
    const tokenProgram = TOKEN_PROGRAM_ID; // TOKEN_2022_PROGRAM_ID if token created with this program
    const associatedTokenProgram = ASSOCIATED_TOKEN_PROGRAM_ID;
    const [escrows, setEscrows] = useState<any[]>([]);
    const [myEscrows, setMyEscrows] = useState<any[]>([]);

    const program = useMemo(() => {
        if (connection && wallet) {
            return getProgram(connection, wallet);
        }
    }, [connection, wallet]);

    const make = async (a: string, b: string, aAmount: number, bAmount: number) => {
        if (!connection || !wallet?.publicKey || !program) return;
        const aPubKey = new web3.PublicKey(a);
        const bPubKey = new web3.PublicKey(b);
        const seed = new BN(randomBytes(8));

        let aMint = await getMint(connection, aPubKey);
        let bMint = await getMint(connection, bPubKey);

        const deposit = new BN(aAmount * Math.pow(10, aMint.decimals));
        const receive = new BN(bAmount * Math.pow(10, bMint.decimals));
        
        const makerAtaA = getAssociatedTokenAddressSync(aMint.address, wallet.publicKey, false, tokenProgram);
        const isBalLess = await balanceLimitCheck(connection, makerAtaA, Number(deposit));
        if(isBalLess){
            throw new Error("Not enough balance.")
        }
        const makerAtaB = getAssociatedTokenAddressSync(bMint.address, wallet.publicKey, false, tokenProgram);

        const makerAtaBAccountInfo = await connection.getAccountInfo(makerAtaB);

        const preInstructions = [];
        if (!makerAtaBAccountInfo) {
            preInstructions.push(
                createAssociatedTokenAccountIdempotentInstruction(
                    wallet.publicKey,
                    makerAtaB,
                    wallet.publicKey,
                    bMint.address,
                    tokenProgram
                )
            );
        }

        const [escrow, _escrowBump] = web3.PublicKey.findProgramAddressSync(
            [Buffer.from("escrow"), wallet.publicKey.toBuffer(), seed.toArrayLike(Buffer, "le", 8)],
            program.programId
        );

        const vault = getAssociatedTokenAddressSync(aMint.address, escrow, true, tokenProgram);

        const accounts = {
            maker: wallet.publicKey,
            mintA: aMint.address,
            mintB: bMint.address,
            escrow,
            makerAtaA,
            makerAtaB,
            vault,
            tokenProgram,
            associatedTokenProgram,
            systemProgram: web3.SystemProgram.programId
        };

        try {
            const signature = await program.methods
                .make(seed, deposit, receive)
                .accounts(accounts)
                .preInstructions(preInstructions)
                .rpc();

            await confirmTxn(connection, signature);
            toast.success("Transaction confirmed successfully");
        } catch (err: any) {
            console.error(err);
            toast.error(err.message);
        }
    }

    const getEscrowOffers = useCallback(async () => {
        if (!program || !wallet || !connection) {
            return;
        }
        try {
            const escrowAccounts = await program.account.escrow.all();
            const readableAccounts = await Promise.all(escrowAccounts.map(async(escrow)=>{
                const xMintInfo = devnetMints.find(token => token.mint === escrow.account.mintA.toBase58());
                const yMintInfo = devnetMints.find(token => token.mint === escrow.account.mintB.toBase58());
                const vault = getAssociatedTokenAddressSync(escrow.account.mintA, escrow.publicKey, true, tokenProgram);
                const xAmount = (await connection.getTokenAccountBalance(vault)).value.uiAmount;
                const yMint = await getMint(connection, escrow.account.mintB);

                return {
                    xSymbol: xMintInfo?.symbol ?? "",
                    ySymbol: yMintInfo?.symbol ?? "",
                    xAmount,
                    yAmount: Number(escrow.account.receive) / Math.pow(10, yMint.decimals),
                    escrow: escrow.publicKey.toBase58(),
                    maker: escrow.account.maker.toBase58()
                }
            }))
            const myEscrows = [];
            const otherEscrows = [];
            for(const escrow of readableAccounts){
                if(escrow.maker === wallet.publicKey.toBase58()){
                    myEscrows.push(escrow);
                }else{
                    otherEscrows.push(escrow);
                }
            }
            setMyEscrows(myEscrows);
            setEscrows(otherEscrows);
        } catch (err) {
            console.error(err)
        }
    }, [program, wallet, connection, tokenProgram])
    useEffect(() => {
        getEscrowOffers()
    }, [getEscrowOffers])

    const take = async (escrowString: string) => {
        if (!program || !wallet || !connection) return;
        try {
            const escrow = new web3.PublicKey(escrowString);
            const escrowAccount = await program.account.escrow.fetch(escrow);
            if(escrowAccount.maker.toBase58() === wallet.publicKey.toBase58()){
                return; // In case if
            }
            const takerAtaA = await getAssociatedTokenAddressSync(escrowAccount.mintA, wallet.publicKey, false, tokenProgram);
            const takerAtaB = await getAssociatedTokenAddressSync(escrowAccount.mintB, wallet.publicKey, false, tokenProgram);
            const takerAccountInfo = await connection.getAccountInfo(takerAtaA);
            const preInstructions = [];

            if (!takerAccountInfo) {
                preInstructions.push(
                    createAssociatedTokenAccountIdempotentInstruction(
                        wallet.publicKey,
                        takerAtaA,
                        wallet.publicKey,
                        escrowAccount.mintA,
                        tokenProgram
                    )
                )
            }
            const makerAtaB = await getAssociatedTokenAddressSync(escrowAccount.mintB, escrowAccount.maker, false, tokenProgram);

            const makerAccountInfo = await connection.getAccountInfo(makerAtaB);
            if (!makerAccountInfo) {
                preInstructions.push(
                    createAssociatedTokenAccountIdempotentInstruction(
                        wallet.publicKey,
                        makerAtaB,
                        escrowAccount.maker,
                        escrowAccount.mintB,
                        tokenProgram
                    )
                )
            };

            const vault = getAssociatedTokenAddressSync(escrowAccount.mintA, escrow, true, tokenProgram);
            const accounts = {
                taker: wallet.publicKey,
                maker: escrowAccount.maker,
                mintA: escrowAccount.mintA,
                mintB: escrowAccount.mintB,
                takerAtaA,
                takerAtaB,
                makerAtaB,
                escrow,
                vault,
                associatedTokenProgram,
                tokenProgram,
                systemProgram: web3.SystemProgram.programId
            }

            const signature = await program.methods
                .take()
                .accounts(accounts)
                .preInstructions(preInstructions)
                .rpc();
            await confirmTxn(connection, signature);
            toast.success("Offer accepted successfully")
        } catch (err: any) {
            toast.error(err.message)
        }
    }

    const refund = async (escrowString: string) => {
        if (!program || !connection || !wallet) return;
        try {
            const escrow = new web3.PublicKey(escrowString);
            const escrowAccount = await program.account.escrow.fetch(escrow);
            if(escrowAccount.maker.toBase58() !== wallet.publicKey.toBase58()){
                return; // In case if
            }
            const makerAtaA = getAssociatedTokenAddressSync(escrowAccount.mintA, wallet.publicKey, false, tokenProgram);
            const accountInfo = await connection.getAccountInfo(makerAtaA);
            const preInstructions = [];
            if(!accountInfo){
                preInstructions.push(
                    createAssociatedTokenAccountIdempotentInstruction(
                        wallet.publicKey,
                        makerAtaA,
                        wallet.publicKey,
                        escrowAccount.mintA,
                        tokenProgram
                    )
                )
            }
            const vault = getAssociatedTokenAddressSync(escrowAccount.mintA, escrow, true, tokenProgram)
            const accounts = {
                maker: wallet.publicKey,
                mintA: escrowAccount.mintA,
                makerAtaA,
                escrow,
                vault,
                associatedTokenProgram,
                tokenProgram,
                systemProgram: web3.SystemProgram.programId
            }
            const signature = await program.methods
                .refund()
                .accounts(accounts)
                .preInstructions(preInstructions)
                .rpc();
            await confirmTxn(connection, signature);
            toast.success("Refund taken successfully")
        } catch (err: any) {
            console.error(err)
            toast.error(err.message)
        }
    }

    return (
        <AppContext.Provider value={{
            onMake: make,
            onTake: take,
            onRefund: refund,
            escrows,
            myEscrows,
            getEscrowOffers
        }}>
            {children}
        </AppContext.Provider>
    )

}

export const useEscrow = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error("useEscrow must be used within a AppProvider");
    }
    return context;
};
