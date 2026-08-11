import React from 'react'
import LoginForm from './LoginForm'

const page = async ({ searchParams }: { searchParams: Promise<{ reset?: string }> }) => {
  const params = await searchParams
  const resetSuccess = params.reset === "success"
  return (
    <LoginForm resetSuccess={resetSuccess} />
  )
}

export default page