import {
  CancelScheduleSend,
  Check,
  Delete,
  Edit,
  HorizontalRule,
  KeyboardControlKey,
  KeyboardDoubleArrowUp,
  LocalOffer,
  ManageSearch,
  MoreTime,
  MoreVert,
  Nfc,
  NoteAdd,
  PriorityHigh,
  RecordVoiceOver,
  Repeat,
  Report,
  SwitchAccessShortcut,
  TimesOneMobiledata,
  Update,
  ViewCarousel,
  Webhook,
} from '@mui/icons-material'
import {
  Avatar,
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  IconButton,
  Menu,
  MenuItem,
  Snackbar,
  Typography,
} from '@mui/joy'
import moment from 'moment'
import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { API_URL } from '../../Config'
import { UserContext } from '../../contexts/UserContext'
import {
  MarkChoreComplete,
  SkipChore,
  UpdateChoreAssignee,
} from '../../utils/Fetcher'
import { Fetch } from '../../utils/TokenManager'
import ConfirmationModal from '../Modals/Inputs/ConfirmationModal'
import DateModal from '../Modals/Inputs/DateModal'
import SelectModal from '../Modals/Inputs/SelectModal'
import TextModal from '../Modals/Inputs/TextModal'
import WriteNFCModal from '../Modals/Inputs/WriteNFCModal'
const ChoreCard = ({
  chore,
  performers,
  onChoreUpdate,
  onChoreRemove,
  sx,
  viewOnly,
}) => {
  const [activeUserId, setActiveUserId] = React.useState(0)
  const [isChangeDueDateModalOpen, setIsChangeDueDateModalOpen] =
    React.useState(false)
  const [isCompleteWithPastDateModalOpen, setIsCompleteWithPastDateModalOpen] =
    React.useState(false)
  const [isChangeAssigneeModalOpen, setIsChangeAssigneeModalOpen] =
    React.useState(false)
  const [isCompleteWithNoteModalOpen, setIsCompleteWithNoteModalOpen] =
    React.useState(false)
  const [confirmModelConfig, setConfirmModelConfig] = React.useState({})
  const [isNFCModalOpen, setIsNFCModalOpen] = React.useState(false)
  const [anchorEl, setAnchorEl] = React.useState(null)
  const menuRef = React.useRef(null)
  const navigate = useNavigate()
  const [isDisabled, setIsDisabled] = React.useState(false)

  const [isPendingCompletion, setIsPendingCompletion] = React.useState(false)
  const [secondsLeftToCancel, setSecondsLeftToCancel] = React.useState(null)
  const [timeoutId, setTimeoutId] = React.useState(null)
  const { userProfile } = React.useContext(UserContext)
  useEffect(() => {
    document.addEventListener('mousedown', handleMenuOutsideClick)
    return () => {
      document.removeEventListener('mousedown', handleMenuOutsideClick)
    }
  }, [anchorEl])

  const handleMenuOpen = event => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleMenuOutsideClick = event => {
    if (
      anchorEl &&
      !anchorEl.contains(event.target) &&
      !menuRef.current.contains(event.target)
    ) {
      handleMenuClose()
    }
  }
  const handleEdit = () => {
    navigate(`/chores/${chore.id}/edit`)
  }
  const handleView = () => {
    navigate(`/chores/${chore.id}`)
  }
  const handleDelete = () => {
    setConfirmModelConfig({
      isOpen: true,
      title: 'Delete Chore',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      message: 'Are you sure you want to delete this chore?',
      onClose: isConfirmed => {
        console.log('isConfirmed', isConfirmed)
        if (isConfirmed === true) {
          Fetch(`${API_URL}/chores/${chore.id}`, {
            method: 'DELETE',
          }).then(response => {
            if (response.ok) {
              onChoreRemove(chore)
            }
          })
        }
        setConfirmModelConfig({})
      },
    })
  }

  const handleTaskCompletion = () => {
    setIsPendingCompletion(true)
    let seconds = 3 // Starting countdown from 3 seconds
    setSecondsLeftToCancel(seconds)

    const countdownInterval = setInterval(() => {
      seconds -= 1
      setSecondsLeftToCancel(seconds)

      if (seconds <= 0) {
        clearInterval(countdownInterval) // Stop the countdown when it reaches 0
      }
    }, 1000)

    const id = setTimeout(() => {
      MarkChoreComplete(chore.id)
        .then(resp => {
          if (resp.ok) {
            return resp.json().then(data => {
              onChoreUpdate(data.res, 'completed')
            })
          }
        })
        .then(() => {
          setIsPendingCompletion(false)
          clearTimeout(id)
          clearInterval(countdownInterval) // Ensure to clear this interval as well
          setTimeoutId(null)
          setSecondsLeftToCancel(null)
        })
    }, 3000)

    setTimeoutId(id)
  }

  const handleChangeDueDate = newDate => {
    if (activeUserId === null) {
      alert('Please select a performer')
      return
    }
    Fetch(`${API_URL}/chores/${chore.id}/dueDate`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        dueDate: newDate ? new Date(newDate).toISOString() : null,
        UpdatedBy: activeUserId,
      }),
    }).then(response => {
      if (response.ok) {
        response.json().then(data => {
          const newChore = data.res
          onChoreUpdate(newChore, 'rescheduled')
        })
      }
    })
  }

  const handleCompleteWithPastDate = newDate => {
    if (activeUserId === null) {
      alert('Please select a performer')
      return
    }
    Fetch(
      `${API_URL}/chores/${chore.id}/do?completedDate=${new Date(
        newDate,
      ).toISOString()}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      },
    ).then(response => {
      if (response.ok) {
        response.json().then(data => {
          const newChore = data.res
          onChoreUpdate(newChore, 'completed')
        })
      }
    })
  }
  const handleAssigneChange = assigneeId => {
    UpdateChoreAssignee(chore.id, assigneeId).then(response => {
      if (response.ok) {
        response.json().then(data => {
          const newChore = data.res
          onChoreUpdate(newChore, 'assigned')
        })
      }
    })
  }
  const handleCompleteWithNote = note => {
    Fetch(`${API_URL}/chores/${chore.id}/do`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        note: note,
      }),
    }).then(response => {
      if (response.ok) {
        response.json().then(data => {
          const newChore = data.res
          onChoreUpdate(newChore, 'completed')
        })
      }
    })
  }
  const getDueDateChipText = nextDueDate => {
    if (chore.nextDueDate === null) return 'No Due Date'
    // if due in next 48 hours, we should it in this format : Tomorrow 11:00 AM
    const diff = moment(nextDueDate).diff(moment(), 'hours')
    if (diff < 48 && diff > 0) {
      return moment(nextDueDate).calendar().replace(' at', '')
    }
    return 'Due ' + moment(nextDueDate).fromNow()
  }
  const getDueDateChipColor = nextDueDate => {
    if (chore.nextDueDate === null) return 'neutral'
    const diff = moment(nextDueDate).diff(moment(), 'hours')
    if (diff < 48 && diff > 0) {
      return 'warning'
    }
    if (diff < 0) {
      return 'danger'
    }

    return 'neutral'
  }

  const getIconForLabel = label => {
    if (!label || label.trim() === '') return <></>
    switch (String(label).toLowerCase()) {
      case 'high':
        return <KeyboardDoubleArrowUp />
      case 'important':
        return <Report />
      default:
        return <LocalOffer />
    }
  }
  const getPriorityIcon = priority => {
    switch (Number(priority)) {
      case 1:
        return <PriorityHigh />
      case 2:
        return <KeyboardDoubleArrowUp />
      case 3:
        return <KeyboardControlKey />
      default:
        return <HorizontalRule />
    }
  }
  const getRecurrentChipText = chore => {
    const dayOfMonthSuffix = n => {
      if (n >= 11 && n <= 13) {
        return 'th'
      }
      switch (n % 10) {
        case 1:
          return 'st'
        case 2:
          return 'nd'
        case 3:
          return 'rd'
        default:
          return 'th'
      }
    }
    if (chore.frequencyType === 'once') {
      return 'Once'
    } else if (chore.frequencyType === 'trigger') {
      return 'Trigger'
    } else if (chore.frequencyType === 'daily') {
      return 'Daily'
    } else if (chore.frequencyType === 'adaptive') {
      return 'Adaptive'
    } else if (chore.frequencyType === 'weekly') {
      return 'Weekly'
    } else if (chore.frequencyType === 'monthly') {
      return 'Monthly'
    } else if (chore.frequencyType === 'yearly') {
      return 'Yearly'
    } else if (chore.frequencyType === 'days_of_the_week') {
      let days = JSON.parse(chore.frequencyMetadata).days
      if (days.length > 4) {
        const allDays = [
          'Sunday',
          'Monday',
          'Tuesday',
          'Wednesday',
          'Thursday',
          'Friday',
          'Saturday',
        ]
        const selectedDays = days.map(d => moment().day(d).format('dddd'))
        const notSelectedDay = allDays.filter(
          day => !selectedDays.includes(day),
        )
        const notSelectedShortdays = notSelectedDay.map(d =>
          moment().day(d).format('ddd'),
        )
        return `Daily except ${notSelectedShortdays.join(', ')}`
      } else {
        days = days.map(d => moment().day(d).format('ddd'))
        return days.join(', ')
      }
    } else if (chore.frequencyType === 'day_of_the_month') {
      let months = JSON.parse(chore.frequencyMetadata).months
      if (months.length > 6) {
        const allMonths = [
          'January',
          'February',
          'March',
          'April',
          'May',
          'June',
          'July',
          'August',
          'September',
          'October',
          'November',
          'December',
        ]
        const selectedMonths = months.map(m => moment().month(m).format('MMMM'))
        const notSelectedMonth = allMonths.filter(
          month => !selectedMonths.includes(month),
        )
        const notSelectedShortMonths = notSelectedMonth.map(m =>
          moment().month(m).format('MMM'),
        )
        return `${chore.frequency}${dayOfMonthSuffix(
          chore.frequency,
        )} except ${notSelectedShortMonths.join(', ')}`
      } else {
        let freqData = JSON.parse(chore.frequencyMetadata)
        const months = freqData.months.map(m => moment().month(m).format('MMM'))
        return `${chore.frequency}${dayOfMonthSuffix(
          chore.frequency,
        )} of ${months.join(', ')}`
      }
    } else if (chore.frequencyType === 'interval') {
      return `Every ${chore.frequency} ${
        JSON.parse(chore.frequencyMetadata).unit
      }`
    } else {
      return chore.frequencyType
    }
  }

  const getFrequencyIcon = chore => {
    if (['once', 'no_repeat'].includes(chore.frequencyType)) {
      return <TimesOneMobiledata />
    } else if (chore.frequencyType === 'trigger') {
      return <Webhook />
    } else {
      return <Repeat />
    }
  }
  const getName = name => {
    const split = Array.from(chore.name)
    // if the first character is emoji then remove it from the name
    if (/\p{Emoji}/u.test(split[0])) {
      return split.slice(1).join('').trim()
    }
    return name
  }

  return (
    <>
      <Chip
        variant='soft'
        sx={{
          position: 'relative',
          top: 10,
          zIndex: 1,
          left: 10,
        }}
        color={getDueDateChipColor(chore.nextDueDate)}
      >
        {getDueDateChipText(chore.nextDueDate)}
      </Chip>

      <Chip
        variant='soft'
        sx={{
          position: 'relative',
          top: 10,
          zIndex: 1,
          ml: 0.4,
          left: 10,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {getFrequencyIcon(chore)}
          {getRecurrentChipText(chore)}
        </div>
      </Chip>

      <Card
        style={viewOnly ? { pointerEvents: 'none' } : {}}
        variant='plain'
        sx={{
          ...sx,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          p: 2,
          // backgroundColor: 'white',
          boxShadow: 'sm',
          borderRadius: 20,

          // mb: 2,
        }}
      >
        <Grid container>
          <Grid
            item
            xs={9}
            onClick={() => {
              navigate(`/chores/${chore.id}`)
            }}
          >
            {/* Box in top right with Chip showing next due date  */}
            <Box display='flex' justifyContent='start' alignItems='center'>
              <Avatar sx={{ mr: 1, fontSize: 22 }}>
                {Array.from(chore.name)[0]}
              </Avatar>
              <Box display='flex' flexDirection='column'>
                <Typography level='title-md'>{getName(chore.name)}</Typography>
                {userProfile && chore.assignedTo !== userProfile.id && (
                  <Typography level='body-md' color='text.disabled'>
                    Assigned to{' '}
                    <Chip variant='outlined'>
                      {
                        performers.find(p => p.id === chore.assignedTo)
                          ?.displayName
                      }
                    </Chip>
                  </Typography>
                )}
                <Box>
                  {chore.priority > 0 && (
                    <Chip
                      sx={{
                        position: 'relative',
                        mr: 0.5,
                        top: 2,
                        zIndex: 1,
                      }}
                      color={
                        chore.priority === 1
                          ? 'danger'
                          : chore.priority === 2
                            ? 'warning'
                            : 'neutral'
                      }
                    >
                      P{chore.priority}
                    </Chip>
                  )}
                  {chore.labels?.split(',').map((label, index) => (
                    <Chip
                      variant='solid'
                      key={label}
                      color='primary'
                      sx={{
                        position: 'relative',
                        ml: index === 0 ? 0 : 0.5,
                        top: 2,
                        zIndex: 1,
                      }}
                      startDecorator={getIconForLabel(label)}
                    >
                      {label}
                    </Chip>
                  ))}
                </Box>
              </Box>
            </Box>
            {/* <Box display='flex' justifyContent='space-between' alignItems='center'>
          <Chip variant='outlined'>
            {chore.nextDueDate === null
              ? '--'
              : 'Due ' + moment(chore.nextDueDate).fromNow()}
          </Chip>
        </Box> */}
          </Grid>
          <Grid
            item
            xs={3}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            <Box display='flex' justifyContent='flex-end' alignItems='flex-end'>
              {/* <ButtonGroup> */}
              <IconButton
                variant='solid'
                color='success'
                onClick={handleTaskCompletion}
                disabled={isPendingCompletion}
                sx={{
                  borderRadius: '50%',
                  minWidth: 50,
                  height: 50,
                  zIndex: 1,
                }}
              >
                <div className='relative grid place-items-center'>
                  <Check />
                  {isPendingCompletion && (
                    <CircularProgress
                      variant='solid'
                      color='success'
                      size='md'
                      sx={{
                        color: 'success.main',
                        position: 'absolute',
                        zIndex: 0,
                      }}
                    />
                  )}
                </div>
              </IconButton>
              <IconButton
                // sx={{ width: 15 }}
                variant='soft'
                color='success'
                onClick={handleMenuOpen}
                sx={{
                  borderRadius: '50%',
                  width: 25,
                  height: 25,
                  position: 'relative',
                  left: -10,
                }}
              >
                <MoreVert />
              </IconButton>
              {/* </ButtonGroup> */}
              <Menu
                size='lg'
                ref={menuRef}
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
              >
                <MenuItem
                  onClick={() => {
                    setIsCompleteWithNoteModalOpen(true)
                  }}
                >
                  <NoteAdd />
                  Complete with note
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    setIsCompleteWithPastDateModalOpen(true)
                  }}
                >
                  <Update />
                  Complete in past
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    SkipChore(chore.id).then(response => {
                      if (response.ok) {
                        response.json().then(data => {
                          const newChore = data.res
                          onChoreUpdate(newChore, 'skipped')
                          handleMenuClose()
                        })
                      }
                    })
                  }}
                >
                  <SwitchAccessShortcut />
                  Skip to next due date
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    setIsChangeAssigneeModalOpen(true)
                  }}
                >
                  <RecordVoiceOver />
                  Delegate to someone else
                </MenuItem>
                <Divider />
                <MenuItem
                  onClick={() => {
                    navigate(`/chores/${chore.id}/history`)
                  }}
                >
                  <ManageSearch />
                  History
                </MenuItem>
                <Divider />
                <MenuItem
                  onClick={() => {
                    setIsChangeDueDateModalOpen(true)
                  }}
                >
                  <MoreTime />
                  Change due date
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    // write current chore URL to NFC
                    // writeToNFC(`${window.location.origin}/chores/${chore.id}`)
                    setIsNFCModalOpen(true)
                  }}
                >
                  <Nfc />
                  Write to NFC
                </MenuItem>
                <MenuItem onClick={handleEdit}>
                  <Edit />
                  Edit
                </MenuItem>
                <MenuItem onClick={handleView}>
                  <ViewCarousel />
                  View
                </MenuItem>
                <MenuItem onClick={handleDelete} color='danger'>
                  <Delete />
                  Delete
                </MenuItem>
              </Menu>
            </Box>
          </Grid>
        </Grid>
        <DateModal
          isOpen={isChangeDueDateModalOpen}
          key={'changeDueDate' + chore.id}
          current={chore.nextDueDate}
          title={`Change due date`}
          onClose={() => {
            setIsChangeDueDateModalOpen(false)
          }}
          onSave={handleChangeDueDate}
        />
        <DateModal
          isOpen={isCompleteWithPastDateModalOpen}
          key={'completedInPast' + chore.id}
          current={chore.nextDueDate}
          title={`Save Chore that you completed in the past`}
          onClose={() => {
            setIsCompleteWithPastDateModalOpen(false)
          }}
          onSave={handleCompleteWithPastDate}
        />
        <SelectModal
          isOpen={isChangeAssigneeModalOpen}
          options={performers}
          displayKey='displayName'
          title={`Delegate to someone else`}
          placeholder={'Select a performer'}
          onClose={() => {
            setIsChangeAssigneeModalOpen(false)
          }}
          onSave={selected => {
            handleAssigneChange(selected.id)
          }}
        />
        <ConfirmationModal config={confirmModelConfig} />
        <TextModal
          isOpen={isCompleteWithNoteModalOpen}
          title='Add note to attach to this completion:'
          onClose={() => {
            setIsCompleteWithNoteModalOpen(false)
          }}
          okText={'Complete'}
          onSave={handleCompleteWithNote}
        />
        <WriteNFCModal
          config={{
            isOpen: isNFCModalOpen,
            url: `${window.location.origin}/chores/${chore.id}`,
            onClose: () => {
              setIsNFCModalOpen(false)
            },
          }}
        />

        <Snackbar
          open={isPendingCompletion}
          endDecorator={
            <Button
              onClick={() => {
                if (timeoutId) {
                  clearTimeout(timeoutId)
                  setIsPendingCompletion(false)
                  setTimeoutId(null)
                  setSecondsLeftToCancel(null) // Reset or adjust as needed
                }
              }}
              size='md'
              variant='outlined'
              color='primary'
              startDecorator={<CancelScheduleSend />}
            >
              Cancel
            </Button>
          }
        >
          <Typography level='body2' textAlign={'center'}>
            Task will be marked as completed in {secondsLeftToCancel} seconds
          </Typography>
        </Snackbar>
      </Card>
    </>
  )
}

export default ChoreCard
