import { config } from 'dotenv'
import { connect } from 'mongoose'

config({ path: '.env.local' })

export const dbConnect = async () => {
  await connect(process.env.DATABASE_URL || '')
}
