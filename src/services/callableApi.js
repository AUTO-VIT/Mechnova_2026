import { httpsCallable } from 'firebase/functions';
import { functions } from './firebase';

/**
 * Helper to call HTTPS Callable function with graceful fallback for local standalone testing
 */
async function callFunction(name, data) {
  try {
    const fn = httpsCallable(functions, name);
    const result = await fn(data);
    return result.data;
  } catch (error) {
    console.warn(`Callable API '${name}' failed or uninitialized, running client fallback logic where applicable:`, error.message);
    throw error;
  }
}

export async function registerTeamApi(payload) {
  return await callFunction('registerTeam', payload);
}

export async function setAdminClaimApi(payload) {
  return await callFunction('setAdminClaim', payload);
}

export async function startSessionApi(payload) {
  return await callFunction('startSession', payload);
}

export async function submitAnswerApi(payload) {
  return await callFunction('submitAnswer', payload);
}

export async function syncClockApi(payload) {
  return await callFunction('syncClock', payload);
}

export async function revealThemesApi(payload) {
  return await callFunction('revealThemes', payload);
}

export async function submitBidApi(payload) {
  return await callFunction('submitBid', payload);
}

export async function finalizeAllocationApi(payload) {
  return await callFunction('finalizeAllocation', payload);
}
