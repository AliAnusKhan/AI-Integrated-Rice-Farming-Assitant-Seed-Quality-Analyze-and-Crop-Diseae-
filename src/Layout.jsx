import React from 'react'
import Sidebar from './components/Sidebar'
import InstallPrompt from './pages/beforeinstallprompt' 

const Layout = ({ children }) => {
  return (
    <div className="flex h-screen overflow-hidden bg-[#f8fcf8]">
      <Sidebar />
      <div className="flex-1 h-full overflow-y-auto">
        <InstallPrompt />
        {children}
      </div>
    </div>
  )
}

export default Layout
