/**
 * faceRecognition.js
 * Server-side utility for storing and comparing face descriptors.
 * The actual face detection / descriptor extraction is done by face-api.js
 * on the FRONTEND. The backend only stores the descriptor array and
 * performs the Euclidean distance comparison for validation.
 */

const MATCH_THRESHOLD = 0.55; // Lower = stricter. 0.55 is a balanced value.

/**
 * Compute Euclidean distance between two descriptor arrays.
 * Both must be Float32Array or plain number arrays of equal length.
 */
function euclideanDistance(d1, d2) {
  if (!d1 || !d2 || d1.length !== d2.length) return Infinity;
  let sum = 0;
  for (let i = 0; i < d1.length; i++) {
    const diff = d1[i] - d2[i];
    sum += diff * diff;
  }
  return Math.sqrt(sum);
}

/**
 * Verify a live descriptor against the stored reference descriptor.
 * @param {number[]} storedDescriptor  - descriptor saved in MongoDB
 * @param {number[]} liveDescriptor    - descriptor from the webcam capture
 * @returns {{ match: boolean, distance: number }}
 */
function verifyFace(storedDescriptor, liveDescriptor) {
  const distance = euclideanDistance(storedDescriptor, liveDescriptor);
  return {
    match: distance <= MATCH_THRESHOLD,
    distance: parseFloat(distance.toFixed(4)),
  };
}

/**
 * Validate that a descriptor looks like a real face-api.js output:
 * 128-element numeric array.
 */
function isValidDescriptor(descriptor) {
  return (
    Array.isArray(descriptor) &&
    descriptor.length === 128 &&
    descriptor.every((v) => typeof v === 'number' && isFinite(v))
  );
}

module.exports = { verifyFace, isValidDescriptor, MATCH_THRESHOLD };
