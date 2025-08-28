import React from 'react'
import { assets, dummyUserData } from '../assets/assets'
import { Link, useNavigate } from 'react-router-dom'
import MenuItems from './MenuItems';
import { CirclePlus, LogOut } from 'lucide-react';
import { useClerk, UserButton } from '@clerk/clerk-react';
import { useSelector } from 'react-redux';
import Theme from './Theme';

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
    const navigate = useNavigate();
    const user = useSelector((state) => state.user.value);
    const { signOut } = useClerk();
    return (
        <div className={`w-60 xl:w-72 bg-background border-r border-border/30 flex flex-col justify-between items-center max-sm:absolute
        top-0 bottom-0 z-20 ${sidebarOpen ? 'translate-x-0' : 'max-sm:-translate-x-full'} transition-all duration-300 ease-in-out`}>
            <div className='w-full'>
                <div className='flex justify-evenly'>
                    <img onClick={() => navigate('/')} src={assets.logo} className='w-35 h-16 my-2 cursor-pointer' alt="Logo" />
                    <Theme />
                </div>
                <hr className='mb-8 border-border/70' />
                <MenuItems setSidebarOpen={setSidebarOpen} />
                <Link to={'/create-post'} className='flex items-center justify-center gap-2 py-2.5 mt-6 mx-6 rounded-lg transition
                bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-700 hover:to-purple-800 active:scale-95
                text-white cursor-pointer'>
                    <CirclePlus className='w-5 h-6' />
                    Create Post
                </Link>
            </div>
            <div className='w-full border-t border-border/70 p-4 px-7 flex items-center justify-between'>
                <div className='flex gap-2 items-center cursor-pointer'>
                    <UserButton />
                    <div>
                        <h1 className='text-sm font-medium'>{user.full_name}</h1>
                        <p className='text-sm text-foreground'>@{user.username}</p>
                    </div>
                </div>
                <LogOut className='w-4.5 text-foreground/70 hover:text-foreground transition cursor-pointer' onClick={signOut} />
            </div>
        </div>
    )
}

export default Sidebar
