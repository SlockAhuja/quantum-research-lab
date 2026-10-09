import https from 'node:https';

function check() {
  const url = `https://slockahuja.github.io/quantum-research-lab/?_cb=${Date.now()}`;
  https.get(url, (res) => {
    let data = '';
    res.on('data', c => data += c);
    res.on('end', () => {
      console.log('HTML Status:', res.statusCode);
      console.log('Contains bundled assets?:', data.includes('/quantum-research-lab/assets/'));

      // Check JS asset
      const jsUrl = 'https://slockahuja.github.io/quantum-research-lab/assets/index-nd_kxnKq.js';
      https.get(jsUrl, (jsRes) => {
        console.log('JS Bundle Status:', jsRes.statusCode, 'Content-Type:', jsRes.headers['content-type'], 'Size:', jsRes.headers['content-length'], 'bytes');
      });

      // Check CSS asset
      const cssUrl = 'https://slockahuja.github.io/quantum-research-lab/assets/index-CnQFXkGs.css';
      https.get(cssUrl, (cssRes) => {
        console.log('CSS Bundle Status:', cssRes.statusCode, 'Content-Type:', cssRes.headers['content-type'], 'Size:', cssRes.headers['content-length'], 'bytes');
      });
    });
  }).on('error', err => console.error('Request error:', err));
}

check();
