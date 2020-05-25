import React from 'react'
import Link from 'next/link'
import PropTypes from 'prop-types'

const AnchorLink = (props) => (
  <Link passHref href={props.href} as={props.as} prefetch={props.prefetch}>
    <a style={{ textDecoration: 'none', color: 'inherit' }}>
      {props.children}
    </a>
  </Link>
)

AnchorLink.propTypes = {
  href: PropTypes.string.isRequired,
  as: PropTypes.string,
  prefetch: PropTypes.bool,
  children: PropTypes.node.isRequired
}

export default AnchorLink
