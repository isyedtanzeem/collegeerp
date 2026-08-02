import React from 'react';
import { Grid, Card, CardContent, Typography, Box } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PeopleIcon from '@mui/icons-material/People';
import SchoolIcon from '@mui/icons-material/School';
import BusinessIcon from '@mui/icons-material/Business';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import CampaignIcon from '@mui/icons-material/Campaign';
import { MetricCard } from '../../types/index.js';

interface RoleMetricCardsProps {
  cards?: MetricCard[];
}

const getCardIcon = (label: string) => {
  const lower = label.toLowerCase();
  if (lower.includes('student')) return <SchoolIcon color="primary" fontSize="medium" />;
  if (lower.includes('faculty') || lower.includes('staff')) return <PeopleIcon color="info" fontSize="medium" />;
  if (lower.includes('department') || lower.includes('course')) return <BusinessIcon color="success" fontSize="medium" />;
  if (lower.includes('fee') || lower.includes('due') || lower.includes('receipt') || lower.includes('balance'))
    return <AccountBalanceWalletIcon color="secondary" fontSize="medium" />;
  if (lower.includes('book') || lower.includes('catalog') || lower.includes('gpa') || lower.includes('pass'))
    return <MenuBookIcon color="warning" fontSize="medium" />;
  if (lower.includes('notice') || lower.includes('active')) return <CampaignIcon color="error" fontSize="medium" />;
  return <CheckCircleIcon color="primary" fontSize="medium" />;
};

export const RoleMetricCards: React.FC<RoleMetricCardsProps> = ({ cards }) => {
  if (!cards || cards.length === 0) return null;

  return (
    <Grid container spacing={2.5} sx={{ mb: 3.5 }}>
      {cards.map((card, idx) => (
        <Grid size={{ xs: 12, sm: 6, md: 3 }} key={idx}>
          <Card
            elevation={0}
            sx={{
              height: '100%',
              borderRadius: 3,
              border: '1px solid #e2e8f0',
              boxShadow: '0 1px 3px 0 rgba(0,0,0,0.05)',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                transform: 'translateY(-3px)',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.08)',
                borderColor: `${card.color || 'primary'}.main`,
              },
            }}
          >
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: 0.5, lineHeight: 1.2 }}>
                  {card.label}
                </Typography>
                <Box
                  sx={{
                    p: 1,
                    borderRadius: 2,
                    bgcolor: `${card.color || 'primary'}.50`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {getCardIcon(card.label)}
                </Box>
              </Box>

              <Typography variant="h4" color={`${card.color || 'primary'}.main`} sx={{ fontWeight: 800, mb: 1 }}>
                {card.value}
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <TrendingUpIcon fontSize="small" color="success" />
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                  {card.change || 'Live ERP Metric'}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};
