import fetch from 'isomorphic-unfetch'
import useSWR from 'swr'
import { ip } from '../config.json'
import { useState, useEffect } from 'react'

/**
 * @return {null|boolean} True if authenticated, null if uncertain, false if not.
 */
const useAuthentication = () => {
  const [authenticated, setAuthenticated] = useState(null)

  // TODO: Wait for self-member endpoint to get data about the member instead of returning true.
  let accessToken
  const { data, revalidate } = useSWR(() => {
    accessToken = localStorage.getItem('accessToken')
    return ip + '/api/forums'
  }, (url) => fetch(url, {
    headers: { authorization: accessToken }
  }))

  useEffect(() => {
    (async () => {
      if (data && data.status === 200) setAuthenticated(true)
      else if (data && (data.status === 401 || data.status === 403)) {
        let refreshToken
        try { refreshToken = localStorage.getItem('refreshToken') } catch (e) { return }
        if (refreshToken && refreshToken !== 'null') {
          const request = await fetch(ip + '/refreshToken', { headers: { authorization: refreshToken } })
          if (request.status === 200) {
            localStorage.setItem('accessToken', (await request.json()).accessToken)
            setAuthenticated(null)
            await revalidate()
            return
          }
        }
        setAuthenticated(false)
      } else setAuthenticated(null)
    })()
  }, [data, revalidate])

  return authenticated
}

export default useAuthentication
