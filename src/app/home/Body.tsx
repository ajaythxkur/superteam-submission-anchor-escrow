"use client"
import { useWallet } from "@solana/wallet-adapter-react"
import { Connected } from "./Connected";
import { NotConnected } from "./NotConnected";
export function Body(){
    const { connected } = useWallet();
    return(
        connected ? <Connected /> : <NotConnected />
    )
}