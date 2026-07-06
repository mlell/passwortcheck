
document.getElementById('password-loading').hidden = true;
document.getElementById('input-wrapper').hidden = false;

const passwordInput = document.getElementById('password');
const strengthFill = document.getElementById('strength-fill');
const scoreLabel = document.getElementById('score-label');
const computingSpinner = document.getElementById('computing-spinner');
const feedbackWarning = document.getElementById('feedback-warning');
const feedbackSuggestions = document.getElementById('feedback-suggestions');
const feedbackDetailsWrapper = document.getElementById('feedback-details-wrapper');
const noIssuesDisclaimer = document.getElementById('no-issues-disclaimer');
const modernOption = document.getElementById('modern-option');
const legacyOption = document.getElementById('legacy-option');
const hashingToggleButton = document.getElementById('hashing-toggle');
const crackTimeValue = document.getElementById('crack-time-value');
const toggleVisibility = document.getElementById('toggle-visibility');

let isLegacyHashing = false;

const hashingScenarios = {
  modern: {
    key: 'offlineSlowHashingXPerSecond',
    label: 'moderne Technik',
    description: 'Passwort-Hash mit langsamem, iteriertem Verfahren (z. B. bcrypt, Argon2) – realistisch ca. 10.000 Rateversuche/Sekunde.',
  },
  legacy: {
    key: 'offlineFastHashingXPerSecond',
    label: 'veraltete Technik',
    description: 'Passwort-Hash mit schneller, nicht iterierter Funktion (z. B. einfaches MD5/SHA-256) – ein Angreifer mit GPUs schafft ca. 10 Milliarden Rateversuche/Sekunde.',
  },
};

hashingToggleButton.addEventListener('click', () => {
  isLegacyHashing = !isLegacyHashing;
  renderFeedback();
});

toggleVisibility.addEventListener('click', () => {
  const isPassword = passwordInput.type === 'password';
  passwordInput.type = isPassword ? 'text' : 'password';
  toggleVisibility.textContent = isPassword ? '🙈' : '👁';
  toggleVisibility.setAttribute('aria-label', isPassword ? 'Passwort verbergen' : 'Passwort anzeigen');
});

const scoreLabels = [
  'Sehr schwach',
  'Schwach',
  'Mittel',
  'Stark',
  'Sehr stark',
];

let lastResult = null;

function scoreFromCrackSeconds(seconds) {
  if (seconds < 0.1) return 0;
  if (seconds < 100) return 1;
  if (seconds < 1e4) return 2;
  if (seconds < 1e6) return 3;
  return 4;
}

function renderFeedback() {
  modernOption.classList.toggle('active', !isLegacyHashing);
  legacyOption.classList.toggle('active', isLegacyHashing);
  hashingToggleButton.classList.toggle('checked', isLegacyHashing);
  hashingToggleButton.setAttribute('aria-checked', isLegacyHashing);



  if (!lastResult) {
    strengthFill.className = 'strength-fill';
    scoreLabel.className = 'score-label';
    scoreLabel.textContent = '';
    crackTimeValue.textContent = '---';
    feedbackDetailsWrapper.hidden = true;
    noIssuesDisclaimer.hidden = true;
    return;
  }

  const result = lastResult;
  const warning = result.feedback.warning;
  const suggestions = result.feedback.suggestions;
  const scenario = isLegacyHashing ? hashingScenarios.legacy : hashingScenarios.modern;
  const crackTime = result.crackTimes[scenario.key].display;
  const score = scoreFromCrackSeconds(result.crackTimes[scenario.key].seconds);

  strengthFill.className = `strength-fill score-${score}`;
  scoreLabel.className = `score-label score-${score}`;
  scoreLabel.textContent = scoreLabels[score];

  feedbackWarning.hidden = !warning;
  feedbackWarning.textContent = warning || '';

  feedbackSuggestions.hidden = suggestions.length === 0;
  feedbackSuggestions.innerHTML = suggestions.map((suggestion) => `<li>${suggestion}</li>`).join('');

  const hasNoIssues = !warning && suggestions.length === 0;
  feedbackDetailsWrapper.hidden = hasNoIssues;
  noIssuesDisclaimer.hidden = !(hasNoIssues && score >= 3);

  crackTimeValue.textContent = crackTime;
}

const worker = new Worker('worker.js', { type: 'module' });
let sequence = 0;
let showLoadingTimeout = null;

passwordInput.addEventListener('input', () => {
  const password = passwordInput.value;

  if (!password) {
    lastResult = null;
    renderFeedback();
    if (showLoadingTimeout) {
      clearTimeout(showLoadingTimeout);
      showLoadingTimeout = null;
    }
    return;
  }

  // Clear any pending loading state
  if (showLoadingTimeout) {
    clearTimeout(showLoadingTimeout);
    showLoadingTimeout = null;
  }

  // Schedule loading state after 0.5s delay
  showLoadingTimeout = setTimeout(() => {
    strengthFill.className = 'strength-fill';
    scoreLabel.className = 'score-label';
    scoreLabel.textContent = 'Berechne';
    computingSpinner.hidden = false;
    crackTimeValue.textContent = '---';
    feedbackDetailsWrapper.hidden = true;
    noIssuesDisclaimer.hidden = true;
  }, 500);

  sequence++;
  worker.postMessage({ password, sequence });
});

worker.addEventListener('message', (e) => {
  const { result, sequence: resultSequence } = e.data;
  if (resultSequence === sequence) {
    // Cancel pending loading state if computation finished quickly
    if (showLoadingTimeout) {
      clearTimeout(showLoadingTimeout);
      showLoadingTimeout = null;
    }
    lastResult = result;
    computingSpinner.hidden = true;
    renderFeedback();
  }
});

renderFeedback();
