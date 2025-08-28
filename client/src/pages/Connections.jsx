import { useNavigate } from 'react-router-dom'
import { MessageSquare, UserCheck, UserPlus, UserRoundPen, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useAuth } from '@clerk/clerk-react';
import { fetchConnections } from '../features/connections/connectionsSlice';
import api from '../api/axios';
import toast from 'react-hot-toast';

const Connections = () => {
  const [currentTab, setCurrentTab] = useState('Followers');
  const navigate = useNavigate();
  const { connections, pendingConnections, followers, following } = useSelector((state) => state.connections);
  const dispatch = useDispatch();
  const { getToken } = useAuth();

  const dataArray = [
    { label: 'Followers', value: followers, icon: Users },
    { label: 'Following', value: following, icon: UserCheck },
    { label: 'Pending', value: pendingConnections, icon: UserRoundPen },
    { label: 'Connections', value: connections, icon: UserPlus }
  ];

  const handleUnfollow = async (userId) => {
    try {
      const token = await getToken();
      const { data } = await api.post('/api/user/unfollow', { id: userId }, { headers: { Authorization: `Bearer ${token}` } });
      if (data.success) {
        toast.success(data.message);
        dispatch(fetchConnections(token));
      } else {
        toast(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };
  
  const acceptConnection = async (userId) => {
    try {
      const token = await getToken();
      const { data } = await api.post('/api/user/accept', { id: userId }, { headers: { Authorization: `Bearer ${token}` } });
      if (data.success) {
        toast.success(data.message);
        dispatch(fetchConnections(token));
      } else {
        toast(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const cancelRequest = async (userId) => {
    try {
      const token = await getToken();
      const { data } = await api.post('/api/user/cancel-request', { id: userId }, { headers: { Authorization: `Bearer ${token}` } });
      if (data.success) {
        toast.success(data.message);
        dispatch(fetchConnections(token));
      } else {
        toast(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    getToken().then((token) => dispatch(fetchConnections(token)));
  }, []);

  return (
    <div className='min-h-screen bg-gradient-to-b from-transition1 to-background'>
      <div className='max-w-6xl mx-auto p-6'>
        {/* Title */}
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-primary mb-2'>Connections</h1>
          <p className='text-foreground'>Manage your network and discover new connections.</p>
        </div>

        {/* Counts */}
        <div className='mb-8 flex flex-wrap gap-6'>
          {dataArray.map((item, index) => (
            <div key={index} className='flex flex-col items-center justify-center gap-1 h-20 w-40 bg-background
             shadow rounded-md'>
              <b>{Array.isArray(item.value) ? item.value.length : (item.value?.incoming?.length || 0) + (item.value?.outgoing?.length || 0)}</b>
              <p className='text-foreground'>{item.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className='inline-flex flex-wrap items-center border border-border/40 rounded-md p-1 bg-background shadow-sm'>
          {dataArray.map((tab) => (
            <button
              key={tab.label}
              className={`flex items-center px-3 py-1 text-sm rounded-md transition-colors cursor-pointer 
                ${currentTab === tab.label ? 'font-medium text-primary' : 'text-foreground hover:text-primary'}`}
              onClick={() => setCurrentTab(tab.label)}
            >
              <tab.icon className='w-4 h-4' />
              <span className='ml-1'>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Connections */}
        <div className='flex flex-wrap gap-6 mt-6'>

          {/* PENDING SPECIAL CASE */}
          {currentTab === 'Pending' ? (
            <div className="flex flex-col gap-6 w-full">
              {/* Incoming */}
              {pendingConnections.incoming?.length > 0 && (
                <div>
                  <h2 className="font-semibold text-slate-700 mb-3">Requests you received</h2>
                  {pendingConnections.incoming.map(user => (
                    <div key={user._id} className="w-full max-w-88 flex gap-5 p-6 bg-background shadow rounded-md">
                      <img src={user.profile_picture} className="rounded-full w-12 h-12 shadow-md" alt="User" />
                      <div className="flex-1">
                        <p className="font-medium">{user.full_name}</p>
                        <p className="text-foreground">@{user.username}</p>
                        <div className="mt-3 flex gap-2">
                          <button
                            className="w-full p-2 text-sm rounded bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700"
                            onClick={() => acceptConnection(user._id)}
                          >
                            Accept
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Outgoing */}
              {pendingConnections.outgoing?.length > 0 && (
                <div className="mt-6">
                  <h2 className="font-semibold text-foreground mb-3">Requests you sent</h2>
                  {pendingConnections.outgoing.map(user => (
                    <div key={user._id} className="w-full max-w-88 flex gap-5 p-6 bg-background shadow rounded-md">
                      <img src={user.profile_picture} className="rounded-full w-12 h-12 shadow-md" alt="User" />
                      <div className="flex-1">
                        <p className="font-medium">{user.full_name}</p>
                        <p className="text-foreground/90">@{user.username}</p>
                        <div className="mt-3 flex gap-2">
                          <button
                            className="w-full p-2 text-sm rounded bg-border/55 hover:bg-border/65"
                            onClick={() => cancelRequest(user._id)}
                          >
                            Cancel Request
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            // DEFAULT RENDER FOR OTHER TABS
            dataArray.find((item) => item.label === currentTab).value.map((user) => (
              <div key={user._id} className='w-full max-w-88 flex gap-5 p-6 bg-background shadow rounded-md'>
                <img src={user.profile_picture} className='rounded-full w-12 h-12 shadow-md mx-auto' alt="User Profile" />
                <div className='flex-1'>
                  <p className='font-medium text-foreground'>{user.full_name}</p>
                  <p className='text-foreground/90'>@{user.username}</p>
                  <p className='text-sm text-foreground'>{user.bio ? `${user.bio.slice(0, 30)}...` : 'No bio'}</p>
                  <div className='flex max-sm:flex-col gap-2 mt-4'>
                    <button
                      className='w-full p-2 text-sm rounded bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white'
                      onClick={() => navigate(`/profile/${user._id}`)}
                    >
                      View Profile
                    </button>
                    {currentTab === 'Following' && (
                      <button
                        className='w-full p-2 text-sm rounded bg-border/55 hover:bg-border/65'
                        onClick={() => handleUnfollow(user._id)}
                      >
                        Unfollow
                      </button>
                    )}
                    {currentTab === 'Connections' && (
                      <button
                        className='w-full p-2 text-sm rounded bg-border/55 hover:bg-border/65 flex items-center justify-center gap-1'
                        onClick={() => navigate(`/messages/${user._id}`)}
                      >
                        <MessageSquare className='w-4 h-4' /> Message
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}

        </div>
      </div>
    </div>
  )
}

export default Connections;
