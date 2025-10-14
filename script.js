// Edit PAIR_URL to point to your deployed pair endpoint (Render, etc.)
const PAIR_URL = location.origin + '/pair'; // default: same domain; change if backend elsewhere

const getPairBtn = document.getElementById('getPair');
const out = document.getElementById('result');
const input = document.getElementById('number');
const copyBtn = document.getElementById('copyBtn');

getPairBtn.addEventListener('click', async () => {
  const number = input.value.trim();
  out.textContent = 'Requesting pair code…';
  try {
    const resp = await fetch(PAIR_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ number })
    });
    if (!resp.ok) {
      const error = await resp.json().catch(()=>({error:resp.statusText}));
      out.textContent = 'Error: ' + (error.error || error.message || resp.statusText);
      return;
    }
    const data = await resp.json();
    // Expect { qr, qrDataUrl, qrString } from the /pair endpoint
    if (data.qrDataUrl) {
      out.innerHTML = `<img src="${data.qrDataUrl}" alt="pair qr" style="max-width:240px"/><div style="margin-top:8px;color:#bbb">Expires soon</div>`;
      // store string for copy
      out.dataset.code = data.qr || data.qrString || '';
    } else if (data.qr) {
      out.textContent = data.qr;
      out.dataset.code = data.qr;
    } else {
      out.textContent = JSON.stringify(data);
    }
  } catch (err) {
    out.textContent = 'Network error: ' + err.message;
  }
});

copyBtn.addEventListener('click', () => {
  const code = out.dataset.code || out.textContent || '';
  if (!code) return alert('No code to copy');
  navigator.clipboard.writeText(code).then(()=> alert('Copied!'), ()=> alert('Copy failed'));
});
