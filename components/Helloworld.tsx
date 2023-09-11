import { useConnection, useAnchorWallet, useWallet } from '@solana/wallet-adapter-react';
import { IDL, Helloworld } from '../utils/helloworld_idl';
import {AnchorProvider, Program, initProvider} from 'golana';
import {ComputeBudgetProgram, Keypair, PublicKey, SystemProgram, Transaction, VersionedTransactionResponse } from '@solana/web3.js';
import React, { FC, useCallback, useState } from 'react';
import BN from 'bn.js';

function getLogStr(response?: VersionedTransactionResponse, somethingElse: string = ''): string {
  return JSON.stringify(response?.meta?.logMessages ?? "Transaction failed, please retry", null, 2);
}

async function  aridrop(provider: AnchorProvider, key: PublicKey) {
  const latestBlockHash = await provider.connection.getLatestBlockhash();
  const airdrop = await provider.connection.requestAirdrop(key, 100000000);
  await provider.connection.confirmTransaction({
      blockhash: latestBlockHash.blockhash,
      lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
      signature: airdrop,
  });
  console.log("Airdrop to payer done: ", key.toBase58());
}

export const HelloworldComp: FC = () => {
    const golanaLoaderID = "HE7R2wfjpgjHnxfA9bS6fSLJzm7nucFfBXQhhxTCWMZs";
    const programAuth = "7iuukgrteZuquJB6ikGD9sPxpdZSze7QaLPywH3Zqa1s";
    const wallet = useAnchorWallet();
    const {connection} = useConnection();
    const provider = initProvider(connection, wallet, golanaLoaderID);
    const userAccountSpace = 512;

    const [userAccount] =  useState(() => {
      return  Keypair.generate();
    }); 
    const { publicKey } = useWallet();
    const [logs, setLogs] = useState<string>(''); // initialize logs state

    const [greetCount, setGreetCount] = useState<number>(0); // initialize greetCount state
    const [yourName, setYourName] = useState(''); // initialize yourName state

    // const handleCreate = useCallback(async () => {
    //   const userAccountLamports = await connection.getMinimumBalanceForRentExemption(userAccountSpace);

    //         // Create the user account
    //         const trans = await provider.sendAndConfirm(
    //             (() => {
    //                 const tx = new Transaction();
    //                 tx.add(
    //                     SystemProgram.createAccount({
    //                         fromPubkey: wallet.publicKey,
    //                         newAccountPubkey: userAccount.publicKey,
    //                         lamports: userAccountLamports,
    //                         space: userAccountSpace,
    //                         programId: new PublicKey(golanaLoaderID),
    //                     })
    //                 );
    //                 return tx;
    //             })(),
    //             [ userAccount],
    //         );

    //         const result = await provider.connection.getTransaction(trans,{
    //           maxSupportedTransactionVersion: 0,
    //         });
    //         console.log(result)
    //         setLogs(() => `Transaction logs: ${getLogStr(result)}\n`); // update logs state
    // },[wallet, provider, userAccount]);

    const handleIxInit = useCallback(async () => {
        await aridrop(provider, wallet.publicKey);

        const hello = await Program.create<Helloworld>(IDL, programAuth);
        const trans = await hello.methods.IxInit(new BN(greetCount))
          .accounts({
              user: wallet.publicKey,
              userAccount: userAccount.publicKey,
              systemProgram: SystemProgram.programId,
          })
          .signers([userAccount]) 
          .rpc({ skipPreflight: true });
        
          const result = await provider.connection.getTransaction(trans);
          setLogs(() => `Transaction logs: ${getLogStr(result)}\n`); // update logs state
           console.log(result)
    }, [wallet, userAccount, provider,greetCount]);

    const handleIxGreet = useCallback(async () => {
      const hello = await Program.create<Helloworld>(IDL, programAuth);
      const trans = await hello.methods.IxGreet([yourName, "and-your-friends"], [new BN(1),new BN(2),new BN(3)])
        .accounts({
            user: wallet.publicKey,
            userAccount: userAccount.publicKey,
        })
        .rpc({ skipPreflight: true });

        const result = await provider.connection.getTransaction(trans);
        setLogs(() => `Transaction logs: ${getLogStr(result)}\n`); // update logs state
        console.log(result)
      
  }, [wallet, userAccount,yourName]);

  return (
    <div>
      <h1 style={{ fontSize: '2rem' }}>Golana: Hello World 👋</h1>
      <p style={{ fontSize: '1.0rem' }}>This is a simple example of how to use the Golana SDK.</p>
      <p style={{ fontSize: '1.5rem' }}>0. Set your solana wallet to the testnet, and connect your wallet.</p>
      <p style={{ fontSize: '1.0rem' }}>1. Create an account to store data onchain and initialize the account with an initial greet count.</p>
      <p style={{ fontSize: '1.0rem' }}>2. Send a greet transaction to get a greeting back and increment the greet count.</p>
      <p style={{ fontSize: '1.0rem' }}>3. View the logs below to see the transaction details.</p>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {/* <button className={`big-button bg-green-500 text-white hover:bg-green-700 ${!publicKey ? 'opacity-50 cursor-not-allowed' : ''}`} onClick={handleCreate} disabled={!publicKey} style={{ borderRadius: '5px', width: '200px', fontSize: '1.5rem', marginBottom: '20px' }}> Create Account </button> */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
          <label htmlFor="greet-count" style={{ fontSize: '1.5rem', marginRight: '10px' }}>Set Initial Greet Count:</label>
          <input type="number" id="greet-count" value={greetCount} onChange={(e) => setGreetCount(parseInt(e.target.value))} style={{ borderRadius: '5px', width: '200px', fontSize: '1.5rem', backgroundColor: '#f5f5f5', border: '1px solid #ccc', padding: '5px' }} />
        </div>
        <button className={`big-button bg-green-500 text-white hover:bg-green-700 ${!publicKey ? 'opacity-50 cursor-not-allowed' : ''}`} onClick={handleIxInit} disabled={!publicKey} style={{ borderRadius: '5px', width: '200px', fontSize: '1.5rem', marginBottom: '20px' }}> Send IxInit </button>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
          <label htmlFor="your-name" style={{ fontSize: '1.5rem', marginRight: '10px' }}>Set Your Name:</label>
          <input type="text" id="your-name" value={yourName} onChange={(e) => setYourName(e.target.value)} style={{ borderRadius: '5px', width: '200px', fontSize: '1.5rem', backgroundColor: '#f5f5f5', border: '1px solid #ccc', padding: '5px' }} />
        </div>
        <button className={`big-button bg-green-500 text-white hover:bg-green-700 ${!publicKey ? 'opacity-50 cursor-not-allowed' : ''}`} onClick={handleIxGreet} disabled={!publicKey} style={{ borderRadius: '5px', width: '200px', fontSize: '1.5rem' }}> Send IxGreet </button>
      </div>
      <br/>
      <textarea
        value={logs}
        readOnly
        style={{ 
          width: '100%', 
          height: '300px', 
          fontFamily: 'monospace',
          padding: '10px',
          borderRadius: '5px',
          border: '1px solid #ccc',
          resize: 'none'
        }}
      />
    </div>
  )
}

