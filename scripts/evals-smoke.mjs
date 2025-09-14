// Simple smoke-test for Daytona eval execution API.
// Requires the Next.js dev server running on http://localhost:3000
// Usage: npm run smoke:evals

const endpoint = process.env.EVALS_ENDPOINT || 'http://localhost:3000/api/evals/execute';

async function main() {
  const payload = {
    language: 'python',
    code: "print('hello from evals smoke')",
    timeout: 10,
  };

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) {
    console.error('Request failed:', res.status, data);
    process.exit(1);
  }
  console.log('exitCode:', data.exitCode);
  console.log('stdout:\n' + data.stdout);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

