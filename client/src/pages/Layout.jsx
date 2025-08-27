import React, { useState } from 'react'
import Sidebar from '../components/Sidebar'
import { Outlet } from 'react-router-dom'
import { Menu, X } from 'lucide-react';
import { dummyUserData } from '../assets/assets';
import Loading from '../components/Loading';
import { useSelector } from 'react-redux';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const user = useSelector((state)=>state.user.value);
  return user ? (
    <div className='w-full flex h-screen'>
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}/>
      <div className='flex-1 bg-foreground/5'>
        <Outlet />
      </div>
      {sidebarOpen ?
        <X className='absolute top-3 right-3 p-2 z-100 bg-background rounded-md shadow w-10 h-10 text-foreground/90 sm:hidden' 
        onClick={()=>setSidebarOpen(false)}/>
        :
        <Menu className='absolute top-3 right-3 p-2 z-100 bg-background rounded-md shadow w-10 h-10 text-foreground/90 sm:hidden'
        onClick={()=>setSidebarOpen(true)}/>
      }
    </div>
  ) : (
    <Loading />
  )
}

export default Layout
