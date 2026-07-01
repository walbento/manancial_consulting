/**
 * API client — Fase 1: JSON local em /data/
 * Fase 2: substituir por endpoints PHP em /api/
 */
(function (global) {
  const USE_LOCAL_DATA = true;
  const API_BASE = global.API_URL || '/api';

  async function fetchLocal(path) {
    const res = await fetch(path);
    if (!res.ok) throw new Error(`Failed to load ${path}`);
    return res.json();
  }

  async function fetchApi(endpoint) {
    const res = await fetch(`${API_BASE}${endpoint}`);
    if (!res.ok) throw new Error(`API error: ${endpoint}`);
    return res.json();
  }

  async function getSettings() {
    if (USE_LOCAL_DATA) return fetchLocal('/data/settings.json');
    return fetchApi('/settings');
  }

  async function getMenu() {
    if (USE_LOCAL_DATA) return fetchLocal('/data/menu.json');
    return fetchApi('/menu');
  }

  async function getPage(section, slug) {
    if (USE_LOCAL_DATA) return fetchLocal(`/data/${section}/${slug}.json`);
    return fetchApi(`/pages/${section}/${slug}`);
  }

  async function getPublicacoes() {
    if (USE_LOCAL_DATA) {
      const res = await fetch('/data/publicacoes/');
      if (res.ok) return res.json();
      return [];
    }
    return fetchApi('/publicacoes');
  }

  async function submitContact(data) {
    if (USE_LOCAL_DATA) {
      console.info('[api] Contact form will use Netlify Forms until PHP backend is ready.', data);
      return { ok: true, provider: 'netlify' };
    }
    const res = await fetch(`${API_BASE}/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  }

  global.SiteAPI = {
    getSettings,
    getMenu,
    getPage,
    getPublicacoes,
    submitContact,
    USE_LOCAL_DATA,
    API_BASE,
  };
})(window);
