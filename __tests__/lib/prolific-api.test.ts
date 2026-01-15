/**
 * @jest-environment node
 */

import {
  getCurrentUser,
  getStudy,
  getStudyStatistics,
  getSubmission,
  listStudies,
  listStudySubmissions,
  exportSubmissionsCSV,
  ProlificApiErrorClass,
  type Study,
  type Submission,
  type PaginatedResponse,
} from '../../src/lib/prolific-api'

// Mock fetch globally
global.fetch = jest.fn()

describe('Prolific API Client', () => {
  const mockApiToken = 'test-api-token-123'
  const mockStudyId = 'study-123'
  const mockSubmissionId = 'submission-456'

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getCurrentUser', () => {
    it('should fetch current user information', async () => {
      const mockUser = {
        id: 'user-123',
        name: 'Test User',
        email: 'test@example.com',
        username: 'testuser',
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockUser,
      })

      const result = await getCurrentUser(mockApiToken)

      expect(result).toEqual(mockUser)
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.prolific.com/api/v1/users/me/',
        expect.objectContaining({
          headers: expect.any(Headers),
        })
      )

      const call = (global.fetch as jest.Mock).mock.calls[0]
      const headers = call[1].headers as Headers
      expect(headers.get('Authorization')).toBe(`Token ${mockApiToken}`)
    })

    it('should handle API errors', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ detail: 'Invalid token' }),
      })

      await expect(getCurrentUser(mockApiToken)).rejects.toThrow(ProlificApiErrorClass)
    })
  })

  describe('listStudies', () => {
    it('should fetch list of studies', async () => {
      const mockStudies: PaginatedResponse<Study> = {
        results: [
          {
            id: 'study-1',
            name: 'Test Study 1',
            internal_name: 'test-study-1',
            description: 'A test study',
            external_study_url: 'https://example.com/study',
            status: 'ACTIVE',
            total_available_places: 100,
            places_taken: 50,
            average_reward_per_hour: 12.5,
            average_time_taken: 600,
            maximum_allowed_time: 3600,
            reward: 250,
            device_compatibility: ['desktop', 'mobile'],
            peripheral_requirements: [],
            created_at: '2024-01-01T00:00:00Z',
            published_at: '2024-01-02T00:00:00Z',
          },
        ],
        meta: {
          count: 1,
          next: null,
          previous: null,
        },
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockStudies,
      })

      const result = await listStudies(mockApiToken)

      expect(result).toEqual(mockStudies)
      expect(result.results).toHaveLength(1)
      expect(result.results[0].status).toBe('ACTIVE')
    })
  })

  describe('getStudy', () => {
    it('should fetch a specific study', async () => {
      const mockStudy: Study = {
        id: mockStudyId,
        name: 'Test Study',
        internal_name: 'test-study',
        description: 'A test study',
        external_study_url: 'https://example.com/study',
        status: 'COMPLETED',
        total_available_places: 100,
        places_taken: 100,
        average_reward_per_hour: 12.5,
        average_time_taken: 600,
        maximum_allowed_time: 3600,
        reward: 250,
        device_compatibility: ['desktop'],
        peripheral_requirements: [],
        created_at: '2024-01-01T00:00:00Z',
        published_at: '2024-01-02T00:00:00Z',
        completed_at: '2024-01-10T00:00:00Z',
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockStudy,
      })

      const result = await getStudy(mockStudyId, mockApiToken)

      expect(result).toEqual(mockStudy)
      expect(global.fetch).toHaveBeenCalledWith(
        `https://api.prolific.com/api/v1/studies/${mockStudyId}/`,
        expect.any(Object)
      )
    })
  })

  describe('listStudySubmissions', () => {
    it('should fetch submissions for a study', async () => {
      const mockSubmissions: PaginatedResponse<Submission> = {
        results: [
          {
            id: 'sub-1',
            participant_id: 'participant-1',
            study_id: mockStudyId,
            status: 'APPROVED',
            started_at: '2024-01-05T10:00:00Z',
            completed_at: '2024-01-05T10:15:00Z',
            time_taken: 900,
          },
          {
            id: 'sub-2',
            participant_id: 'participant-2',
            study_id: mockStudyId,
            status: 'AWAITING REVIEW',
            started_at: '2024-01-05T11:00:00Z',
            completed_at: '2024-01-05T11:12:00Z',
            time_taken: 720,
          },
        ],
        meta: {
          count: 2,
          next: null,
          previous: null,
        },
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockSubmissions,
      })

      const result = await listStudySubmissions(mockStudyId, mockApiToken)

      expect(result).toEqual(mockSubmissions)
      expect(result.results).toHaveLength(2)
      expect(result.results[0].status).toBe('APPROVED')
    })
  })

  describe('getSubmission', () => {
    it('should fetch a specific submission', async () => {
      const mockSubmission: Submission = {
        id: mockSubmissionId,
        participant_id: 'participant-1',
        study_id: mockStudyId,
        status: 'APPROVED',
        started_at: '2024-01-05T10:00:00Z',
        completed_at: '2024-01-05T10:15:00Z',
        time_taken: 900,
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockSubmission,
      })

      const result = await getSubmission(mockStudyId, mockSubmissionId, mockApiToken)

      expect(result).toEqual(mockSubmission)
      expect(global.fetch).toHaveBeenCalledWith(
        `https://api.prolific.com/api/v1/studies/${mockStudyId}/submissions/${mockSubmissionId}/`,
        expect.any(Object)
      )
    })
  })

  describe('getStudyStatistics', () => {
    it('should calculate study statistics correctly', async () => {
      const mockStudy: Study = {
        id: mockStudyId,
        name: 'Test Study',
        internal_name: 'test-study',
        description: 'A test study',
        external_study_url: 'https://example.com/study',
        status: 'COMPLETED',
        total_available_places: 100,
        places_taken: 100,
        average_reward_per_hour: 12.5,
        average_time_taken: 600,
        maximum_allowed_time: 3600,
        reward: 250,
        device_compatibility: ['desktop'],
        peripheral_requirements: [],
        created_at: '2024-01-01T00:00:00Z',
        published_at: '2024-01-02T00:00:00Z',
        completed_at: '2024-01-10T00:00:00Z',
      }

      const mockSubmissions: PaginatedResponse<Submission> = {
        results: [
          {
            id: 'sub-1',
            participant_id: 'participant-1',
            study_id: mockStudyId,
            status: 'APPROVED',
            started_at: '2024-01-05T10:00:00Z',
            completed_at: '2024-01-05T10:15:00Z',
            time_taken: 900, // 15 minutes
          },
          {
            id: 'sub-2',
            participant_id: 'participant-2',
            study_id: mockStudyId,
            status: 'APPROVED',
            started_at: '2024-01-05T11:00:00Z',
            completed_at: '2024-01-05T11:05:00Z',
            time_taken: 300, // 5 minutes
          },
          {
            id: 'sub-3',
            participant_id: 'participant-3',
            study_id: mockStudyId,
            status: 'REJECTED',
            started_at: '2024-01-05T12:00:00Z',
            completed_at: '2024-01-05T12:10:00Z',
            time_taken: 600, // 10 minutes
          },
          {
            id: 'sub-4',
            participant_id: 'participant-4',
            study_id: mockStudyId,
            status: 'AWAITING REVIEW',
            started_at: '2024-01-05T13:00:00Z',
            completed_at: '2024-01-05T13:08:00Z',
            time_taken: 480, // 8 minutes
          },
        ],
        meta: {
          count: 4,
          next: null,
          previous: null,
        },
      }

      ;(global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockStudy,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockSubmissions,
        })

      const result = await getStudyStatistics(mockStudyId, mockApiToken)

      expect(result.study).toEqual(mockStudy)
      expect(result.totalSubmissions).toBe(4)
      expect(result.approvedSubmissions).toBe(2)
      expect(result.rejectedSubmissions).toBe(1)
      expect(result.awaitingReviewSubmissions).toBe(1)
      expect(result.completedSubmissions).toBe(3) // approved + rejected
      // Average: (900 + 300 + 600 + 480) / 4 / 60 = 9.5 minutes
      expect(result.averageTimeMinutes).toBeCloseTo(9.5, 1)
    })

    it('should handle studies with no submissions', async () => {
      const mockStudy: Study = {
        id: mockStudyId,
        name: 'Empty Study',
        internal_name: 'empty-study',
        description: 'A study with no submissions',
        external_study_url: 'https://example.com/study',
        status: 'ACTIVE',
        total_available_places: 100,
        places_taken: 0,
        average_reward_per_hour: 12.5,
        average_time_taken: 0,
        maximum_allowed_time: 3600,
        reward: 250,
        device_compatibility: ['desktop'],
        peripheral_requirements: [],
        created_at: '2024-01-01T00:00:00Z',
      }

      const mockSubmissions: PaginatedResponse<Submission> = {
        results: [],
        meta: {
          count: 0,
          next: null,
          previous: null,
        },
      }

      ;(global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockStudy,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockSubmissions,
        })

      const result = await getStudyStatistics(mockStudyId, mockApiToken)

      expect(result.totalSubmissions).toBe(0)
      expect(result.approvedSubmissions).toBe(0)
      expect(result.rejectedSubmissions).toBe(0)
      expect(result.awaitingReviewSubmissions).toBe(0)
      expect(result.averageTimeMinutes).toBeNull()
    })
  })

  describe('exportSubmissionsCSV', () => {
    it('should export submissions as CSV', async () => {
      const mockSubmissions: PaginatedResponse<Submission> = {
        results: [
          {
            id: 'sub-1',
            participant_id: 'participant-1',
            study_id: mockStudyId,
            status: 'APPROVED',
            started_at: '2024-01-05T10:00:00Z',
            completed_at: '2024-01-05T10:15:00Z',
            time_taken: 900,
          },
          {
            id: 'sub-2',
            participant_id: 'participant-2',
            study_id: mockStudyId,
            status: 'AWAITING REVIEW',
            started_at: '2024-01-05T11:00:00Z',
            completed_at: '2024-01-05T11:12:00Z',
            time_taken: 720,
          },
        ],
        meta: {
          count: 2,
          next: null,
          previous: null,
        },
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockSubmissions,
      })

      const result = await exportSubmissionsCSV(mockStudyId, mockApiToken)

      expect(result).toContain('id,participant_id,status')
      expect(result).toContain('sub-1,participant-1,APPROVED')
      expect(result).toContain('sub-2,participant-2,AWAITING REVIEW')
      expect(result.split('\n')).toHaveLength(3) // header + 2 rows
    })

    it('should handle empty submissions', async () => {
      const mockSubmissions: PaginatedResponse<Submission> = {
        results: [],
        meta: {
          count: 0,
          next: null,
          previous: null,
        },
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockSubmissions,
      })

      const result = await exportSubmissionsCSV(mockStudyId, mockApiToken)

      expect(result).toBe('id,participant_id,status,started_at,completed_at,time_taken\n')
    })
  })

  describe('Error handling', () => {
    it('should throw ProlificApiErrorClass with status code', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ detail: 'Study not found' }),
      })

      try {
        await getStudy(mockStudyId, mockApiToken)
        fail('Should have thrown an error')
      } catch (error) {
        expect(error).toBeInstanceOf(ProlificApiErrorClass)
        expect((error as ProlificApiErrorClass).statusCode).toBe(404)
        expect((error as ProlificApiErrorClass).message).toBe('Study not found')
      }
    })

    it('should handle network errors', async () => {
      ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))

      await expect(getCurrentUser(mockApiToken)).rejects.toThrow(ProlificApiErrorClass)
    })
  })
})
