import React from 'react';
import { Paper, Typography, Grid, Card, Box, Avatar } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import BusinessIcon from '@mui/icons-material/Business';
import BookIcon from '@mui/icons-material/Book';
import CampaignIcon from '@mui/icons-material/Campaign';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import { useNavigate } from 'react-router-dom';
import { QuickActionItem } from '../../types/index.js';

interface RoleQuickActionsProps {
  actions?: QuickActionItem[];
}

const getActionIcon = (iconName: string) => {
  switch (iconName) {
    case 'People':
      return <PeopleIcon />;
    case 'Business':
      return <BusinessIcon />;
    case 'Book':
      return <BookIcon />;
    case 'Campaign':
      return <CampaignIcon />;
    case 'AccountBalanceWallet':
      return <AccountBalanceWalletIcon />;
    case 'MenuBook':
      return <MenuBookIcon />;
    default:
      return <BookIcon />;
  }
};

export const RoleQuickActions: React.FC<RoleQuickActionsProps> = ({ actions }) => {
  const navigate = useNavigate();

  if (!actions || actions.length === 0) return null;

  return (
    <Paper sx={{ p: 3, borderRadius: 3, height: '100%' }}>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
        Quick Module Shortcuts
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
        Direct navigation to your core workspace functions:
      </Typography>

      <Grid container spacing={2}>
        {actions.map((action, idx) => (
          <Grid size={{ xs: 12, sm: 6 }} key={idx}>
            <Card
              variant="outlined"
              onClick={() => navigate(action.route)}
              sx={{
                p: 2,
                cursor: 'pointer',
                borderRadius: 2,
                borderColor: '#e2e8f0',
                transition: 'all 0.2s',
                '&:hover': {
                  borderColor: 'primary.main',
                  bgcolor: 'primary.50',
                  transform: 'translateX(3px)',
                },
              }}
            >
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: 'primary.main', width: 42, height: 42 }}>
                  {getActionIcon(action.icon)}
                </Avatar>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    {action.label}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Access {action.label}
                  </Typography>
                </Box>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
};
