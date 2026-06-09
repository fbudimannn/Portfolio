const baseUrl = (process.argv[2] || 'http://localhost:3000').replace(/\/$/, '');
const message = process.argv[3] || 'What are your main programming skills?';

console.log(`Testing chatbot at: ${baseUrl}/api/chat`);
console.log(`Message: ${message}\n`);

try {
  const response = await fetch(`${baseUrl}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  });

  const text = await response.text();
  console.log('Status:', response.status);

  try {
    console.log(JSON.stringify(JSON.parse(text), null, 2));
  } catch {
    console.log(text);
  }

  process.exit(response.ok ? 0 : 1);
} catch (error) {
  console.error('Request failed:', error.message);
  console.error('\nLocal tip: run `npm run dev` first, then `npm run test:chat`.');
  process.exit(1);
}
