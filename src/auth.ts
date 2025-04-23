import NextAuth from 'next-auth'
import GitHub from 'next-auth/providers/github'
import Google from 'next-auth/providers/google'

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [Google, GitHub],
  session: {
    strategy: 'jwt',
    // strategy: 'database',
  },
  secret: process.env.AUTH_SECRET,
  pages: {
    signIn: '/signIn',
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google' || account?.provider === 'github') {
        try {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL

          const res = await fetch(`${apiUrl}/api/user-auth`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ user, account }),
          })
          if (res.ok) {
            return true
          }
        } catch (error) {
          console.log(error)
          return false
        }
      }
      return true
    },
  },
})
