function generateNIF() {
  const letters = 'TRWAGMYFPDXBNJZSQVHLCKE';
  const number = Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
  const letter = letters[number % 23];
  return `${number}${letter}`;
}

function copyNifToClipboard(nif) {
  navigator.clipboard.writeText(nif).then(() => {
    console.log(`NIF copied to clipboard: ${nif}`);

    if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
      document.activeElement.value = nif;
    }

    const div = document.createElement('div');
    div.classList.add('nif-generator-notification');

    const imageUrl = chrome.runtime.getURL('icons/icon32.png');

    div.innerHTML = `
      <img src="${imageUrl}" alt="NIF Generator" />
      NIF <strong>${nif}</strong> copied to clipboard.
    `;
    document.body.appendChild(div);

    setTimeout(() => {
      div.remove();
    }, 2000);

  }).catch(err => {
    console.error('Failed to copy NIF to clipboard:', err);
  });
}

chrome.action.onClicked.addListener((tab) => {
  const nif = generateNIF();

  if (tab && tab.id !== chrome.tabs.TAB_ID_NONE) {
    return chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: copyNifToClipboard,
      args: [nif]
    });
  } 

  console.error('No valid tab available. Cannot execute script.');
});



