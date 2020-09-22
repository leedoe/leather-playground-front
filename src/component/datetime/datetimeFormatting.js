import moment from 'moment';

const dateTimeFormatting = (datetime) => {
  const today = moment().format('YYYY-MM-DD')
  const created_time = moment(datetime)
  const createdTimeDate = created_time.format('YYYY-MM-DD')

  if(today === createdTimeDate) {
    return created_time.format('H:mm')
  } else {
    return created_time.format('YY-MM-DD')
  }
}

export default dateTimeFormatting