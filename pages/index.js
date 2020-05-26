import React from 'react'
import Title from '../imports/title'
import Layout from '../imports/layout'

const Index = () => {
  return (
    <React.StrictMode>
      <Title
        title='Forums - Mythic'
        description='Forums for the Mythic Minecraft community.'
        url='/'
      />
      <Layout />
    </React.StrictMode>
  )
}

export default Index
