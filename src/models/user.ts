import mongoose, { Model, Schema } from 'mongoose'
interface IUser {
  name: string
  email: string
}
const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
  },
  {
    timestamps: true,
  }
)
let User: Model<IUser>
try {
  User = mongoose.model<IUser>('User')
} catch {
  User = mongoose.model<IUser>('User', userSchema)
}
export default User
