/**
 * @jest-environment node
 */

import {
  getCurrentUser,
  getStudy,
  getStudyStatistics,
  getStudyDemographics,
  getSubmission,
  getSubmissionDemographics,
  listStudies,
  listStudySubmissions,
  exportSubmissionsCSV,
  bulkApproveSubmissions,
  bulkRejectSubmissions,
  rejectSubmission,
  getSubmissionIdsByParticipant,
  sendMessage,
  listUserMessages,
  listRecentMessages,
  REJECTION_CATEGORIES,
  ProlificApiErrorClass,
  type Study,
  type Submission,
  type SubmissionDemographics,
  type Message,
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
            filters: [],
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

    it('should normalize date_created into created_at when created_at is missing', async () => {
      const mockStudies = {
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
            date_created: '2024-01-01T00:00:00Z',
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

      expect(result.results[0].created_at).toBe('2024-01-01T00:00:00Z')
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
        filters: [],
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

    it('should normalize date_created into created_at when created_at is missing', async () => {
      const mockStudy = {
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
        date_created: '2024-01-01T00:00:00Z',
        published_at: '2024-01-02T00:00:00Z',
        completed_at: '2024-01-10T00:00:00Z',
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockStudy,
      })

      const result = await getStudy(mockStudyId, mockApiToken)

      expect(result.created_at).toBe('2024-01-01T00:00:00Z')
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

      expect(result.results).toHaveLength(2)
      expect(result.results[0].status).toBe('APPROVED')
    })

    it('should follow pagination to fetch all pages', async () => {
      const page1: PaginatedResponse<Submission> = {
        results: [
          {
            id: 'sub-1',
            participant_id: 'p-1',
            study_id: mockStudyId,
            status: 'APPROVED',
            started_at: '2024-01-05T10:00:00Z',
            completed_at: '2024-01-05T10:15:00Z',
            time_taken: 900,
          },
        ],
        meta: {
          count: 2,
          next: `https://api.prolific.com/api/v1/studies/${mockStudyId}/submissions/?page=2`,
          previous: null,
        },
      }

      const page2: PaginatedResponse<Submission> = {
        results: [
          {
            id: 'sub-2',
            participant_id: 'p-2',
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

      ;(global.fetch as jest.Mock)
        .mockResolvedValueOnce({ ok: true, json: async () => page1 })
        .mockResolvedValueOnce({ ok: true, json: async () => page2 })

      const result = await listStudySubmissions(mockStudyId, mockApiToken)

      expect(result.results).toHaveLength(2)
      expect(result.results[0].id).toBe('sub-1')
      expect(result.results[1].id).toBe('sub-2')
      expect(global.fetch).toHaveBeenCalledTimes(2)
      // Verify second call used the correct paginated path
      const secondCall = (global.fetch as jest.Mock).mock.calls[1][0]
      expect(secondCall).toContain('/submissions/')
      expect(secondCall).toContain('page=2')
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
        filters: [],
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

    it('should properly escape CSV fields with commas', async () => {
      const mockSubmissions: PaginatedResponse<Submission> = {
        results: [
          {
            id: 'sub-1',
            participant_id: 'participant,with,commas',
            study_id: mockStudyId,
            status: 'APPROVED',
            started_at: '2024-01-05T10:00:00Z',
            completed_at: '2024-01-05T10:15:00Z',
            time_taken: 900,
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
        json: async () => mockSubmissions,
      })

      const result = await exportSubmissionsCSV(mockStudyId, mockApiToken)

      expect(result).toContain('"participant,with,commas"')
    })

    it('should properly escape CSV fields with quotes', async () => {
      const mockSubmissions: PaginatedResponse<Submission> = {
        results: [
          {
            id: 'sub-1',
            participant_id: 'participant"with"quotes',
            study_id: mockStudyId,
            status: 'APPROVED',
            started_at: '2024-01-05T10:00:00Z',
            completed_at: '2024-01-05T10:15:00Z',
            time_taken: 900,
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
        json: async () => mockSubmissions,
      })

      const result = await exportSubmissionsCSV(mockStudyId, mockApiToken)

      expect(result).toContain('"participant""with""quotes"')
    })

    it('should properly escape CSV fields with newlines', async () => {
      const mockSubmissions: PaginatedResponse<Submission> = {
        results: [
          {
            id: 'sub-1',
            participant_id: 'participant\nwith\nnewlines',
            study_id: mockStudyId,
            status: 'APPROVED',
            started_at: '2024-01-05T10:00:00Z',
            completed_at: '2024-01-05T10:15:00Z',
            time_taken: 900,
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
        json: async () => mockSubmissions,
      })

      const result = await exportSubmissionsCSV(mockStudyId, mockApiToken)

      expect(result).toContain('"participant\nwith\nnewlines"')
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

  describe('bulkApproveSubmissions', () => {
    it('should send bulk approve request with study ID and participant IDs', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        text: async () => '{}',
      })

      const participantIds = ['pid-1', 'pid-2', 'pid-3']
      await bulkApproveSubmissions(mockStudyId, participantIds, mockApiToken)

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.prolific.com/api/v1/submissions/bulk-approve/',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            study_id: mockStudyId,
            participant_ids: participantIds,
          }),
        })
      )

      const call = (global.fetch as jest.Mock).mock.calls[0]
      const headers = call[1].headers as Headers
      expect(headers.get('Authorization')).toBe(`Token ${mockApiToken}`)
      expect(headers.get('Content-Type')).toBe('application/json')
    })

    it('should handle 204 empty body response', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 204,
        text: async () => '',
      })

      await expect(
        bulkApproveSubmissions(mockStudyId, ['pid-1'], mockApiToken)
      ).resolves.toBeUndefined()
    })

    it('should throw on API error', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ detail: 'Invalid participant IDs' }),
      })

      await expect(bulkApproveSubmissions(mockStudyId, ['bad-pid'], mockApiToken)).rejects.toThrow(
        ProlificApiErrorClass
      )
    })

    it('should throw on API error with empty body', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => {
          throw new Error('no body')
        },
      })

      await expect(bulkApproveSubmissions(mockStudyId, ['pid-1'], mockApiToken)).rejects.toThrow(
        ProlificApiErrorClass
      )
    })

    it('should wrap network errors in ProlificApiErrorClass', async () => {
      ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('DNS resolution failed'))

      await expect(bulkApproveSubmissions(mockStudyId, ['pid-1'], mockApiToken)).rejects.toThrow(
        ProlificApiErrorClass
      )
    })
  })

  describe('bulkRejectSubmissions', () => {
    it('should send bulk reject request with study ID and participant IDs', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        text: async () => '"The request to bulk reject has been made successfully."',
      })

      const participantIds = ['pid-1', 'pid-2']
      await bulkRejectSubmissions(mockStudyId, participantIds, mockApiToken)

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.prolific.com/api/v1/submissions/bulk-reject/',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            study_id: mockStudyId,
            participant_ids: participantIds,
          }),
        })
      )
    })

    it('should throw on API error', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ detail: 'Invalid participant IDs' }),
      })

      await expect(bulkRejectSubmissions(mockStudyId, ['bad-pid'], mockApiToken)).rejects.toThrow(
        ProlificApiErrorClass
      )
    })

    it('should wrap network errors', async () => {
      ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network failure'))

      await expect(bulkRejectSubmissions(mockStudyId, ['pid-1'], mockApiToken)).rejects.toThrow(
        ProlificApiErrorClass
      )
    })
  })

  describe('rejectSubmission', () => {
    it('should send transition request with categories and message', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        text: async () => '{}',
      })

      await rejectSubmission(
        'sub-123',
        [REJECTION_CATEGORIES.FAILED_ATTENTION_CHECK, REJECTION_CATEGORIES.OTHER],
        'You failed attention checks.',
        mockApiToken
      )

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.prolific.com/api/v1/submissions/sub-123/transition/',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            action: 'REJECT',
            rejection_categories: ['FAILED_ATTENTION_CHECK', 'OTHER'],
            message: 'You failed attention checks.',
          }),
        })
      )
    })

    it('should throw on API error', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 422,
        json: async () => ({ detail: 'Invalid transition' }),
      })

      await expect(
        rejectSubmission('sub-bad', [REJECTION_CATEGORIES.OTHER], 'test', mockApiToken)
      ).rejects.toThrow(ProlificApiErrorClass)
    })
  })

  describe('getSubmissionIdsByParticipant', () => {
    it('should map participant IDs to submission IDs', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          results: [
            {
              id: 'sub-1',
              participant_id: 'pid-a',
              study_id: mockStudyId,
              status: 'AWAITING REVIEW',
              started_at: '',
            },
            {
              id: 'sub-2',
              participant_id: 'pid-b',
              study_id: mockStudyId,
              status: 'AWAITING REVIEW',
              started_at: '',
            },
            {
              id: 'sub-3',
              participant_id: 'pid-c',
              study_id: mockStudyId,
              status: 'APPROVED',
              started_at: '',
            },
          ],
        }),
      })

      const result = await getSubmissionIdsByParticipant(
        mockStudyId,
        ['pid-a', 'pid-c'],
        mockApiToken
      )

      expect(result.get('pid-a')).toBe('sub-1')
      expect(result.get('pid-c')).toBe('sub-3')
      expect(result.has('pid-b')).toBe(false)
    })
  })

  // -------------------------------------------------------------------------
  // Messaging API
  // -------------------------------------------------------------------------

  describe('sendMessage', () => {
    it('should POST a message to the messages endpoint', async () => {
      const mockMessage: Message = {
        id: 'msg-1',
        sender_id: 'researcher-1',
        body: 'Hello, please complete the survey.',
        sent_at: '2024-06-01T12:00:00Z',
        channel_id: 'channel-1',
        data: {
          study_id: mockStudyId,
        },
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        text: async () => JSON.stringify(mockMessage),
      })

      await sendMessage(
        mockStudyId,
        'participant-1',
        'Hello, please complete the survey.',
        mockApiToken
      )
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.prolific.com/api/v1/messages/',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            recipient_id: 'participant-1',
            body: 'Hello, please complete the survey.',
            study_id: mockStudyId,
          }),
        })
      )

      const call = (global.fetch as jest.Mock).mock.calls[0]
      const headers = call[1].headers as Headers
      expect(headers.get('Authorization')).toBe(`Token ${mockApiToken}`)
      expect(headers.get('Content-Type')).toBe('application/json')
    })

    it('should throw ProlificApiErrorClass on API error', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        text: async () => '{"detail": "Invalid participant ID"}',
      })

      await expect(sendMessage(mockStudyId, 'bad-pid', 'Hello', mockApiToken)).rejects.toThrow(
        ProlificApiErrorClass
      )
    })

    it('should throw ProlificApiErrorClass on network error', async () => {
      ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))

      await expect(
        sendMessage(mockStudyId, 'participant-1', 'Hello', mockApiToken)
      ).rejects.toThrow(ProlificApiErrorClass)
    })
  })

  describe('listUserMessages', () => {
    it('should fetch messages for a user', async () => {
      const mockMessages: PaginatedResponse<Message> = {
        results: [
          {
            id: 'msg-1',
            sender_id: 'researcher-1',
            body: 'First message',
            sent_at: '2024-06-01T12:00:00Z',
            channel_id: 'channel-1',
            data: { study_id: mockStudyId, category: 'other' },
          },
          {
            id: 'msg-2',
            sender_id: 'researcher-1',
            body: 'Second message',
            sent_at: '2024-06-01T13:00:00Z',
            channel_id: 'channel-2',
            data: { study_id: mockStudyId, category: 'rejections' },
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
        json: async () => mockMessages,
      })

      const result = await listUserMessages('participant-1', mockApiToken)

      expect(result).toEqual(mockMessages)
      expect(result.results).toHaveLength(2)
      expect(global.fetch).toHaveBeenCalledWith(
        `https://api.prolific.com/api/v1/messages/?user_id=participant-1`,
        expect.objectContaining({
          headers: expect.any(Headers),
        })
      )
    })

    it('should handle empty message list', async () => {
      const mockMessages: PaginatedResponse<Message> = {
        results: [],
        meta: { count: 0, next: null, previous: null },
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockMessages,
      })

      const result = await listUserMessages('participant-1', mockApiToken)
      expect(result.results).toHaveLength(0)
    })

    it('should throw ProlificApiErrorClass on API error', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ detail: 'Bad request' }),
      })

      await expect(listUserMessages('bad-user', mockApiToken)).rejects.toThrow(
        ProlificApiErrorClass
      )
    })
  })

  describe('listRecentMessages', () => {
    it('should fetch messages after a date', async () => {
      const mockMessages: PaginatedResponse<Message> = {
        results: [
          {
            id: 'msg-1',
            sender_id: 'researcher-1',
            body: 'Recent message',
            sent_at: '2024-06-01T12:00:00Z',
            channel_id: 'channel-1',
          },
        ],
        meta: { count: 1, next: null, previous: null },
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockMessages,
      })

      const result = await listRecentMessages('2024-05-01T00:00:00Z', mockApiToken)
      expect(result.results).toHaveLength(1)
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/messages/?created_after='),
        expect.objectContaining({ headers: expect.any(Headers) })
      )
    })
  })

  describe('getSubmissionDemographics', () => {
    const mockDemographics: SubmissionDemographics = {
      submission_id: mockSubmissionId,
      participant_id: 'participant-1',
      started_at: '2024-01-05T10:00:00Z',
      completed_at: '2024-01-05T10:15:00Z',
      time_taken: 900,
      total_approvals: 42,
      demographics: {
        age: '30',
        country_of_birth: 'GB',
        sex: 'Male',
      },
    }

    it('should return demographics for a valid submission', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () => JSON.stringify(mockDemographics),
      })

      const result = await getSubmissionDemographics(mockSubmissionId, mockApiToken)

      expect(result).toEqual(mockDemographics)
      expect(global.fetch).toHaveBeenCalledWith(
        `https://api.prolific.com/api/v1/submissions/${mockSubmissionId}/demographics/`,
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: `Token ${mockApiToken}`,
          }),
        })
      )
    })

    it('should return null when the demographics endpoint returns 404', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        text: async () => '',
      })

      const result = await getSubmissionDemographics(mockSubmissionId, mockApiToken)

      expect(result).toBeNull()
    })

    it('should return null when the response body is empty', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () => '',
      })

      const result = await getSubmissionDemographics(mockSubmissionId, mockApiToken)

      expect(result).toBeNull()
    })

    it('should return null when the response body is not valid JSON', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () => 'not-valid-json',
      })

      const result = await getSubmissionDemographics(mockSubmissionId, mockApiToken)

      expect(result).toBeNull()
    })

    it('should throw ProlificApiErrorClass on non-404 API error', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: async () => '',
      })

      await expect(getSubmissionDemographics(mockSubmissionId, mockApiToken)).rejects.toThrow(
        ProlificApiErrorClass
      )
    })
  })

  describe('getStudyDemographics', () => {
    const makeSubmission = (id: string, participantId: string): Submission => ({
      id,
      participant_id: participantId,
      study_id: mockStudyId,
      status: 'APPROVED',
      started_at: '2024-01-05T10:00:00Z',
      completed_at: '2024-01-05T10:15:00Z',
      time_taken: 900,
    })

    const makeDemographics = (
      submissionId: string,
      participantId: string
    ): SubmissionDemographics => ({
      submission_id: submissionId,
      participant_id: participantId,
      started_at: '2024-01-05T10:00:00Z',
      completed_at: '2024-01-05T10:15:00Z',
      time_taken: 900,
      total_approvals: 10,
      demographics: { age: '25', sex: 'Female' },
    })

    it('should return a Map populated with demographics keyed by participant_id', async () => {
      const submissions: PaginatedResponse<Submission> = {
        results: [makeSubmission('sub-1', 'p-1'), makeSubmission('sub-2', 'p-2')],
        meta: { count: 2, next: null, previous: null },
      }

      // First call: listStudySubmissions
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => submissions,
      })
      // Subsequent calls: getSubmissionDemographics for each submission
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () => JSON.stringify(makeDemographics('sub-1', 'p-1')),
      })
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () => JSON.stringify(makeDemographics('sub-2', 'p-2')),
      })

      const result = await getStudyDemographics(mockStudyId, mockApiToken)

      expect(result).toBeInstanceOf(Map)
      expect(result.size).toBe(2)
      expect(result.get('p-1')).toEqual(makeDemographics('sub-1', 'p-1'))
      expect(result.get('p-2')).toEqual(makeDemographics('sub-2', 'p-2'))
    })

    it('should skip submissions whose demographics endpoint returns null (404)', async () => {
      const submissions: PaginatedResponse<Submission> = {
        results: [makeSubmission('sub-1', 'p-1'), makeSubmission('sub-2', 'p-2')],
        meta: { count: 2, next: null, previous: null },
      }

      // listStudySubmissions
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => submissions,
      })
      // sub-1 demographics: 404
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        text: async () => '',
      })
      // sub-2 demographics: success
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () => JSON.stringify(makeDemographics('sub-2', 'p-2')),
      })

      const result = await getStudyDemographics(mockStudyId, mockApiToken)

      expect(result.size).toBe(1)
      expect(result.has('p-1')).toBe(false)
      expect(result.get('p-2')).toEqual(makeDemographics('sub-2', 'p-2'))
    })

    it('should return an empty Map when there are no submissions', async () => {
      const submissions: PaginatedResponse<Submission> = {
        results: [],
        meta: { count: 0, next: null, previous: null },
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => submissions,
      })

      const result = await getStudyDemographics(mockStudyId, mockApiToken)

      expect(result).toBeInstanceOf(Map)
      expect(result.size).toBe(0)
    })

    it('should process submissions in batches respecting the concurrency limit', async () => {
      const numSubmissions = 7
      const concurrency = 3
      const subList = Array.from({ length: numSubmissions }, (_, i) =>
        makeSubmission(`sub-${i + 1}`, `p-${i + 1}`)
      )

      const submissions: PaginatedResponse<Submission> = {
        results: subList,
        meta: { count: numSubmissions, next: null, previous: null },
      }

      // listStudySubmissions
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => submissions,
      })
      // Demographics for each submission
      for (let i = 0; i < numSubmissions; i++) {
        ;(global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          status: 200,
          text: async () => JSON.stringify(makeDemographics(`sub-${i + 1}`, `p-${i + 1}`)),
        })
      }

      const result = await getStudyDemographics(mockStudyId, mockApiToken, concurrency)

      expect(result.size).toBe(numSubmissions)
      for (let i = 1; i <= numSubmissions; i++) {
        expect(result.has(`p-${i}`)).toBe(true)
      }
    })
  })
})
