import fs from 'fs'
import path from 'path'
import {
  DispositionSummarySchema,
  SensitivityAnalysisSchema,
  DataAuditSchema,
  validateDataFiles,
} from '../../scripts/validate-data-schemas'

describe('Data Schema Validation', () => {
  describe('DispositionSummarySchema', () => {
    it('validates a valid disposition summary', () => {
      const validData = {
        updatedAt: '2026-04-05T11:12:32.183868+00:00',
        study: {
          id: '69c17630acada6abeead2da5',
          name: 'Technology Adoption Barriers Survey (2026)',
          status: 'ACTIVE',
          totalAvailablePlaces: 500,
          placesTaken: 246,
          averageRewardPerHour: 3919.05,
          averageTimeTaken: 10,
          reward: 700,
          publishedAt: '2026-03-23T18:00:28.650000Z',
        },
        completionProgress: {
          target: 500,
          completed: 246,
          approved: 209,
          awaitingReview: 37,
          percentComplete: 49.2,
        },
        dispositions: {
          INCOMPLETE: 61,
        },
        actions: {
          approved: 209,
          rejected: 29,
          returned: 133,
          timedOut: 6,
          awaitingReview: 37,
          active: 0,
          messaged: 0,
        },
        iriPassRates: {
          barrier: 58.1,
          readiness: 71.1,
          maturity: 80.8,
          denominator: 339,
        },
      }

      expect(() => DispositionSummarySchema.parse(validData)).not.toThrow()
    })

    it('fails when missing required fields', () => {
      const invalidData = {
        updatedAt: '2026-04-05T11:12:32.183868+00:00',
        // missing study, completionProgress, etc.
      }

      expect(() => DispositionSummarySchema.parse(invalidData)).toThrow()
    })
  })

  describe('SensitivityAnalysisSchema', () => {
    it('validates a valid sensitivity analysis', () => {
      const validData = {
        samples: [
          {
            key: 'conservative_clean',
            label: 'Conservative Clean',
            description: 'Test description',
            n: 78,
          },
        ],
        metrics: [
          {
            key: 'barrier_mean',
            label: 'Barrier Grand Mean',
            values: {
              conservative_clean: 2.8158,
            },
          },
        ],
      }

      expect(() => SensitivityAnalysisSchema.parse(validData)).not.toThrow()
    })

    it('fails when metrics are missing', () => {
      const invalidData = {
        samples: [],
      }

      expect(() => SensitivityAnalysisSchema.parse(invalidData)).toThrow()
    })
  })

  describe('DataAuditSchema', () => {
    it('validates a valid data audit', () => {
      const validData = {
        waterfall_steps: [
          {
            step: 0,
            name: 'INCOMPLETE',
            count: 61,
            cumulative_excluded: 61,
          },
        ],
      }

      expect(() => DataAuditSchema.parse(validData)).not.toThrow()
    })

    it('fails when waterfall_steps have wrong type', () => {
      const invalidData = {
        waterfall_steps: [
          {
            step: '0', // Should be number
            name: 'INCOMPLETE',
            count: 61,
            cumulative_excluded: 61,
          },
        ],
      }

      expect(() => DataAuditSchema.parse(invalidData)).toThrow()
    })
  })
})
