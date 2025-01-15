import { CalendarViewDay, Check, Timelapse } from '@mui/icons-material'
import {
  Box,
  Chip,
  ListDivider,
  ListItem,
  ListItemContent,
  Typography,
} from '@mui/joy'
import moment from 'moment'
import React, { ReactElement } from 'react'

export const getCompletedChip = historyEntry => {
  let text = 'No Due Date'
  let color = 'info'
  let icon: ReactElement
  // if completed few hours +-6 hours
  if (
    historyEntry.dueDate &&
    historyEntry.completedAt > historyEntry.dueDate - 1000 * 60 * 60 * 6 &&
    historyEntry.completedAt < historyEntry.dueDate + 1000 * 60 * 60 * 6
  ) {
    text = 'On Time'
    color = 'success'
    icon = <Check />
  } else if (
    historyEntry.dueDate &&
    historyEntry.completedAt < historyEntry.dueDate
  ) {
    text = 'On Time'
    color = 'success'
    icon = <Check />
  }

  // if completed after due date then it's late
  else if (
    historyEntry.dueDate &&
    historyEntry.completedAt > historyEntry.dueDate
  ) {
    text = 'Late'
    color = 'warning'
    icon = <Timelapse />
  } else {
    text = 'No Due Date'
    color = 'neutral'
    icon = <CalendarViewDay />
  }

  return (
    <Chip startDecorator={icon} color={color}>
      {text}
    </Chip>
  )
}

export const HistoryCard = ({
  allHistory,
  historyEntry,
  index,
  onClick,
}) => {
  function formatTimeDifference(startDate, endDate) {
    const diffInMinutes = moment(startDate).diff(endDate, 'minutes')
    let timeValue = diffInMinutes
    let unit = 'minute'

    if (diffInMinutes >= 60) {
      const diffInHours = moment(startDate).diff(endDate, 'hours')
      timeValue = diffInHours
      unit = 'hour'

      if (diffInHours >= 24) {
        const diffInDays = moment(startDate).diff(endDate, 'days')
        timeValue = diffInDays
        unit = 'day'
      }
    }

    return `${timeValue} ${unit}${timeValue !== 1 ? 's' : ''}`
  }

  return (
    <>
      <ListItem sx={{ gap: 1.5, alignItems: 'flex-start' }} onClick={onClick}>
        <ListItemContent sx={{ my: 0 }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Typography level='body1' sx={{ fontWeight: 'md' }}>
              {historyEntry.completedAt
                ? moment(historyEntry.completedAt).format(
                    'ddd MM/DD/yyyy HH:mm',
                  )
                : 'Skipped'}
            </Typography>
            {getCompletedChip(historyEntry)}
          </Box>
          {historyEntry.dueDate && (
            <Typography level='body2' color='text.tertiary'>
              Due: {moment(historyEntry.dueDate).format('ddd MM/DD/yyyy')}
            </Typography>
          )}
          {historyEntry.notes && (
            <Typography level='body2' color='text.tertiary'>
              Note: {historyEntry.notes}
            </Typography>
          )}
        </ListItemContent>
      </ListItem>
      {index < allHistory.length - 1 && (
        <>
          <ListDivider component='li'>
            {index < allHistory.length - 1 &&
              allHistory[index + 1].completedAt && (
                <Typography level='body3' color='text.tertiary'>
                  {formatTimeDifference(
                    historyEntry.completedAt,
                    allHistory[index + 1].completedAt,
                  )}&nbsp;before
                </Typography>
              )}
          </ListDivider>
        </>
      )}
    </>
  )
}
