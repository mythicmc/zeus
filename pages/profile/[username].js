import React, { useEffect } from 'react'
import { useRouter } from 'next/router'
import PropTypes from 'prop-types'
import fetch from 'isomorphic-unfetch'
import useSWR from 'swr'
import Title from '../../imports/title'
import Layout from '../../imports/layout'
import useAuthentication from '../../imports/useAuthentication'
import { ip } from '../../config.json'

// TODO: More info (post count, recent posts, etc), data like avatar, role, email, IP and SSR.
const Profile = (props) => {
  const router = useRouter()
  const authenticated = useAuthentication()
  const username = props.username || router.query.username

  let accessToken
  const { data, revalidate } = useSWR(() => {
    accessToken = localStorage.getItem('accessToken')
    if (!username) return
    return ip + `/api/member/${username}`
  }, (url) => fetch(url, {
    headers: { authorization: accessToken }
  }).then(e => e.status === 200 ? e.json() : { status: e.status }), { initialData: props.member })

  useEffect(() => {
    if (authenticated && data && (data.status === 403 || data.status === 401)) revalidate()
  }, [authenticated, data, revalidate])

  return (
    <React.StrictMode>
      <Title
        title={`${data ? data.name : 'Member Profile'} - Mythic`}
        description={data ? `Profile of member of user ${data.name}.` : 'Loading...'}
        url={`/profile/${username}`}
      />
      <Layout>
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

/*
export async function getServerSideProps (context) {
  const username = context.params.username // Remove !username checks from main code.
  const request = await fetch(ip + `/api/member/${username}`)
  // Error handling.
  const response = await request.json()
  return { props: { username: response, member } }
}
*/

export default Profile
