import mongoose from 'mongoose'
import User from '@/models/user'

async function getUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || '')
    const users = await User.find({}).sort({ createdAt: -1 })
    return users
  } catch (error) {
    console.error('Error fetching users:', error)
    return []
  } finally {
    await mongoose.disconnect()
  }
}

export default async function UsersPage() {
  const users = await getUsers()

  return (
    <div className="mx-auto max-w-screen-lg">
      <h1 className="text-3xl font-bold mb-8">
        All Registered Users (등록된 사용자)
      </h1>
      <div className="bg-white shadow-md rounded-lg p-6">
        <ul className="space-y-4">
          {users.map((user) => (
            <li key={user._id.toString()} className="border-b pb-2">
              <div className="flex justify-between items-center">
                <div>
                  <span className="font-bold text-gray-800">{user.email}</span>
                  <span className="text-gray-600 ml-2">- {user.name}</span>
                </div>
                <div className="text-sm text-gray-500">
                  가입일: {new Date(user.createdAt).toLocaleDateString()}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
