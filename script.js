// Public Google Sheet ID
const SHEET_ID = '1nGkyppfnjgLbwaXuHjAHYRmD-vqbJi9BhBOx1UGhdT0';

const input = document.getElementById('schoolCode');
const clearBtn = document.getElementById('clearBtn');
const loading = document.getElementById('loading');
const errorDiv = document.getElementById('errorMessage');
const resultCard = document.getElementById('resultCard');

// Toggle clear button
input.addEventListener('input', () => {
  clearBtn.style.display = input.value ? 'block' : 'none';
});

clearBtn.addEventListener('click', () => {
  input.value = '';
  clearBtn.style.display = 'none';
  input.focus();
});

// Trigger search on Enter key
input.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') handleSearch();
});

async function handleSearch() {
  const code = input.value.trim();
  errorDiv.style.display = 'none';
  errorDiv.innerText = '';
  resultCard.style.display = 'none';

  if (!code) {
    showError('ദയവായി ഒരു സ്കൂൾ കോഡ് നൽകുക!');
    return;
  }

  loading.style.display = 'flex';

  // Google Sheet Visualization API Query Endpoint
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json`;

  try {
    const response = await fetch(url);
    const text = await response.text();

    // Extract JSON payload from Google's response wrapper
    const jsonString = text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1);
    const json = JSON.parse(jsonString);
    const rows = json.table.rows;

    let match = null;

    for (let row of rows) {
      // Column A (Index 0): School Code
      const rowCode = row.c[0] ? String(row.c[0].v || row.c[0].f || '').trim() : '';

      if (rowCode === code) {
        match = {
          code: rowCode,
          name: row.c[1] ? (row.c[1].v || '') : '',
          subdistrict: row.c[2] ? (row.c[2].v || '') : '',
          management: row.c[3] ? (row.c[3].v || '') : '',
          link: row.c[4] ? (row.c[4].v || '') : ''
        };
        break;
      }
    }

    loading.style.display = 'none';

    if (match) {
      document.getElementById('resCode').innerText = `കോഡ്: ${match.code}`;
      document.getElementById('resManagement').innerText = match.management || 'General';
      document.getElementById('resName').innerText = match.name;
      document.getElementById('resSubdistrict').innerText = match.subdistrict || 'N/A';

      const wikiBtn = document.getElementById('wikiLink');
      if (match.link) {
        wikiBtn.href = match.link;
        wikiBtn.style.display = 'flex';
      } else {
        wikiBtn.style.display = 'none';
      }

      resultCard.style.display = 'block';
    } else {
      showError('ഈ സ്കൂൾ കോഡ് കണ്ടെത്തിയില്ല!');
    }
  } catch (err) {
    loading.style.display = 'none';
    showError('വിവരങ്ങൾ ലഭ്യമാക്കുന്നതിൽ തടസ്സമുണ്ടായി. ദയവായി പിന്നീട് ശ്രമിക്കുക.');
  }
}

function showError(msg) {
  errorDiv.innerText = msg;
  errorDiv.style.display = 'block';
}
