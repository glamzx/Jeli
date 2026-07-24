// Jeli Frontend Application State & Controller

let influencersCatalog = [];
let activeTab = 'all';

document.addEventListener('DOMContentLoaded', () => {
  fetchCatalog();
  initThemeToggle();
  initFormHandler();
});

// Fetch catalog from Node.js backend
async function fetchCatalog() {
  try {
    const res = await fetch('/api/catalog');
    influencersCatalog = await res.json();
    renderCatalog(influencersCatalog);
  } catch (err) {
    console.error('Error loading catalog:', err);
  }
}

// Render catalog cards matching screenshot aesthetic
function renderCatalog(items) {
  const grid = document.getElementById('catalogGrid');
  if (!grid) return;

  grid.innerHTML = items.map(item => `
    <div class="catalog-card">
      <div class="card-header">
        <img src="${item.avatar}" alt="${item.nickname}" class="card-avatar">
        <div class="card-title">
          <h3>
            ${item.nickname}
            ${item.verified ? '<svg class="verified-icon" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>' : ''}
          </h3>
          <span class="card-handle">${item.username} • ${item.city}</span>
        </div>
      </div>

      <div class="card-niche-badge">🏷️ ${item.niche}</div>

      <div class="card-stats">
        <div>
          <span class="stat-num">${formatNum(item.followers)}</span>
          <span class="stat-lbl">Подписчики</span>
        </div>
        <div>
          <span class="stat-num">${formatNum(item.totalLikes)}</span>
          <span class="stat-lbl">Лайки</span>
        </div>
        <div>
          <span class="stat-num">${item.totalVideos}</span>
          <span class="stat-lbl">Видео</span>
        </div>
      </div>

      <div class="card-actions">
        <button class="card-btn btn-primary" onclick="launchCampaign('${item.username}')">Запустить кампанию</button>
        <button class="card-btn btn-secondary" onclick="analyzeInfluencerSingle('${item.username}')">Анализ AI</button>
      </div>
    </div>
  `).join('');
}

// Form Handler for AI Business Matcher
function initFormHandler() {
  const form = document.getElementById('campaignForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const businessDescription = document.getElementById('businessDescription').value;
    const targetNiche = document.getElementById('targetNiche').value;
    const budget = document.getElementById('budgetInput').value;

    const btn = document.getElementById('submitMatcherBtn');
    btn.disabled = true;
    btn.innerHTML = `✨ AI Проводит многокритериальный анализ...`;

    try {
      const res = await fetch('/api/analyze-match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessDescription,
          targetNiche,
          budget,
          influencers: influencersCatalog
        })
      });

      const data = await res.json();
      if (res.ok && data.matches) {
        renderAIMatches(data.matches, businessDescription);
      } else {
        alert(data.error || 'Не удалось выполнить AI-анализ');
      }
    } catch (err) {
      console.error('Match Error:', err);
      alert('Ошибка при вызове сервера AI анализа.');
    } finally {
      btn.disabled = false;
      btn.innerHTML = `<span class="btn-text">Провести AI-анализ и подобрать блогеров</span>`;
    }
  });
}

// Render AI Match Evaluation Cards
function renderAIMatches(matches, businessDesc) {
  const container = document.getElementById('aiResultsContainer');
  const grid = document.getElementById('aiMatchesGrid');
  const summaryText = document.getElementById('aiResultsSummaryText');

  container.classList.remove('hidden');
  summaryText.innerText = `Найдено ${matches.length} релевантных инфлюенсеров для запроса: "${businessDesc.slice(0, 60)}..."`;

  grid.innerHTML = matches.map(m => {
    const mc = m.multi_criteria_scores || {};
    return `
      <div class="match-card">
        <div class="match-score-badge">${m.overall_alignment_score}% Совпадение</div>
        
        <div class="match-user-info">
          <div class="match-details">
            <h4>${m.nickname || m.username}</h4>
            <span>${m.username} • ${m.alignment_tier}</span>
          </div>
        </div>

        <div class="match-criteria-bars">
          <div class="criteria-item">
            <span class="criteria-label">Тематическое соответствие нише:</span>
            <span class="criteria-value">${mc.niche_topic_fit || 80}%</span>
          </div>
          <div class="criteria-item">
            <span class="criteria-label">Региональный охват ЦА:</span>
            <span class="criteria-value">${mc.audience_demographics_reach || 85}%</span>
          </div>
          <div class="criteria-item">
            <span class="criteria-label">Стиль и бренд-безопасность:</span>
            <span class="criteria-value">${mc.content_tone_aesthetics || 90}%</span>
          </div>
          <div class="criteria-item">
            <span class="criteria-label">Конверсионный потенциал:</span>
            <span class="criteria-value">${mc.commercial_conversion_potential || 85}%</span>
          </div>
        </div>

        <p class="match-summary">${m.ai_content_summary}</p>

        <div class="card-actions">
          <button class="card-btn btn-primary" onclick="launchCampaign('${m.username}')">Запустить кампанию</button>
          <button class="card-btn btn-secondary" onclick="viewDeepMatchDetails('${encodeURIComponent(JSON.stringify(m))}')">Подробный AI-отчёт</button>
        </div>
      </div>
    `;
  }).join('');

  container.scrollIntoView({ behavior: 'smooth' });
}

// Modal Report Dialog
function viewDeepMatchDetails(encodedData) {
  const data = JSON.parse(decodeURIComponent(encodedData));
  const modal = document.getElementById('analysisModal');
  const content = document.getElementById('modalContent');

  content.innerHTML = `
    <h2 style="font-size:24px; font-weight:800; margin-bottom:8px;">AI Отчёт мэтчинга: ${data.nickname || data.username}</h2>
    <p style="color:var(--primary-accent); font-weight:700; margin-bottom:20px;">Общий показатель совпадения: ${data.overall_alignment_score}% (${data.alignment_tier})</p>

    <div style="background:var(--bg-color); padding:16px; border-radius:12px; margin-bottom:20px;">
      <h4 style="font-size:16px; font-weight:700; margin-bottom:6px;">💡 Рекомендуемый рекламный креатив (Campaign Hook):</h4>
      <p style="font-size:14px; color:var(--text-muted);">${data.recommended_campaign_angle || 'Прямая интеграция продукта в повседневный контент инфлюенсера.'}</p>
    </div>

    <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:20px;">
      <div style="background:rgba(34, 197, 94, 0.08); padding:14px; border-radius:12px;">
        <h5 style="color:#16A34A; font-weight:700; margin-bottom:6px;">✅ Преимущества (Pros):</h5>
        <ul style="font-size:13px; padding-left:18px;">
          ${(data.pros || ['Высокая вовлеченность аудитории']).map(p => `<li>${p}</li>`).join('')}
        </ul>
      </div>

      <div style="background:rgba(239, 68, 68, 0.08); padding:14px; border-radius:12px;">
        <h5 style="color:#DC2626; font-weight:700; margin-bottom:6px;">⚠️ Ограничения (Cons):</h5>
        <ul style="font-size:13px; padding-left:18px;">
          ${(data.cons || ['Требуется предварительное согласование сценария']).map(c => `<li>${c}</li>`).join('')}
        </ul>
      </div>
    </div>

    <button class="pill-btn primary-black-btn" style="width:100%;" onclick="launchCampaign('${data.username}')">Запустить интеграцию через Escrow</button>
  `;

  modal.classList.remove('hidden');
}

function closeModal() {
  document.getElementById('analysisModal').classList.add('hidden');
}

function launchCampaign(username) {
  alert(`🚀 Сделка запущена для ${username}! Депозит будет заблокирован в системе Escrow до подтверждения интеграции.`);
}

function analyzeInfluencerSingle(username) {
  document.getElementById('businessDescription').value = `Ищем блогера ${username} для проведения прямой рекламной интеграции.`;
  document.getElementById('submitMatcherBtn').click();
}

function filterCatalog() {
  const city = document.getElementById('cityFilter').value;
  const niche = document.getElementById('nicheFilter').value;

  let filtered = influencersCatalog;
  if (city !== 'all') filtered = filtered.filter(i => i.city === city);
  if (niche !== 'all') filtered = filtered.filter(i => i.niche.includes(niche));

  renderCatalog(filtered);
}

function switchTab(tab) {
  document.querySelectorAll('.tab-item').forEach(b => b.classList.remove('active'));
  event.target.classList.add('active');
  filterCatalog();
}

function scrollToMatcher() {
  document.getElementById('ai-matcher').scrollIntoView({ behavior: 'smooth' });
}

function openInfluencerModal() {
  alert('✨ Регистрация для инфлюенсеров: Авторизуйтесь через TikTok, чтобы стать амбассадором и получать предложения от брендов.');
}

function initThemeToggle() {
  const btn = document.getElementById('themeToggleBtn');
  btn.addEventListener('click', () => {
    document.body.classList.toggle('dark-theme');
    document.body.classList.toggle('light-theme');
  });
}

function formatNum(num) {
  if (num >= 1000000000) return (num / 1000000000).toFixed(1) + 'B';
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(0) + 'K';
  return num;
}
