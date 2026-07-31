import { useState } from 'react';
import {
  Container, Typography, Box, Paper, Avatar, TextField, Button, Alert, Grid, CircularProgress,
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import PhotoUploader from '../components/PhotoUploader';

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const [photoUrl, setPhotoUrl] = useState(user?.profilePhoto || '');
  const [name, setName] = useState(user?.name || '');
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  if (!user) return null;

  const handleSave = async () => {
    setError('');
    setSaving(true);
    try {
      await updateProfile({ name, profilePhoto: photoUrl });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>My Profile</Typography>
      <Paper sx={{ p: 4, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 4, flexWrap: 'wrap' }}>
          <Avatar
            src={photoUrl}
            sx={{ width: 96, height: 96, bgcolor: 'primary.main', fontSize: '2.5rem' }}
          >
            {name.charAt(0)}
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>{name}</Typography>
            <Typography variant="body2" color="text.secondary">{user.email}</Typography>
            <Typography variant="caption" color="text.secondary">
              Role: {user.role} · Member since {new Date(user.createdAt).toLocaleDateString()}
            </Typography>
          </Box>
        </Box>

        <Grid container spacing={2.5} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField label="Display Name" fullWidth value={name}
              onChange={(e) => setName(e.target.value)} size="small" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField label="Email" fullWidth value={user.email} disabled size="small" />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Typography variant="subtitle2" sx={{ mb: 0.5, fontWeight: 600 }}>Profile Photo</Typography>
            <PhotoUploader
              value={photoUrl ? [photoUrl] : []}
              onChange={(urls) => setPhotoUrl(urls[0] || '')}
              max={1}
              multiple={false}
              label="Upload photo (mock upload, no platform)"
            />
          </Grid>
        </Grid>

        {saved && <Alert severity="success" sx={{ mb: 2, borderRadius: 1 }}>Profile updated!</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 1 }}>{error}</Alert>}

        <Button variant="contained" onClick={handleSave} disabled={saving} sx={{ px: 4 }}>
          {saving ? <CircularProgress size={22} color="inherit" /> : 'Save Changes'}
        </Button>
      </Paper>
    </Container>
  );
}
