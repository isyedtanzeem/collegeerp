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
  Tooltip,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import BusinessIcon from '@mui/icons-material/Business';
import BookIcon from '@mui/icons-material/Book';
import ClassIcon from '@mui/icons-material/Class';
import SchoolIcon from '@mui/icons-material/School';
import WorkIcon from '@mui/icons-material/Work';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import CampaignIcon from '@mui/icons-material/Campaign';
import PersonIcon from '@mui/icons-material/Person';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import GradeIcon from '@mui/icons-material/Grade';
import AssignmentIcon from '@mui/icons-material/Assignment';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AssessmentIcon from '@mui/icons-material/Assessment';
import SettingsIcon from '@mui/icons-material/Settings';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LogoutIcon from '@mui/icons-material/Logout';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import { UserRole } from '../../types/index.js';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  drawerWidth: number;
  collapsed?: boolean;
}

interface NavItem {
  title: string;
  path: string;
  icon: React.ReactNode;
  allowedRoles?: UserRole[];
}

const STUDENT_NAV_ITEMS: NavItem[] = [
  { title: 'Dashboard', path: '/dashboard', icon: <DashboardIcon /> },
  { title: 'My Profile', path: '/profile', icon: <PersonIcon /> },
  { title: 'My Subjects', path: '/subjects', icon: <ClassIcon /> },
  { title: 'Attendance', path: '/attendance', icon: <HowToRegIcon /> },
  { title: 'Results', path: '/marks', icon: <GradeIcon /> },
  { title: 'Assignments', path: '/assignments', icon: <AssignmentIcon /> },
  { title: 'Study Materials', path: '/materials', icon: <MenuBookIcon /> },
  { title: 'Timetable', path: '/timetable', icon: <CalendarMonthIcon /> },
  { title: 'Fees', path: '/fees', icon: <AccountBalanceWalletIcon /> },
  { title: 'Library', path: '/library', icon: <BookIcon /> },
  { title: 'Leave Requests', path: '/leaves', icon: <EventBusyIcon /> },
  { title: 'Notices', path: '/notices', icon: <CampaignIcon /> },
  { title: 'Notifications', path: '/notifications', icon: <NotificationsIcon /> },
  { title: 'Settings', path: '/settings', icon: <SettingsIcon /> },
];

const ADMIN_NAV_ITEMS: NavItem[] = [
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
    allowedRoles: ['SUPER_ADMIN', 'PRINCIPAL', 'HOD', 'FACULTY'],
  },
  {
    title: 'Course Catalog',
    path: '/courses',
    icon: <BookIcon />,
    allowedRoles: ['SUPER_ADMIN', 'PRINCIPAL', 'HOD', 'FACULTY'],
  },
  {
    title: 'Subject Module',
    path: '/subjects',
    icon: <ClassIcon />,
    allowedRoles: ['SUPER_ADMIN', 'PRINCIPAL', 'HOD', 'FACULTY'],
  },
  {
    title: 'Student Module',
    path: '/students',
    icon: <SchoolIcon />,
    allowedRoles: ['SUPER_ADMIN', 'PRINCIPAL', 'HOD', 'FACULTY', 'ACCOUNTANT'],
  },
  {
    title: 'Faculty Module',
    path: '/faculty',
    icon: <WorkIcon />,
    allowedRoles: ['SUPER_ADMIN', 'PRINCIPAL', 'HOD'],
  },
  {
    title: 'Attendance Module',
    path: '/attendance',
    icon: <HowToRegIcon />,
    allowedRoles: ['SUPER_ADMIN', 'PRINCIPAL', 'HOD', 'FACULTY'],
  },
  {
    title: 'Examination Module',
    path: '/exams',
    icon: <FactCheckIcon />,
    allowedRoles: ['SUPER_ADMIN', 'PRINCIPAL', 'HOD', 'FACULTY'],
  },
  {
    title: 'Marks & Results',
    path: '/marks',
    icon: <GradeIcon />,
    allowedRoles: ['SUPER_ADMIN', 'PRINCIPAL', 'HOD', 'FACULTY'],
  },
  {
    title: 'Fees & Accounts',
    path: '/fees',
    icon: <AccountBalanceWalletIcon />,
    allowedRoles: ['SUPER_ADMIN', 'PRINCIPAL', 'HOD', 'ACCOUNTANT'],
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
    path: '/library',
    icon: <MenuBookIcon />,
    allowedRoles: ['LIBRARIAN', 'SUPER_ADMIN', 'PRINCIPAL', 'HOD', 'FACULTY'],
  },
  {
    title: 'Assignment Module',
    path: '/assignments',
    icon: <AssignmentIcon />,
    allowedRoles: ['SUPER_ADMIN', 'PRINCIPAL', 'HOD', 'FACULTY'],
  },
  {
    title: 'Leave Module',
    path: '/leaves',
    icon: <EventBusyIcon />,
    allowedRoles: ['SUPER_ADMIN', 'PRINCIPAL', 'HOD', 'FACULTY'],
  },
  {
    title: 'Timetable Module',
    path: '/timetable',
    icon: <CalendarMonthIcon />,
    allowedRoles: ['SUPER_ADMIN', 'PRINCIPAL', 'HOD', 'FACULTY'],
  },
  {
    title: 'Reports & Analytics',
    path: '/reports',
    icon: <AssessmentIcon />,
    allowedRoles: ['SUPER_ADMIN', 'PRINCIPAL', 'HOD', 'FACULTY', 'ACCOUNTANT'],
  },
  {
    title: 'Settings Module',
    path: '/settings',
    icon: <SettingsIcon />,
  },
  {
    title: 'My Profile',
    path: '/profile',
    icon: <PersonIcon />,
  },
];

export const Sidebar: React.FC<SidebarProps> = ({ open, onClose, drawerWidth, collapsed = false }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const userRole = user?.role || 'STUDENT';

  const visibleNavItems = userRole === 'STUDENT'
    ? STUDENT_NAV_ITEMS
    : ADMIN_NAV_ITEMS.filter((item) => {
        if (!item.allowedRoles) return true;
        return item.allowedRoles.includes(userRole);
      });

  const renderContent = (isCollapsedMode: boolean) => (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', pt: 2, overflowX: 'hidden' }}>
      <Box sx={{ px: isCollapsedMode ? 1.5 : 3, pb: 2, textAlign: isCollapsedMode ? 'center' : 'left' }}>
        <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: 1, fontSize: isCollapsedMode ? '0.65rem' : '0.75rem' }}>
          {isCollapsedMode ? 'MENU' : 'Navigation Menu'}
        </Typography>
      </Box>

      <Divider sx={{ mb: 1 }} />

      <List sx={{ px: 1, flexGrow: 1 }}>
        {visibleNavItems.map((item) => {
          const isSelected = location.pathname === item.path;

          const button = (
            <ListItemButton
              selected={isSelected}
              onClick={() => {
                navigate(item.path);
                if (onClose) onClose();
              }}
              sx={{
                borderRadius: 2,
                py: 1.2,
                px: isCollapsedMode ? 1.2 : 2,
                justifyContent: isCollapsedMode ? 'center' : 'initial',
                minHeight: 44,
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
              <ListItemIcon
                sx={{
                  minWidth: isCollapsedMode ? 0 : 40,
                  mr: isCollapsedMode ? 0 : 0.5,
                  justifyContent: 'center',
                  color: isSelected ? 'inherit' : 'text.secondary',
                }}
              >
                {item.icon}
              </ListItemIcon>
              {!isCollapsedMode && (
                <ListItemText
                  primary={item.title}
                  slotProps={{
                    primary: {
                      sx: {
                        fontSize: '0.9rem',
                        fontWeight: isSelected ? 700 : 500,
                        whiteSpace: 'nowrap',
                      },
                    },
                  }}
                />
              )}
            </ListItemButton>
          );

          return (
            <ListItem key={item.title} disablePadding sx={{ mb: 0.5 }}>
              {isCollapsedMode ? (
                <Tooltip title={item.title} placement="right" arrow>
                  <Box sx={{ width: '100%' }}>{button}</Box>
                </Tooltip>
              ) : (
                button
              )}
            </ListItem>
          );
        })}

        <ListItem disablePadding sx={{ mt: 1, mb: 0.5 }}>
          {isCollapsedMode ? (
            <Tooltip title="Logout" placement="right" arrow>
              <ListItemButton
                onClick={logout}
                sx={{
                  borderRadius: 2,
                  py: 1.2,
                  px: 1.2,
                  justifyContent: 'center',
                  minHeight: 44,
                  color: 'error.main',
                  '&:hover': { bgcolor: 'error.50' },
                }}
              >
                <ListItemIcon sx={{ minWidth: 0, justifyContent: 'center', color: 'error.main' }}>
                  <LogoutIcon />
                </ListItemIcon>
              </ListItemButton>
            </Tooltip>
          ) : (
            <ListItemButton
              onClick={logout}
              sx={{
                borderRadius: 2,
                py: 1.2,
                px: 2,
                minHeight: 44,
                color: 'error.main',
                '&:hover': { bgcolor: 'error.50' },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40, mr: 0.5, justifyContent: 'center', color: 'error.main' }}>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText
                primary="Logout"
                slotProps={{
                  primary: {
                    sx: {
                      fontSize: '0.9rem',
                      fontWeight: 700,
                      whiteSpace: 'nowrap',
                    },
                  },
                }}
              />
            </ListItemButton>
          )}
        </ListItem>
      </List>

      <Box sx={{ p: isCollapsedMode ? 1.5 : 2, bgcolor: 'background.default', borderTop: '1px solid #e2e8f0', mt: 'auto', textAlign: 'center' }}>
        {isCollapsedMode ? (
          <Tooltip title={`Active Role: ${userRole.replace('_', ' ')}`} placement="right" arrow>
            <Typography variant="caption" sx={{ fontWeight: 800, color: 'primary.main', display: 'block' }}>
              {userRole.substring(0, 3)}
            </Typography>
          </Tooltip>
        ) : (
          <>
            <Typography variant="caption" color="text.secondary" align="center" sx={{ display: 'block' }}>
              Active Role: <strong>{userRole.replace('_', ' ')}</strong>
            </Typography>
            <Typography variant="caption" color="text.secondary" align="center" sx={{ display: 'block', fontSize: '0.7rem' }}>
              Community College ERP v2.6.0
            </Typography>
          </>
        )}
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
        {renderContent(false)}
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
            overflowX: 'hidden',
            transition: (theme) =>
              theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
          },
        }}
        open
      >
        {renderContent(collapsed)}
      </Drawer>
    </>
  );
};
