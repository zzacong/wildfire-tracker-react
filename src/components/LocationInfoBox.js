import { useState, useEffect } from 'react'
import { Icon } from '@iconify/react'
import closeIcon from '@iconify/icons-mdi/close'

export default function LocationInfoBox({ info }) {
  const [hide, setHide] = useState(false)

  useEffect(() => {
    setHide(false)
  }, [info])

  return (
    <>
      {!hide && (
        <div className="location-info">
          <h2>Event Location Info</h2>
          <ul>
            <li>
              ID: <strong>{info.id}</strong>
            </li>
            <li>
              TITLE: <strong>{info.title}</strong>
            </li>
          </ul>
          <Icon
            icon={closeIcon}
            className="close"
            onClick={() => setHide(true)}
          />
        </div>
      )}
    </>
  )
}
