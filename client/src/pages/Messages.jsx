import { Eye, MessageSquare } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'

const Messages = () => {
  const navigate = useNavigate()
  const { connections } = useSelector((state)=>state.connections);

  return (
    <div className='min-h-screen relative bg-gradient-to-b from-transition1 via-transition2 to-background'>
      <div className='max-w-6xl mx-auto p-6'>
        {/* Title */}
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-primary mb-2'>Messages</h1>
          <p className='text-foreground'>Talk to your friends and family</p>
        </div>
        {/* Connected Users */}
        <div className='flex flex-col gap-3'>
          {connections.map((user)=>(
            <div key={user._id} className='max-w-xl flex gap-5 p-6 bg-background shadow rounded-md'>
              <img src={user.profile_picture} className='rounded-full size-12 mx-auto' alt="User Profile Picture" />
              <div className='flex-1'>
                <p className='font-medium text-foreground'>{user.full_name}</p>
                <p className='text-foreground/85'>@{user.username}</p>
                <p className='text-sm text-foreground'>{user.bio}</p>
              </div>
              <div className='flex flex-col gap-2 mt-4'>
                <button className='size-10 flex items-center justify-center text-sm rounded bg-border/50 hover:bg-border/70 
                text-primary/95 active:scale-95 transition cursor-pointer gap-1' onClick={()=>navigate(`/messages/${user._id}`)}>
                  <MessageSquare className='w-4 h-4'/>
                </button>
                <button className='size-10 flex items-center justify-center text-sm rounded bg-border/50 hover:bg-border/70 
                text-primary/95 active:scale-95 transition cursor-pointer' onClick={()=>navigate(`/profile/${user._id}`)}>
                  <Eye className='w-4 h-4'/>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Messages
