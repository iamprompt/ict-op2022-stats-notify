import dayjs from 'dayjs'
import 'dayjs/locale/th'
import Timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'

dayjs.locale('th')
dayjs.extend(utc)
dayjs.extend(Timezone)

dayjs.tz.setDefault('Asia/Bangkok')

export default dayjs
