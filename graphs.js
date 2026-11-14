'use strict';

const SOURCE_COMMIT = '9c0f9368368bcce058d9c4baf80a614d3709cdbb';
const SOURCE_URL = `https://raw.githubusercontent.com/m0333ism-dev/relational-graph-stylometry/${SOURCE_COMMIT}/site/data/original-tuples.json`;
const PAYLOAD_SHA256 = '3b2badc59fb8bb20e2e8f8e0167de85869226af61a793f7aab99beb28f4ce36d';
const CSV_SHA256 = '5068c83649471c0ac2daff34841c5ab6622eb13c49547875b750a95c745a2ff4';
const COLORS = { ai: '#b04f24', human: '#216596' };
const NAMES = { ai: 'AI-generated', human: 'Human-written' };
const GENRES = ['email', 'review', 'legal', 'abstracts', 'articles', 'papers'];
const PRESETS = {
  all: null,
  sentence: ['avg_sent_length', 'sent_len_median', 'sent_length_variability', 'sent_len_iqr', 'sent_len_max'],
  entropy: ['char_entropy', 'char_bigram_entropy', 'char_trigram_entropy', 'pos_bigram_entropy'],
  words: ['avg_content_word_length', 'chars_per_word_mean', 'chars_per_word_std', 'avg_syllables_per_word'],
};

// Pure transformations are shared by the browser and arithmetic checks.
function quantile(sorted, q) {
  const position = (sorted.length - 1) * q;
  const lower = Math.floor(position), fraction = position - lower;
  return sorted[lower] + fraction * (sorted[Math.min(lower + 1, sorted.length - 1)] - sorted[lower]);
}
function scaledValue(data, row, feature) {
  const width = data.maximum[feature] - data.minimum[feature];
  return width === 0 ? 0 : (data.values[row][feature] - data.minimum[feature]) / width;
}
function rowsFor(data, label, genre, unique) {
  const seen = new Set(), rows = [];
  for (let i = 0; i < data.values.length; i++) {
    if (data.labels[i] !== label || (genre !== 'ALL' && data.genres[i] !== genre)) continue;
    const key = JSON.stringify([data.genres[i], data.groups[i]]);
    if (unique && seen.has(key)) continue;
    seen.add(key); rows.push(i);
  }
  return rows;
}
function summarize(data, rows, features) {
  return features.map(feature => {
    const column = rows.map(row => scaledValue(data, row, feature)).sort((a, b) => a - b);
    return { q1: quantile(column, .25), median: quantile(column, .5), q3: quantile(column, .75) };
  });
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { quantile, scaledValue, rowsFor, summarize };
}

async function startGraphs() {
  const el = id => document.getElementById(id);
  const status = el('status');
  try {
    if (!globalThis.Plotly) throw Error('The plotting library did not load. Please reload the page.');
    const response = await fetch(SOURCE_URL);
    if (!response.ok) throw Error(`The public research data returned HTTP ${response.status}.`);
    const bytes = await response.arrayBuffer();
    const digest = [...new Uint8Array(await crypto.subtle.digest('SHA-256', bytes))].map(v => v.toString(16).padStart(2, '0')).join('');
    if (digest !== PAYLOAD_SHA256) throw Error('The research data does not match the pinned public version.');
    const data = JSON.parse(new TextDecoder().decode(bytes));
    if (data.data_sha256 !== CSV_SHA256 || data.values.length !== 5046 || data.names.length !== 132 || data.labels.length !== 5046 || data.values.some(row => row.length !== 132 || row.some(value => !Number.isFinite(value)))) {
      throw Error('The research data schema or numeric values failed validation.');
    }
    let selected = data.names.map((_, i) => i), rendering = false;
    const defaultClass = document.body.dataset.class;
    el('class').value = ['ai', 'human'].includes(defaultClass) ? defaultClass : 'both';
    const query = new URLSearchParams(location.search);
    if (GENRES.includes(query.get('genre'))) el('genre').value = query.get('genre');
    if (Object.hasOwn(PRESETS, query.get('features'))) el('preset').value = query.get('features');
    const renderLibrary = () => {
      el('features').replaceChildren();
      const query = el('search').value.toLowerCase();
      data.names.forEach((name, index) => {
        if (!name.toLowerCase().includes(query)) return;
        const label = document.createElement('label'), checkbox = document.createElement('input');
        checkbox.type = 'checkbox'; checkbox.checked = selected.includes(index);
        checkbox.addEventListener('change', () => {
          if (checkbox.checked) selected.push(index);
          else if (selected.length > 1) selected = selected.filter(i => i !== index);
          else checkbox.checked = true;
          el('preset').value = 'custom';
          el('selection-count').textContent = `${selected.length} features selected. Apply to update the plot.`;
        });
        label.append(checkbox, document.createTextNode(name)); el('features').append(label);
      });
    };
    const applyPreset = () => {
      const names = PRESETS[el('preset').value];
      if (el('preset').value !== 'custom') selected = names ? names.map(name => data.names.indexOf(name)) : data.names.map((_, i) => i);
      if (selected.some(index => index < 0)) throw Error('A selected feature is absent from this dataset.');
      renderLibrary();
      el('selection-count').textContent = `${selected.length} features selected.`;
    };
    const render = async () => {
      if (rendering) return;
      rendering = true; el('apply').disabled = true;
      try {
        const labels = el('class').value === 'both' ? ['human', 'ai'] : [el('class').value];
        const genre = el('genre').value, unique = el('unique').checked, traces = [], counts = [];
        const features = [...selected], x = features.map((_, i) => i);
        for (const label of labels) {
          const rows = rowsFor(data, label, genre, unique), summary = summarize(data, rows, features);
          counts.push(`${NAMES[label]}: ${rows.length.toLocaleString()} ${unique ? 'representatives' : 'documents'}`);
          if (el('view').value === 'documents') {
            const xx = [], yy = [], hover = [];
            for (const row of rows) {
              features.forEach((feature, j) => {
                xx.push(j); yy.push(scaledValue(data, row, feature));
                hover.push([data.ids[row], data.genres[row], data.names[feature], data.values[row][feature]]);
              });
              xx.push(null); yy.push(null); hover.push(null);
            }
            traces.push({ type: 'scattergl', mode: 'lines', x: xx, y: yy, customdata: hover, connectgaps: false,
              line: { color: COLORS[label], width: .6 }, opacity: .14, showlegend: false,
              hovertemplate: '%{customdata[0]}<br>Genre: %{customdata[1]}<br>%{customdata[2]}<br>Raw: %{customdata[3]}<br>Shared scale: %{y:.4f}<extra></extra>' });
          } else {
            traces.push({ type: 'scatter', mode: 'lines', x, y: summary.map(s => s.q1), line: { width: 0 }, showlegend: false, hoverinfo: 'skip' });
            traces.push({ type: 'scatter', mode: 'lines', x, y: summary.map(s => s.q3), line: { width: 0 }, fill: 'tonexty', fillcolor: label === 'ai' ? 'rgba(176,79,36,.13)' : 'rgba(33,101,150,.13)', name: `${NAMES[label]} · middle 50%`, hoverinfo: 'skip' });
          }
          traces.push({ type: 'scatter', mode: 'lines+markers', x, y: summary.map(s => s.median),
            customdata: features.map((feature, i) => [data.names[feature], summary[i].q1, summary[i].q3]), name: `${NAMES[label]} · median`,
            line: { color: COLORS[label], width: 2 }, marker: { size: 4 },
            hovertemplate: '%{customdata[0]}<br>Median: %{y:.4f}<br>Q1: %{customdata[1]:.4f}<br>Q3: %{customdata[2]:.4f}<extra>%{fullData.name}</extra>' });
        }
        el('plot').style.minWidth = features.length > 20 ? '1200px' : '0';
        await Plotly.react('plot', traces, {
          title: { text: `${labels.length === 2 ? 'Human and AI' : NAMES[labels[0]]} · ${genre === 'ALL' ? 'all six genres' : genre}`, x: .04 },
          paper_bgcolor: '#ffffff', plot_bgcolor: '#ffffff', height: features.length > 20 ? 690 : 540,
          margin: { l: 70, r: 30, t: 85, b: features.length > 20 ? 260 : 145 },
          xaxis: { tickmode: 'array', tickvals: x, ticktext: features.map(i => data.names[i]), tickangle: -65, tickfont: { size: features.length > 20 ? 8 : 11 }, range: [-.5, features.length - .5], automargin: true },
          yaxis: { title: { text: 'Shared full-corpus min–max scale' }, range: [-.025, 1.025], gridcolor: '#e5eaf0' },
          legend: { orientation: 'h', y: 1.13 }, hovermode: 'closest',
        }, { responsive: true, displaylogo: false, toImageButtonOptions: { filename: 'stylometric-feature-profiles', format: 'png', scale: 2 } });
        el('counts').textContent = counts.join(' · ');
        el('view-note').textContent = el('view').value === 'documents'
          ? 'Each faint line connects the selected feature measurements from one document; the stronger line is the group median. All eligible documents are drawn, with no random subsampling.'
          : 'The line is the median of each feature. Shading spans its 25th to 75th percentiles; it is a marginal summary, not one document or a joint interaction pattern.';
        el('warning').textContent = genre === 'papers'
          ? 'Papers contain only 23 documents per class and remain descriptive.'
          : genre === 'ALL' ? 'The pooled view mixes six genres. Five genres have 500 documents per class; papers have 23. Use the genre control before interpreting a group contrast.' : '';
        el('definitions').replaceChildren();
        features.forEach(feature => {
          const name = data.names[feature];
          if (data.flags[name]) { const item = document.createElement('li'); item.textContent = `${name}: ${data.flags[name]}`; el('definitions').append(item); }
        });
        status.textContent = `Ready · ${features.length} features · verified public research payload.`;
      } finally { rendering = false; el('apply').disabled = false; }
    };
    const safelyRender = () => render().catch(error => { status.textContent = `Graph error: ${error.message}`; });
    el('preset').addEventListener('change', applyPreset);
    el('search').addEventListener('input', renderLibrary);
    el('apply').addEventListener('click', safelyRender);
    document.querySelectorAll('fieldset').forEach(node => { node.disabled = false; });
    applyPreset(); await render();
    new ResizeObserver(() => {
      if (el('plot')._fullLayout) Plotly.Plots.resize(el('plot'));
    }).observe(el('plot').parentElement);
  } catch (error) {
    status.textContent = `Unable to load graphs: ${error.message} The full rebuilt explorer is linked below.`;
    el('retry').hidden = false;
  }
}
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('retry').addEventListener('click', () => location.reload());
    startGraphs();
  });
}
