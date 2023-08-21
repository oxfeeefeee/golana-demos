import { useConnection, useAnchorWallet, useWallet } from '@solana/wallet-adapter-react';
import { IDL, Helloworld } from '../utils/helloworld_idl';
import {Program, initProvider} from 'golana';
import {ComputeBudgetProgram, Keypair, PublicKey, SystemProgram, Transaction } from '@solana/web3.js';
import React, { FC, useCallback, useState } from 'react';
import BN from 'bn.js';

export const HelloworldComp: FC = () => {
    const golanaLoaderID = "6ZjLk7jSFVVb2rxeoRf4ex3Q7zECi5SRTV4HbX55nNdP";
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

    const handleCreate = useCallback(async () => {
      const userAccountLamports = await connection.getMinimumBalanceForRentExemption(userAccountSpace);

            // Create the user account
            const trans = await provider.sendAndConfirm(
                (() => {
                    const tx = new Transaction();
                    tx.add(
                        SystemProgram.createAccount({
                            fromPubkey: wallet.publicKey,
                            newAccountPubkey: userAccount.publicKey,
                            lamports: userAccountLamports,
                            space: userAccountSpace,
                            programId: new PublicKey(golanaLoaderID),
                        })
                    );
                    return tx;
                })(),
                [ userAccount],
            );

            const result = await provider.connection.getTransaction(trans,{
              maxSupportedTransactionVersion: 0,
            });
            console.log(result)
            setLogs(() => `CreateAccount transaction: ${JSON.stringify(result.meta.logMessages, null, 2)}\n`); // update logs state
    },[wallet, provider, userAccount]);

    const handleIxInit = useCallback(async () => {
        const hello = await Program.create<Helloworld>(IDL, programAuth);
        const trans = await hello.methods.IxInit(new BN(greetCount))
          .accounts({
              user: wallet.publicKey,
              userAccount: userAccount.publicKey,
          })
          .preInstructions([
              ComputeBudgetProgram.requestHeapFrame({ bytes: 256 * 1024 }),
              ComputeBudgetProgram.setComputeUnitLimit({ units: 1400000 })
          ])
          .rpc({ skipPreflight: true });
        
          const result = await provider.connection.getTransaction(trans);
          setLogs(() => `IxInit transaction: ${JSON.stringify(result.meta.logMessages, null, 2)}\n`); // update logs state
           console.log(result)
    }, [wallet, userAccount, provider]);

    const handleIxGreet = useCallback(async () => {
      const hello = await Program.create<Helloworld>(IDL, programAuth);
      const trans = await hello.methods.IxGreet("best_chain_devs")
        .accounts({
            user: wallet.publicKey,
            userAccount: userAccount.publicKey,
        })
        .preInstructions([
            ComputeBudgetProgram.requestHeapFrame({ bytes: 256 * 1024 }),
            ComputeBudgetProgram.setComputeUnitLimit({ units: 1400000 })
        ])
        .rpc();

        const result = await provider.connection.getTransaction(trans);
        setLogs(() => `IxGreet transaction: ${JSON.stringify(result.meta.logMessages, null, 2)}\n`); // update logs state
        console.log(result)
      
  }, [wallet, userAccount]);

  return (
    <div>
      <h1 style={{ fontSize: '2rem' }}>Golana: Hello World 👋</h1>
      <br/>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <button className={`big-button bg-green-500 text-white hover:bg-green-700 ${!publicKey ? 'opacity-50 cursor-not-allowed' : ''}`} onClick={handleCreate} disabled={!publicKey} style={{ borderRadius: '5px', width: '200px', fontSize: '1.5rem', marginBottom: '20px' }}> Create Account </button>
        <label htmlFor="greet-count" style={{ fontSize: '1.5rem', marginBottom: '10px' }}>Set Initial Greet Count:</label>
        <input type="number" id="greet-count" value={greetCount} onChange={(e) => setGreetCount(parseInt(e.target.value))} style={{ borderRadius: '5px', width: '200px', fontSize: '1.5rem', marginBottom: '20px' }} />
        <button className={`big-button bg-green-500 text-white hover:bg-green-700 ${!publicKey ? 'opacity-50 cursor-not-allowed' : ''}`} onClick={handleIxInit} disabled={!publicKey} style={{ borderRadius: '5px', width: '200px', fontSize: '1.5rem', marginBottom: '20px' }}> Send IxInit </button>
        <button className={`big-button bg-green-500 text-white hover:bg-green-700 ${!publicKey ? 'opacity-50 cursor-not-allowed' : ''}`} onClick={handleIxGreet} disabled={!publicKey} style={{ borderRadius: '5px', width: '200px', fontSize: '1.5rem' }}> Send IxGreet </button>
      </div>
      <br/>
      <textarea
        value={logs}
        readOnly
        style={{ 
          width: '100%', 
          height: '400px', 
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

