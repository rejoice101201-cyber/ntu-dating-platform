import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { Breadcrumbs, Link, Typography, Box } from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

interface BreadcrumbItem {
  label: string;
  path: string;
  clickable?: boolean; // Default to true
}

interface BreadcrumbNavProps {
  items: BreadcrumbItem[];
}

export default function BreadcrumbNav({ items }: BreadcrumbNavProps) {
  const navigate = useNavigate();

  return (
    <Box sx={{ mb: 3 }}>
      <Breadcrumbs
        separator={<NavigateNextIcon fontSize="small" />}
        aria-label="breadcrumb"
      >
        {items.map((item, index) => (
          item.clickable === false || index === items.length - 1 ? (
            <Typography key={item.label} color="text.primary" sx={{ fontWeight: 600 }}>
              {item.label}
            </Typography>
          ) : (
            <Link
              key={item.label}
              underline="hover"
              color="inherit"
              href={item.path}
              onClick={(event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
                event.preventDefault();
                navigate(item.path);
              }}
            >
              {item.label}
            </Link>
          )
        ))}
      </Breadcrumbs>
    </Box>
  );
}
