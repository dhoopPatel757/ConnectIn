import React, { useContext, useEffect, useState } from 'react'
import Nav from '../components/Nav.jsx'
import { AuthDataContext } from '../context/AuthContext.jsx'
import { UserDataContext } from '../context/UserContext.jsx'
import axios from 'axios'
import profilepicture from '../assets/profile.png'


const Notification = () => {
    const { serverUrl } = useContext(AuthDataContext)
    const { socket, userData } = useContext(UserDataContext)

    const [notificationData, setNotificationData] = useState([])
    const [loading, setLoading] = useState(false)
    const [clearing, setClearing] = useState(false)
    const [message, setMessage] = useState("")

    const handleGetNotifications = async () => {
        try {
            setLoading(true)
            const res = await axios.get(`${serverUrl}/api/notifications`, { withCredentials: true })
            setNotificationData(res.data.notifications || [])
        } catch (err) {
            console.error('fetch notifications error', err)
            const serverMsg = err?.response?.data?.message || err.message || 'notifications could not be fetched'
            setMessage(serverMsg)
        } finally {
            setLoading(false)
        }
    }

    const handleDeleteNotification = async (id) => {
        try {
            await axios.delete(`${serverUrl}/api/notifications/${id}`, { withCredentials: true })
            setNotificationData(prev => prev.filter(n => n._id !== id))
        } catch (err) {
            console.error('delete notification error', err)
        }
    }

    const handleClearAll = async () => {
        if (!notificationData.length) return
        const previous = notificationData;
        // Optimistic UI: clear immediately
        setNotificationData([]);
        setClearing(true);
        try {
            await axios.delete(`${serverUrl}/api/notifications/clear`, { withCredentials: true });
            setMessage('All notifications cleared')
            setTimeout(() => setMessage(''), 3000)
        } catch (err) {
            console.error('clear notifications error', err)
            // restore previous on failure
            setNotificationData(previous);
            const serverMsg = err?.response?.data?.message || err.message || 'Could not clear notifications';
            setMessage(serverMsg);
            setTimeout(() => setMessage(''), 4000)
        } finally {
            setClearing(false)
        }
    }

    useEffect(() => {
        // only fetch notifications once the user is loaded (so auth cookie/token should be present)
        if (!userData) return
        handleGetNotifications()
    }, [userData])

    useEffect(() => {
        if (!socket) return
        const handler = (notification) => setNotificationData(prev => [notification, ...prev])
        socket.on('newNotification', handler)
        return () => socket.off('newNotification', handler)
    }, [socket])

    return (
        <div className="w-screen min-h-screen bg-[#F4F2EE] pt-[100px] px-[20px] flex flex-col gap-[15px]">
            <Nav />

            <div className="w-full bg-white shadow rounded-2xl flex items-center justify-between px-6 py-4">
                <div className="text-[22px] text-gray-700 font-semibold">Notifications</div>
                <div className="text-sm text-gray-500">{notificationData.length} items</div>
                <div>
                    <button onClick={handleClearAll} disabled={clearing || notificationData.length===0} className={`ml-4 ${clearing ? 'bg-red-300' : 'bg-red-500 hover:bg-red-600'} text-white px-3 py-2 rounded-md text-sm`}>
                        {clearing ? 'Clearing...' : 'Clear All'}
                    </button>
                </div>
            </div>

            {loading && <div className="text-center text-gray-500 mt-4">Loading...</div>}
            {message && <div className="text-center text-sm text-green-600 mt-3">{message}</div>}

            {notificationData.length > 0 ? (
                <div className="w-full bg-white shadow rounded-2xl flex flex-col gap-[12px] p-[12px]">
                    {notificationData.map(notification => (
                        <div key={notification._id} className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 pr-12 sm:pr-4 rounded-lg bg-white hover:shadow-lg hover:-translate-y-0.5 transition-all duration-150">
                            <button onClick={() => handleDeleteNotification(notification._id)} aria-label="Delete notification" className="absolute right-3 top-3 z-50 bg-white rounded-full p-2 shadow-sm hover:bg-gray-100 text-gray-600">✕</button>

                            <div className="flex items-center gap-[12px] w-full">
                                <div className="w-[55px] h-[55px] rounded-full overflow-hidden">
                                    <img src={notification.relatedUser?.profileImage || profilepicture} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex flex-col">
                                    <div className="font-semibold text-[16px]">{notification.relatedUser?.firstname} {notification.relatedUser?.lastname}</div>
                                    <div className="text-[13px] text-gray-500">{notification.relatedUser?.headline}</div>
                                </div>
                            </div>

                            <div className="flex-1 flex flex-col sm:flex-row items-start sm:items-center justify-between pl-0 sm:pl-3 mt-3 sm:mt-0">
                                <div className="flex-1">
                                    <div className="text-sm text-gray-600">
                                        <span className="font-semibold text-gray-800">{notification.relatedUser?.firstname} {notification.relatedUser?.lastname}</span>
                                        <span className="ml-2">{
                                            notification.type === 'like' ? 'liked your post' :
                                            notification.type === 'comment' ? 'commented on your post' :
                                            notification.type === 'connection_accept' ? 'accepted your connection' : ''
                                        }</span>
                                    </div>

                                    {notification.type === 'comment' && notification.commentText && (
                                        <div className="mt-2 bg-gray-50 border border-gray-100 rounded-md p-3 text-sm text-gray-700 max-w-[640px]">{notification.commentText}</div>
                                    )}

                                    {notification.type !== 'comment' && notification.relatedPost?.description && (
                                        <div className="text-sm text-gray-600 mt-2 line-clamp-2">{notification.relatedPost.description}</div>
                                    )}

                                    <div className="text-xs text-gray-400 mt-2">{new Date(notification.createdAt).toLocaleString()}</div>
                                </div>

                                {notification.relatedPost && (notification.relatedPost.image?.url || notification.relatedPost.image) ? (
                                    <div className="hidden sm:block w-[80px] h-[80px] ml-4 rounded overflow-hidden bg-gray-100 flex-shrink-0">
                                        <img src={notification.relatedPost.image?.url || notification.relatedPost.image} alt="post" className="w-full h-full object-cover" />
                                    </div>
                                ) : null}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="w-full bg-white shadow rounded-2xl p-8 text-center text-gray-500">No notifications</div>
            )}
        </div>
    )
}

export default Notification


