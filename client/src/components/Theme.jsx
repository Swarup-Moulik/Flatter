import { Moon, Sun } from 'lucide-react';
import React, { useEffect, useState } from 'react';

const Theme = () => {
    const [isDark, setIsDark] = useState(true);
    const toggletheme = () => {
        if (isDark) {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
            setIsDark(false);
        } else {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
            setIsDark(true);
        }
    }
    useEffect(() => {
        const storedtheme = localStorage.getItem('theme');
        if (storedtheme === 'dark' || storedtheme === null) {
            setIsDark(true);
            document.documentElement.classList.add('dark');
        } else {
            setIsDark(false);
            document.documentElement.classList.add('light');
        }
    }, [])
    return (
        <button onClick={toggletheme}
            className="p-2 rounded-full transition-colors duration-300 focus:outline-hidden cursor-pointer">
                {isDark ? <Sun className='w-6 h-6 text-yellow-300' /> : <Moon className='w-6 h-6 text-blue-900' />}
        </button>
    )
}

export default Theme