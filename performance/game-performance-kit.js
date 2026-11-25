/* Game Performance Kit v1.0.0
 * Derived and decoupled from neon_brick_battle's render-quality-manager.js.
 * MIT License, Copyright (c) 2026 youjianchonglangshou-design.
 * Browser plain script / Node CommonJS. No game engine or dependencies required.
 */
(function (root, factory) {
  const api = factory(root);
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.GamePerformanceKit = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (root) {
  'use strict';
  const ORDER = Object.freeze(['emergency', 'safe', 'balanced', 'high', 'ultra']);
  const has = (o, k) => Object.prototype.hasOwnProperty.call(o, k);
  const finite = (v, fallback = 0) => Number.isFinite(Number(v)) ? Number(v) : fallback;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const clone = (x) => JSON.parse(JSON.stringify(x));

  // These numbers are taken from the uploaded game's render-profile-{desktop,mobile}.js.
  const PROFILES = Object.freeze({
    desktop: {
      id: 'desktop-auto', mobile: false, defaultTier: 'high',
      app: { antialias: true, powerPreference: 'high-performance' },
      tiers: {
        ultra: { id: 'ultra', label: 'Ultra', dprLimit: 2.6, minDpr: 1.5, maxRenderPixels: 7600000, caps: { fxScale: 1.18, particles: 430, sparks: 390, shockwaves: 26, ghosts: 24 } },
        high: { id: 'high', label: 'High', dprLimit: 2.2, minDpr: 1.35, maxRenderPixels: 6500000, caps: { fxScale: 1.1, particles: 360, sparks: 320, shockwaves: 22, ghosts: 20 } },
        balanced: { id: 'balanced', label: 'Balanced', dprLimit: 1.85, minDpr: 1.2, maxRenderPixels: 4800000, caps: { fxScale: 0.98, particles: 260, sparks: 220, shockwaves: 15, ghosts: 15 } },
        safe: { id: 'safe', label: 'Safe', dprLimit: 1.5, minDpr: 1, maxRenderPixels: 3200000, caps: { fxScale: 0.8, particles: 150, sparks: 115, shockwaves: 8, ghosts: 9 } },
        emergency: { id: 'emergency', label: 'Emergency', dprLimit: 1.2, minDpr: 1, maxRenderPixels: 2200000, caps: { fxScale: 0.64, particles: 80, sparks: 60, shockwaves: 4, ghosts: 5 } }
      }
    },
    mobile: {
      id: 'mobile-auto', mobile: true, defaultTier: 'balanced',
      app: { antialias: false, powerPreference: 'high-performance' },
      tiers: {
        ultra: { id: 'ultra', label: 'Ultra', dprLimit: 2.25, minDpr: 1.5, maxRenderPixels: 3000000, caps: { fxScale: 1.08, particles: 320, sparks: 280, shockwaves: 18, ghosts: 18 } },
        high: { id: 'high', label: 'High', dprLimit: 2, minDpr: 1.45, maxRenderPixels: 2400000, caps: { fxScale: 1, particles: 250, sparks: 220, shockwaves: 14, ghosts: 15 } },
        balanced: { id: 'balanced', label: 'Balanced', dprLimit: 1.75, minDpr: 1.35, maxRenderPixels: 1800000, caps: { fxScale: 0.92, particles: 180, sparks: 140, shockwaves: 10, ghosts: 10 } },
        safe: { id: 'safe', label: 'Safe', dprLimit: 1.5, minDpr: 1.2, maxRenderPixels: 1350000, caps: { fxScale: 0.78, particles: 110, sparks: 85, shockwaves: 6, ghosts: 7 } },
        emergency: { id: 'emergency', label: 'Emergency', dprLimit: 1.2, minDpr: 1, maxRenderPixels: 950000, caps: { fxScale: 0.62, particles: 60, sparks: 45, shockwaves: 3, ghosts: 4 } }
      }
    }
  });

  function detectMobile(env = root, hint = false) {
    const win = env.window || env;
    const nav = env.navigator || win.navigator || {};
    let coarse = false;
    try { coarse = Boolean(win.matchMedia?.('(pointer: coarse)')?.matches); } catch (_) { /* ignore */ }
    const touch = finite(nav.maxTouchPoints, 0) > 0;
    const narrow = Math.min(finite(win.innerWidth, 9999), finite(win.innerHeight, 9999)) < 760;
    return Boolean(hint || (touch && (coarse || narrow)));
  }

  function estimateInitialTier(profile, env = root, storedTier = '') {
    if (storedTier && profile.tiers?.[storedTier] && storedTier !== 'emergency') return storedTier;
    const win = env.window || env;
    const nav = env.navigator || win.navigator || {};
    const cores = finite(nav.hardwareConcurrency, 0);
    const memory = finite(nav.deviceMemory, 0);
    const dpr = Math.max(1, finite(win.devicePixelRatio, 1));
    const physicalPixels = Math.max(1, finite(win.innerWidth, 360)) * Math.max(1, finite(win.innerHeight, 740)) * dpr * dpr;
    let score = profile.mobile ? 0 : 2;
    if (cores >= 10) score += 3;
    else if (cores >= 8) score += 2;
    else if (cores >= 6) score += 1;
    else if (cores > 0 && cores <= 4) score -= 2;
    if (memory >= 8) score += 3;
    else if (memory >= 6) score += 2;
    else if (memory > 0 && memory <= 3) score -= 2;
    if (dpr >= 3.5) score -= 2;
    else if (dpr >= 2.75) score -= 1;
    if (physicalPixels >= 6000000) score -= 3;
    else if (physicalPixels >= 4000000) score -= 2;
    else if (physicalPixels >= 2600000) score -= 1;
    else if (physicalPixels <= 1400000) score += 1;
    if (score >= 7) return 'ultra';
    if (score >= 4) return 'high';
    if (score <= -2) return 'safe';
    return profile.defaultTier || 'balanced';
  }

  function create(options = {}) {
    const env = options.env || root;
    const win = env.window || env;
    const nav = env.navigator || win.navigator || {};
    const doc = env.document || win.document || {};
    const clock = options.clock || (() => (win.performance?.now?.() ?? Date.now()));
    const profileName = options.profile === 'mobile' || options.profile === 'desktop'
      ? options.profile : (detectMobile(env, options.mobileHint) ? 'mobile' : 'desktop');
    const profile = typeof options.profile === 'object' && options.profile !== null
      ? clone(options.profile) : clone(PROFILES[profileName]);
    const tiers = profile.tiers;
    if (!tiers || !tiers[profile.defaultTier]) throw new Error('Invalid profile: tiers/defaultTier missing');
    const enabledTiers = ORDER.filter(id => has(tiers, id));
    if (!enabledTiers.length) throw new Error('Invalid quality tiers');
    const targetFps = clamp(finite(options.targetFps, 60), 15, 240);
    const sampleMs = Math.max(100, finite(options.sampleMs, 500));
    const recoveryFps = clamp(finite(options.recoveryFps, targetFps * 57 / 60), 1, targetFps);
    const lowFps = clamp(finite(options.lowFps, targetFps * 48 / 60), 1, recoveryFps);
    // Optional simulator policy: seek the highest tier meeting a user-defined floor.
    // Legacy consumers keep the original fixed recovery/low FPS policy.
    const adaptiveFloor = options.fpsThreshold != null;
    let fpsThreshold = clamp(Math.round(finite(options.fpsThreshold, 12)), 8, 30);
    let nextProbeAt = 0;
    const namespace = String(options.namespace || win.location?.pathname || 'game');
    const storageKey = options.storageKey || `game-performance-kit:v1:${namespace}:${profile.id || profileName}`;
    // Some embedded/opaque-origin browsers throw on reading localStorage itself.
    let storage = options.storage || null;
    if (!storage) { try { storage = win.localStorage || null; } catch (_) { storage = null; } }
    const listeners = new Set();
    if (typeof options.onChange === 'function') listeners.add(options.onChange);
    const effects = options.effects || {};
    let mode = 'auto';
    let currentTierId = profile.defaultTier;
    let resizeRequired = true;
    let immediateResize = false;
    let resizeHandler = null;
    let cooldownUntil = 0;
    let lastDownshiftAt = -Infinity;
    let lowSamples = 0, severeSamples = 0, highSamples = 0, stableSamples = 0;
    let fpsFrames = 0, fpsStart = null, lastFrameAt = null, fps = 0;
    let lastReason = 'initial-detection';
    let gpuCaps = null;
    let disposed = false;
    let persistStable = false;

    function readStored() {
      try { return storage?.getItem(storageKey) || ''; } catch (_) { return ''; }
    }
    function writeStored(value) {
      try { storage?.setItem(storageKey, value); } catch (_) { /* private mode */ }
    }
    const fromStorage = options.useStorage === false ? '' : readStored();
    const initial = options.initialTier || estimateInitialTier(profile, env, fromStorage);
    currentTierId = has(tiers, initial) && initial !== 'emergency' ? initial : profile.defaultTier;

    function getState(reason = lastReason) {
      const tier = tiers[currentTierId];
      return {
        mode, profileId: profile.id || profileName, mobile: Boolean(profile.mobile),
        tierId: currentTierId, tierLabel: tier.label || currentTierId,
        reason, fps, targetFps, fpsThreshold: adaptiveFloor ? fpsThreshold : null, pendingResize: resizeRequired,
        dprLimit: tier.dprLimit, minDpr: tier.minDpr, maxRenderPixels: tier.maxRenderPixels,
        settings: { ...tier.caps, ...(effects[currentTierId] || {}) },
        caps: { ...tier.caps }, effects: { ...(effects[currentTierId] || {}) },
        gpuCaps: gpuCaps ? { ...gpuCaps } : null
      };
    }

    function dispatch(reason) {
      lastReason = reason;
      const state = getState(reason);
      for (const listener of [...listeners]) {
        try { listener(state); } catch (err) { win.console?.error?.('GamePerformanceKit subscriber error:', err); }
      }
      try {
        if (typeof win.CustomEvent === 'function' && typeof win.dispatchEvent === 'function') {
          win.dispatchEvent(new win.CustomEvent('game-performance-change', { detail: state }));
        }
      } catch (_) { /* optional */ }
      return state;
    }

    function resetCounters() {
      lowSamples = severeSamples = highSamples = stableSamples = 0;
      persistStable = false;
    }
    function requestTier(id, opt = {}) {
      if (disposed || !has(tiers, id) || id === currentTierId) return false;
      if (!opt.force && clock() < cooldownUntil) return false;
      currentTierId = id;
      resetCounters();
      resizeRequired = true;
      immediateResize = immediateResize || Boolean(opt.immediateResize);
      cooldownUntil = clock() + Math.max(0, finite(opt.cooldownMs, 7000));
      dispatch(opt.reason || 'manual-selection');
      return true;
    }
    function stepTier(amount, opt = {}) {
      const at = enabledTiers.indexOf(currentTierId);
      return requestTier(enabledTiers[clamp(at + amount, 0, enabledTiers.length - 1)], opt);
    }
    function setFpsThreshold(value) {
      if (!adaptiveFloor || value === null || value === '' || !Number.isFinite(Number(value))) return fpsThreshold;
      fpsThreshold = clamp(Math.round(Number(value)), 8, 30);
      resetCounters(); nextProbeAt = 0; cooldownUntil = 0;
      fpsStart = lastFrameAt = null; fpsFrames = 0;
      return fpsThreshold;
    }
    function observeAdaptiveFloor(measured, now, intense) {
      // Ignore the first 1.5 s after a quality change (scene rebuild / texture allocation).
      if (now < cooldownUntil) return;
      if (measured < fpsThreshold) { lowSamples++; highSamples = 0; }
      else { lowSamples = 0; highSamples = intense ? 0 : highSamples + 1; }
      // A short sustained miss steps down, including from safe to emergency.
      if (lowSamples >= 3 && enabledTiers.indexOf(currentTierId) > 0) {
        if (stepTier(-1, { force: true, reason: 'fps-below-threshold', immediateResize: true, cooldownMs: 1500 })) nextProbeAt = now + 45000;
        return;
      }
      // Reaching the floor is enough to try the next tier, even at exactly 12 FPS.
      // If that trial fails, the downshift above restores the sustainable tier.
      if (highSamples >= 6 && now >= nextProbeAt && enabledTiers.indexOf(currentTierId) < enabledTiers.length - 1) {
        stepTier(1, { reason: 'fps-threshold-probe', cooldownMs: 1500 });
        return;
      }
    }
    function observeFps(value, context = {}) {
      if (disposed || doc.hidden) return;
      const measured = finite(value, 0);
      if (!(measured > 0)) return;
      fps = measured;
      const playing = context.isPlaying !== false;
      if (mode !== 'auto' || !playing) {
        resetCounters();
        return;
      }
      const intense = Boolean(context.intense);
      const now = finite(context.now, clock());
      if (adaptiveFloor) { observeAdaptiveFloor(measured, now, intense); return; }
      const ratio = targetFps / 60;
      if (measured < 35 * ratio) severeSamples++; else severeSamples = Math.max(0, severeSamples - 1);
      if (measured < lowFps) lowSamples++; else lowSamples = Math.max(0, lowSamples - 1);
      if (measured >= recoveryFps && !intense) highSamples++; else highSamples = Math.max(0, highSamples - 2);
      if (measured >= 52 * ratio) stableSamples++; else stableSamples = 0;
      if (severeSamples >= 2 && enabledTiers.indexOf(currentTierId) > 0 && now - lastDownshiftAt >= 1500) {
        if (stepTier(-1, { force: true, reason: 'fps-severe', immediateResize: true, cooldownMs: 9000 })) lastDownshiftAt = now;
        return;
      }
      if (lowSamples >= 5 && enabledTiers.indexOf(currentTierId) > enabledTiers.indexOf('safe') && now - lastDownshiftAt >= 3500) {
        if (stepTier(-1, { force: true, reason: 'fps-low', cooldownMs: 9000 })) lastDownshiftAt = now;
        return;
      }
      if (!intense && highSamples >= 30 && enabledTiers.indexOf(currentTierId) < enabledTiers.length - 1 && now >= cooldownUntil) {
        stepTier(1, { reason: 'fps-stable', cooldownMs: 20000 });
        return;
      }
      if (stableSamples >= 40 && !persistStable && currentTierId !== 'emergency' && options.useStorage !== false) {
        writeStored(currentTierId);
        persistStable = true;
      }
    }

    // Invoke from the GAME'S rendered frame loop. Do not invoke from physics updates.
    function frame(now = clock(), context = {}) {
      if (disposed) return fps;
      if (context.isPlaying === false || doc.hidden) {
        fpsStart = lastFrameAt = null;
        fpsFrames = 0;
        resetCounters();
        return fps;
      }
      if (lastFrameAt != null && (now < lastFrameAt || now - lastFrameAt > 2000)) {
        fpsStart = null;
        fpsFrames = 0;
      }
      if (fpsStart === null) fpsStart = now;
      lastFrameAt = now;
      fpsFrames++;
      const elapsed = now - fpsStart;
      if (elapsed >= sampleMs) {
        // Count one frame as window start; avoids large overcount on short samples.
        const measured = Math.max(0, Math.round((fpsFrames - 1) * 1000 / elapsed));
        fpsStart = now;
        fpsFrames = 1;
        observeFps(measured, { ...context, now });
      }
      return fps;
    }

    function registerGpuCapabilities(data = {}) {
      gpuCaps = {
        maxTextureSize: finite(data.maxTextureSize, 0),
        maxRenderbufferSize: finite(data.maxRenderbufferSize, 0)
      };
      const index = enabledTiers.indexOf(currentTierId);
      if (gpuCaps.maxTextureSize > 0 && gpuCaps.maxTextureSize < 4096 && index > enabledTiers.indexOf('safe')) {
        requestTier('safe', { force: true, reason: 'gpu-capability', immediateResize: true });
      } else if (gpuCaps.maxTextureSize >= 4096 && gpuCaps.maxTextureSize < 8192 && index > enabledTiers.indexOf('balanced')) {
        requestTier('balanced', { force: true, reason: 'gpu-capability', immediateResize: true });
      }
      return { ...gpuCaps };
    }

    function resolveResolution(cssWidth, cssHeight, opt = {}) {
      const width = Math.max(1, finite(cssWidth, 1));
      const height = Math.max(1, finite(cssHeight, 1));
      const tier = tiers[currentTierId];
      const deviceDpr = Math.max(1, finite(win.devicePixelRatio, 1));
      const pixelBudgetDpr = Math.sqrt(Math.max(1, finite(tier.maxRenderPixels, 1)) / (width * height));
      let renderDpr;
      if (opt.strictPixelBudget) {
        // Optional stricter mode: may choose DPR under 1 to respect huge canvases.
        renderDpr = Math.max(0.5, Math.min(deviceDpr, tier.dprLimit, pixelBudgetDpr));
      } else {
        // Faithful to the source game's DPR floor and budget preference.
        renderDpr = Math.max(1, Math.min(deviceDpr, Math.max(
          Math.min(deviceDpr, finite(tier.minDpr, 1)),
          Math.min(finite(tier.dprLimit, 1), pixelBudgetDpr)
        )));
      }
      return {
        cssWidth: width, cssHeight: height, deviceDpr, renderDpr,
        pixelWidth: Math.max(1, Math.floor(width * renderDpr)),
        pixelHeight: Math.max(1, Math.floor(height * renderDpr))
      };
    }

    function setResizeHandler(fn) {
      resizeHandler = typeof fn === 'function' ? fn : null;
      return api;
    }
    function markResized() { resizeRequired = immediateResize = false; }
    function commitPendingResize(context = {}) {
      if (!resizeRequired || !resizeHandler) return false;
      const safePoint = immediateResize || context.isPlaying === false ||
        context.goalTransition || context.hitStop || context.ultimateFreeze || context.allowDuringPlay;
      if (!safePoint) return false;
      try {
        const result = resizeHandler(getState());
        if (result === false) return false;
        markResized();
        return true;
      } catch (err) {
        win.console?.error?.('GamePerformanceKit resize failed:', err);
        return false;
      }
    }
    function activateEmergency() {
      if (mode !== 'auto') mode = 'auto';
      if (currentTierId === 'emergency') {
        resizeRequired = immediateResize = true;
        return getState();
      }
      requestTier('emergency', { force: true, reason: 'webgl-emergency', immediateResize: true, cooldownMs: 60000 });
      return getState();
    }
    function setMode(nextMode, tierId) {
      if (nextMode !== 'auto' && nextMode !== 'manual') throw new Error('Mode must be auto or manual');
      mode = nextMode;
      resetCounters();
      if (adaptiveFloor && nextMode === 'auto') { nextProbeAt = 0; cooldownUntil = 0; fpsStart = lastFrameAt = null; fpsFrames = 0; }
      if (nextMode === 'manual') {
        if (tierId && !has(tiers, tierId)) throw new Error('Unknown tier: ' + tierId);
        if (tierId && requestTier(tierId, { force: true, reason: 'manual-selection', immediateResize: true })) return getState();
      }
      dispatch(nextMode === 'auto' ? 'auto-resumed' : 'manual-selection');
      return getState();
    }
    function subscribe(fn, fireNow = true) {
      if (typeof fn !== 'function') throw new Error('Subscriber must be a function');
      listeners.add(fn);
      if (fireNow) fn(getState());
      return () => listeners.delete(fn);
    }
    function destroy() {
      disposed = true;
      listeners.clear();
      resizeHandler = null;
    }

    const api = {
      profile, storageKey, get state() { return getState(); },
      get currentTierId() { return currentTierId; },
      get settings() { return getState().settings; },
      get fps() { return fps; },
      get pendingResize() { return resizeRequired; },
      get mode() { return mode; },
      observeFps, frame, requestTier, stepTier, setMode, setFpsThreshold, activateEmergency,
      registerGpuCapabilities, resolveResolution, setResizeHandler, markResized,
      commitPendingResize, getState, subscribe, destroy
    };
    dispatch('initial-detection');
    return api;
  }

  return Object.freeze({ version: '1.0.0', order: ORDER, profiles: PROFILES,
    detectMobile, estimateInitialTier, create });
});
