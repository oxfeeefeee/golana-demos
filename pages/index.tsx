import Link from 'next/link'
import Layout from '../components/Layout'

import { IDL, Helloworld } from '../utils/helloworld_idl.js';
import Program from 'golana';

const IndexPage = () => {
  const handleIxInit = async () => {
    console.log('handleIxInit Button clicked!')

    const hello = new Program<Helloworld>(IDL, await Program.createCodePubKeys("helloworld"));
    const userAccountSpace = 512;

    console.log('222handleIxInit Button clicked!')
  }

  const handleIxGreet = () => {
    console.log('Button clicked!')
  }

  return (
    <Layout title="Home | Next.js + TypeScript Example">
      <h1 style={{ fontSize: '2rem' }}>Golana: Hello World 👋</h1>
      <br/>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <button className="big-button bg-green-500 text-white hover:bg-green-700 active:bg-green-900" onClick={handleIxInit} style={{ borderRadius: '5px', width: '200px', fontSize: '1.5rem', marginBottom: '20px' }}> Send IxInit </button>
        <button className="big-button bg-green-500 text-white hover:bg-green-700 active:bg-green-900" onClick={handleIxGreet} style={{ borderRadius: '5px', width: '200px', fontSize: '1.5rem' }}> Send IxGreet </button>
      </div>
      <br/>
    </Layout>
  )
}

export default IndexPage
