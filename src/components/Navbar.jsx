import React from 'react'
import { GraduationCap } from 'lucide-react'

const Navbar = () => {
  return (
    <div className="flex items-center gap-3 p-4 border-b border-gray-200 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <GraduationCap size={20} />
      <span className="font-semibold">ECS Dashboard</span>
    </div>
  )
}

export default Navbar


