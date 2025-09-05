import React from 'react'

const Loading = ({height = '100vh'}) => {
  return (
    <div className='flex items-center justify-center h-screen bg-gradient-to-b from-transition1 via-transition2 to-background' style={{height}}>
      <div className='w-10 h-10 rounded-full border-3 border-rose-800 border-t-transparent animate-spin'>

      </div>
    </div>
  )
}

export default Loading
