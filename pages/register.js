import React, { useState, useRef } from 'react'
import { useRouter } from 'next/router'
import fetch from 'isomorphic-unfetch'
import Title from '../imports/title'
import Layout from '../imports/layout'
import AnchorLink from '../imports/anchorLink'
import useAuthentication from '../imports/useAuthentication'
import { ip } from '../config.json'

// TODO: Support email verification.
const Register = () => {
  const router = useRouter()
  const emailInput = useRef()
  const confPassInput = useRef()
  const passwordInput = useRef()
  const authenticated = useAuthentication()
  if (authenticated) {
    router.back()
  }

  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confPass, setConfPass] = useState('')
  const [fetching, setFetching] = useState(false)
  const [statusCode, setStatusCode] = useState(200) // Expected values: 200, 403, 500

  const invalidName = !username.match(/^[a-zA-Z0-9_]*$/)

  const handleRegister = async () => {
    if (!username || !password || !email || password !== confPass || invalidName) return
    try {
      setFetching(true)
      const request = await fetch(ip + '/register', {
        method: 'POST',
        body: JSON.stringify({ email }),
        headers: { username, password, 'content-type': 'application/json' }
      })
      if (request.status === 200) {
        router.push('/login')
      } else setStatusCode(request.status)
    } catch (e) {
      setStatusCode(null)
      console.error(e)
    }
    setFetching(false)
  }

  return (
    <React.StrictMode>
      <Title
        title='Register - Mythic'
        description='Register an account on the Mythic forums.'
        url='/register'
      />
      <Layout>
        <form onSubmit={e => e.preventDefault()}>
          <label htmlFor='username'>Username: </label>
          <input
            type='text'
            id='username'
            value={username}
            disabled={fetching}
            onChange={e => setUsername(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && emailInput.current) emailInput.current.focus()
            }}
          />
          <br /><br />
          <label htmlFor='email'>Email: </label>
          <input
            type='email'
            id='email'
            value={email}
            ref={emailInput}
            disabled={fetching}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && passwordInput.current) passwordInput.current.focus()
            }}
          />
          <br /><br />
          <label htmlFor='password'>Password: </label>
          <input
            type='password'
            id='password'
            value={password}
            disabled={fetching}
            ref={passwordInput}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && confPassInput.current) confPassInput.current.focus()
            }}
          />
          <br /><br />
          <label htmlFor='confirm-pass'>Confirm Password: </label>
          <input
            type='password'
            id='confirm-pass'
            value={confPass}
            ref={confPassInput}
            disabled={fetching}
            onChange={e => setConfPass(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') handleRegister()
            }}
          />
          <br /><br />
          <button
            onClick={handleRegister}
            disabled={!username || !password || !email || password !== confPass || invalidName}
          >
            Register
          </button>
        </form>
        {invalidName && <p>Only a-z, A-Z, 0-9 and underscores (_) are allowed in the forum slug!</p>}
        {statusCode === 409 && <p>This username is already taken!</p>}
        {statusCode !== 200 && statusCode !== 409 && <p>An unknown error occurred while trying to request.</p>}
        {password !== confPass && <p>The entered passwords do not match!</p>}
        <p>Already have an account?
          <AnchorLink href='/login'>
            <span style={{ color: 'blue' }}> Login</span>
          </AnchorLink>
        </p>
      </Layout>
    </React.StrictMode>
  )
}

export default Register
