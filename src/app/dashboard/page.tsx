import { auth } from '@/auth'
import Image from 'next/image'
import React from 'react'

export default async function DashboardPage() {
  const session = await auth()

  return (
    <div>
      {session && session.user && (
        <div className='flex items-center gap-2'>
          <Image
            src={session?.user.image as string}
            width={200}
            height={200}
            alt='avartar'
            className='rounded-full'
          />
          <p className='text-white text-lg font-bold px-2 '>
            {JSON.stringify(session)}
          </p>
        </div>
      )}
    </div>
  )
}
