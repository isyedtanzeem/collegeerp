import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Box,
  Chip,
  Select,
  FormControl,
  InputLabel,
  Divider,
  ListItemIcon,
  Tooltip,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import SchoolIcon from '@mui/icons-material/School';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import StorageIcon from '@mui/icons-material/Storage';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import { UserRole } from '../../types/index.js';

interface HeaderProps {
  onToggleSidebar: () => void;
}

const ROLE_COLORS: Record<UserRole, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
  SUPER_ADMIN: 'error',
  PRINCIPAL: 'primary',
  HOD: 'info',
  FACULTY: 'success',
  STUDENT: 'warning',
  ACCOUNTANT: 'secondary',
  LIBRARIAN: 'default',
};

const ALL_ROLES: { role: UserRole; label: string }[] = [
  { role: 'SUPER_ADMIN', label: 'Super Admin' },
  { role: 'PRINCIPAL', label: 'Principal' },
  { role: 'HOD', label: 'HOD' },
  { role: 'FACULTY', label: 'Faculty' },
  { role: 'STUDENT', label: 'Student' },
  { role: 'ACCOUNTANT', label: 'Accountant' },
  { role: 'LIBRARIAN', label: 'Librarian' },
];

interface DbHealth {
  connected: boolean;
  state: string;
  host: string;
  name: string;
  counts?: { users: number; departments: number; courses: number; notices: number };
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const { user, logout, quickLoginRole } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [dbHealth, setDbHealth] = useState<DbHealth>({ connected: false, state: 'Checking', host: '', name: '' });

  useEffect(() => {
    let isMounted = true;
    const checkDbHealth = async () => {
      try {
        const res = await fetch('/api/health');
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data?.database) {
            setDbHealth({
              connected: data.database.state === 'Connected',
              state: data.database.state,
              host: data.database.host,
              name: data.database.name,
              counts: data.database.counts,
            });
          }
        }
      } catch (e) {
        if (isMounted) {
          setDbHealth((prev) => ({ ...prev, connected: false, state: 'Offline' }));
        }
      }
    };

    checkDbHealth();
    const interval = setInterval(checkDbHealth, 15000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleProfile = () => {
    handleCloseMenu();
    navigate('/profile');
  };

  const handleLogout = () => {
    handleCloseMenu();
    logout();
    navigate('/login');
  };

  const handleQuickRoleChange = async (newRole: UserRole) => {
    await quickLoginRole(newRole);
    navigate('/dashboard');
  };

  const dbTooltipText = dbHealth.connected
    ? `Database: Connected (${dbHealth.state})\nHost: ${dbHealth.host}\nDB Name: ${dbHealth.name}${
        dbHealth.counts ? `\nUsers: ${dbHealth.counts.users} | Depts: ${dbHealth.counts.departments} | Courses: ${dbHealth.counts.courses}` : ''
      }`
    : `Database State: ${dbHealth.state}`;

  return (
    <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar sx={{ justifyContent: 'space-between', minHeight: 64 }}>
        {/* Left Section: Menu Toggle + Brand + DB Badge */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <IconButton color="inherit" aria-label="open drawer" edge="start" onClick={onToggleSidebar} sx={{ mr: 1 }}>
            <MenuIcon />
          </IconButton>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>
            <Avatar sx={{ bgcolor: 'primary.main', width: 36, height: 36 }}>
              <SchoolIcon fontSize="small" />
            </Avatar>
            <Box>
              <Typography variant="h6" color="text.primary" sx={{ lineHeight: 1.2, fontSize: '1.1rem', fontWeight: 700 }}>
                Astra College ERP
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
                MERN Institutional Suite
              </Typography>
            </Box>
          </Box>

          {/* Live DB Connection Badge */}
          <Tooltip title={<span style={{ whiteSpace: 'pre-line' }}>{dbTooltipText}</span>} arrow>
            <Chip
              icon={<StorageIcon style={{ fontSize: 14 }} />}
              label={dbHealth.connected ? 'DB CONNECTED' : `DB ${dbHealth.state.toUpperCase()}`}
              color={dbHealth.connected ? 'success' : 'error'}
              variant="outlined"
              size="small"
              sx={{
                ml: 2,
                height: 24,
                fontSize: '0.68rem',
                fontWeight: 800,
                letterSpacing: 0.5,
                borderWidth: 1.5,
                display: { xs: 'none', md: 'inline-flex' },
              }}
            />
          </Tooltip>
        </Box>

        {/* Right Section: Quick Demo Role Switcher + User Profile */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* Quick Role Switcher Pill */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1 }}>
            <SwapHorizIcon fontSize="small" color="action" />
            <FormControl size="small" variant="outlined" sx={{ minWidth: 150 }}>
              <InputLabel id="quick-role-select-label">Switch Role</InputLabel>
              <Select
                labelId="quick-role-select-label"
                value={user?.role || ''}
                label="Switch Role"
                onChange={(e) => handleQuickRoleChange(e.target.value as UserRole)}
                sx={{ height: 36, fontSize: '0.85rem' }}
              >
                {ALL_ROLES.map((item) => (
                  <MenuItem key={item.role} value={item.role}>
                    {item.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Current Role Badge */}
          {user && (
            <Chip
              label={user.role.replace('_', ' ')}
              color={ROLE_COLORS[user.role] || 'default'}
              size="small"
              sx={{ fontWeight: 600, fontSize: '0.75rem' }}
            />
          )}

          {/* User Profile Avatar */}
          <IconButton onClick={handleOpenMenu} size="small" sx={{ ml: 0.5 }}>
            <Avatar sx={{ bgcolor: 'secondary.main', width: 36, height: 36, fontSize: '0.9rem', fontWeight: 600 }}>
              {user?.name ? user.name.charAt(0) : 'U'}
            </Avatar>
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleCloseMenu}
            slotProps={{
              paper: {
                elevation: 3,
                sx: { mt: 1.5, width: 220, borderRadius: 2 },
              },
            }}
          >
            <Box sx={{ px: 2, py: 1.5 }}>
              <Typography variant="subtitle2" noWrap sx={{ fontWeight: 700 }}>
                {user?.name}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
                {user?.email}
              </Typography>
            </Box>
            <Divider />
            <MenuItem onClick={handleProfile}>
              <ListItemIcon>
                <PersonIcon fontSize="small" />
              </ListItemIcon>
              My Profile
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" color="error" />
              </ListItemIcon>
              Sign Out
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};
