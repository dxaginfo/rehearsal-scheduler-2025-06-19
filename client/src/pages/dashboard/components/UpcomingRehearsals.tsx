import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  Divider,
  Button,
  Link
} from '@mui/material';
import {
  MusicNote as MusicNoteIcon,
  AccessTime as AccessTimeIcon,
  Place as PlaceIcon,
  ArrowForward as ArrowForwardIcon,
  Event as EventIcon
} from '@mui/icons-material';
import { format, parseISO } from 'date-fns';

interface RehearsalAttendance {
  userId: string;
  status: 'confirmed' | 'declined' | 'pending';
  responseDate?: string;
}

interface Rehearsal {
  _id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  location: {
    name: string;
    address?: string;
  };
  attendance: RehearsalAttendance[];
  setlist?: string[];
  notes?: string;
  bandName: string;
  bandId: string;
}

interface UpcomingRehearsalsProps {
  rehearsals: Rehearsal[];
}

const UpcomingRehearsals: React.FC<UpcomingRehearsalsProps> = ({ rehearsals }) => {
  if (!rehearsals.length) {
    return (
      <Box sx={{ py: 4, textAlign: 'center' }}>
        <EventIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" color="textSecondary" gutterBottom>
          No upcoming rehearsals
        </Typography>
        <Typography variant="body2" color="textSecondary" paragraph>
          Create a new rehearsal to get started
        </Typography>
        <Button 
          component={RouterLink} 
          to="/rehearsals/create" 
          variant="outlined" 
          color="primary"
          startIcon={<EventIcon />}
        >
          Schedule Rehearsal
        </Button>
      </Box>
    );
  }

  return (
    <List disablePadding>
      {rehearsals.map((rehearsal, index) => (
        <React.Fragment key={rehearsal._id}>
          <ListItem alignItems="flex-start" sx={{ py: 2 }}>
            <ListItemAvatar>
              <Avatar sx={{ bgcolor: 'primary.main' }}>
                <MusicNoteIcon />
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={
                <Typography variant="subtitle1" component="div">
                  {rehearsal.title}
                </Typography>
              }
              secondary={
                <Box sx={{ mt: 0.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                    <AccessTimeIcon fontSize="small" sx={{ color: 'text.secondary', mr: 1 }} />
                    <Typography variant="body2" color="textSecondary" component="span">
                      {format(parseISO(rehearsal.startTime), 'EEE, MMM d • h:mm a')} - {format(parseISO(rehearsal.endTime), 'h:mm a')}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                    <PlaceIcon fontSize="small" sx={{ color: 'text.secondary', mr: 1 }} />
                    <Typography variant="body2" color="textSecondary" component="span">
                      {rehearsal.location.name}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <MusicNoteIcon fontSize="small" sx={{ color: 'text.secondary', mr: 1 }} />
                    <Typography variant="body2" color="textSecondary" component="span">
                      {rehearsal.bandName}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', mt: 1 }}>
                    <Chip 
                      label={`${rehearsal.attendance.filter(a => a.status === 'confirmed').length} Confirmed`} 
                      size="small" 
                      color="success" 
                      variant="outlined"
                      sx={{ mr: 1 }}
                    />
                    <Chip 
                      label={`${rehearsal.attendance.filter(a => a.status === 'pending').length} Pending`} 
                      size="small" 
                      color="warning" 
                      variant="outlined"
                    />
                  </Box>
                </Box>
              }
            />
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', ml: 2 }}>
              <Link 
                component={RouterLink} 
                to={`/rehearsals/${rehearsal._id}`} 
                underline="none"
                sx={{ display: 'flex', alignItems: 'center' }}
              >
                <Typography variant="body2" color="primary">
                  Details
                </Typography>
                <ArrowForwardIcon fontSize="small" sx={{ ml: 0.5 }} />
              </Link>
            </Box>
          </ListItem>
          {index < rehearsals.length - 1 && <Divider component="li" />}
        </React.Fragment>
      ))}
    </List>
  );
};

export default UpcomingRehearsals;