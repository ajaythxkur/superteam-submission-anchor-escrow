"use client";

import { Maker } from "@/components/Maker";
import { Refund } from "@/components/Refund";
import { Take } from "@/components/Take";
export function Connected() {
    return (
        <div className="container-fluid">
            <div className="row">
                <div className="col-md-5 col-xl-4 border p-3">
                    <Maker />
                    <hr />
                    <Refund />
                </div>
                <div className="col-md-7 col-xl-8 border">
                    <Take />
                </div>
            </div>
        </div>
    )
}