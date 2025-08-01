import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Group, Menu, Avatar, ActionIcon, Indicator } from '@mantine/core';
import { 
  IconArrowLeft, 
  IconSun, 
  IconMoon, 
  IconBell, 
  IconUser, 
  IconSettings, 
  IconLogout,
  IconCalendar
} from '@tabler/icons-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const FullPageLayout = ({ children }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const handleBackClick = () => {
    navigate(-1);
  };

  const handleLogout = () => {
    logout();
    navigate('/auth/login');
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header pleine largeur optimisé */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="w-full px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Section gauche : Logo + Navigation */}
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3">
                <IconCalendar className="h-8 w-8 text-emerald-600" />
                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                    Planning Interactif
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Vision complète du planning
                  </p>
                </div>
              </div>
              
              <Button
                variant="light"
                leftSection={<IconArrowLeft size={16} />}
                onClick={handleBackClick}
                className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
              >
                Retour
              </Button>
            </div>

            {/* Section droite : Actions utilisateur */}
            <div className="flex items-center space-x-4">
              {/* Toggle thème */}
              <ActionIcon
                variant="light"
                onClick={toggleTheme}
                size="lg"
                className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
              >
                {isDark ? <IconSun size={20} /> : <IconMoon size={20} />}
              </ActionIcon>

              {/* Notifications */}
              <Indicator inline label="3" size={16} color="red">
                <ActionIcon
                  variant="light"
                  size="lg"
                  className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                >
                  <IconBell size={20} />
                </ActionIcon>
              </Indicator>

              {/* Menu utilisateur */}
              <Menu shadow="md" width={200}>
                <Menu.Target>
                  <Button
                    variant="light"
                    leftSection={
                      <Avatar size="sm" radius="xl">
                        {user?.prenom?.[0]}{user?.nom?.[0]}
                      </Avatar>
                    }
                    className="text-gray-700 dark:text-gray-300"
                  >
                    {user?.prenom} {user?.nom}
                  </Button>
                </Menu.Target>

                <Menu.Dropdown>
                  <Menu.Item 
                    leftSection={<IconUser size={16} />}
                    onClick={() => navigate('/profil')}
                  >
                    Mon profil
                  </Menu.Item>
                  <Menu.Item 
                    leftSection={<IconSettings size={16} />}
                    onClick={() => navigate('/securite')}
                  >
                    Sécurité
                  </Menu.Item>
                  <Menu.Item 
                    leftSection={<IconSettings size={16} />}
                    onClick={() => navigate('/parametres')}
                  >
                    Paramètres
                  </Menu.Item>
                  <Menu.Divider />
                  <Menu.Item
                    leftSection={<IconLogout size={16} />}
                    onClick={handleLogout}
                    color="red"
                  >
                    Déconnexion
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            </div>
          </div>
        </div>
      </header>

      {/* Contenu principal - utilise toute la largeur */}
      <main className="flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  );
};

export default FullPageLayout; 