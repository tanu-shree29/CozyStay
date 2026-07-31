import { beforeEach, describe, expect, it, vi } from 'vitest';

const { client } = vi.hoisted(() => ({
  client: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));

vi.mock('../api/client', async (importOriginal) => {
  const mod = await importOriginal<typeof import('../api/client')>();
  return { ...mod, apiClient: client };
});

import { messageApi } from '../api';

const SNAKE_MSG = {
  id: 1,
  contact_request_id: 7,
  sender_id: 1,
  sender_name: 'Alice Host',
  text: 'Are you there?',
  deleted: false,
  created_at: '2026-07-31T06:00:00',
  read_at: null,
};

beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
});

describe('messageApi.getConversations', () => {
  it('maps backend conversations into the frontend shape', async () => {
    client.get.mockResolvedValueOnce({
      data: [
        {
          id: 'conv-7',
          contact_request_id: 7,
          with_user_id: 3,
          with_user_name: 'Charlie Guest',
          with_user_photo: '',
          property_title: 'Cozy Beach House',
          property_id: 1,
          last_message: 'Are you there?',
          last_message_deleted: false,
          last_message_at: '2026-07-31T06:00:00',
          unread: 1,
        },
      ],
    });
    const convos = await messageApi.getConversations();
    expect(client.get).toHaveBeenCalledWith('/messages/conversations');
    expect(convos).toEqual([
      {
        id: 'conv-7',
        contactRequestId: '7',
        withUserId: '3',
        withUserName: 'Charlie Guest',
        withUserPhoto: '',
        propertyTitle: 'Cozy Beach House',
        propertyId: '1',
        lastMessage: 'Are you there?',
        lastMessageAt: '2026-07-31T06:00:00',
        unread: 1,
      },
    ]);
  });

  it('sends the contact_request_id and text to the real endpoint', async () => {
    client.post.mockResolvedValueOnce({ data: SNAKE_MSG });
    const sent = await messageApi.send('7', 'Are you there?');
    expect(client.post).toHaveBeenCalledWith('/messages/', {
      contact_request_id: 7,
      text: 'Are you there?',
    });
    expect(sent.contactRequestId).toBe('7');
    expect(sent.senderName).toBe('Alice Host');
  });
});

describe('messageApi.markConversationRead', () => {
  it('PUTs the read marker and returns the unread summary', async () => {
    client.put.mockResolvedValueOnce({ data: { updated: 2, unread: 0 } });
    const result = await messageApi.markConversationRead('7');
    expect(client.put).toHaveBeenCalledWith('/messages/by-request/7/read');
    expect(result).toEqual({ updated: 2, unread: 0 });
  });
});

describe('messageApi.deleteMessage', () => {
  it('soft-deletes a message via the endpoint and maps the result', async () => {
    client.delete.mockResolvedValueOnce({ data: { ...SNAKE_MSG, deleted: true } });
    const deleted = await messageApi.deleteMessage('1');
    expect(client.delete).toHaveBeenCalledWith('/messages/1');
    expect(deleted.deleted).toBe(true);
  });
});
