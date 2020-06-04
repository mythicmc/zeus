import React from 'react'
import PropTypes from 'prop-types'
import { useRouter } from 'next/router'
import fetch from 'isomorphic-unfetch'
import AnchorLink from './anchorLink'
import { ip } from '../config.json'

const Layout = (props) => {
  const router = useRouter()
  const logout = async () => {
    const authorization = localStorage.getItem('accessToken')
    if (authorization) {
      try { await fetch(`${ip}/logout`, { headers: { authorization } }) } catch (e) {}
      localStorage.removeItem('accessToken')
      router.reload()
    }
  }

  return (
    <div style={props.style}>
      <style jsx global>
        {`
        body {}
        `}
      </style>
      <div style={{ padding: 8, border: 'black 1px solid', marginBottom: '1em', display: 'flex', alignItems: 'center' }}>
        <h2>mYtHiCC fOrUMs v3</h2>
        <div style={{ flex: 1 }} />
        {props.auth
          ? <span style={{ cursor: 'pointer' }} onClick={logout}>Logout</span>
          : router.pathname !== '/login' && <AnchorLink href='/login'>Login</AnchorLink>}
      </div>
      {props.children}
    </div>
  )
}

Layout.propTypes = {
  style: PropTypes.object,
  children: PropTypes.node,
  auth: PropTypes.oneOfType([PropTypes.object, PropTypes.bool])
}

export default Layout
