(() => {
  const TARGET = 90;
  const MIN_FINISH = 70;
  const AUTO_INTERVAL_MS = 350;
  const STABLE_MS = 450;
  const MIN_SHARPNESS = 36;
  const MIN_CHANGE = 9;
  const MIN_LIGHT = 28;
  const MAX_LIGHT = 235;
  const OUTPUT_MAX_DIMENSION = 2560;

  const steps = [
    { until: 10, title: 'Corner start', text: 'Start in one corner. Point into the room. Take one small step, pause briefly, then continue. Do not spin in place.' },
    { until: 25, title: 'Wall 1', text: 'Walk slowly along the first wall. Small step, short pause. Keep most of the previous view visible.' },
    { until: 35, title: 'Corner 2', text: 'Arc around the next corner from two different positions. Pause briefly after each small step.' },
    { until: 50, title: 'Wall 2', text: 'Continue along the next wall. Translate through the room; avoid pure rotation.' },
    { until: 65, title: 'Opposite side', text: 'Cover the opposite side. Keep strong overlap and reveal areas hidden earlier.' },
    { until: 78, title: 'Detail pass', text: 'Move closer to furniture and difficult areas. Small step, pause, capture.' },
    { until: 90, title: 'Center sweep', text: 'Finish through the center. Revisit missing corners from a new physical position.' },
  ];

  const $ = (id) => document.getElementById(id);
  const setup = $('setup'), scanner = $('scanner'), results = $('results');
  const startBtn = $('startBtn'), video = $('video');
  const analysisCanvas = $('analysisCanvas'), captureCanvas = $('captureCanvas');
  const actx = analysisCanvas.getContext('2d', { willReadFrequently: true });
  const cctx = captureCanvas.getContext('2d');
  const acceptedCount = $('acceptedCount'), targetCount = $('targetCount');
  const stepLabel = $('stepLabel'), stepTitle = $('stepTitle'), coachText = $('coachText');
  const warning = $('warning'), progressBar = $('progressBar');
  const sharpnessVal = $('sharpnessVal'), lightVal = $('lightVal'), changeVal = $('changeVal');
  const manualCaptureBtn = $('manualCaptureBtn'), pauseBtn = $('pauseBtn'), finishBtn = $('finishBtn');
  const voiceToggle = $('voiceToggle'), autoToggle = $('autoToggle');
  const downloadBtn = $('downloadBtn'), restartBtn = $('restartBtn');

  targetCount.textContent = TARGET;

  let stream = null;
  let videoTrack = null;
  let imageCapture = null;
  let imageCaptureAvailable = false;
  let photos = [];
  let manifest = [];
  let lastGray = null;
  let autoTimer = null;
  let startedAt = 0;
  let paused = false;
  let blurRejected = 0;
  let duplicateRejected = 0;
  let lightingRejected = 0;
  let motionRejected = 0;
  let lastMotionAt = 0;
  let lastSpokenStep = -1;
  let captureBusy = false;
  let lastAcceptedAt = 0;
  let cameraSettings = {};

  document.querySelectorAll('.precheck').forEach(cb => cb.addEventListener('change', () => {
    startBtn.disabled = ![...document.querySelectorAll('.precheck')].every(x => x.checked);
  }));

  function speak(text) {
    if (!voiceToggle.checked || !('speechSynthesis' in window)) return;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.95;
    speechSynthesis.speak(u);
  }

  function currentStepIndex() {
    const n = photos.length;
    const idx = steps.findIndex(s => n < s.until);
    return idx < 0 ? steps.length - 1 : idx;
  }

  function updateCoach() {
    const idx = currentStepIndex();
    const s = steps[idx];
    stepLabel.textContent = `Step ${idx + 1} of ${steps.length}`;
    stepTitle.textContent = s.title;
    coachText.textContent = s.text;
    acceptedCount.textContent = photos.length;
    progressBar.style.width = `${Math.min(100, photos.length / TARGET * 100)}%`;
    if (idx !== lastSpokenStep) {
      lastSpokenStep = idx;
      speak(`${s.title}. ${s.text}`);
    }
  }

  async function requestMotionPermission() {
    try {
      if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
        const res = await DeviceMotionEvent.requestPermission();
        if (res !== 'granted') return;
      }
      window.addEventListener('devicemotion', (e) => {
        const a = e.acceleration || {};
        const r = e.rotationRate || {};
        const accel = Math.sqrt((a.x||0)**2 + (a.y||0)**2 + (a.z||0)**2);
        const rot = Math.sqrt((r.alpha||0)**2 + (r.beta||0)**2 + (r.gamma||0)**2);
        if (accel > 2.5 || rot > 75) lastMotionAt = Date.now();
      }, { passive: true });
    } catch (_) {}
  }

  async function startCamera() {
    if (!navigator.mediaDevices?.getUserMedia) {
      alert('Camera API unavailable. Open this page over HTTPS in Safari/Chrome.');
      return false;
    }
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 3840 },
          height: { ideal: 2160 },
          frameRate: { ideal: 30, max: 30 }
        }
      });
      video.srcObject = stream;
      await video.play();

      videoTrack = stream.getVideoTracks()[0] || null;
      cameraSettings = videoTrack?.getSettings?.() || {};

      if (videoTrack && typeof ImageCapture !== 'undefined') {
        try {
          imageCapture = new ImageCapture(videoTrack);
          if (typeof imageCapture.takePhoto === 'function') {
            imageCaptureAvailable = true;
          }
        } catch (_) {
          imageCapture = null;
          imageCaptureAvailable = false;
        }
      }
      return true;
    } catch (err) {
      alert(`Could not open camera: ${err.message}`);
      return false;
    }
  }

  function analyzeFrame() {
    const W = 160, H = 120;
    analysisCanvas.width = W; analysisCanvas.height = H;
    actx.drawImage(video, 0, 0, W, H);
    const { data } = actx.getImageData(0, 0, W, H);
    const gray = new Uint8Array(W * H);
    let sum = 0;
    for (let i = 0, p = 0; i < data.length; i += 4, p++) {
      const g = (data[i] * 0.299 + data[i+1] * 0.587 + data[i+2] * 0.114) | 0;
      gray[p] = g; sum += g;
    }
    const light = sum / gray.length;

    let lapSum = 0, lapSq = 0, count = 0;
    for (let y = 1; y < H - 1; y++) {
      for (let x = 1; x < W - 1; x++) {
        const i = y * W + x;
        const lap = 4 * gray[i] - gray[i-1] - gray[i+1] - gray[i-W] - gray[i+W];
        lapSum += lap; lapSq += lap * lap; count++;
      }
    }
    const mean = lapSum / count;
    const sharpness = Math.sqrt(Math.max(0, lapSq / count - mean * mean));

    let change = 100;
    if (lastGray) {
      let diff = 0;
      for (let i = 0; i < gray.length; i += 8) diff += Math.abs(gray[i] - lastGray[i]);
      change = diff / (gray.length / 8);
    }
    return { gray, light, sharpness, change };
  }

  function showWarning(text) {
    warning.textContent = text;
    warning.classList.remove('hidden');
    clearTimeout(showWarning.t);
    showWarning.t = setTimeout(() => warning.classList.add('hidden'), 900);
  }

  async function blobDimensions(blob) {
    try {
      const bmp = await createImageBitmap(blob);
      const d = { width: bmp.width, height: bmp.height };
      bmp.close?.();
      return d;
    } catch (_) {
      return { width: video.videoWidth || 0, height: video.videoHeight || 0 };
    }
  }

  async function downscaleIfNeeded(blob) {
    try {
      const bmp = await createImageBitmap(blob);
      const maxDim = Math.max(bmp.width, bmp.height);
      if (maxDim <= OUTPUT_MAX_DIMENSION) {
        const dims = { width: bmp.width, height: bmp.height };
        bmp.close?.();
        return { blob, ...dims };
      }

      const scale = OUTPUT_MAX_DIMENSION / maxDim;
      const w = Math.max(1, Math.round(bmp.width * scale));
      const h = Math.max(1, Math.round(bmp.height * scale));
      captureCanvas.width = w;
      captureCanvas.height = h;
      cctx.drawImage(bmp, 0, 0, w, h);
      bmp.close?.();
      const scaled = await new Promise(resolve => captureCanvas.toBlob(resolve, 'image/jpeg', 0.94));
      return { blob: scaled || blob, width: w, height: h };
    } catch (_) {
      const dims = await blobDimensions(blob);
      return { blob, ...dims };
    }
  }

  async function takePhotoBlob() {
    if (imageCaptureAvailable && imageCapture) {
      try {
        const raw = await imageCapture.takePhoto();
        const normalized = await downscaleIfNeeded(raw);
        return { ...normalized, mode: 'image_capture' };
      } catch (_) {
        // Fall through to preview-frame capture.
      }
    }

    const vw = video.videoWidth || 1280, vh = video.videoHeight || 720;
    captureCanvas.width = vw;
    captureCanvas.height = vh;
    cctx.drawImage(video, 0, 0, vw, vh);
    const blob = await new Promise(resolve => captureCanvas.toBlob(resolve, 'image/jpeg', 0.94));
    return { blob, width: vw, height: vh, mode: 'canvas_fallback' };
  }

  async function capture({ manual = false } = {}) {
    if (captureBusy || paused || !stream || photos.length >= TARGET) return;
    const a = analyzeFrame();
    sharpnessVal.textContent = a.sharpness.toFixed(0);
    lightVal.textContent = a.light.toFixed(0);
    changeVal.textContent = a.change.toFixed(0);

    const stableFor = Date.now() - lastMotionAt;
    if (!manual && stableFor < STABLE_MS) {
      motionRejected++;
      showWarning('Pause briefly for a sharp photo');
      return;
    }
    if (a.light < MIN_LIGHT) { lightingRejected++; showWarning('Too dark'); return; }
    if (a.light > MAX_LIGHT) { lightingRejected++; showWarning('Too bright'); return; }
    if (a.sharpness < MIN_SHARPNESS) { blurRejected++; showWarning('Hold still for half a second'); return; }
    if (lastGray && a.change < MIN_CHANGE) { duplicateRejected++; showWarning('Take one small step'); return; }

    captureBusy = true;
    try {
      const photo = await takePhotoBlob();
      if (!photo.blob) return;

      const idx = photos.length + 1;
      const filename = `frame_${String(idx).padStart(3, '0')}.jpg`;
      photos.push({ name: filename, blob: photo.blob });
      manifest.push({
        index: idx,
        filename,
        captured_at: new Date().toISOString(),
        elapsed_ms: Date.now() - startedAt,
        step: steps[currentStepIndex()]?.title || 'Complete',
        sharpness: Number(a.sharpness.toFixed(2)),
        brightness: Number(a.light.toFixed(2)),
        scene_change: Number(a.change.toFixed(2)),
        width: photo.width,
        height: photo.height,
        capture_mode: photo.mode,
        manual
      });

      lastGray = a.gray;
      lastAcceptedAt = Date.now();
      navigator.vibrate?.(25);
      updateCoach();

      if (photos.length % 10 === 0 && photos.length < TARGET) {
        speak(`${photos.length} good photos captured. Keep moving through the room with small steps and short pauses.`);
      }
      if (photos.length >= TARGET) finishScan(true);
    } finally {
      captureBusy = false;
    }
  }

  function startAuto() {
    stopAuto();
    autoTimer = setInterval(() => {
      if (autoToggle.checked) capture();
      else {
        const a = analyzeFrame();
        sharpnessVal.textContent = a.sharpness.toFixed(0);
        lightVal.textContent = a.light.toFixed(0);
        changeVal.textContent = a.change.toFixed(0);
      }

      if (lastAcceptedAt && Date.now() - lastAcceptedAt > 9000 && !paused) {
        lastAcceptedAt = Date.now();
        speak('Take one small step, then pause briefly so I can capture a sharp photo.');
      }
    }, AUTO_INTERVAL_MS);
  }

  function stopAuto() {
    if (autoTimer) clearInterval(autoTimer);
    autoTimer = null;
  }

  startBtn.addEventListener('click', async () => {
    await requestMotionPermission();
    const ok = await startCamera();
    if (!ok) return;
    setup.classList.add('hidden');
    scanner.classList.remove('hidden');
    startedAt = Date.now();
    lastAcceptedAt = Date.now();
    updateCoach();
    speak('Scan started. Move with small steps. After each step, pause briefly. I will take the sharp photos automatically.');
    startAuto();
  });

  manualCaptureBtn.addEventListener('click', () => capture({ manual: true }));

  pauseBtn.addEventListener('click', () => {
    paused = !paused;
    pauseBtn.textContent = paused ? 'Resume' : 'Pause';
    speak(paused ? 'Paused.' : 'Resumed. Continue with a small step and a short pause.');
  });

  finishBtn.addEventListener('click', () => finishScan(false));

  function finishScan(force = false) {
    if (!force && photos.length < MIN_FINISH) {
      const ok = confirm(`Only ${photos.length} of ${TARGET} good photos were captured. This is probably not enough for a strong 3D reconstruction. Finish anyway?`);
      if (!ok) {
        speak(`Keep scanning. You currently have ${photos.length} good photos. Aim for at least ${MIN_FINISH}.`);
        return;
      }
    }

    stopAuto();
    stream?.getTracks().forEach(t => t.stop());
    stream = null;
    scanner.classList.add('hidden');
    results.classList.remove('hidden');
    $('sumAccepted').textContent = photos.length;
    $('sumBlur').textContent = blurRejected;
    $('sumDup').textContent = duplicateRejected;
    const sec = Math.floor((Date.now() - startedAt) / 1000);
    $('sumDuration').textContent = `${Math.floor(sec/60)}:${String(sec%60).padStart(2,'0')}`;
  }

  restartBtn.addEventListener('click', () => location.reload());

  downloadBtn.addEventListener('click', async () => {
    if (!photos.length) return;

    const scanMeta = {
      scanner_version: '2.0',
      created_at: new Date().toISOString(),
      target_photos: TARGET,
      minimum_recommended_photos: MIN_FINISH,
      accepted_photos: photos.length,
      blur_rejected: blurRejected,
      duplicate_rejected: duplicateRejected,
      lighting_rejected: lightingRejected,
      motion_rejected: motionRejected,
      preferred_capture_mode: 'ImageCapture.takePhoto()',
      image_capture_available: imageCaptureAvailable,
      output_max_dimension: OUTPUT_MAX_DIMENSION,
      camera_settings: cameraSettings,
      notes: 'Guided still-image room capture. Feed images directly into reconstruction; do not extract video frames.',
      frames: manifest
    };

    const files = [
      ...photos,
      {
        name: 'scan_manifest.json',
        blob: new Blob([JSON.stringify(scanMeta, null, 2)], { type: 'application/json' })
      }
    ];

    const zipBlob = await buildZip(files);
    const a = document.createElement('a');
    a.href = URL.createObjectURL(zipBlob);
    a.download = `room_scan_${new Date().toISOString().replace(/[:.]/g,'-')}.zip`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
  });

  async function buildZip(files) {
    const enc = new TextEncoder();
    const chunks = [];
    const central = [];
    let offset = 0;
    const dos = dosDateTime(new Date());

    for (const f of files) {
      const name = enc.encode(f.name);
      const data = new Uint8Array(await f.blob.arrayBuffer());
      const crc = crc32(data);

      const local = new Uint8Array(30 + name.length);
      const v = new DataView(local.buffer);
      v.setUint32(0, 0x04034b50, true);
      v.setUint16(4, 20, true);
      v.setUint16(6, 0, true);
      v.setUint16(8, 0, true);
      v.setUint16(10, dos.time, true);
      v.setUint16(12, dos.date, true);
      v.setUint32(14, crc, true);
      v.setUint32(18, data.length, true);
      v.setUint32(22, data.length, true);
      v.setUint16(26, name.length, true);
      v.setUint16(28, 0, true);
      local.set(name, 30);
      chunks.push(local, data);

      const cen = new Uint8Array(46 + name.length);
      const c = new DataView(cen.buffer);
      c.setUint32(0, 0x02014b50, true);
      c.setUint16(4, 20, true);
      c.setUint16(6, 20, true);
      c.setUint16(8, 0, true);
      c.setUint16(10, 0, true);
      c.setUint16(12, dos.time, true);
      c.setUint16(14, dos.date, true);
      c.setUint32(16, crc, true);
      c.setUint32(20, data.length, true);
      c.setUint32(24, data.length, true);
      c.setUint16(28, name.length, true);
      c.setUint16(30, 0, true);
      c.setUint16(32, 0, true);
      c.setUint16(34, 0, true);
      c.setUint16(36, 0, true);
      c.setUint32(38, 0, true);
      c.setUint32(42, offset, true);
      cen.set(name, 46);
      central.push(cen);

      offset += local.length + data.length;
    }

    const centralOffset = offset;
    const centralSize = central.reduce((n, x) => n + x.length, 0);

    const end = new Uint8Array(22);
    const e = new DataView(end.buffer);
    e.setUint32(0, 0x06054b50, true);
    e.setUint16(4, 0, true);
    e.setUint16(6, 0, true);
    e.setUint16(8, files.length, true);
    e.setUint16(10, files.length, true);
    e.setUint32(12, centralSize, true);
    e.setUint32(16, centralOffset, true);
    e.setUint16(20, 0, true);

    return new Blob([...chunks, ...central, end], { type: 'application/zip' });
  }

  function dosDateTime(d) {
    const year = Math.max(1980, d.getFullYear());
    return {
      date: ((year - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate(),
      time: (d.getHours() << 11) | (d.getMinutes() << 5) | Math.floor(d.getSeconds() / 2)
    };
  }

  const crcTable = (() => {
    const table = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = (c & 1) ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      table[n] = c >>> 0;
    }
    return table;
  })();

  function crc32(data) {
    let c = 0xffffffff;
    for (let i = 0; i < data.length; i++) c = crcTable[(c ^ data[i]) & 0xff] ^ (c >>> 8);
    return (c ^ 0xffffffff) >>> 0;
  }
})();