// Content script to handle pasting values into inputs, triggering change events, and showing notifications

function pasteValueAndTriggerEvent(value) {
	if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) {
		document.activeElement.value = value;

		// Trigger various events to ensure the application recognizes the change
		document.activeElement.dispatchEvent(new Event('input', { bubbles: true }));
		document.activeElement.dispatchEvent(new Event('change', { bubbles: true }));
		document.activeElement.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true }));
		document.activeElement.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true }));
	}
}

function showNotification(type, result) {
	console.log('Showing notification for:', type, result);

	// Remove any existing notifications
	const existingNotifications = document.querySelectorAll('.nif-generator-notification');
	existingNotifications.forEach(notification => {
		console.log('Removing existing notification');
		notification.remove();
	});

	const notification = document.createElement('div');
	notification.className = 'nif-generator-notification';

	// Get the extension's icon URL
	const imageUrl = chrome.runtime.getURL('icons/icon32.png');
	console.log('Icon URL:', imageUrl);

	notification.innerHTML = `
    <img src="${imageUrl}" alt="${type} Generator" />
    ${type} <strong>${result}</strong> copied to clipboard.
  `;

	document.body.appendChild(notification);
	console.log('Notification added to DOM');

	// Auto-remove after 3 seconds
	setTimeout(() => {
		if (notification.parentNode) {
			console.log('Removing notification after timeout');
			notification.remove();
		}
	}, 3000);
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
	if (request.action === 'pasteValue') {
		pasteValueAndTriggerEvent(request.value);
		sendResponse({ success: true });
	} else if (request.action === 'showNotification') {
		showNotification(request.type, request.result);
		sendResponse({ success: true });
	}
});
