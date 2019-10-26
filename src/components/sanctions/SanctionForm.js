// @flow
import React, { useState } from 'react'
import { Form, Button, Alert } from 'reactstrap'

import SelectUser from './SelectUser'
import SelectRule from './SelectRule'
import ExtraInfoInput from './ExtraInfoInput'

type AlertState = {
  visible: boolean,
  text?: string,
  color?: 'success' | 'danger'
}

const SanctionForm = ({
  team,
  users,
  createSanction
}: {
  team: Team,
  users: User[],
  createSanction: (CreateSanction, (Sanction) => void, (Reason) => void) => void
}) => {
  const [sanction, setSanction] = useState<CreateSanction>({})
  const [alertState, setAlertState] = useState<AlertState>({ visible: false })
  const [creating, setCreating] = useState<boolean>(false)

  const updateSanction = (sanction: CreateSanction) => {
    setSanction(sanction)
  }

  const getSuccessAlertText = (sanction: Sanction): string => {
    const user = users.find(user => user.id === sanction.user_id)

    if (user) {
      return `${user.firstname} ${user.lastname} a payé ${sanction.price}`
    }

    return ''
  }

  const getErrorAlertText = (reason: Reason): string => {
    return 'Error'
  }

  const saveSanction = () => {
    setCreating(true)

    createSanction(
      sanction,
      sanction => {
        setAlertState({ visible: true, text: getSuccessAlertText(sanction), color: 'success' })
        setSanction({})
        setCreating(false)
      },
      reason => {
        setAlertState({ visible: true, text: getErrorAlertText(reason), color: 'danger' })
        setSanction({})
        setCreating(false)
      }
    )
  }

  const initializeExtraInfo = (associated_rule: string): ExtraInfo => {
    const rule = team.rules.find(rule => rule.id === associated_rule)

    if (rule) {
      switch (rule.kind.type) {
        case 'MULTIPLICATION':
        case 'TIME_MULTIPLICATION':
          return { type: 'MULTIPLICATION', factor: 1 }

        default:
          break
      }
    }

    return { type: 'NONE' }
  }

  const buttonIsDisabled: boolean = !sanction.user_id || !sanction.sanction_info

  const dismissAlert = () => setAlertState({ visible: false })

  return (
    <div>
      <Alert isOpen={alertState.visible} toggle={dismissAlert} color={alertState.color && alertState.color}>
        {alertState.text && alertState.text}
      </Alert>
      <Form>
        <SelectUser
          users={users}
          userId={sanction.user_id}
          updateSelectedUser={user_id =>
            updateSanction({
              ...sanction,
              user_id
            })
          }
        />
        <SelectRule
          rules={team.rules.filter(rule => rule.kind.type !== 'REGULAR_INTERVALS')}
          ruleId={sanction.sanction_info && sanction.sanction_info.associated_rule}
          updateSelectedRule={associated_rule =>
            updateSanction({
              ...sanction,
              sanction_info: {
                associated_rule,
                extra_info: initializeExtraInfo(associated_rule)
              }
            })
          }
        />
        <ExtraInfoInput
          extraInfo={sanction.sanction_info && sanction.sanction_info.extra_info}
          updateExtraInfo={extra_info =>
            updateSanction({
              ...sanction,
              sanction_info: {
                ...sanction.sanction_info,
                extra_info
              }
            })
          }
        />
        <Button onClick={() => saveSanction()} disabled={buttonIsDisabled}>
          Ça paye !
        </Button>
      </Form>
    </div>
  )
}

const withAsyncData = SanctionForm => (props: any) => (
  <SanctionForm team={props.team} users={props.users} createSanction={props.createSanction} />
)

export default withAsyncData(SanctionForm)
