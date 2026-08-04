import React from 'react';
import { Box, Typography } from '@mui/material';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  variant?: 'light' | 'dark';
}

export const Logo: React.FC<LogoProps> = ({ size = 'medium', variant = 'dark' }) => {
  const iconSize = size === 'small' ? 34 : size === 'large' ? 56 : 42;
  const titleSize = size === 'small' ? '1.05rem' : size === 'large' ? '1.45rem' : '1.2rem';
  const subtitleSize = size === 'small' ? '0.65rem' : size === 'large' ? '0.8rem' : '0.72rem';

  const textColor = variant === 'light' ? '#ffffff' : '#0f172a';
  const accentColor = variant === 'light' ? '#38bdf8' : '#0284c7';

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: size === 'large' ? 1.75 : 1.25 }}>
      {/* Emblem SVG */}
      <Box
        sx={{
          width: iconSize,
          height: iconSize,
          borderRadius: size === 'small' ? 2 : 3,
          background: 'linear-gradient(135deg, #0284c7 0%, #0f172a 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(2, 132, 199, 0.25)',
          flexShrink: 0,
        }}
      >
        <svg viewBox="0 0 40 40" width={iconSize * 0.7} height={iconSize * 0.7}>
          <path d="M20 6 L33 12.5 L20 19 L7 12.5 Z" fill="#fbbf24" />
          <path d="M28 15.5 V22 C28 22 24 24.5 20 24.5 C16 24.5 12 22 12 22 V15.5" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M31 14 V23" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="31" cy="24.5" r="1.2" fill="#fbbf24" />
          <path d="M10 28 C14 26.5 18 27.5 20 29 C22 27.5 26 26.5 30 28 V33 C26 31.5 22 32.5 20 34 C18 32.5 14 31.5 10 33 Z" fill="#ffffff" opacity="0.95" />
        </svg>
      </Box>

      {/* Brand Text */}
      <Box>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 800,
            color: textColor,
            lineHeight: 1.1,
            fontSize: titleSize,
            letterSpacing: '-0.02em',
          }}
        >
          Community College
        </Typography>
        <Typography
          variant="caption"
          sx={{
            display: 'block',
            fontWeight: 700,
            color: accentColor,
            fontSize: subtitleSize,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            mt: 0.2,
          }}
        >
          ERP Portal
        </Typography>
      </Box>
    </Box>
  );
};
