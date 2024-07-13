"use client";

import { useEscrow } from "@/context/AppProvider";
import { shortenAddress } from "@/utils/shortenAddress";
import React, { useState } from "react";
import { NoDataFound } from "../NoDataFound";
import { Loading } from "../Loading";

export function Take() {
    const { escrows, onTake, getEscrowOffers, loading } = useEscrow()
    const [transactionInProgress, setTransactionInProgress] = useState(false)
    if(loading) return <Loading />;
    if (escrows.length === 0) return <NoDataFound />;
    const handleTake = async (escrow: string) => {
        try {
            setTransactionInProgress(true)
            await onTake(escrow)
            await getEscrowOffers()
        } catch (err) {
            console.error(err)
        } finally {
            setTransactionInProgress(false)
        }
    }
    return (
        <div className="container-fluid p-3">
            <h5 className="mb-4 text-cyan"><u>Take offers</u></h5>
            <div className="row mb-2 d-none d-sm-flex">
                <div className="col-3 text-cyan">User</div>
                <div className="col-3 text-cyan">Deposit Of</div>
                <div className="col-3 text-cyan">For</div>
                <div className="col-3 text-cyan">Action</div>
            </div>
            {
                escrows.map((info, index) => (
                    <React.Fragment key={index}>
                        <hr />
                        <div className="row mb-3 rounded rounded-sm-0 bg-dark-gray p-2 align-items-center">
                            <div className="col-sm-3 mb-2 mb-sm-0">
                                {shortenAddress(info.maker)}
                            </div>
                            <div className="col-sm-3 mb-2 mb-sm-0">
                                {info.xAmount} {info.xSymbol}
                            </div>
                            <div className="col-sm-3 mb-2 mb-sm-0">
                                {info.yAmount} {info.ySymbol}
                            </div>
                            <div className="col-sm-3 mb-2 mb-sm-0">
                                {
                                    transactionInProgress
                                        ?
                                        <button className="btn" disabled>Accept</button>
                                        :
                                        <button className="btn" onClick={() => handleTake(info.escrow)}>Accept</button>
                                }
                            </div>
                        </div>
                    </React.Fragment>
                ))
            }
        </div>
    )
}