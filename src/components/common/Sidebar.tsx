import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  Divider,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import BusinessIcon from '@mui/icons-material/Business';
import BookIcon from '@mui/icons-material/Book';
import ClassIcon from '@mui/icons-material/Class';
import SchoolIcon from '@mui/icons-material/School';
import WorkIcon from '@mui/icons-material/Work';
import CampaignIcon from '@mui/icons-material/Campaign';
import PersonIcon from '@mui/icons-material/Person';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import { UserRole } from '../../types/index.js';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  drawerWidth: number;
}

interface NavItem {
  title: string;
  path: string;
  icon: React.ReactNode;
  allowedRoles?: UserRole[];
}

const NAV_ITEMS: NavItem[] = [
  {
    title: 'Dashboard',
    path: '/dashboard',
    icon: <DashboardIcon />,
  },
  {
    title: 'User Management',
    path: '/users',
    icon: <PeopleIcon />,
    allowedRoles: ['SUPER_ADMIN', 'PRINCIPAL', 'HOD'],
  },
  {
    title: 'Departments',
    path: '/departments',
    icon: <BusinessIcon />,
    allowedRoles: ['SUPER_ADMIN', 'PRINCIPAL', 'HOD', 'FACULTY', 'STUDENT'],
  },
  {
    title: 'Course Catalog',
    path: '/courses',
    icon: <BookIcon />,
    allowedRoles: ['SUPER_ADMIN', 'PRINCIPAL', 'HOD', 'FACULTY', 'STUDENT'],
  },
  {
    title: 'Subject Module',
    path: '/subjects',
    icon: <ClassIcon />,
    allowedRoles: ['SUPER_ADMIN', 'PRINCIPAL', 'HOD', 'FACULTY', 'STUDENT'],
  },
  {
    title: 'Student Module',
    path: '/students',
    icon: <SchoolIcon />,
    allowedRoles: ['SUPER_ADMIN', 'PRINCIPAL', 'HOD', 'FACULTY', 'STUDENT'],
  },
  {
    title: 'Faculty Module',
    path: '/faculty',
    icon: <WorkIcon />,
    allowedRoles: ['SUPER_ADMIN', 'PRINCIPAL', 'HOD', 'FACULTY', 'STUDENT'],
  },
  {
    title: 'Notice Board',
    path: '/notices',
    icon: <CampaignIcon />,
  },
  {
    title: 'Financial Desk',
    path: '/dashboard',
    icon: <AccountBalanceWalletIcon />,
    allowedRoles: ['ACCOUNTANT', 'SUPER_ADMIN', 'PRINCIPAL'],
  },
  {
    title: 'Library Portal',
    path: '/dashboard',
    icon: <MenuBookIcon />,
    allowedRoles: ['LIBRARIAN', 'SUPER_ADMIN', 'STUDENT', 'FACULTY'],
  },
  {
    title: 'My Profile',
    path: '/profile',
    icon: <PersonIcon />,
  },
];

export const Sidebar: React.FC<SidebarProps> = ({ open, onClose, drawerWidth }) => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const userRole = user?.role || 'STUDENT';

  const visibleNavItems = NAV_ITEMS.filter((item) => {
    if (!item.allowedRoles) return true;
    return item.allowedRoles.includes(userRole);
  });

  const content = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', pt: 2 }}>
      <Box sx={{ px: 3, pb: 2 }}>
        <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: 1 }}>
          Navigation Menu
        </Typography>
      </Box>

      <Divider sx={{ mb: 1 }} />

      <List sx={{ px: 1.5, flexGrow: 1 }}>
        {visibleNavItems.map((item) => {
          const isSelected = location.pathname === item.path;

          return (
            <ListItem key={item.title} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                selected={isSelected}
                onClick={() => {
                  navigate(item.path);
                  if (onClose) onClose();
                }}
                sx={{
                  borderRadius: 2,
                  py: 1,
                  px: 2,
                  '&.Mui-selected': {
                    bgcolor: 'primary.main',
                    color: 'primary.contrastText',
                    '& .MuiListItemIcon-root': {
                      color: 'primary.contrastText',
                    },
                    '&:hover': {
                      bgcolor: 'primary.dark',
                    },
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40, color: isSelected ? 'inherit' : 'text.secondary' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.title}
                  slotProps={{
                    primary: {
                      sx: {
                        fontSize: '0.9rem',
                        fontWeight: isSelected ? 700 : 500,
                      },
                    },
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Box sx={{ p: 2, bgcolor: 'background.default', borderTop: '1px solid #e2e8f0', mt: 'auto' }}>
        <Typography variant="caption" color="text.secondary" align="center" sx={{ display: 'block' }}>
          Active Role: <strong>{userRole.replace('_', ' ')}</strong>
        </Typography>
        <Typography variant="caption" color="text.secondary" align="center" sx={{ display: 'block', fontSize: '0.7rem' }}>
          College ERP v2.6.0
        </Typography>
      </Box>
    </Box>
  );

  return (
    <>
      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={open}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
        }}
      >
        {content}
      </Drawer>

      {/* Desktop Persistent Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            borderRight: '1px solid #e2e8f0',
            top: 64,
            height: 'calc(100% - 64px)',
          },
        }}
        open
      >
        {content}
      </Drawer>
    </>
  );
};
