import React from 'react'

const Loading = ({height = '100vh'}) => {
  return (
    <div className='flex items-center justify-center h-screen' style={{height}}>
      <div className='w-10 h-10 rounded-full border-3 border-purple-500 border-t-transparent animate-spin'>

      </div>
    </div>
  )
}

export default Loading
