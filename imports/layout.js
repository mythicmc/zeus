import React from 'react'
import PropTypes from 'prop-types'

const Layout = (props) => (
  <div style={props.style}>
    <style jsx global>
      {`
      body {}
      `}
    </style>
    <h2>mYtHiCC fOrUMs v3</h2>
    {props.children}
  </div>
)

Layout.propTypes = {
  style: PropTypes.object,
  children: PropTypes.node
}

export default Layout
