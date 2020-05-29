import React from 'react'
import PropTypes from 'prop-types'
import AnchorLink from './anchorLink'

const Layout = (props) => (
  <div style={props.style}>
    <style jsx global>
      {`
      body {}
      `}
    </style>
    <div style={{ padding: 8, border: 'black 1px solid', marginBottom: '1em', display: 'flex', alignItems: 'center' }}>
      <h2>mYtHiCC fOrUMs v3</h2>
      <div style={{ flex: 1 }} />
      <AnchorLink href='/login'>Login</AnchorLink> {/* TODO: Log out button. */}
    </div>
    {props.children}
  </div>
)

Layout.propTypes = {
  style: PropTypes.object,
  children: PropTypes.node
}

export default Layout
