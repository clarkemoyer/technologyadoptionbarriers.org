const fs = require('fs')
const { performance } = require('node:perf_hooks')

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
  let sink = 0
  const start = performance.now()
  for (let i = 0; i < ITERATIONS; i++) {
    // Mimic the two places where the loop happens
    for (const group of PRIMARY_GROUPS) {
      const sample = sensitivityData.samples.find((s) => s.key === group.key)
      if (sample) sink++
    }
    for (const group of PRIMARY_GROUPS) {
      const sample = sensitivityData.samples.find((s) => s.key === group.key)
      if (sample) sink++
    }
  }
  const end = performance.now()
  return [end - start, sink]
}

function benchmarkMap() {
  let sink = 0
  // The map creation happens once per module load; build it before timing so
  // the benchmark measures only lookup cost, not initialization.
  const samplesByKey = new Map((sensitivityData.samples || []).map((s) => [s.key, s]))

  const start = performance.now()
  for (let i = 0; i < ITERATIONS; i++) {
    for (const group of PRIMARY_GROUPS) {
      const sample = samplesByKey.get(group.key)
      if (sample) sink++
    }
    for (const group of PRIMARY_GROUPS) {
      const sample = samplesByKey.get(group.key)
      if (sample) sink++
    }
  }
  const end = performance.now()
  return [end - start, sink]
}

// Warmup
for (let i = 0; i < 1000; i++) {
  for (const group of PRIMARY_GROUPS) {
    sensitivityData.samples.find((s) => s.key === group.key)
  }
}

const [timeFind, sinkFind] = benchmarkFind()
const [timeMap, sinkMap] = benchmarkMap()

console.log(`Baseline (.find()): ${timeFind.toFixed(2)} ms for ${ITERATIONS} iterations`)
console.log(`Optimized (Map.get()): ${timeMap.toFixed(2)} ms for ${ITERATIONS} iterations`)
console.log(`Improvement: ${(((timeFind - timeMap) / timeFind) * 100).toFixed(2)}% faster`)
console.log(`Speedup: ${(timeFind / timeMap).toFixed(2)}x`)
// Reference sinks to prevent dead-code elimination across both functions
if (sinkFind !== sinkMap) console.warn('Sink mismatch — results may differ')
