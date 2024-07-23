## Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Functions](#functions)
  - [make](#make)
  - [refund](#refund)
  - [take](#take)
- [Customization](#customization)
- [Links](#links)

## Introduction

This is a [Anchor Escrow 2024](https://github.com/deanmlittle/anchor-escrow-2024) project frontend implementation.

## Features

- Secure escrow transactions
- Refund functionality for unresolved transactions
- Easy fund release upon fulfillment of conditions

## Installation

To install and set up the project, follow these steps:

1. Clone the repository:
    ```sh
    git clone https://github.com/ajaythxkur/talent-escrow.git
    ```

2. Navigate to the project directory:
    ```sh
    cd talent-escrow
    ```

3. Install the dependencies:
    ```sh
    npm install
    ```

## Usage

Run the project on development server:

```sh
npm run dev
```

## Functions

### `make`

The `make` function creates a new escrow account. It locks the deposit token and stores the information about the receiving amount and mint.

### `refund`

The `refund` function allows user to close the escrow account. It gives back the locked tokens and closes the escrow account

### `take`

The take function allows the recipient to claim the funds from the escrow account once the specified conditions are met.

## Customization

You can update the token mints in /src/utils/constant.ts.

You can update the network in /src/context/AppWalletProvider.tsx. & /src/app/api/action/route.ts (Solana Blinks)

## Links

[Youtube](https://www.youtube.com/watch?v=LQdiFE5jM_g)
