import mongoose from 'mongoose'

const privateKeySchema = new mongoose.Schema({
  ownerEmail: {
    type: String,
    required: true,
    unique: true,
  },
  privatekey: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
})

const PrivateKey =
  mongoose.models.PrivateKey || mongoose.model('PrivateKey', privateKeySchema)

export default PrivateKey
