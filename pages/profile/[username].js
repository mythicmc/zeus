import React, { useEffect } from 'react'
import { useRouter } from 'next/router'
import PropTypes from 'prop-types'
import fetch from 'isomorphic-unfetch'
import useSWR from 'swr'
import Title from '../../imports/title'
import Layout from '../../imports/layout'
import useAuthentication from '../../imports/useAuthentication'
import { ip } from '../../config.json'

// TODO: More info (post count, recent posts, etc), data like avatar, role, email, IP.
const Profile = (props) => {
  const router = useRouter()
  const authenticated = useAuthentication()
  const username = props.username || router.query.username

  let accessToken
  const { data, revalidate } = useSWR(() => {
    accessToken = localStorage.getItem('accessToken')
    return ip + `/public/member/${username}`
  }, (url) => fetch(url, {
    headers: { authorization: accessToken }
  }).then(e => e.status === 200 ? e.json() : { status: e.status }), { initialData: props.member })

  useEffect(() => {
    if (authenticated && data && (data.status === 403 || data.status === 401)) revalidate()
  }, [authenticated, data, revalidate])

  return (
    <React.StrictMode>
      <Title
        title={`${username || 'Member Profile'} - Mythic`}
        description={username ? `Profile of member of user ${username}.` : 'Loading...'}
        url={`/profile/${username}`}
      />
      <Layout auth={authenticated}>
        {data && !data.status && (
          <>
            <p>Username: {data.name}</p>
            <p>Last logged in on {new Date(data.lastLogin).toString()}</p>
            <p>Joined the forums on {new Date(data.createdOn).toString()}</p>
          </>
        )}
        {!data && <p>Loading...</p>}
        {data && (data.status === 401 || data.status === 403) && <p>You are not logged in!</p>}
        {data && data.status && data.status !== 401 && data.status !== 403 &&
          <p>An unknown error occurred.</p>}
      </Layout>
    </React.StrictMode>
  )
}

Profile.propTypes = {
  username: PropTypes.string,
  member: PropTypes.object
}

export async function getServerSideProps (context) {
  const username = context.params.username
  try {
    const request = await fetch(ip + `/public/member/${username}`)
    if (!request.ok) return { props: { member: null, username } }
    const response = await request.json()
    return { props: { member: response, username } }
  } catch (e) {
    console.error(e)
    return { props: { member: null, username } }
  }
}

export default Profile
