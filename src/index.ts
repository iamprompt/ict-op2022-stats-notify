import { readFile } from 'fs/promises'
import type { Dayjs } from 'dayjs'
import { schedule } from 'node-cron'
import axios from 'axios'
import { stringify } from 'qs'
import dayjs from './utils/dayjs'
import { dbConnect } from './lib/mongoose'
import Participant from './model/participant.model'

const getParticipantNoByDate = async (date: Dayjs) => {
  const distinctParticipantsEmail = await Participant.distinct('email', {
    createdAt: {
      $gte: date.startOf('day').toDate(),
      $lte: date.endOf('day').toDate(),
    },
  })

  return distinctParticipantsEmail.length
}

const sendLineNotify = async (message?: string, notificationDisabled = false) => {
  try {
    if (!message) {
      console.log('No message to send')
      return
    }

    const lineNotifyTokenString = await readFile('./line_notify_token.json', 'utf-8')
    const lineNotifyToken: string[] = JSON.parse(lineNotifyTokenString)

    if (lineNotifyToken.length === 0)
      throw new Error('No line notify token found')

    for (const token of lineNotifyToken) {
      axios.post('https://notify-api.line.me/api/notify',
        stringify({ message, notificationDisabled }),
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
    }
  }
  catch (error) {
    console.log(error)
  }
}

let milestoneSent = {}

const checkAndNotify = async (mileStoneNotify = false) => {
  console.log(`[${dayjs().format('YYYY-MM-DD HH:mm:ss')}]: Checking...${mileStoneNotify ? ' (for milestone every 5 seconds)' : ' (every 15 minutes)'}`)

  try {
    const dateToCheck = ['2022-10-28', '2022-10-29']
    const numberOfParticipants = await dateToCheck.reduce(async (acc, date) => {
      const accValue = await acc
      accValue[date] = await getParticipantNoByDate(dayjs.tz(date))
      accValue.total = (accValue.total || 0) + accValue[date]
      return acc
    }
    , Promise.resolve({}) as Promise<Record<string, number>>)

    console.log(numberOfParticipants)

    const message = `\nจำนวนผู้ลงทะเบียนเข้าร่วมกิจกรรม ICT Mahidol Open House 2022\n\nวันที่ 28 ต.ค. 2565: ${numberOfParticipants['2022-10-28']} คน\nวันที่ 29 ต.ค. 2565: ${numberOfParticipants['2022-10-29']} คน\n\nรวมทั้งหมด: ${numberOfParticipants.total} คน\n\nข้อมูล ณ วันที่ ${dayjs().tz('Asia/Bangkok').format('DD/MM/YYYY HH:mm:ss')}`

    if (!mileStoneNotify) {
      await sendLineNotify(message)
    }
    else {
      const milestone = 500
      const milestoneReached = Object.keys(numberOfParticipants).some(date => numberOfParticipants[date] % milestone === 0)
      if (milestoneReached) {
        if (Object.entries(numberOfParticipants).every(([date, sent]) => milestoneSent[date] === sent))
          return
        console.log('Milestone reached')
        await sendLineNotify(message)
        milestoneSent = numberOfParticipants
      }
    }
  }
  catch (error) {}
}

const main = async () => {
  await dbConnect()

  checkAndNotify()

  schedule('0 7-17 * * *', () => checkAndNotify())
  schedule('*/5 * * * * *', () => checkAndNotify(true))
}

main()
