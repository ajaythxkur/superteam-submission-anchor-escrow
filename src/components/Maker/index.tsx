"use client"
import React, { useState } from "react";
import { useEscrow } from "@/context/AppProvider";
import { devnetMints } from "@/utils/constant";
export function Maker() {
    const { onMake, getEscrowOffers } = useEscrow()
    const [xMint, setXMint] = useState<string>(devnetMints[0].mint);
    const [yMint, setYMint] = useState<string>(devnetMints[1].mint);
    const [xAmount, setXAmount] = useState<number>();
    const [yAmount, setYAmount] = useState<number>();
    const [transactionInProgress, setTransactionInProgress] = useState(false)
    const handleMake = async () => {
        if (!xMint || !yMint || !xAmount || !yAmount) return;
        try {
            setTransactionInProgress(true)
            await onMake(xMint, yMint, xAmount, yAmount);
            await getEscrowOffers()
        } catch (err) {
            console.error(err)
        } finally {
            setTransactionInProgress(false)
        }
    }
    return (
        <div>
            <h5 className="mb-4 text-cyan"><u>Make An Offer</u></h5>
            <form className="bg-dark-gray p-3 rounded">
                <div className="mb-3">
                    <label>Deposit</label>
                    <div className="input-group">
                        <input type="text" name="deposit" className="form-control" placeholder="Enter deposit amount" value={xAmount} onChange={(e) => setXAmount(Number(e.target.value))} />
                        <select name="xMint" className="input-group-text border-none" value={xMint} onChange={(e) => setXMint(e.target.value)}>
                            {
                                devnetMints.map((mint, index) => (
                                    <option value={mint.mint} key={index}>{mint.symbol}</option>
                                ))
                            }
                        </select>
                    </div>
                </div>
                <div className="mb-3">
                    <label>Receive</label>
                    <div className="input-group">
                        <input type="text" name="receive" id="receive" className="form-control" placeholder="Enter receive amount" value={yAmount} onChange={(e) => setYAmount(Number(e.target.value))} />
                        <select id="yMint" name="yMint" className="input-group-text" value={yMint} onChange={(e) => setYMint(e.target.value)}>
                            {
                                devnetMints.map((mint, index) => (
                                    <option value={mint.mint} key={index}>{mint.symbol}</option>
                                ))
                            }
                        </select>
                    </div>
                </div>
                {
                    transactionInProgress ? <button className="btn" type="button" disabled>Processing...</button> : <button className="btn" type="button" onClick={handleMake}>Make Offer</button>
                }
            </form>
        </div>

    )
}