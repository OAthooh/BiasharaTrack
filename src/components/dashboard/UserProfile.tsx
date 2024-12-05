import { useState } from 'react';
import { User, Settings, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { User as UserType } from '../../types/user';

interface UserProfileProps {
  user: UserType;
}

export default function UserProfile({ user }: UserProfileProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="w-full flex items-center px-3 py-3 text-[#FDFFFC] hover:bg-[#2EC4B6]/10 rounded-lg transition-colors group"
      >
        <div className="flex-shrink-0">
          {user.imageUrl ? (
            <img
              src={user.imageUrl}
              alt={user.name}
              className="h-10 w-10 rounded-full object-cover border-2 border-[#2EC4B6]"
            />
          ) : (
            <div className="h-10 w-10 rounded-full bg-[#2EC4B6]/20 flex items-center justify-center">
              <User className="h-6 w-6 text-[#2EC4B6]" />
            </div>
          )}
        </div>
        <div className="ml-3 flex-1 min-w-0">
          <div className="text-sm font-medium truncate">{user.name}</div>
          <div className="text-xs text-[#FDFFFC]/70 truncate">{user.email}</div>
        </div>
        <ChevronDown className={`ml-2 h-4 w-4 text-[#FDFFFC]/70 transition-transform ${
          isMenuOpen ? 'transform rotate-180' : ''
        }`} />
      </button>

      {isMenuOpen && (
        <div className="absolute top-full left-0 w-full mt-1 bg-[#011627] rounded-lg shadow-lg border border-[#FDFFFC]/10 py-1 z-50">
          <div className="px-3 py-2 border-b border-[#FDFFFC]/10">
            <div className="text-xs text-[#FDFFFC]/70">Business</div>
            <div className="text-sm font-medium text-[#FDFFFC] truncate">
              {user.businessName}
            </div>
          </div>
          <Link
            to="/dashboard/profile"
            className="flex items-center px-3 py-2 text-sm text-[#FDFFFC] hover:bg-[#2EC4B6]/10"
          >
            <Settings className="h-4 w-4 mr-2" />
            Account Settings
          </Link>
        </div>
      )}
    </div>
  );
}