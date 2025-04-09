import { auth, signIn, signOut } from '@/auth'
import Link from 'next/link'
import { Button } from './ui/button'
import Image from 'next/image'
export default async function Navbar() {
  const session = await auth()

  return (
    <nav className="flex justify-between items-center bg-black px-8 py-4">
      <Link href="/" className="text-white text-lg font-bold">
        ForgeCryptoDemo
      </Link>

      <div>
        <Link href="/hashFunc" className="text-white text-lg font-bold">
          HashFunc
        </Link>
      </div>

      <div>
        <Link href="/encryptFunc" className="text-white text-lg font-bold">
          EncryptFunc
        </Link>
      </div>

      <div>
        <Link href="/rsaFunc" className="text-white text-lg font-bold">
          RSAFunc
        </Link>
      </div>

      {session && session.user ? (
        <div className="flex items-center gap-2">
          <Image
            src={session?.user.image as string}
            width={40}
            height={40}
            alt="avartar"
            className="rounded-full"
          />
          <p className="text-white text-lg font-bold px-2 ">
            {session.user.name}
          </p>
          <form
            action={async () => {
              'use server'
              await signOut()
            }}
          >
            <Button
              variant={'outline'}
              size="lg"
              className="font-bold text-lg"
              type="submit"
            >
              Sign Out
            </Button>
          </form>
        </div>
      ) : (
        <>
          <form
            action={async () => {
              'use server'
              await signIn()
            }}
          >
            <Button
              variant={'outline'}
              size="lg"
              className="font-bold text-lg"
              type="submit"
            >
              Sign In
            </Button>
          </form>
          {/* <LoginButton>Login</LoginButton> */}
        </>
      )}
    </nav>
  )
}
