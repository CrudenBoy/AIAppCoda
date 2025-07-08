
import React, { useState } from 'react';
import type { ScreenView } from '../App'; // Assuming ScreenView is exported from App.tsx

interface HamburgerMenuProps {
  currentScreen: ScreenView;
  navigation: {
    navigateTo: (screen: ScreenView) => void;
    handleOpenAdminScreen: () => void;
  };
}

const HamburgerMenu: React.FC<HamburgerMenuProps> = ({ currentScreen, navigation }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  const commonLinks = [
    { label: 'Main Menu', screen: 'mainMenu' as ScreenView },
    { label: 'Presentation Screen', screen: 'presentation' as ScreenView },
    { label: 'View Tasks', screen: 'tasks' as ScreenView },
    { label: 'View Responses', screen: 'responses' as ScreenView },
  ];

  let menuLinks = commonLinks;

  if (currentScreen === 'admin') {
    menuLinks = [
        { label: 'Main Menu', screen: 'mainMenu' as ScreenView },
        { label: 'Presentation Screen', screen: 'presentation' as ScreenView },
        { label: 'View Tasks', screen: 'tasks' as ScreenView },
    ];
  } else {
    // Filter out the current screen from the common links
    menuLinks = commonLinks.filter(link => link.screen !== currentScreen);
  }


  return (
    <div className="relative">
      <button
        onClick={toggleMenu}
        className="p-2 text-gray-600 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
        aria-label="Open navigation menu"
        aria-expanded={isOpen}
      >
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
        </svg>
      </button>

      {isOpen && (
        <div 
            className="absolute left-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50"
            role="menu"
            aria-orientation="vertical"
            aria-labelledby="menu-button"
        >
          <div className="py-1" role="none">
            {menuLinks.map((link) => (
              <button
                key={link.screen}
                onClick={() => {
                  navigation.navigateTo(link.screen);
                  setIsOpen(false);
                }}
                disabled={currentScreen === link.screen}
                className={`block w-full text-left px-4 py-2 text-sm ${
                  currentScreen === link.screen 
                    ? 'bg-indigo-100 text-indigo-700 font-semibold' 
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
                role="menuitem"
              >
                {link.label}
              </button>
            ))}
           <button
               onClick={() => {
                 navigation.handleOpenAdminScreen();
                 setIsOpen(false);
               }}
               className={`block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900`}
               role="menuitem"
             >
               Settings
             </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HamburgerMenu;
