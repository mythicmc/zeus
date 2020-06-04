import React, { useState, useRef } from 'react'
import fetch from 'isomorphic-unfetch'
import Title from '../imports/title'
import Layout from '../imports/layout'
import useAuthentication from '../imports/useAuthentication'
import { ip } from '../config.json'

const ChangePassword = () => {
  const confirmInput = useRef()
  const passwordInput = useRef()
  const authenticated = useAuthentication()

  const [password, setPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [newPassConfirm, setNewPassConfirm] = useState('')
  const [fetching, setFetching] = useState(false)
  const [statusCode, setStatusCode] = useState(200) // Expected values: 200, 403, 500

  const handlePasswordChange = async () => {
    if (!password || !newPassword || !newPassConfirm) return
    else if (newPassConfirm !== newPassword) return
    try {
      setFetching(true)
      const authorization = localStorage.getItem('accessToken')
      const request = await fetch(ip + '/changePassword', {
        method: 'POST',
        body: JSON.stringify({ newPassword, password }),
        headers: { authorization, 'content-type': 'application/json' }
      })
      if (statusCode === 200) window.location.pathname = '/login' // Since router.push doesn't work.
      else setStatusCode(request.status)
    } catch (e) {
      setStatusCode(null)
      console.error(e)
    }
    setFetching(false)
  }

  if (!authenticated) {
    return (
      <React.StrictMode>
        <Title
          title='Change Password - Mythic'
          description='Page to change your password on the Mythic forums.'
          url='/changepassword'
        />
        <Layout auth={authenticated}>
          {authenticated === null
            ? <p>Loading...</p>
            : <p>You are not logged in!</p>}
        </Layout>
      </React.StrictMode>
    )
  }
  return (
    <React.StrictMode>
      <Title
        title='Change Password - Mythic'
        description='Page to change your password on the Mythic forums.'
        url='/changepassword'
      />
      <Layout auth={authenticated}>
        <form onSubmit={e => e.preventDefault()}>
          <label htmlFor='password'>Password: </label>
          <input
            type='password'
            id='password'
            value={password}
            disabled={fetching}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && passwordInput.current) passwordInput.current.focus()
            }}
          />
          <br /><br />
          <label htmlFor='new-password'>New Password: </label>
          <input
            type='password'
            id='new-password'
            ref={passwordInput}
            value={newPassword}
            disabled={fetching}
            onChange={e => setNewPassword(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && confirmInput.current) confirmInput.current.focus()
            }}
          />
          <br /><br />
          <label htmlFor='new-pass-confirm'>Confirm New Password: </label>
          <input
            type='password'
            id='new-pass-confirm'
            ref={confirmInput}
            value={newPassConfirm}
            disabled={fetching}
            onChange={e => setNewPassConfirm(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') handlePasswordChange()
            }}
          />
          <br /><br />
          <button
            onClick={handlePasswordChange}
            disabled={fetching || !password || !newPassword || newPassword !== newPassConfirm}
          >
            Change Password
          </button>
        </form>
        {newPassword !== newPassConfirm && <p>The entered passwords do not match!</p>}
        {statusCode === 401 && <p>Unauthorized!</p>}
        {statusCode === 403 && <p>The password you entered was incorrect!</p>}
        {statusCode !== 200 && statusCode !== 401 && statusCode !== 403 &&
          <p>An unknown error occurred while trying to request.</p>}
      </Layout>
    </React.StrictMode>
  )
}

export default ChangePassword
