# NaviGuard: Trustless Maritime Escrow
Overview
NaviGuard is a decentralized insurance and escrow protocol designed for the maritime industry. It leverages the Polkadot Hub to provide high-performance risk assessment and instant liquidity for vessel-related transactions.

# Tech Stack
Smart Contracts: Solidity (EVM) for the frontend logic + Rust (PVM) for high-performance risk calculation.

Compiler: resolc (Solidity to PVM compiler).

Chain: Polkadot Asset Hub (Westend Testnet).

Interoperability: XCM for People Chain identity verification.

Frontend: React + Scaffold-DOT + viem.

# Key Features
Dual-VM Architecture: Uses the EVM layer for user-facing escrow logic while offloading heavy maritime risk scoring to PolkaVM (PVM) for near-native execution speed.

Native Asset Escrow: Supports native USDT and DOT on Asset Hub without wrapping, reducing counterparty risk.

Identity-Verified Claims: Claims are only processed if the vessel owner has a "Verified Mariner" status on the People Chain.

