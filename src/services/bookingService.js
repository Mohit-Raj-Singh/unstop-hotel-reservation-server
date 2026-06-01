/**
 * Travel time between a set of rooms (first to last in sorted order).
 * Rooms must be sorted by floor then position before calling.
 * Formula: horizontal segments within each floor group + vertical jumps between floors.
 */
function computeTravelTime(rooms) {
  if (rooms.length <= 1) return 0;

  // Group consecutive rooms by floor
  const sorted = [...rooms].sort((a, b) =>
    a.floor !== b.floor ? a.floor - b.floor : a.position - b.position
  );

  let travelTime = 0;
  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1];
    const curr = sorted[i];
    if (prev.floor === curr.floor) {
      travelTime += Math.abs(curr.position - prev.position);
    } else {
      // Move from rightmost room on prev floor to lift (position 1) → up → leftmost on curr floor
      travelTime += (prev.position - 1) + Math.abs(curr.floor - prev.floor) * 2 + (curr.position - 1);
    }
  }
  return travelTime;
}

/**
 * Find the best single-floor allocation: the floor with the most available rooms
 * that has at least `count` available rooms, picking the leftmost consecutive block.
 */
function findSingleFloorAllocation(availableByFloor, count) {
  let best = null;
  let bestFloorAvailableCount = -1;

  for (const [floor, rooms] of Object.entries(availableByFloor)) {
    if (rooms.length < count) continue;

    // Sort by position and find all consecutive windows of size `count`
    const sorted = [...rooms].sort((a, b) => a.position - b.position);

    // Find the consecutive window (by position index, not value) with min span
    for (let i = 0; i <= sorted.length - count; i++) {
      const window = sorted.slice(i, i + count);
      // Prefer: floor with most available rooms (more room flexibility), then leftmost
      if (
        best === null ||
        rooms.length > bestFloorAvailableCount ||
        (rooms.length === bestFloorAvailableCount && window[0].position < best[0].position)
      ) {
        best = window;
        bestFloorAvailableCount = rooms.length;
      }
    }
  }
  return best;
}

/**
 * Find the best multi-floor allocation that minimizes total travel time.
 * Tries all combinations of available rooms across floors.
 */
function findMultiFloorAllocation(availableRooms, count) {
  // For performance, work with sorted rooms and use a greedy/exhaustive approach
  // Since count ≤ 5 and floors ≤ 10 and rooms per floor ≤ 10, we can afford combination search

  const rooms = [...availableRooms].sort((a, b) =>
    a.floor !== b.floor ? a.floor - b.floor : a.position - b.position
  );

  if (rooms.length < count) return null;

  let bestCombo = null;
  let bestTime = Infinity;

  // Generate all combinations of `count` rooms from available rooms
  const combo = (start, current) => {
    if (current.length === count) {
      const t = computeTravelTime(current);
      if (t < bestTime) {
        bestTime = t;
        bestCombo = [...current];
      }
      return;
    }
    for (let i = start; i <= rooms.length - (count - current.length); i++) {
      combo(i + 1, [...current, rooms[i]]);
    }
  };

  combo(0, []);
  return bestCombo;
}

/**
 * Main booking algorithm.
 * @param {Array} allAvailableRooms - rooms with status 'available'
 * @param {number} count - number of rooms to book (1–5)
 * @returns {{ rooms: Array, travelTime: number } | null}
 */
function findOptimalRooms(allAvailableRooms, count) {
  if (allAvailableRooms.length < count) return null;

  // Group by floor
  const byFloor = {};
  for (const room of allAvailableRooms) {
    if (!byFloor[room.floor]) byFloor[room.floor] = [];
    byFloor[room.floor].push(room);
  }

  // Priority 1: same-floor allocation
  const singleFloor = findSingleFloorAllocation(byFloor, count);
  if (singleFloor) {
    return { rooms: singleFloor, travelTime: computeTravelTime(singleFloor) };
  }

  // Priority 2: multi-floor allocation minimizing travel time
  const multiFloor = findMultiFloorAllocation(allAvailableRooms, count);
  if (multiFloor) {
    return { rooms: multiFloor, travelTime: computeTravelTime(multiFloor) };
  }

  return null;
}

module.exports = { findOptimalRooms, computeTravelTime };
