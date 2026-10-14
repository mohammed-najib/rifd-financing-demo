import { describe, expect, it } from 'vitest'
import { canReadApplication, freezeRepayment, products } from './index'

describe('frozen fictional repayment', () => {
  it('preserves the historical equipment schedule and completed amounts', () => {
    const schedule = freezeRepayment(1_200_000, 18, products.equipment, '2026-07-10', 2)
    expect(schedule.markup).toBe(96_000)
    expect(schedule.total).toBe(1_296_000)
    expect(schedule.rows).toHaveLength(18)
    expect(schedule.rows[0]).toEqual({ due: '2026-08-15', amount: 72_000, status: 'completed' })
    expect(schedule.rows[17]).toEqual({ due: '2028-01-15', amount: 72_000, status: 'upcoming' })
    expect(schedule.completed).toBe(144_000)
    expect(schedule.remaining).toBe(1_152_000)
  })
  it('rounds half-up markup and puts the whole-rial remainder in the last installment', () => {
    const schedule = freezeRepayment(100_010, 6, products.inventory, '2026-10-14')
    expect(schedule.markup).toBe(5_001)
    expect(schedule.total).toBe(105_011)
    expect(schedule.rows.map(row => row.amount)).toEqual([17_501, 17_501, 17_501, 17_501, 17_501, 17_506])
    expect(schedule.rows[0].due).toBe('2026-11-15')
    expect(schedule.completed).toBe(0)
  })
  it('keeps Huda\'s fixed baseline and proposed response arithmetic distinct', () => {
    expect(freezeRepayment(600_000, 6, products.inventory, '2026-10-14').rows[0].amount).toBe(105_000)
    expect(freezeRepayment(450_000, 6, products.inventory, '2026-10-14').rows[0].amount).toBe(78_750)
  })
})

describe('read permissions', () => {
  it.each(['draft', 'submitted', 'underReview', 'correctionsRequested', 'approved', 'rejected'] as const)('only the owning applicant reads %s', status => {
    expect(canReadApplication('mariam', { owner: 'mariam', status })).toBe(true)
    expect(canReadApplication('huda', { owner: 'mariam', status })).toBe(false)
  })
  it('staff reads submitted states and cannot inspect an applicant draft', () => {
    expect(canReadApplication('salma', { owner: 'mariam', status: 'draft' })).toBe(false)
    for (const status of ['submitted', 'underReview', 'correctionsRequested', 'approved', 'rejected'] as const) expect(canReadApplication('salma', { owner: 'mariam', status })).toBe(true)
  })
})
