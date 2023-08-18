import { useConnection, useAnchorWallet } from '@solana/wallet-adapter-react';
import { IDL, Helloworld } from '../utils/helloworld_idl';
import {Program, initProvider} from 'golana';
import { Keypair, SystemProgram, Transaction } from '@solana/web3.js';
import React, { FC, useCallback } from 'react';


export const HelloworldComp: FC = () => {
    const wallet = useAnchorWallet();
    const {connection} = useConnection();
    console.log(wallet, connection, "1111");

    const handleIxInit = useCallback(async () => {

        console.log(wallet, connection, "3333");


        console.log('handleIxInit Button clicked!')
        initProvider(connection, wallet, "6ZjLk7jSFVVb2rxeoRf4ex3Q7zECi5SRTV4HbX55nNdP");

        const keys = await Program.createCodePubKeys("helloworld");
        const hello = new Program<Helloworld>(IDL, keys);
        const userAccountSpace = 512;

        console.log('222handleIxInit Button clicked!')
    }, [wallet, connection]);

  const handleIxGreet = () => {
    console.log('Button clicked!')
  }

  return (
    <div>
      <h1 style={{ fontSize: '2rem' }}>Golana: Hello World 👋</h1>
      <br/>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <button className="big-button bg-green-500 text-white hover:bg-green-700 active:bg-green-900" onClick={handleIxInit} style={{ borderRadius: '5px', width: '200px', fontSize: '1.5rem', marginBottom: '20px' }}> Send IxInit </button>
        <button className="big-button bg-green-500 text-white hover:bg-green-700 active:bg-green-900" onClick={handleIxGreet} style={{ borderRadius: '5px', width: '200px', fontSize: '1.5rem' }}> Send IxGreet </button>
      </div>
      <br/>
    </div>
  )
}
