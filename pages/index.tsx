import Link from 'next/link'
import Layout from '../components/Layout'
import { HelloworldComp } from '../components/Helloworld'

const IndexPage = () => {
  return (
    <Layout title="Home | Next.js + TypeScript Example">
      <HelloworldComp />
    </Layout>
  )
}

export default IndexPage
