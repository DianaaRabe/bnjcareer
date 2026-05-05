const fetch = require('node-fetch'); // or just use global fetch if node > 18
async function test() {
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer test"
    },
    body: JSON.stringify({
      model: "google/gemma-3n-e2b-it:free",
      messages: [{role: "user", content: "test"}]
    })
  });
  console.log(res.status, res.statusText);
  console.log(await res.text());
}
test();
