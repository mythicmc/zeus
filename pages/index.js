import React from 'react'
import Title from '../imports/title'
import Layout from '../imports/layout'
import useAuthentication from '../imports/useAuthentication'

const Index = () => {
  const authentication = useAuthentication()

  return (
    <React.StrictMode>
      <Title
        title='Forums - Mythic'
        description='Forums for the Mythic Minecraft community.'
        url='/'
      />
      <Layout>
        Logged in status: {JSON.stringify(authentication)}
      </Layout>
    </React.StrictMode>
  )
}

export default Index
