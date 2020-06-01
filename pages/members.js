import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import fetch from 'isomorphic-unfetch'
import useSWR from 'swr'
import Title from '../imports/title'
import Layout from '../imports/layout'
import AnchorLink from '../imports/anchorLink'
import useAuthentication from '../imports/useAuthentication'
import { ip } from '../config.json'

// TODO: SSR.
const Members = (props) => {
  const authenticated = useAuthentication()

  let accessToken
  const { data, revalidate } = useSWR(() => {
    accessToken = localStorage.getItem('accessToken')
    return ip + '/api/members'
  }, (url) => fetch(url, {
    headers: { authorization: accessToken }
  }).then(e => e.status === 200 ? e.json() : { status: e.status }), { initialData: props.members })

  useEffect(() => {
    if (authenticated && data && (data.status === 403 || data.status === 401)) revalidate()
  }, [authenticated, data, revalidate])

  return (
    <React.StrictMode>
      <Title
        title='Members - Mythic'
        description='All members of the Mythic Minecraft community.'
        url='/members'
      />
      <Layout>
        {Array.isArray(data) && data.map(member => (
          <div key={member.name}>
            <AnchorLink href='/profile/[username]' as={`/profile/${member.name}`}>
              <span style={{ color: 'blue' }}>{member.name}</span>
            </AnchorLink>
            <br />
            <span>Last seen on {new Date(member.lastLogin).toString()}</span>
            <hr />
          </div>
        ))}
        {!data && <p>Loading...</p>}
        {data && (data.status === 401 || data.status === 403) && <p>You are not logged in!</p>}
        {data && data.status && data.status !== 401 && data.status !== 403 &&
          <p>An unknown error occurred.</p>}
      </Layout>
    </React.StrictMode>
  )
}

Members.propTypes = {
  members: PropTypes.array
}

/*
export async function getServerSideProps (context) {
  const request = await fetch(ip + '/api/members')
  // Error handling.
  const response = await request.json()
  return { props: { members: response } }
}
*/

export default Members
