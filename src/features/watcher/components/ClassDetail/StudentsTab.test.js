import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import api from '../../../../api/axios';
import StudentsTab from './StudentsTab';

jest.mock('../../../../api/axios', () => ({
  post: jest.fn(),
}));

jest.mock('react-toastify', () => ({
  toast: { error: jest.fn() },
}));

describe('StudentsTab JCode connection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.open = jest.fn();
  });

  test('opens the JCode URL returned in the response body', async () => {
    api.post.mockResolvedValue({
      request: { responseURL: 'https://jcode.jedutools.io/api/redirect' },
      data: { url: 'https://jcode.jedutools.io/jcode/session-id/' },
    });

    render(
      <StudentsTab
        students={[{
          email: 'student@example.com',
          name: 'Student',
          studentNum: '202600001',
          courseRole: 'STUDENT',
        }]}
        searchQuery=""
        onSearchChange={jest.fn()}
        sort={{ field: 'name', order: 'asc' }}
        onToggleSort={jest.fn()}
        onWithdrawUser={jest.fn()}
        onPromoteStudent={jest.fn()}
        userRole="PROFESSOR"
        courseId={60}
        isDarkMode={false}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'JCode' }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/api/redirect', {
        userEmail: 'student@example.com',
        courseId: 60,
      }, { withCredentials: true });
      expect(window.open).toHaveBeenCalledWith(
        'https://jcode.jedutools.io/jcode/session-id/',
        '_blank'
      );
    });
  });
});
