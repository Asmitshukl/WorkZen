import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';
import { getNavigationItems } from '@utils/permissions';
import {
  LayoutDashboard,
  Users,
  Calendar,
  Plane,
  DollarSign,
  FileText,
  User,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

const iconMap = {
  dashboard: LayoutDashboard,
  people: Users,
  calendar: Calendar,
  flight: Plane,
  money: DollarSign,
  chart: FileText,
  person: User
};

const Sidebar = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState([]);

  const navigationItems = getNavigationItems(user?.role);

  const toggleExpand = (name) => {
    setExpandedItems(prev =>
      prev.includes(name)
        ? prev.filter(item => item !== name)
        : [...prev, name]
    );
  };

  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <aside className="w-64 bg-gray-900 text-white flex-shrink-0">
      <div className="p-4 border-b border-gray-800">
        <h1 className="text-xl font-bold">HR Payroll</h1>
        <p className="text-sm text-gray-400">Management System</p>
      </div>

      <nav className="p-4 space-y-2">
        {navigationItems.map((item) => {
          const Icon = iconMap[item.icon];
          const expanded = expandedItems.includes(item.name);
          const hasChildren = item.children && item.children.length > 0;

          return (
            <div key={item.name}>
              {hasChildren ? (
                <button
                  onClick={() => toggleExpand(item.name)}
                  className="w-full flex items-center justify-between px-4 py-2 rounded hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-center">
                    {Icon && <Icon className="w-5 h-5 mr-3" />}
                    <span>{item.name}</span>
                  </div>
                  {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>
              ) : (
                <Link
                  to={item.path}
                  className={`flex items-center px-4 py-2 rounded transition-colors ${
                    isActive(item.path)
                      ? 'bg-blue-600 text-white'
                      : 'hover:bg-gray-800'
                  }`}
                >
                  {Icon && <Icon className="w-5 h-5 mr-3" />}
                  <span>{item.name}</span>
                </Link>
              )}

              {hasChildren && expanded && (
                <div className="ml-8 mt-1 space-y-1">
                  {item.children.map((child) => (
                    <Link
                      key={child.path}
                      to={child.path}
                      className={`block px-4 py-2 rounded text-sm transition-colors ${
                        isActive(child.path)
                          ? 'bg-blue-600 text-white'
                          : 'hover:bg-gray-800'
                      }`}
                    >
                      {child.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;