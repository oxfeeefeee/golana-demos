import { ComputeBudgetProgram, Keypair, SystemProgram, Transaction, PublicKey, SYSVAR_RENT_PUBKEY } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, createMint, mintTo, getAccount, getOrCreateAssociatedTokenAccount, Account, ASSOCIATED_TOKEN_PROGRAM_ID } from "@solana/spl-token";
import BN from 'bn.js';
import {AnchorProvider,Program, initProvider} from 'golana';
import { IDL, Swap } from './swap_idl';

export class SwapProgram {
    private static infoAccountSpace = 512;

    private program: Program<Swap>;

    private infoAccount: Keypair;
    private mintAuthority: Keypair;
    private vaultA: Keypair;
    private vaultB: Keypair;

    private creator: PublicKey;
    private depositor: PublicKey;
    private trader: PublicKey;

    private depositorTokenAccountA: Account;
    private depositorTokenAccountB: Account;
    private depositorTokenAccountLP: Account;

    private traderTokenAccountA: Account;
    private traderTokenAccountB: Account;

    private mintA: PublicKey;
    private mintB: PublicKey;
    private mintLP: PublicKey;

    private vault_authority_pda: PublicKey;
    private vault_authority_bump: number;
    private lp_token_mint_auth_pda: PublicKey;
    private lp_token_mint_auth_bump: number;

    public static async create(provider: AnchorProvider, programAuth: PublicKey, creator: PublicKey, depositor: PublicKey, trader: PublicKey, mintA?:PublicKey, mintB?:PublicKey, mintLP?:PublicKey ): Promise<SwapProgram> {
        const swapProgram = new SwapProgram();

        swapProgram.program = await Program.create<Swap>(IDL, programAuth);
        [swapProgram.vault_authority_pda, swapProgram.vault_authority_bump] = await swapProgram.program.findAddr("vault-auth");
        [swapProgram.lp_token_mint_auth_pda, swapProgram.lp_token_mint_auth_bump] = await swapProgram.program.findAddr("mint-auth");
        
        swapProgram.infoAccount = new Keypair();
        swapProgram.mintAuthority = new Keypair();
        swapProgram.vaultA = new Keypair();
        swapProgram.vaultB = new Keypair();

        swapProgram.creator = creator;
        swapProgram.depositor = depositor;
        swapProgram.trader = trader;

        const payer = new Keypair();
        const needNewMintA: boolean = !mintA;
        const needNewMintB: boolean = !mintB;
        const needNewMintLP: boolean = !mintLP;
        if (needNewMintA || needNewMintB || needNewMintLP) {
            const latestBlockHash = await provider.connection.getLatestBlockhash();
            const airdrop = await provider.connection.requestAirdrop(payer.publicKey, 100000000);
            await provider.connection.confirmTransaction({
                blockhash: latestBlockHash.blockhash,
                lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
                signature: airdrop,
            });

            console.log("Airdrop to payer done: ", payer.publicKey.toBase58());
        }

        const infoAccountLamports = await provider.connection.getMinimumBalanceForRentExemption(this.infoAccountSpace);
        await provider.sendAndConfirm(
            (() => {
                const tx = new Transaction();
                tx.add(
                    SystemProgram.createAccount({
                        fromPubkey: payer.publicKey,
                        newAccountPubkey: swapProgram.infoAccount.publicKey,
                        lamports: infoAccountLamports,
                        space: this.infoAccountSpace,
                        programId: swapProgram.program.golanaLoader.programId,
                    })
                );
                return tx;
            })(),
            [payer, swapProgram.infoAccount],
            { commitment: 'confirmed' },
        );
        console.log("Create info account done");
        
        // Create mintA if not provided
        if (needNewMintA) {
            mintA = await createMint(
                provider.connection,
                payer,
                swapProgram.mintAuthority.publicKey,
                null,
                15
            );
        }
        swapProgram.mintA = mintA;
        // Create mintB if not provided
        if (needNewMintB) {
            mintB = await createMint(
                provider.connection,
                payer,
                swapProgram.mintAuthority.publicKey,
                null,
                15
            );
        }
        swapProgram.mintB = mintB;
        // Create Mint of LP token if not provided
        if (needNewMintLP) {
            mintLP = await createMint(
                provider.connection,
                payer,
                swapProgram.lp_token_mint_auth_pda,
                null,
                15
            );
        }
        swapProgram.mintLP = mintLP;
        console.log("Create mints done");
      
        swapProgram.depositorTokenAccountA = await getOrCreateAssociatedTokenAccount(
            provider.connection,
            payer,
            mintA,
            depositor,
        );
        swapProgram.depositorTokenAccountB = await getOrCreateAssociatedTokenAccount(
            provider.connection,
            payer,
            mintB,
            depositor,
        );
        swapProgram.depositorTokenAccountLP = await getOrCreateAssociatedTokenAccount(
            provider.connection,
            payer,
            swapProgram.mintLP,
            depositor,
        );

        swapProgram.traderTokenAccountA = await getOrCreateAssociatedTokenAccount(
            provider.connection,
            payer,
            mintA,
            trader,
        );
        swapProgram.traderTokenAccountB = await getOrCreateAssociatedTokenAccount(
            provider.connection,
            payer,
            mintB,
            trader,
        );

        if (needNewMintA){
            await mintTo(
                provider.connection,
                payer,
                swapProgram.mintA,
                swapProgram.depositorTokenAccountA.address,
                swapProgram.mintAuthority.publicKey,
                100000000,
                [swapProgram.mintAuthority],
            );
            await mintTo(
                provider.connection,
                payer,
                swapProgram.mintA,
                swapProgram.traderTokenAccountA.address,
                swapProgram.mintAuthority.publicKey,
                1000,
                [swapProgram.mintAuthority],
            );
            console.log("Minted test token A");
        }
        if (needNewMintB) {
            await mintTo(
                provider.connection,
                payer,
                swapProgram.mintB,
                swapProgram.depositorTokenAccountB.address,
                swapProgram.mintAuthority.publicKey,
                100000000,
                [swapProgram.mintAuthority],
            );
            await mintTo(
                provider.connection,
                payer,
                swapProgram.mintB,
                swapProgram.traderTokenAccountB.address,
                swapProgram.mintAuthority.publicKey,
                1000,
                [swapProgram.mintAuthority],
            );

            console.log("Minted test token B");
        }

        return swapProgram;
    }

    public async IxCreatePool(minLiqudity: BN = new BN(10000), fee: BN = new BN(100)): Promise<string> {
        return await this.program.methods
            .IxCreatePool(minLiqudity, fee)
            .accounts({
                creator: this.creator,
                mintA: this.mintA,
                mintB: this.mintB,
                tokenAVault: this.vaultA.publicKey,
                tokenBVault: this.vaultB.publicKey,
                poolInfo: this.infoAccount.publicKey,
                systemProgram: SystemProgram.programId,
                tokenProgram: TOKEN_PROGRAM_ID,
                rent: SYSVAR_RENT_PUBKEY,
            })
            .preInstructions([
                ComputeBudgetProgram.requestHeapFrame({ bytes: 256 * 1024 }),
                ComputeBudgetProgram.setComputeUnitLimit({ units: 1400000 }),
            ])
            .signers([this.vaultA, this.vaultB])
            .rpc();
    }

    public async IxDeposite(amountA: BN, amountB: BN): Promise<string> {
        return await this.program.methods
            .IxDeposit(amountA, amountB, this.lp_token_mint_auth_bump)
            .accounts({
                depositor: this.depositor,
                mintLiquidity:this. mintLP,
                mintLpAuth: this.lp_token_mint_auth_pda,
                tokenA: this.depositorTokenAccountA.address,
                tokenB: this.depositorTokenAccountB.address,
                tokenLiquidity: this.depositorTokenAccountLP.address,
                tokenAVault: this.vaultA.publicKey,
                tokenBVault: this.vaultB.publicKey,
                vaultAuthority: this.vault_authority_pda,
                poolInfo: this.infoAccount.publicKey,
                systemProgram: SystemProgram.programId,
                tokenProgram: TOKEN_PROGRAM_ID,
                associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
            })
            .preInstructions([
                ComputeBudgetProgram.requestHeapFrame({ bytes: 256 * 1024 }),
                ComputeBudgetProgram.setComputeUnitLimit({ units: 1400000 }),
            ])
            .signers([])
            .rpc();
    }

    public async IxTrade(amountA: BN, amountB: BN): Promise<string> {
        return await this.program.methods
            .IxTrade(amountA, amountB, this.vault_authority_bump)
            .accounts({
                trader: this.trader,
                tokenA: this.traderTokenAccountA.address,
                tokenB: this.traderTokenAccountB.address,
                tokenAVault: this.vaultA.publicKey,
                tokenBVault: this.vaultB.publicKey,
                vaultAuthority: this.vault_authority_pda,
                poolInfo: this.infoAccount.publicKey,
                tokenProgram: TOKEN_PROGRAM_ID,
            })
            .preInstructions([
                ComputeBudgetProgram.requestHeapFrame({ bytes: 256 * 1024 }),
                ComputeBudgetProgram.setComputeUnitLimit({ units: 1400000 }),
            ])
            .signers([])
            .rpc();
    }

    public async IxWithdraw(amount: BN): Promise<string> {
        return await this.program.methods
            .IxWithdraw(amount, this.vault_authority_bump)
            .accounts({
                depositor: this.depositor,
                mintLiquidity: this.mintLP,
                mintLpAuth: this.lp_token_mint_auth_pda,
                tokenA: this.depositorTokenAccountA.address,
                tokenB: this.depositorTokenAccountB.address,
                tokenLiquidity: this.depositorTokenAccountLP.address,
                tokenAVault: this.vaultA.publicKey,
                tokenBVault: this.vaultB.publicKey,
                vaultAuthority: this.vault_authority_pda,
                poolInfo: this.infoAccount.publicKey,
                tokenProgram: TOKEN_PROGRAM_ID,
            })
            .preInstructions([
                ComputeBudgetProgram.requestHeapFrame({ bytes: 256 * 1024 }),
                ComputeBudgetProgram.setComputeUnitLimit({ units: 1400000 }),
            ])
            .signers([])
            .rpc();
    }

    public async IxClosePool(): Promise<string> {
        return await this.program.methods
            .IxClosePool(this.vault_authority_bump)
            .accounts({
                creator: this.creator,
                tokenAVault: this.vaultA.publicKey,
                tokenBVault: this.vaultB.publicKey,
                vaultAuthority: this.vault_authority_pda,
                poolInfo: this.infoAccount.publicKey,
                systemProgram: SystemProgram.programId,
                tokenProgram: TOKEN_PROGRAM_ID,
            })
            .preInstructions([
                ComputeBudgetProgram.requestHeapFrame({ bytes: 256 * 1024 }),
                ComputeBudgetProgram.setComputeUnitLimit({ units: 1400000 }),
            ])
            .signers([])
            .rpc();
    }

    public async logDepositorAccounts() {
        const connection = this.program.provider.connection;
        const _depositorA = await getAccount(connection, this.depositorTokenAccountA.address);
        console.log("depositorA", _depositorA.amount.toString());
        const _depositorB = await getAccount(connection, this.depositorTokenAccountB.address);
        console.log("depositorB", _depositorB.amount.toString());
        const _lpAccount = await getAccount(connection, this.depositorTokenAccountLP.address);
        console.log("depositorLP", _lpAccount.amount.toString());

        const _vaultA = await getAccount(connection, this.vaultA.publicKey);
        console.log("vaultA", _vaultA.amount.toString());
        const _vaultB = await getAccount(connection, this.vaultB.publicKey);
        console.log("vaultB", _vaultB.amount.toString());
    }

    public async logTraderAccounts() {
        const connection = this.program.provider.connection;
        const _traderA = await getAccount(connection, this.traderTokenAccountA.address);
        console.log("Trade token A:", _traderA.amount.toString());
        const _traderB = await getAccount(connection, this.traderTokenAccountB.address);
        console.log("Trade token B:", _traderB.amount.toString());
    }
}




