const models = [
  {
    id: 'gpt-5-1-codex',
    name: 'GPT 5.1 Codex',
    prompt: [1.0, 5.0],
    output: [2.0, 10.0],
    note: 'Strong code reasoning; watch prompt cost on large contexts.'
  },
  {
    id: 'claude-sonnet-4-5',
    name: 'Claude Sonnet 4.5',
    prompt: [3.0, 3.0],
    output: [15.0, 15.0],
    note: 'Balanced quality and speed for review and fixes.'
  },
  {
    id: 'claude-opus-4-5',
    name: 'Claude Opus 4.5',
    prompt: [15.0, 15.0],
    output: [75.0, 75.0],
    note: 'Premium reasoning; reserve for difficult debugging.'
  },
  {
    id: 'gemini-3-pro',
    name: 'Gemini 3.0 Pro',
    prompt: [0.5, 0.5],
    output: [1.5, 1.5],
    note: 'Cost-efficient for autocomplete and batch linting.'
  }
];

const promptSlider = document.getElementById('promptSlider');
const outputSlider = document.getElementById('outputSlider');
const promptInput = document.getElementById('promptInput');
const outputInput = document.getElementById('outputInput');
const promptValue = document.getElementById('promptValue');
const outputValue = document.getElementById('outputValue');
const tableRows = document.getElementById('tableRows');

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function formatNumber(num) {
  return num.toLocaleString('en-US');
}

function midpoint(range) {
  const [low, high] = range;
  return (low + high) / 2;
}

function calcCost(tokens, pricePerMillion) {
  return (tokens / 1_000_000) * pricePerMillion;
}

function syncInputs(fromSlider = true) {
  if (fromSlider) {
    promptInput.value = promptSlider.value;
    outputInput.value = outputSlider.value;
  } else {
    const nextPrompt = clamp(Number(promptInput.value) || 0, Number(promptSlider.min), 1_000_000);
    const nextOutput = clamp(Number(outputInput.value) || 0, Number(outputSlider.min), 1_000_000);

    adjustSliderRange(promptSlider, nextPrompt);
    adjustSliderRange(outputSlider, nextOutput);

    promptSlider.value = nextPrompt;
    outputSlider.value = nextOutput;
  }
}

function adjustSliderRange(slider, value) {
  const currentMax = Number(slider.max);
  if (value > currentMax) {
    const rounded = Math.ceil(value / 5000) * 5000;
    slider.max = rounded;
  }
}

function renderRows() {
  const promptTokens = Number(promptSlider.value);
  const outputTokens = Number(outputSlider.value);

  promptValue.textContent = formatNumber(promptTokens);
  outputValue.textContent = formatNumber(outputTokens);

  const fragment = document.createDocumentFragment();

  models.forEach((model) => {
    const promptCost = calcCost(promptTokens, midpoint(model.prompt));
    const outputCost = calcCost(outputTokens, midpoint(model.output));
    const total = promptCost + outputCost;

    const row = document.createElement('div');
    row.className = 'table__row';
    row.setAttribute('role', 'row');
    row.innerHTML = `
      <span><strong>${model.name}</strong><div class="tag">${model.note}</div></span>
      <span>$${promptCost.toFixed(4)}</span>
      <span>$${outputCost.toFixed(4)}</span>
      <span>$${total.toFixed(4)}</span>
    `;
    fragment.appendChild(row);
  });

  tableRows.innerHTML = '';
  tableRows.appendChild(fragment);
}

function handleSliderInput() {
  syncInputs(true);
  renderRows();
}

function handleNumberInput() {
  syncInputs(false);
  renderRows();
}

[promptSlider, outputSlider].forEach((slider) => slider.addEventListener('input', handleSliderInput));
[promptInput, outputInput].forEach((input) => input.addEventListener('input', handleNumberInput));

syncInputs(true);
renderRows();
