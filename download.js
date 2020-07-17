const altDownloadsEl = document.createElement('P');
const altDownloadsLink = document.createElement('A');
const downloadsEl = document.getElementById('downloads');
altDownloadsLink.setAttribute('href', 'https://github.com/TagViewer/tagviewer/releases/latest');
altDownloadsLink.appendChild(document.createTextNode('from GitHub'));
altDownloadsEl.appendChild(document.createTextNode('If these downloads don\'t load, try manually downloading them '));
altDownloadsEl.appendChild(altDownloadsLink);
altDownloadsEl.appendChild(document.createTextNode('.'));
const downloadLinkTimeout = setTimeout(function () { downloadsEl.appendChild(altDownloadsEl); }, 3000);

/**
 * Make a human readable name from the file name
 * @param {string} name
 */
const humanReadableName = function (name) {
  if (name.endsWith('.zip')) {
    return `${{
      MacOS: 'MacOS',
      Windows: 'Windows',
      linux: 'Linux'
    }[name.slice(name.indexOf('-') + 1, name.indexOf('-', name.indexOf('-') + 2))]} Zip`;
  } else if (name.endsWith('rpm')) return 'Linux RPM Package';
  else if (name.endsWith('deb')) return 'Linux DEB Package';
  else if (name === 'PKGBUILD') return 'Arch Linux PKGBUILD File';
  else {
    return name;
  }
};

function humanFileSize (bytes, si = false, dp = 1) {
  const thresh = si ? 1000 : 1024;

  if (Math.abs(bytes) < thresh) {
    return `${bytes} B`;
  }

  const units = si
    ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
    : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
  let u = -1;
  const r = 10 ** dp;

  do {
    bytes /= thresh;
    ++u;
  } while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1);

  return `${bytes.toFixed(dp)} ${units[u]}`;
}
const valueRelease = function ({ name: release }) {
  if (release === 'PKGBUILD') {
    return 7;
  } else if (release.endsWith('deb')) {
    return 6;
  } else if (release.endsWith('rpm')) {
    return 5;
  } else if (release.endsWith('.zip')) {
    if (release.includes('Windows')) return 4;
    if (release.includes('MacOS')) return 3;
    if (release.includes('linux')) return 2;
  } else {
    return 1;
  }
};

fetch('https://api.github.com/repos/TagViewer/tagviewer/releases/latest').then(async function (response) {
  clearTimeout(downloadLinkTimeout);
  let downloadsListHTML = '';
  const body = await response.json();
  body.assets.sort((a, b) => valueRelease(b) - valueRelease(a)).forEach(function (release) {
    downloadsListHTML += `<div class="download-option"><h3>${humanReadableName(release.name)}</h3><button class="download-button" data-download-url="${release.browser_download_url}" aria-label="Download this file">\u2003</button><p>Size: ${humanFileSize(release.size, true, 1)}</p></div>`;
  });
  downloadsListHTML += `<div class="download-option"><h3>Source Tarball</h3><button class="download-button" data-download-url="${body.tarball_url}" aria-label="Download this file">\u2003</button></div>`;
  downloadsEl.innerHTML = downloadsListHTML;
  document.querySelectorAll('.download-button').forEach(function (button) {
    button.addEventListener('click', function () {
      window.open(this.dataset.downloadUrl, '_blank', 'noopener');
    });
  });
}).catch(err => console.error(err));
