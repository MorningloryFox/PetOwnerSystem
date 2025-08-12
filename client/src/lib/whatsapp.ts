export function openWhatsApp(customerId: string, message: string) {
  // TODO: Implement WhatsApp integration
  // For now, open WhatsApp Web with a generic message
  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/?text=${encodedMessage}`;
  
  // Open in new tab
  window.open(whatsappUrl, '_blank');
  
  // Log the action for future API integration
  console.log('WhatsApp message for customer:', customerId, 'Message:', message);
  
  // TODO: Send message via API
  // fetch('/api/whatsapp/send', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ customerId, message, type: 'manual' })
  // });
}
