import { API_URL } from '../VideoContext';

export const apiService = {
  // Videos
  fetchVideos: async () => {
    const cacheBuster = `?t=${new Date().getTime()}`;
    const res = await fetch(`${API_URL}/videos${cacheBuster}`);
    if (!res.ok) throw new Error('Error fetching videos');
    return res.json();
  },
  createVideo: async (video: any, isUploading: boolean) => {
    if (isUploading) return false;
    const res = await fetch(`${API_URL}/videos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...video, createdAt: new Date().toISOString() })
    });
    return res.ok;
  },
  updateVideo: async (video: any) => {
    const res = await fetch(`${API_URL}/videos/${video.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(video)
    });
    return res.ok;
  },
  deleteVideo: async (id: string) => {
    const res = await fetch(`${API_URL}/videos/${id}`, { method: 'DELETE' });
    return res.ok;
  },
  incrementView: async (id: string) => {
    fetch(`${API_URL}/videos/${id}/view`, { method: 'POST' }).catch(console.error);
  },

  // Programs
  fetchPrograms: async () => {
    const cacheBuster = `?t=${new Date().getTime()}`;
    const res = await fetch(`${API_URL}/programs${cacheBuster}`);
    if (!res.ok) throw new Error('Error fetching programs');
    return res.json();
  },
  createProgram: async (program: any) => {
    const res = await fetch(`${API_URL}/programs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(program)
    });
    return res.ok;
  },
  updateProgram: async (program: any) => {
    const res = await fetch(`${API_URL}/programs/${program.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(program)
    });
    return res.ok;
  },
  deleteProgram: async (id: string) => {
    const res = await fetch(`${API_URL}/programs/${id}`, { method: 'DELETE' });
    return res.ok;
  },

  // Banners
  fetchBanners: async () => {
    const cacheBuster = `?t=${new Date().getTime()}`;
    const res = await fetch(`${API_URL}/banners${cacheBuster}`);
    if (!res.ok) throw new Error('Error fetching banners');
    return res.json();
  },
  createBanner: async (banner: any) => {
    const res = await fetch(`${API_URL}/banners`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(banner)
    });
    return res.ok;
  },
  updateBanner: async (banner: any) => {
    const res = await fetch(`${API_URL}/banners/${banner.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(banner)
    });
    return res.ok;
  },
  deleteBanner: async (id: string) => {
    const res = await fetch(`${API_URL}/banners/${id}`, { method: 'DELETE' });
    return res.ok;
  },

  // Sponsors
  fetchSponsors: async () => {
    const cacheBuster = `?t=${new Date().getTime()}`;
    const res = await fetch(`${API_URL}/sponsors${cacheBuster}`);
    if (!res.ok) throw new Error('Error fetching sponsors');
    return res.json();
  },
  createSponsor: async (sponsor: any) => {
    const res = await fetch(`${API_URL}/sponsors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sponsor)
    });
    return res.ok;
  },
  updateSponsor: async (sponsor: any) => {
    const res = await fetch(`${API_URL}/sponsors/${sponsor.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sponsor)
    });
    return res.ok;
  },
  deleteSponsor: async (id: string) => {
    const res = await fetch(`${API_URL}/sponsors/${id}`, { method: 'DELETE' });
    return res.ok;
  },

  // Likes
  incrementLike: async (id: string) => {
    fetch(`${API_URL}/videos/${id}/like`, { method: 'POST' }).catch(console.error);
  },

  // Profile
  fetchProfile: async (token: string) => {
    const res = await fetch(`${API_URL}/profile`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Error fetching profile');
    return res.json();
  },
  updateProfile: async (profile: any, token: string) => {
    const res = await fetch(`${API_URL}/profile`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(profile)
    });
    return res.ok;
  }
};
