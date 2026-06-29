/**
 * Scenario Definitions
 * ====================
 * Each scenario represents a conversation flow to demonstrate in the prototype.
 * Scenarios are tagged to phases via flags.config.js (not here).
 *
 * Add your feature-specific scenarios below.
 */

export const scenarios = []

export function getScenario(id) {
  return scenarios.find((s) => s.id === id) || null
}

export function getAllScenarios() {
  return scenarios
}
