import Link from 'next/link'

export default function Home() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Forge Crypto Demo</h1>

      <div className="bg-red-200 px-4 py-2 rounded-md mb-4 w-max">
        <Link href="https://www.npmjs.com/package/node-forge">
          node-forge package: https://www.npmjs.com/package/node-forge
        </Link>
      </div>

      <div className="bg-blue-200 px-4 py-2 rounded-md mb-4 w-max">
        <Link href="https://forge-crypto.netlify.app/">
          Frontend Forge Demo with bootstrap: https://forge-crypto.netlify.app/
        </Link>
      </div>

      <div className="bg-yellow-200 px-4 py-2 rounded-md mb-4 w-max">
        <Link href="https://crypto-demo-phi.vercel.app/">
          Next.js Fullstack Forge Demo - https://crypto-demo-phi.vercel.app/
        </Link>
      </div>

      <div className="bg-yellow-500 px-4 py-2 rounded-md mb-4 w-max">
        <Link href="https://forge-crypto-demo.vercel.app/">
          Next.js Fullstack Forge Crypto Demo (This App) <br />
          - https://forge-crypto-demo.vercel.app/ <br />-
          https://github.com/lbcsultan/forge-crypto-demo
        </Link>
      </div>
    </div>
  )
}
