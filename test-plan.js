async function test() {
  try {
    const regRes = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fname: 'TestPlan',
        lname: 'User',
        email: `plan${Date.now()}@test.com`,
        password: 'password123'
      })
    });
    const regData = await regRes.json();
    const token = regData.token;

    console.log('Testing /api/ai/study-plan...');
    const planRes = await fetch('http://localhost:5000/api/ai/study-plan', {
      method: 'GET',
      headers: { 
        'Authorization': `Bearer ${token}` 
      }
    });
    
    console.log('Status:', planRes.status);
    console.log('Body:', await planRes.text());
  } catch (err) {
    console.error('Error:', err.message);
  }
}
test();
