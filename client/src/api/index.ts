import { AuthResponse, Booking, ContactRequest, Conversation, Message, Notification, Property, Review, User } from '../types';
import { apiClient, toAppError } from './client';

const asString = (v: unknown) => (v === null || v === undefined ? '' : String(v));

function mapUser(u: any): User {
  return {
    id: asString(u.id),
    name: u.name,
    email: u.email,
    role: u.role,
    profilePhoto: u.profile_photo ?? undefined,
    createdAt: u.created_at ?? '',
  };
}

function mapProperty(p: any): Property {
  return {
    id: asString(p.id),
    hostId: asString(p.host_id),
    hostName: p.host_name ?? '',
    hostPhoto: p.host_photo ?? undefined,
    title: p.title,
    description: p.description,
    pricePerNight: Number(p.price_per_night),
    location: p.location,
    photos: p.photos ?? [],
    amenities: p.amenities ?? [],
    isActive: p.is_active,
    avgRating: p.avg_rating ?? undefined,
    reviewCount: p.review_count ?? 0,
    createdAt: p.created_at ?? '',
    blockedDates: p.blocked_dates ?? undefined,
  };
}

function mapBooking(b: any): Booking {
  return {
    id: asString(b.id),
    propertyId: asString(b.property_id),
    propertyTitle: b.property_title ?? '',
    propertyPhoto: b.property_photo ?? '',
    guestId: asString(b.guest_id),
    guestName: b.guest_name ?? '',
    hostId: asString(b.host_id),
    hostName: b.host_name ?? undefined,
    property: b.property ? mapProperty(b.property) : undefined,
    guest: b.guest ?? undefined,
    startDate: b.start_date ?? '',
    endDate: b.end_date ?? '',
    status: b.status,
    createdAt: b.created_at ?? '',
  };
}

function mapReview(r: any): Review {
  return {
    id: asString(r.id),
    bookingId: asString(r.booking_id),
    userId: asString(r.user_id),
    userName: r.user_name ?? '',
    propertyId: asString(r.property_id),
    rating: Number(r.rating),
    text: r.text ?? '',
    createdAt: r.created_at ?? '',
  };
}

function mapContactRequest(cr: any): ContactRequest {
  return {
    id: asString(cr.id),
    propertyId: asString(cr.property_id),
    propertyTitle: cr.property_title ?? undefined,
    guestId: asString(cr.guest_id),
    guestName: cr.guest_name ?? '',
    hostId: asString(cr.host_id),
    hostName: cr.host_name ?? undefined,
    status: cr.status,
    message: cr.message ?? undefined,
    createdAt: cr.created_at ?? '',
    updatedAt: cr.updated_at ?? undefined,
  };
}

function mapMessage(m: any): Message {
  return {
    id: asString(m.id),
    contactRequestId: asString(m.contact_request_id),
    senderId: asString(m.sender_id),
    senderName: m.sender_name ?? '',
    text: m.text,
    createdAt: m.created_at ?? '',
    readAt: m.read_at ?? undefined,
    deleted: m.deleted ?? false,
  };
}

function mapNotification(n: any): Notification {
  return {
    id: asString(n.id),
    userId: asString(n.user_id),
    type: n.type,
    referenceId: asString(n.reference_id),
    title: n.title,
    message: n.message ?? '',
    read: n.read,
    actionUrl: n.action_url ?? undefined,
    createdAt: n.created_at ?? '',
  };
}

function mapConversation(c: any): Conversation {
  return {
    id: c.id,
    contactRequestId: asString(c.contact_request_id),
    withUserId: asString(c.with_user_id),
    withUserName: c.with_user_name,
    withUserPhoto: c.with_user_photo ?? '',
    propertyTitle: c.property_title,
    propertyId: asString(c.property_id),
    lastMessage: c.last_message ?? undefined,
    lastMessageAt: c.last_message_at ?? undefined,
    unread: Number(c.unread ?? 0),
  };
}

export const authApi = {
  register: async (data: { name: string; email: string; password: string; role?: string }): Promise<AuthResponse> => {
    try {
      const res = await apiClient.post('/auth/register', data);
      return { token: res.data.token, user: mapUser(res.data.user) };
    } catch (e) { toAppError(e); }
  },
  login: async (data: { email: string; password: string }): Promise<AuthResponse> => {
    try {
      const res = await apiClient.post('/auth/login', data);
      return { token: res.data.token, user: mapUser(res.data.user) };
    } catch (e) { toAppError(e); }
  },
  googleLogin: async (credential: string): Promise<AuthResponse> => {
    try {
      const res = await apiClient.post('/auth/google', { credential });
      return { token: res.data.token, user: mapUser(res.data.user) };
    } catch (e) { toAppError(e); }
  },
  getMe: async (): Promise<User> => {
    try {
      const res = await apiClient.get('/auth/me');
      return mapUser(res.data.user);
    } catch (e) { toAppError(e); }
  },
};

export const propertyApi = {
  getAll: async (params?: { location?: string; maxPrice?: number; amenities?: string[] }): Promise<Property[]> => {
    try {
      const res = await apiClient.get('/properties', {
        params: {
          location: params?.location || undefined,
          max_price: params?.maxPrice || undefined,
          amenities: params?.amenities && params.amenities.length > 0 ? params.amenities.join(',') : undefined,
        },
      });
      return res.data.map(mapProperty);
    } catch (e) { toAppError(e); }
  },
  getById: async (id: string): Promise<Property> => {
    try {
      const res = await apiClient.get(`/properties/${id}`);
      return mapProperty(res.data);
    } catch (e) { toAppError(e); }
  },
  create: async (data: Partial<Property>): Promise<Property> => {
    try {
      const res = await apiClient.post('/properties', {
        title: data.title,
        description: data.description,
        price_per_night: data.pricePerNight,
        location: data.location,
        photos: data.photos,
        amenities: data.amenities ?? [],
      });
      return mapProperty(res.data);
    } catch (e) { toAppError(e); }
  },
  update: async (id: string, data: Partial<Property>): Promise<Property> => {
    try {
      const res = await apiClient.put(`/properties/${id}`, {
        title: data.title,
        description: data.description,
        price_per_night: data.pricePerNight,
        location: data.location,
        photos: data.photos,
        amenities: data.amenities,
      });
      return mapProperty(res.data);
    } catch (e) { toAppError(e); }
  },
  delete: async (id: string): Promise<{ message: string }> => {
    try {
      const res = await apiClient.delete(`/properties/${id}`);
      return res.data;
    } catch (e) { toAppError(e); }
  },
};

export const bookingApi = {
  create: async (data: { propertyId: string; startDate: string; endDate: string }): Promise<Booking> => {
    try {
      const res = await apiClient.post('/bookings/', {
        property_id: Number(data.propertyId),
        start_date: data.startDate,
        end_date: data.endDate,
      });
      return mapBooking(res.data);
    } catch (e) { toAppError(e); }
  },
  getMy: async (): Promise<Booking[]> => {
    try {
      const res = await apiClient.get('/bookings/my');
      return res.data.map(mapBooking);
    } catch (e) { toAppError(e); }
  },
  getRequests: async (): Promise<Booking[]> => {
    try {
      const res = await apiClient.get('/bookings/requests');
      return res.data.map(mapBooking);
    } catch (e) { toAppError(e); }
  },
  respond: async (id: string, action: 'confirmed' | 'declined'): Promise<Booking> => {
    try {
      const res = await apiClient.put(`/bookings/${id}/respond`, { action });
      return mapBooking(res.data);
    } catch (e) { toAppError(e); }
  },
};

export const reviewApi = {
  getByProperty: async (propertyId: string): Promise<Review[]> => {
    try {
      const res = await apiClient.get(`/reviews/property/${propertyId}`);
      return res.data.map(mapReview);
    } catch (e) { toAppError(e); }
  },
  getByUser: async (userId: string): Promise<Review[]> => {
    try {
      const res = await apiClient.get(`/reviews/user/${userId}`);
      return res.data.map(mapReview);
    } catch (e) { toAppError(e); }
  },
  create: async (data: { bookingId: string; propertyId: string; rating: number; text: string }): Promise<Review> => {
    try {
      const res = await apiClient.post('/reviews/', {
        booking_id: Number(data.bookingId),
        rating: data.rating,
        text: data.text,
      });
      return mapReview(res.data);
    } catch (e) { toAppError(e); }
  },
};

export const userApi = {
  getAll: async (): Promise<User[]> => {
    try {
      const res = await apiClient.get('/users/');
      return res.data.map(mapUser);
    } catch (e) { toAppError(e); }
  },
  update: async (id: string, data: Partial<User>): Promise<User> => {
    try {
      const res = await apiClient.put(`/users/${id}`, {
        name: data.name,
        email: data.email,
        role: data.role,
        profile_photo: data.profilePhoto,
      });
      return mapUser(res.data);
    } catch (e) { toAppError(e); }
  },
  delete: async (id: string): Promise<{ message: string }> => {
    try {
      const res = await apiClient.delete(`/users/${id}`);
      return res.data;
    } catch (e) { toAppError(e); }
  },
};

export const contactRequestApi = {
  create: async (data: { propertyId: string; message?: string }): Promise<ContactRequest> => {
    try {
      const res = await apiClient.post('/contact-requests/', {
        property_id: Number(data.propertyId),
        message: data.message ?? '',
      });
      return mapContactRequest(res.data);
    } catch (e) { toAppError(e); }
  },
  getMy: async (role?: string): Promise<ContactRequest[]> => {
    try {
      const res = await apiClient.get('/contact-requests/', { params: { role: role || '' } });
      return res.data.map(mapContactRequest);
    } catch (e) { toAppError(e); }
  },
  respond: async (id: string, action: 'approved' | 'declined'): Promise<ContactRequest> => {
    try {
      const res = await apiClient.put(`/contact-requests/${id}/respond`, { action });
      return mapContactRequest(res.data);
    } catch (e) { toAppError(e); }
  },
};

export const messageApi = {
  send: async (contactRequestId: string, text: string): Promise<Message> => {
    try {
      const res = await apiClient.post('/messages/', {
        contact_request_id: Number(contactRequestId),
        text,
      });
      return mapMessage(res.data);
    } catch (e) { toAppError(e); }
  },
  getByRequest: async (contactRequestId: string): Promise<Message[]> => {
    try {
      const res = await apiClient.get(`/messages/by-request/${contactRequestId}`);
      return res.data.map(mapMessage);
    } catch (e) { toAppError(e); }
  },
  markConversationRead: async (contactRequestId: string): Promise<{ updated: number; unread: number }> => {
    try {
      const res = await apiClient.put(`/messages/by-request/${contactRequestId}/read`);
      return res.data;
    } catch (e) { toAppError(e); }
  },
  deleteMessage: async (id: string): Promise<Message> => {
    try {
      const res = await apiClient.delete(`/messages/${id}`);
      return mapMessage(res.data);
    } catch (e) { toAppError(e); }
  },
  getConversations: async (): Promise<Conversation[]> => {
    try {
      const res = await apiClient.get('/messages/conversations');
      return res.data.map(mapConversation);
    } catch (e) { toAppError(e); }
  },
};

export const notificationApi = {
  getAll: async (): Promise<Notification[]> => {
    try {
      const res = await apiClient.get('/notifications/');
      return res.data.map(mapNotification);
    } catch (e) { toAppError(e); }
  },
  getUnreadCount: async (): Promise<number> => {
    try {
      const res = await apiClient.get('/notifications/unread-count');
      return Number(res.data.count ?? 0);
    } catch (e) { toAppError(e); }
  },
  markRead: async (id: string): Promise<void> => {
    try {
      await apiClient.put(`/notifications/${id}/read`);
    } catch (e) { toAppError(e); }
  },
  markAllRead: async (): Promise<void> => {
    try {
      await apiClient.put('/notifications/read-all');
    } catch (e) { toAppError(e); }
  },
  delete: async (id: string): Promise<{ message: string }> => {
    try {
      const res = await apiClient.delete(`/notifications/${id}`);
      return res.data;
    } catch (e) { toAppError(e); }
  },
};

export const adminApi = {
  getStats: async (): Promise<{ totalUsers: number; totalActiveListings: number; totalBookings: number }> => {
    try {
      const res = await apiClient.get('/admin/stats');
      return {
        totalUsers: Number(res.data.total_users ?? 0),
        totalActiveListings: Number(res.data.total_active_listings ?? 0),
        totalBookings: Number(res.data.total_bookings ?? 0),
      };
    } catch (e) { toAppError(e); }
  },
  getListings: async (): Promise<Property[]> => {
    try {
      const res = await apiClient.get('/admin/listings');
      return res.data.map(mapProperty);
    } catch (e) { toAppError(e); }
  },
  getBookings: async (): Promise<Booking[]> => {
    try {
      const res = await apiClient.get('/admin/bookings');
      return res.data.map(mapBooking);
    } catch (e) { toAppError(e); }
  },
  deleteListing: async (id: string): Promise<{ message: string }> => {
    try {
      const res = await apiClient.delete(`/admin/listings/${id}`);
      return res.data;
    } catch (e) { toAppError(e); }
  },
  deleteBooking: async (id: string): Promise<{ message: string }> => {
    try {
      const res = await apiClient.delete(`/admin/bookings/${id}`);
      return res.data;
    } catch (e) { toAppError(e); }
  },
};
