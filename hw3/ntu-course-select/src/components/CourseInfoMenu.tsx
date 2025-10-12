import * as React from 'react';
import Box from '@mui/material/Box';
import { styled, ThemeProvider, createTheme } from '@mui/material/styles';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import ArrowRight from '@mui/icons-material/ArrowRight';
import KeyboardArrowDown from '@mui/icons-material/KeyboardArrowDown';
import School from '@mui/icons-material/School';
import Description from '@mui/icons-material/Description';
import Assignment from '@mui/icons-material/Assignment';
import Map from '@mui/icons-material/Map';
import Language from '@mui/icons-material/Language';
import Class from '@mui/icons-material/Class';
import History from '@mui/icons-material/History';
import Room from '@mui/icons-material/Room';

const courseData = [
  { 
    category: '修課認識',
    items: [
      { icon: <Description />, label: '課程相關說明文件', url: 'https://www.aca.ntu.edu.tw/w/aca/UAADForms_21102811111810357' },
      { icon: <Assignment />, label: '必修科目及應修學分', url: 'https://curri.aca.ntu.edu.tw/NTUVoxCourse/index.php/uquery/index?lang=zh' },
      { icon: <School />, label: '不可申請探索學分', url: 'https://if190.aca.ntu.edu.tw/graderanking/explore_search.html' },
      { icon: <Language />, label: '領域專長', url: 'https://specom.aca.ntu.edu.tw/?lang=zh' },
      { icon: <Map />, label: '臺大課程地圖', url: 'https://coursemap.aca.ntu.edu.tw/course_map_all/index.php' }
    ]
  },
  { 
    category: '相關申請',
    items: [
      { icon: <Assignment />, label: '學分底免申請', url: 'https://curri.aca.ntu.edu.tw/aca_doc/waive.asp' },
      { icon: <Language />, label: '進階英語免修', url: 'https://curri.aca.ntu.edu.tw/cur/N1.htm' }
    ]
  },
  { 
    category: '其他',
    items: [
      { icon: <Room />, label: '教務處教室查詢借用系統', url: 'https://gra206.aca.ntu.edu.tw/classrm/acarm' },
      { icon: <History />, label: '臺灣大學歷年課表', url: 'https://course.lib.ntu.edu.tw/' }
    ]
  }
];

const FireNav = styled(List)<{ component?: React.ElementType }>({
  '& .MuiListItemButton-root': {
    paddingLeft: 16,
    paddingRight: 16,
  },
  '& .MuiListItemIcon-root': {
    minWidth: 0,
    marginRight: 12,
  },
  '& .MuiSvgIcon-root': {
    fontSize: 18,
  },
});

interface CourseInfoMenuProps {
  open: boolean;
  onClose: () => void;
}

export default function CourseInfoMenu({ open, onClose }: CourseInfoMenuProps) {
  const [expandedCategories, setExpandedCategories] = React.useState<{ [key: string]: boolean }>({
    '修課認識': true,
    '相關申請': false,
    '其他': false
  });

  const handleCategoryToggle = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const handleLinkClick = (url: string) => {
    window.open(url, '_blank');
    onClose();
  };

  if (!open) return null;

  return (
    <Box 
      sx={{ 
        position: 'absolute', 
        top: '100%', 
        right: 0, 
        zIndex: 1000, 
        mt: 1,
        // 添加一個小的間隙，讓滑鼠可以從按鈕移動到選單而不觸發關閉
        '&::before': {
          content: '""',
          position: 'absolute',
          top: '-8px',
          left: 0,
          right: 0,
          height: '8px',
          backgroundColor: 'transparent'
        }
      }}
      onMouseEnter={() => {}} // 保持開啟狀態
      onMouseLeave={onClose} // 離開時關閉
    >
      <ThemeProvider
        theme={createTheme({
          components: {
            MuiListItemButton: {
              defaultProps: {
                disableTouchRipple: true,
              },
            },
          },
          palette: {
            mode: 'light',
            primary: { main: '#1976d2' },
            background: { paper: '#ffffff' },
          },
        })}
      >
        <Paper elevation={8} sx={{ 
          width: 400, 
          minWidth: 400, 
          maxWidth: 400,
          border: '1px solid #e0e0e0' 
        }}>
          <FireNav component="nav" disablePadding>
            <ListItemButton component="div" sx={{ height: 48, backgroundColor: '#f5f5f5' }}>
              <ListItemIcon sx={{ fontSize: 20 }}>📚</ListItemIcon>
              <ListItemText
                sx={{ my: 0 }}
                primary="課程資訊"
                primaryTypographyProps={{
                  fontSize: 16,
                  fontWeight: 'bold',
                  color: '#1976d2',
                }}
              />
            </ListItemButton>
            <Divider />
            
            {courseData.map((category, categoryIndex) => (
              <React.Fragment key={category.category}>
                <Box
                  sx={[
                    expandedCategories[category.category]
                      ? {
                          bgcolor: 'rgba(25, 118, 210, 0.08)',
                        }
                      : {
                          bgcolor: null,
                        },
                    expandedCategories[category.category]
                      ? {
                          pb: 1,
                        }
                      : {
                          pb: 0,
                        },
                  ]}
                >
                  <ListItemButton
                    alignItems="flex-start"
                    onClick={() => handleCategoryToggle(category.category)}
                    sx={[
                      {
                        px: 2,
                        pt: 1.5,
                      },
                      expandedCategories[category.category]
                        ? {
                            pb: 0,
                          }
                        : {
                            pb: 1.5,
                          },
                    ]}
                  >
                    <ListItemText
                      primary={category.category}
                      primaryTypographyProps={{
                        fontSize: 14,
                        fontWeight: 'medium',
                        lineHeight: '20px',
                        mb: '2px',
                        color: '#424242',
                      }}
                      sx={{ my: 0 }}
                    />
                    <KeyboardArrowDown
                      sx={[
                        {
                          mr: -1,
                          opacity: 0.7,
                          transition: '0.2s',
                        },
                        expandedCategories[category.category]
                          ? {
                              transform: 'rotate(-180deg)',
                            }
                          : {
                              transform: 'rotate(0)',
                            },
                      ]}
                    />
                  </ListItemButton>
                  {expandedCategories[category.category] &&
                    category.items.map((item) => (
                      <ListItemButton
                        key={item.label}
                        onClick={() => handleLinkClick(item.url)}
                        sx={{ 
                          py: 0.5, 
                          minHeight: 36, 
                          color: '#424242',
                          '&:hover': {
                            backgroundColor: '#f5f5f5',
                            color: '#1976d2'
                          }
                        }}
                      >
                        <ListItemIcon sx={{ color: 'inherit', minWidth: 32 }}>
                          {item.icon}
                        </ListItemIcon>
                        <ListItemText
                          primary={item.label}
                          primaryTypographyProps={{ 
                            fontSize: 13, 
                            fontWeight: 'normal',
                            sx: {
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }
                          }}
                        />
                        <ArrowRight sx={{ fontSize: 16, opacity: 0.5 }} />
                      </ListItemButton>
                    ))}
                </Box>
                {categoryIndex < courseData.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </FireNav>
        </Paper>
      </ThemeProvider>
    </Box>
  );
}
