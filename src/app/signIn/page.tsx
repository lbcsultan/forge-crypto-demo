import { auth, signIn } from '@/auth'
import { redirect } from 'next/navigation'

export default async function SignInPage() {
  const session = await auth()
  if (session) redirect('/')

  return (
    <div className="flex flex-col gap-4 text-center mt-10">
      <form
        action={async () => {
          'use server'
          await signIn('github')
        }}
      >
        <button
          type="submit"
          className="text-2xl bg-slate-400 p-4 rounded-lg m-4"
        >
          Signin with GitHub
        </button>
      </form>
      <form
        action={async () => {
          'use server'
          await signIn('google')
        }}
      >
        <button
          type="submit"
          className="text-2xl bg-slate-400 p-4 rounded-lg m-4"
        >
          Signin with Google
        </button>
      </form>
    </div>
  )
}
