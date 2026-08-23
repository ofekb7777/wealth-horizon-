export const sendGmail = async (accessToken: string, toAddress: string, subject: string, bodyText: string) => {
  const emailLines = [
    `To: ${toAddress}`,
    'Content-Type: text/plain; charset="UTF-8"',
    'MIME-Version: 1.0',
    `Subject: ${subject}`,
    '',
    bodyText
  ];
  
  const emailString = emailLines.join('\r\n');
  
  // Safe btoa for UTF-8
  const base64EncodedEmail = btoa(
    Array.from(new TextEncoder().encode(emailString))
      .map(b => String.fromCharCode(b))
      .join('')
  ).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

  const response = await fetch('https://gmail.googleapis.com/upload/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      raw: base64EncodedEmail
    })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Gmail API Error: ${errorData.error?.message || response.statusText}`);
  }

  return response.json();
};
