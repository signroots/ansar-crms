self.addEventListener('push', (event) => {
  console.log('Push event received:', event.data ? event.data.text() : 'No data');
  
  if (!event.data) {
    console.error('Push event received but no data was sent.');
    return;
  }

  try {
    const message = event.data.json(); // Attempt to parse JSON payload
    console.log('Parsed message:', message);

      const options = {
      body: message.body || 'No body provided',

    };

    // Show the notification
    event.waitUntil(
      self.registration.showNotification(message.title || 'No title', options)
    );
    console.log('Notification displayed:', message.title);
  } catch (error) {
    console.error('Error parsing push event data:', error);
  }
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event.notification);
  event.notification.close();

  const url = event.notification.data?.url || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      if (clientList.length > 0) {
        return clientList[0].focus();
      }
      return clients.openWindow(url);
    })
  );
});
