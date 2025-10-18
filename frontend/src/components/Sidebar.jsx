import React from 'react'
import { SIDEBAR_CLASSES } from '../assets/dummy'

const Sidebar = (user, tasks) => {
    return (
        <>
        {/* Desktop Sidebar */}
        <div className={SIDEBAR_CLASSES.desktop}>
            <div className='p-5 border-b border-purple-100 lg:block hidden'>
                <div className='flex items-center gap-3 '>
                    <div className='w-10 h-10 rounded-full bg-gradient-to-br from-fuchsia-500 to-purple-600
                    flex items-center justify-center text-white font-bold shadow-md'>
                        {intital}
                    </div>
                </div>
            </div>
        </div>
        </>
    )
}

export default Sidebar