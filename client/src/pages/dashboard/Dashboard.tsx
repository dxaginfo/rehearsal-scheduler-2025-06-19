import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  CardActions,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  LinearProgress,
  Stack,
  IconButton,
  Link,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  MusicNote as MusicNoteIcon,
  Group as GroupIcon,
  Event as EventIcon,
  Add as AddIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Help as HelpIcon,
  ArrowForward as ArrowForwardIcon,
  Notifications as NotificationsIcon,
  CalendarMonth as CalendarMonthIcon,
  PersonAdd as PersonAddIcon
} from '@mui/icons-material';
import { format, isAfter, isBefore, parseISO } from 'date-fns';

import { selectUser } from '../../redux/slices/authSlice';
import { useGetBandsQuery, useGetNotificationsQuery } from '../../redux/api/apiSlice';
import UpcomingRehearsals from './components/UpcomingRehearsals';
import BandCards from './components/BandCards';
import AttendanceStats from './components/AttendanceStats';
import DashboardNotifications from './components/DashboardNotifications';
import QuickActions from './components/QuickActions';

const Dashboard: React.FC = () => {
  const user = useSelector(selectUser);
  const [selectedBandId, setSelectedBandId] = useState<string | null>(null);
  
  // Fetch data from the API
  const { 
    data: bands, 
    isLoading: isLoadingBands, 
    error: bandsError 
  } = useGetBandsQuery(undefined);
  
  const { 
    data: notifications, 
    isLoading: isLoadingNotifications,
    error: notificationsError
  } = useGetNotificationsQuery(undefined);
  
  // Set the first band as selected when data loads
  useEffect(() => {
    if (bands && bands.length > 0 && !selectedBandId) {
      setSelectedBandId(bands[0]._id);
    }
  }, [bands, selectedBandId]);

  // Process data
  const upcomingRehearsals = React.useMemo(() => {
    if (!bands) return [];
    
    const rehearsals = bands.flatMap(band => 
      band.rehearsals?.map(rehearsal => ({
        ...rehearsal,
        bandName: band.name,
        bandId: band._id
      })) || []
    );
    
    return rehearsals
      .filter(rehearsal => isAfter(parseISO(rehearsal.startTime), new Date()))
      .sort((a, b) => parseISO(a.startTime).getTime() - parseISO(b.startTime).getTime())
      .slice(0, 5);
  }, [bands]);
  
  const pendingResponses = React.useMemo(() => {
    if (!bands) return [];
    
    return bands.flatMap(band => 
      band.rehearsals?.filter(rehearsal => {
        const memberStatus = rehearsal.attendance.find(a => a.userId === user?.id);
        return memberStatus?.status === 'pending' && 
          isAfter(parseISO(rehearsal.startTime), new Date());
      }).map(rehearsal => ({
        ...rehearsal,
        bandName: band.name,
        bandId: band._id
      })) || []
    );
  }, [bands, user]);
  
  const recentNotifications = React.useMemo(() => {
    if (!notifications) return [];
    return notifications.slice(0, 5);
  }, [notifications]);
  
  const attendanceStats = React.useMemo(() => {
    if (!bands) return { attended: 0, missed: 0, total: 0, rate: 0 };
    
    const allRehearsals = bands.flatMap(band => 
      band.rehearsals?.filter(rehearsal => 
        isBefore(parseISO(rehearsal.startTime), new Date())
      ) || []
    );
    
    const attended = allRehearsals.filter(rehearsal => {
      const memberStatus = rehearsal.attendance.find(a => a.userId === user?.id);
      return memberStatus?.status === 'confirmed';
    }).length;
    
    const total = allRehearsals.length;
    const missed = total - attended;
    const rate = total > 0 ? Math.round((attended / total) * 100) : 0;
    
    return { attended, missed, total, rate };
  }, [bands, user]);
  
  if (isLoadingBands || isLoadingNotifications) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }
  
  if (bandsError || notificationsError) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">
          {bandsError ? 'Failed to load bands' : 'Failed to load notifications'}. Please try refreshing the page.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Welcome back, {user?.name?.split(' ')[0] || 'Musician'}!
        </Typography>
        <Typography color="textSecondary" variant="subtitle1">
          Here's what's happening with your bands and rehearsals
        </Typography>
      </Box>
      
      <Grid container spacing={3}>
        {/* Quick Stats */}
        <Grid item xs={12} md={8}>
          <Grid container spacing={3}>
            {/* Upcoming Rehearsals */}
            <Grid item xs={12}>
              <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography component="h2" variant="h6" color="primary" gutterBottom>
                    Upcoming Rehearsals
                  </Typography>
                  <Button 
                    component={RouterLink} 
                    to="/calendar" 
                    size="small" 
                    endIcon={<CalendarMonthIcon />}
                  >
                    View Calendar
                  </Button>
                </Box>
                <UpcomingRehearsals rehearsals={upcomingRehearsals} />
              </Paper>
            </Grid>
            
            {/* Bands List */}
            <Grid item xs={12}>
              <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography component="h2" variant="h6" color="primary" gutterBottom>
                    Your Bands
                  </Typography>
                  <Button 
                    component={RouterLink} 
                    to="/bands/create" 
                    size="small" 
                    startIcon={<AddIcon />}
                  >
                    Create Band
                  </Button>
                </Box>
                <BandCards bands={bands || []} />
              </Paper>
            </Grid>
          </Grid>
        </Grid>
        
        {/* Side Panel */}
        <Grid item xs={12} md={4}>
          <Grid container spacing={3}>
            {/* Attendance Stats */}
            <Grid item xs={12}>
              <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
                <Typography component="h2" variant="h6" color="primary" gutterBottom>
                  Your Attendance
                </Typography>
                <AttendanceStats stats={attendanceStats} />
              </Paper>
            </Grid>
            
            {/* Pending Responses */}
            <Grid item xs={12}>
              <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
                <Typography component="h2" variant="h6" color="primary" gutterBottom>
                  Pending Responses
                </Typography>
                {pendingResponses.length > 0 ? (
                  <List>
                    {pendingResponses.map((rehearsal) => (
                      <ListItem key={rehearsal._id} alignItems="flex-start" disableGutters>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'warning.main' }}>
                            <HelpIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={`${rehearsal.bandName} Rehearsal`}
                          secondary={
                            <>
                              {format(parseISO(rehearsal.startTime), 'MMM d, yyyy • h:mm a')}
                              <Box sx={{ mt: 1 }}>
                                <Button
                                  variant="outlined"
                                  size="small"
                                  color="success"
                                  startIcon={<CheckCircleIcon />}
                                  sx={{ mr: 1 }}
                                >
                                  Confirm
                                </Button>
                                <Button
                                  variant="outlined"
                                  size="small"
                                  color="error"
                                  startIcon={<CancelIcon />}
                                >
                                  Decline
                                </Button>
                              </Box>
                            </>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Box sx={{ py: 2, textAlign: 'center' }}>
                    <Typography variant="body2" color="textSecondary">
                      No pending responses
                    </Typography>
                  </Box>
                )}
              </Paper>
            </Grid>
            
            {/* Recent Notifications */}
            <Grid item xs={12}>
              <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography component="h2" variant="h6" color="primary" gutterBottom>
                    Recent Notifications
                  </Typography>
                  <IconButton size="small" color="primary">
                    <NotificationsIcon />
                  </IconButton>
                </Box>
                <DashboardNotifications notifications={recentNotifications} />
              </Paper>
            </Grid>
            
            {/* Quick Actions */}
            <Grid item xs={12}>
              <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
                <Typography component="h2" variant="h6" color="primary" gutterBottom>
                  Quick Actions
                </Typography>
                <QuickActions />
              </Paper>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;