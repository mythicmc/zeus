import React from 'react'
import PropTypes from 'prop-types'

const Layout = (props) => (
  <div style={props.style}>
    <style jsx global>
      {`
      body {}
      `}
    </style>
    {props.children}
  </div>
)

Layout.propTypes = {
  style: PropTypes.object,
  children: PropTypes.node.isRequired
}

export default Layout
