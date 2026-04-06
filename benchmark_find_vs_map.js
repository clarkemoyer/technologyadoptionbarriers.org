const fs = require('fs')

// Load the actual data to make it realistic
const sensitivityData = JSON.parse(fs.readFileSync('src/data/sensitivity-analysis.json', 'utf8'))

const PRIMARY_GROUPS = [
  { key: 'conservative_clean', label: 'Conservative Clean', color: 'border-green-500' },
  { key: 'flexible_clean', label: 'Flexible Clean', color: 'border-blue-500' },
  { key: 'prolific_accepted', label: 'Prolific Accepted', color: 'border-amber-500' },
  { key: 'v2_finished', label: 'All V2 Finished', color: 'border-gray-400' },
]

const ITERATIONS = 100000

function benchmarkFind() {
  const start = performance.now()
  for (let i = 0; i < ITERATIONS; i++) {
    // Mimic the two places where the loop happens
    for (const group of PRIMARY_GROUPS) {
      const sample = sensitivityData.samples.find((s) => s.key === group.key)
    }
    for (const group of PRIMARY_GROUPS) {
      const sample = sensitivityData.samples.find((s) => s.key === group.key)
    }
  }
  const end = performance.now()
  return end - start
}

function benchmarkMap() {
  const start = performance.now()
  // The map creation happens once per module load
  const samplesByKey = new Map((sensitivityData.samples || []).map((s) => [s.key, s]))

  for (let i = 0; i < ITERATIONS; i++) {
    for (const group of PRIMARY_GROUPS) {
      const sample = samplesByKey.get(group.key)
    }
    for (const group of PRIMARY_GROUPS) {
      const sample = samplesByKey.get(group.key)
    }
  }
  const end = performance.now()
  return end - start
}

// Warmup
for (let i = 0; i < 1000; i++) {
  for (const group of PRIMARY_GROUPS) {
    sensitivityData.samples.find((s) => s.key === group.key)
  }
}

const timeFind = benchmarkFind()
const timeMap = benchmarkMap()

console.log(`Baseline (.find()): ${timeFind.toFixed(2)} ms for ${ITERATIONS} iterations`)
console.log(`Optimized (Map.get()): ${timeMap.toFixed(2)} ms for ${ITERATIONS} iterations`)
console.log(`Improvement: ${(((timeFind - timeMap) / timeFind) * 100).toFixed(2)}% faster`)
console.log(`Speedup: ${(timeFind / timeMap).toFixed(2)}x`)
