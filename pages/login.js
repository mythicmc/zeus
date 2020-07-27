import React, { useState, useRef } from 'react'
import { useRouter } from 'next/router'
import fetch from 'isomorphic-unfetch'
import Title from '../imports/title'
import Layout from '../imports/layout'
import AnchorLink from '../imports/anchorLink'
import useAuthentication from '../imports/useAuthentication'
import { ip } from '../config.json'

const Login = () => {
  const router = useRouter()
  const passwordInput = useRef()
  const authenticated = useAuthentication()
  if (authenticated) {
    router.back()
  }

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [fetching, setFetching] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [statusCode, setStatusCode] = useState(200) // Expected values: 200, 403, 500

  const handleLogin = async () => {
    if (!username || !password) return
    try {
      setFetching(true)
      const request = await fetch(ip + '/login', {
        headers: { username, password, rememberMe }
      })
      if (request.status === 200) {
        const result = await request.json()
        localStorage.setItem('accessToken', result.accessToken)
        localStorage.setItem('refreshToken', result.refreshToken)
        router.push(router.query.redirect || '/')
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
        title='Log In - Mythic'
        description='Login page for the Mythic forums.'
        url='/login'
      />
      <Layout auth={authenticated}>
        <form onSubmit={e => e.preventDefault()}>
          <label htmlFor='username'>Username: </label>
          <input
            type='text'
            id='username'
            value={username}
            disabled={fetching}
            onChange={e => setUsername(e.target.value)}
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
              if (e.key === 'Enter') handleLogin()
            }}
          />
          <br /><br />
          <label htmlFor='remember-me'>Remember Me: </label>
          <input
            type='checkbox'
            id='remember-me'
            value={rememberMe}
            disabled={fetching}
            onChange={e => setRememberMe(e.target.value)}
          />
          <br /><br />
          <button onClick={handleLogin} disabled={fetching || !username || !password}>Login</button>
        </form>
        {statusCode === 401 && <p>Invalid username or password!</p>}
        {statusCode !== 200 && statusCode !== 401 && <p>An unknown error occurred while trying to request.</p>}
        <p>Don&apos;t have an account?
          <AnchorLink href='/register'>
            <span style={{ color: 'blue' }}> Register</span>
          </AnchorLink>
        </p>
      </Layout>
    </React.StrictMode>
  )
}

export default Login
