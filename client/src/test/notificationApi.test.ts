import { beforeEach, describe, expect, it, vi } from 'vitest';

const { client } = vi.hoisted(() => ({
  client: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));

vi.mock('../api/client', async (importOriginal) => {
  const mod = await importOriginal<typeof import('../api/client')>();
  return { ...mod, apiClient: client };
});

import { notificationApi, contactRequestApi, propertyApi } from '../api';

const SNAKE_NOTIF = {
  id: 1,
  user_id: 3,
  type: 'contact_request',
  reference_id: 7,
  title: 'New Contact Request',
  message: 'A guest wants to connect',
  action_url: '/messages',
  read: false,
  created_at: '2026-07-31T06:00:00',
};

beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
});

describe('notificationApi', () => {
  it('maps notifications from snake_case to the frontend shape', async () => {
    client.get.mockResolvedValueOnce({ data: [SNAKE_NOTIF] });
    const notifs = await notificationApi.getAll();
    expect(client.get).toHaveBeenCalledWith('/notifications/');
    expect(notifs).toEqual([
      {
        id: '1',
        userId: '3',
        type: 'contact_request',
        referenceId: '7',
        title: 'New Contact Request',
        message: 'A guest wants to connect',
        read: false,
        actionUrl: '/messages',
        createdAt: '2026-07-31T06:00:00',
      },
    ]);
  });

  it('reports an unread count', async () => {
    client.get.mockResolvedValueOnce({ data: { count: 3 } });
    const count = await notificationApi.getUnreadCount();
    expect(count).toBe(3);
    expect(client.get).toHaveBeenCalledWith('/notifications/unread-count');
  });

  it('marks a single notification as read', async () => {
    client.put.mockResolvedValueOnce({ data: { ...SNAKE_NOTIF, read: true } });
    await notificationApi.markRead('1');
    expect(client.put).toHaveBeenCalledWith('/notifications/1/read');
  });

  it('marks all notifications as read', async () => {
    client.put.mockResolvedValueOnce({ data: { message: 'All marked as read' } });
    await notificationApi.markAllRead();
    expect(client.put).toHaveBeenCalledWith('/notifications/read-all');
  });

  it('deletes a notification', async () => {
    client.delete.mockResolvedValueOnce({ data: { message: 'Notification deleted' } });
    await notificationApi.delete('1');
    expect(client.delete).toHaveBeenCalledWith('/notifications/1');
  });

  it('normalizes backend {error} payloads into {message} for the UI', async () => {
    client.get.mockRejectedValueOnce({ response: { status: 404, data: { error: 'Not found' } } });
    await expect(notificationApi.getAll()).rejects.toMatchObject({
      response: { status: 404, data: { message: 'Not found' } },
    });
  });
});

describe('contactRequestApi', () => {
  it('posts the property_id payload when creating a request', async () => {
    localStorage.setItem('token', 'some-token');
    client.post.mockResolvedValueOnce({
      data: {
        id: 5, property_id: 1, guest_id: 3, guest_name: 'Charlie', host_id: 1,
        status: 'pending', message: 'Hi!', created_at: '2026-07-31T06:00:00',
      },
    });
    await contactRequestApi.create({ propertyId: '1', message: 'Hi!' });
    expect(client.post).toHaveBeenCalledWith('/contact-requests/', {
      property_id: 1,
      message: 'Hi!',
    });
  });

  it('responds with the action the host chose', async () => {
    client.put.mockResolvedValueOnce({ data: { id: 5, status: 'approved' } });
    await contactRequestApi.respond('5', 'approved');
    expect(client.put).toHaveBeenCalledWith('/contact-requests/5/respond', { action: 'approved' });
  });

  it('loads property details by id through the real endpoint', async () => {
    client.get.mockResolvedValueOnce({
      data: {
        id: 1, host_id: 1, host_name: 'Alice Host', title: 'Cozy Beach House',
        price_per_night: 150, location: 'Miami, FL', photos: ['a.jpg'], amenities: ['WiFi'],
        is_active: true, review_count: 1, avg_rating: 5, created_at: '2026-07-31T06:00:00',
      },
    });
    const prop = await propertyApi.getById('1');
    expect(client.get).toHaveBeenCalledWith('/properties/1');
    expect(prop.hostName).toBe('Alice Host');
    expect(prop.pricePerNight).toBe(150);
    expect(prop.avgRating).toBe(5);
  });
});
