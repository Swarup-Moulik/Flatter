import React from 'react'
import { menuItemsData } from '../assets/assets'
import { NavLink } from 'react-router-dom'

const MenuItems = ({setSidebarOpen}) => {
  return (
    <div className='px-6 text-foreground/90 space-y-1 font-medium'>
      {menuItemsData.map(({to, label, Icon})=>(
        <NavLink key={to} to={to} end={to === '/'} onClick={()=>setSidebarOpen(false)} className={({isActive})=>`px-3.5 py-2 flex
        items-center gap-3 rounded-xl ${isActive ? 'bg-background text-indigo-500' : 'hover:bg-border/30'}`}>
            <Icon className='w-5 h-5'/>
            {label}
        </NavLink>
      ))}
    </div>
  )
}

export default MenuItems
