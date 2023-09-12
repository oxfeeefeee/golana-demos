import { useConnection, useAnchorWallet, useWallet } from '@solana/wallet-adapter-react';
import { IDL, Swap } from '../utils/swap_idl';
import {SwapProgram} from '../utils/swapProgram';
import {Program, initProvider} from 'golana';
import {ComputeBudgetProgram, Keypair, PublicKey, SystemProgram, Transaction, VersionedTransactionResponse } from '@solana/web3.js';
import React, { FC, useCallback, useState } from 'react';
import BN from 'bn.js';

function getLogStr(response?: VersionedTransactionResponse, somethingElse: string = ''): string {
  return JSON.stringify(response?.meta?.logMessages ?? "Failed to get transaction log, it may or may not have failed", null, 2);
}

export const SwapComp: FC = () => {
    const golanaLoaderID = "HE7R2wfjpgjHnxfA9bS6fSLJzm7nucFfBXQhhxTCWMZs";
    const programAuth = "7iuukgrteZuquJB6ikGD9sPxpdZSze7QaLPywH3Zqa1s";
    const wallet = useAnchorWallet();
    const {connection} = useConnection();
    const provider = initProvider(connection, wallet, golanaLoaderID);

    const { publicKey } = useWallet();
    const [logs, setLogs] = useState<string>(''); // initialize logs state

    const [program, setProgram] = useState<SwapProgram>(); // initialize program state

    const handleInit = useCallback(async () => {
        const swap = await SwapProgram.create(provider, new PublicKey(programAuth), provider.publicKey,provider.publicKey,provider.publicKey);
        setProgram(swap);
        setLogs("Init Done!");
      },[wallet, provider, setProgram, setLogs]);

    const handleCreatePool = useCallback(async () => {
        const trans = await program.IxCreatePool();
        await printLog(trans);
    },[wallet, provider, program]);

    const handleDeposite = useCallback(async () => {
        const trans = await program.IxDeposite(new BN(100000), new BN(400000));
        await printLog(trans);
        await program.logDepositorAccounts();
    },[wallet, provider, program]);
    
    const handleWithdraw = useCallback(async () => {
        const trans = await program.IxWithdraw(new BN(50000));
        await printLog(trans);
        await program.logDepositorAccounts();
    },[wallet, provider, program]);

    const handleTrade = useCallback(async () => {
        const trans = await program.IxTrade(new BN(10), new BN(20));
        await printLog(trans);
        await program.logTraderAccounts();
    },[wallet, provider, program]);

    const handleClosePool = useCallback(async () => {
        const trans = await program.IxClosePool();
        await printLog(trans);
    },[wallet, provider, program]);

    const printLog = async function (response: string) {
        const result = await provider.connection.getTransaction(response,{
            maxSupportedTransactionVersion: 0,
          });
        console.log(result)
        setLogs(() => `Transaction logs: ${getLogStr(result)}\n`); // update logs state
    }

    return (
    <div>
      <h1 style={{ fontSize: '2rem' }}>Uniswap V2 style swap demo</h1>
      <p style={{ fontSize: '1.5rem' }}>First, set your solana wallet to the testnet, and connect your wallet.</p>
      <p style={{ fontSize: '1.0rem' }}>Click though the buttons below to try out the demo, the numbers are preset in the code. Take a look at the <a href="https://github.com/oxfeeefeee/golana-demos/blob/main/utils/swapProgram.ts" target="_blank" rel="noopener noreferrer" style={{ color: 'green' }}>source code</a> to see what's going on.</p>
      <p style={{ fontSize: '1.0rem' }}>It takes quite a while to get the transactions confirmed, please be patient. And you can check the console for more logs.</p>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <button className={`big-button bg-green-500 text-white hover:bg-green-700 ${!publicKey ? 'opacity-50 cursor-not-allowed' : ''}`} onClick={handleInit} disabled={!publicKey} style={{ borderRadius: '5px', width: '200px', fontSize: '1.5rem', marginBottom: '20px' }}> Init </button>
        <button className={`big-button bg-green-500 text-white hover:bg-green-700 ${!publicKey ? 'opacity-50 cursor-not-allowed' : ''}`} onClick={handleCreatePool} disabled={!publicKey} style={{ borderRadius: '5px', width: '200px', fontSize: '1.5rem', marginBottom: '20px' }}> Create Pool </button>
        <button className={`big-button bg-green-500 text-white hover:bg-green-700 ${!publicKey ? 'opacity-50 cursor-not-allowed' : ''}`} onClick={handleDeposite} disabled={!publicKey} style={{ borderRadius: '5px', width: '200px', fontSize: '1.5rem', marginBottom: '20px' }}> Deposite </button>
        <button className={`big-button bg-green-500 text-white hover:bg-green-700 ${!publicKey ? 'opacity-50 cursor-not-allowed' : ''}`} onClick={handleWithdraw} disabled={!publicKey} style={{ borderRadius: '5px', width: '200px', fontSize: '1.5rem', marginBottom: '20px' }}> Withdraw </button>
        <button className={`big-button bg-green-500 text-white hover:bg-green-700 ${!publicKey ? 'opacity-50 cursor-not-allowed' : ''}`} onClick={handleTrade} disabled={!publicKey} style={{ borderRadius: '5px', width: '200px', fontSize: '1.5rem', marginBottom: '20px' }}> Trade </button>
        <button className={`big-button bg-green-500 text-white hover:bg-green-700 ${!publicKey ? 'opacity-50 cursor-not-allowed' : ''}`} onClick={handleClosePool} disabled={!publicKey} style={{ borderRadius: '5px', width: '200px', fontSize: '1.5rem', marginBottom: '20px' }}> Close Pool </button>
        {/* <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
          <label htmlFor="greet-count" style={{ fontSize: '1.5rem', marginRight: '10px' }}>Set Initial Greet Count:</label>
          <input type="number" id="greet-count" value={greetCount} onChange={(e) => setGreetCount(parseInt(e.target.value))} style={{ borderRadius: '5px', width: '200px', fontSize: '1.5rem', backgroundColor: '#f5f5f5', border: '1px solid #ccc', padding: '5px' }} />
        </div>
        <button className={`big-button bg-green-500 text-white hover:bg-green-700 ${!publicKey ? 'opacity-50 cursor-not-allowed' : ''}`} onClick={handleIxInit} disabled={!publicKey} style={{ borderRadius: '5px', width: '200px', fontSize: '1.5rem', marginBottom: '20px' }}> Send IxInit </button>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
          <label htmlFor="your-name" style={{ fontSize: '1.5rem', marginRight: '10px' }}>Set Your Name:</label>
          <input type="text" id="your-name" value={yourName} onChange={(e) => setYourName(e.target.value)} style={{ borderRadius: '5px', width: '200px', fontSize: '1.5rem', backgroundColor: '#f5f5f5', border: '1px solid #ccc', padding: '5px' }} />
        </div>
        <button className={`big-button bg-green-500 text-white hover:bg-green-700 ${!publicKey ? 'opacity-50 cursor-not-allowed' : ''}`} onClick={handleIxGreet} disabled={!publicKey} style={{ borderRadius: '5px', width: '200px', fontSize: '1.5rem' }}> Send IxGreet </button> */}
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
