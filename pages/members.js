import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import fetch from 'isomorphic-unfetch'
import useSWR from 'swr'
import Title from '../imports/title'
import Layout from '../imports/layout'
import AnchorLink from '../imports/anchorLink'
import useAuthentication from '../imports/useAuthentication'
import { ip } from '../config.json'

const Members = (props) => {
  const authenticated = useAuthentication()

  let accessToken
  const { data, revalidate, error } = useSWR(() => {
    accessToken = localStorage.getItem('accessToken')
    return ip + '/public/members'
  }, (url) => fetch(url, {
    headers: { authorization: accessToken }
  }).then(e => e.status === 200 ? e.json() : { status: e.status }), { initialData: props.members })

  useEffect(() => {
    if (authenticated) revalidate()
  }, [authenticated, revalidate])

  return (
    <React.StrictMode>
      <Title
        title='Members - Mythic'
        description='All members of the Mythic Minecraft community.'
        url='/members'
      />
      <Layout auth={authenticated}>
        {Array.isArray(data) && data.sort((a, b) => a.name.localeCompare(b.name)).map(member => (
          <div key={member.name}>
            <AnchorLink href='/profile/[username]' as={`/profile/${member.name}`}>
              <span style={{ color: 'blue' }}>{member.name}</span>
            </AnchorLink>
            <br />
            <span>Last seen on {new Date(member.lastLogin).toString()}</span>
            <hr />
          </div>
        ))}
        {!data && !error && <p>Loading...</p>}
        {data && (data.status === 401 || data.status === 403) && <p>You are not logged in!</p>}
        {((data && data.status && data.status !== 401 && data.status !== 403) || error) &&
          <p>An unknown error occurred.</p>}
      </Layout>
    </React.StrictMode>
  )
}

Members.propTypes = {
  members: PropTypes.array
}

export async function getServerSideProps (context) {
  try {
    const request = await fetch(ip + '/public/members')
    if (!request.ok) return { props: { members: null } }
    const response = await request.json()
    return { props: { members: response } }
  } catch (e) {
    console.error(e)
    return { props: { members: null } }
  }
}

export default Members
