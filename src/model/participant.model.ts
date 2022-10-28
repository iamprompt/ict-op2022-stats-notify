import type { Model } from 'mongoose'
import { Schema, model, models } from 'mongoose'

export interface IParticipant {
  regType: string
  language: string
  firstName: string
  lastName: string
  email: string
  phone: string
  province: number
  school: string
  educationLevel: number
  policyAgreement: boolean

  lineUserId: string
  lineDisplayName: string
  linePicture: string

  createdAt: Date
  updatedAt: Date
}

const participantSchema = new Schema(
  {
    regType: String,
    language: String,
    firstName: String,
    lastName: String,
    dob: Date,
    email: String,
    phone: String,
    province: Number,
    school: String,
    educationLevel: Number,
    policyAgreement: Boolean,

    // LINE
    lineUserId: String,
    lineDisplayName: String,
    linePicture: String,
  },
  { timestamps: true },
)

const Participant: Model<IParticipant> = models.Participant || model('Participant', participantSchema)

export default Participant
