import { ref, onUnmounted } from 'vue';

/**
 * Composable for draggable elements with momentum and magnetic snap points
 * @param {Object} options Configuration options
 * @param {Function} options.getSnapPoints - Returns array of { id, x, y, type } snap points
 * @param {Function} options.getBounds - Returns { left, top, right, bottom } bounds
 * @param {Function} options.onSnapComplete - Called when snap animation completes
 * @param {string} options.storageKey - localStorage key for persistence
 * @param {string} options.defaultSnapId - Default snap point ID
 */
export function useDraggable(options = {}) {
  const {
    getSnapPoints = () => [],
    getBounds = () => null,
    onSnapComplete = () => {},
    storageKey = null,
    defaultSnapId = 'bottom-center'
  } = options;

  // Physics constants
  const VELOCITY_THRESHOLD = 1;
  const DISTANCE_THRESHOLD = 2;
  const MAX_VELOCITY = 4000;
  const TIME_SCALE = 0.4;  // Higher = flick projects further, easier to reach distant corners

  // State
  const isDragging = ref(false);
  const isAnimating = ref(false);
  const position = ref({ x: 0, y: 0 });
  const currentSnapPoint = ref(null);
  const targetSnapPoint = ref(null); // The snap point we're animating toward

  // Internal state
  let dragOffset = { x: 0, y: 0 };
  let positionHistory = [];
  let animationFrameId = null;
  let capturedElement = null;
  let capturedPointerId = null;

  /**
   * Initialize position from storage or default
   */
  const initialize = (snapPoints) => {
    let targetSnapId = defaultSnapId;

    if (storageKey) {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        targetSnapId = saved;
      }
    }

    const snap = snapPoints.find(s => s.id === targetSnapId) || snapPoints[0];
    if (snap) {
      position.value = { x: snap.x, y: snap.y };
      currentSnapPoint.value = snap;
    }
  };

  /**
   * Start dragging
   * @param {boolean} centerOnCursor - If true, element centers on cursor (no offset)
   */
  const startDrag = (e, elementRect, containerRect, centerOnCursor = false) => {
    if (isDragging.value || isAnimating.value) return;

    // Cancel any ongoing animation
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }

    // Capture pointer for reliable tracking
    capturedElement = e.target;
    capturedPointerId = e.pointerId;
    try {
      capturedElement.setPointerCapture(capturedPointerId);
    } catch (err) {
      // May fail if pointer already released
    }

    // Set offset - either center on cursor or maintain click position
    if (centerOnCursor) {
      dragOffset = { x: 0, y: 0 };
    } else {
      const elementCenterX = elementRect.left + elementRect.width / 2;
      const elementCenterY = elementRect.top + elementRect.height / 2;
      dragOffset = {
        x: e.clientX - elementCenterX,
        y: e.clientY - elementCenterY
      };
    }

    // Initialize position history for velocity calculation
    positionHistory = [{
      x: e.clientX,
      y: e.clientY,
      timestamp: performance.now()
    }];

    isDragging.value = true;
  };

  /**
   * Update position during drag
   */
  const updateDrag = (e, containerRect) => {
    if (!isDragging.value) return;

    const bounds = getBounds();

    // Calculate position relative to container
    let x = e.clientX - containerRect.left - dragOffset.x;
    let y = e.clientY - containerRect.top - dragOffset.y;

    // Clamp to bounds if provided
    if (bounds) {
      x = Math.max(bounds.left, Math.min(bounds.right, x));
      y = Math.max(bounds.top, Math.min(bounds.bottom, y));
    }

    position.value = { x, y };

    // Track position for velocity (keep last 5 samples)
    positionHistory.push({
      x: e.clientX,
      y: e.clientY,
      timestamp: performance.now()
    });
    if (positionHistory.length > 5) {
      positionHistory.shift();
    }
  };

  /**
   * Calculate velocity from position history
   */
  const calculateVelocity = () => {
    if (positionHistory.length < 2) return { x: 0, y: 0 };

    const recent = positionHistory.slice(-3);
    const first = recent[0];
    const last = recent[recent.length - 1];
    const dt = (last.timestamp - first.timestamp) / 1000;

    if (dt === 0) return { x: 0, y: 0 };

    let vx = (last.x - first.x) / dt;
    let vy = (last.y - first.y) / dt;

    // Cap velocity
    vx = Math.max(-MAX_VELOCITY, Math.min(MAX_VELOCITY, vx));
    vy = Math.max(-MAX_VELOCITY, Math.min(MAX_VELOCITY, vy));

    return { x: vx, y: vy };
  };

  /**
   * Project where momentum would take us
   */
  const projectMomentum = (pos, vel) => {
    return {
      x: pos.x + vel.x * TIME_SCALE,
      y: pos.y + vel.y * TIME_SCALE
    };
  };

  /**
   * Find nearest snap point to a position
   */
  const findNearestSnapPoint = (pos) => {
    const snapPoints = getSnapPoints();
    let nearest = null;
    let minDistance = Infinity;

    for (const snap of snapPoints) {
      const dx = pos.x - snap.x;
      const dy = pos.y - snap.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < minDistance) {
        minDistance = distance;
        nearest = snap;
      }
    }

    return nearest;
  };

  /**
   * Animate to snap point - fast lerp
   */
  const animateToSnapPoint = (targetSnap) => {
    isAnimating.value = true;
    targetSnapPoint.value = targetSnap;

    const LERP_SPEED = 0.25;

    const tick = () => {
      const dx = targetSnap.x - position.value.x;
      const dy = targetSnap.y - position.value.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < 1) {
        position.value = { x: targetSnap.x, y: targetSnap.y };
        isAnimating.value = false;
        currentSnapPoint.value = targetSnap;
        targetSnapPoint.value = null;
        animationFrameId = null;

        if (storageKey) {
          localStorage.setItem(storageKey, targetSnap.id);
        }

        onSnapComplete(targetSnap);
      } else {
        position.value = {
          x: position.value.x + dx * LERP_SPEED,
          y: position.value.y + dy * LERP_SPEED
        };
        animationFrameId = requestAnimationFrame(tick);
      }
    };

    animationFrameId = requestAnimationFrame(tick);
  };

  /**
   * Find snap point most aligned with velocity direction
   */
  const findSnapPointInDirection = (pos, vel) => {
    const snapPoints = getSnapPoints();
    const speed = Math.sqrt(vel.x * vel.x + vel.y * vel.y);

    // If not moving fast enough, just find nearest
    if (speed < 50) {
      return findNearestSnapPoint(pos);
    }

    // Normalize velocity to get direction
    const dirX = vel.x / speed;
    const dirY = vel.y / speed;

    let bestSnap = null;
    let bestScore = -Infinity;

    for (const snap of snapPoints) {
      // Vector from current position to snap point
      const dx = snap.x - pos.x;
      const dy = snap.y - pos.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 1) continue; // Skip if we're already there

      // Normalize
      const snapDirX = dx / dist;
      const snapDirY = dy / dist;

      // Dot product = how aligned the snap point is with our velocity
      const alignment = dirX * snapDirX + dirY * snapDirY;

      // Score: prefer aligned points, with some distance factor
      // alignment ranges from -1 (opposite) to 1 (same direction)
      // Only consider points somewhat in our direction (alignment > 0)
      if (alignment > 0.3) {
        const score = alignment * 100 - dist * 0.1; // Favor direction over proximity
        if (score > bestScore) {
          bestScore = score;
          bestSnap = snap;
        }
      }
    }

    // Fall back to nearest if no good directional match
    return bestSnap || findNearestSnapPoint(pos);
  };

  /**
   * End dragging - calculate momentum and snap
   */
  const endDrag = () => {
    if (!isDragging.value) return;

    // Release pointer capture on the original element
    if (capturedElement && capturedPointerId !== null) {
      try {
        capturedElement.releasePointerCapture(capturedPointerId);
      } catch (err) {
        // Pointer may have been released already
      }
      capturedElement = null;
      capturedPointerId = null;
    }

    isDragging.value = false;

    // Calculate final velocity
    const velocity = calculateVelocity();

    // Find snap point in the direction of the flick
    const targetSnap = findSnapPointInDirection(position.value, velocity);

    if (targetSnap) {
      animateToSnapPoint(targetSnap);
    }
  };

  /**
   * Cancel drag and snap to nearest point
   */
  const cancelDrag = () => {
    if (isDragging.value) {
      isDragging.value = false;
    }

    const targetSnap = findNearestSnapPoint(position.value);
    if (targetSnap) {
      animateToSnapPoint(targetSnap);
    }
  };

  /**
   * Move to a specific snap point programmatically
   */
  const moveToSnapPoint = (snapId) => {
    const snapPoints = getSnapPoints();
    const snap = snapPoints.find(s => s.id === snapId);
    if (snap) {
      animateToSnapPoint(snap);
    }
  };

  /**
   * Set position directly (used for initialization)
   */
  const setPosition = (x, y) => {
    position.value = { x, y };
  };

  /**
   * Update position when snap points change (e.g., resize)
   */
  const updateForNewSnapPoints = () => {
    if (isDragging.value || isAnimating.value) return;

    const snapPoints = getSnapPoints();
    if (currentSnapPoint.value) {
      // Find the same snap point in new configuration
      const sameSnap = snapPoints.find(s => s.id === currentSnapPoint.value.id);
      if (sameSnap) {
        position.value = { x: sameSnap.x, y: sameSnap.y };
        currentSnapPoint.value = sameSnap;
      }
    }
  };

  // Cleanup on unmount
  onUnmounted(() => {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
    }
  });

  return {
    // State (reactive)
    isDragging,
    isAnimating,
    position,
    currentSnapPoint,
    targetSnapPoint,

    // Methods
    initialize,
    startDrag,
    updateDrag,
    endDrag,
    cancelDrag,
    moveToSnapPoint,
    setPosition,
    updateForNewSnapPoints,
    findNearestSnapPoint
  };
}
