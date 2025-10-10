import React, { useCallback, useEffect, useState } from 'react'
import Navbar from './Navbar'
import { Sidebar } from 'lucide-react'
import { Outlet } from 'react-router-dom';
import axios, { Axios } from 'axios'

const Layout = ({onLogout, user}) => {

   const [tasks, setTasks] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);

   const fetchTasks = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem('token');
            if(!token) throw new Error("No Auth Token Found")
            const {data} = await axios.get("http://localhost:4000/api/tasks/gp" , {
                headers: {Authorization: `Bearer ${token}`}
            })  
            
            const arr = Array.isArray(data) ? data :
                Array.isArray(data?.tasks) ? data.tasks :
                    Array.isArray(data?.data) ? data.data : []
            setTasks(arr)
        } 
        catch (err) {
            console.error(err);
            setError(err.message || "Could not load tasks.")
            if(err.response?.status === 401) onLogout()
        }
        finally{
            setLoading(false)
        }
   }, [onLogout])

   useEffect(() => { fetchTasks()}, [fetchTasks])
   
  return (
    <div className='min-h-screen bg-gray-50'>
        <Navbar user={user} onLogout={onLogout}/>
        <Sidebar user={user} tasks={tasks}/>

        <div className='ml-0 xl:ml-64 lg:ml-64 md:ml-16 pt-16 p-3 sm:p-4 md:p-4 transition-all duration-300'>
            <div className='grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6 '>
                <div className='xl:col-span-2 space-y-3 sm:space-y-4 '>
                    <Outlet context={{tasks, refreshTasks: fetchTasks}} />

                    

                </div>

            </div>

        </div>
    </div>
  )
}

export default Layout