"use client";

import { useEscrow } from "@/context/AppProvider";
import { useState } from "react";
import { NoDataFound } from "../NoDataFound";
import { Loading } from "../Loading";

export function Refund() {
    const { myEscrows: escrows, onRefund, getEscrowOffers, loading } = useEscrow()
    const [transactionInProgress, setTransactionInProgress] = useState(false)
    if (loading) return <Loading />
    if (escrows.length === 0) return <NoDataFound />;
    const handleRefund = async (escrow: string) => {
        try {
            setTransactionInProgress(true)
            await onRefund(escrow)
            await getEscrowOffers()
        } catch (err) {
            console.error(err)
        } finally {
            setTransactionInProgress(false)
        }
    }
    return (
        <div className="container-fluid">
            <h5 className="mb-4 text-cyan"><u>My offers</u></h5>

            <div className="row">
                {
                    escrows.map((info, index) => (
                        <div className="col-lg-6" key={index}>
                            <div className="rounded p-2 refund-info-box mb-3">
                                <p>Trading: {info.xAmount} {info.xSymbol}</p>
                                <p>For: {info.yAmount} {info.ySymbol}</p>
                                {
                                    transactionInProgress
                                        ?
                                        <button className="btn" disabled>Cancel Offer</button>
                                        :
                                        <button className="btn" onClick={() => handleRefund(info.escrow)}>Cancel Offer</button>
                                }
                            </div>
                        </div>
                    ))
                }
            </div>

        </div>
    )
}