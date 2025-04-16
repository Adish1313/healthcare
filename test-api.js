const http = require('http');

const options = {
  hostname: '172.16.13.138',
  port: 5000,
  path: '/api/contact-info',
  method: 'GET'
};

const req = http.request(options, res => {
  console.log(`Status Code: ${res.statusCode}`);
  
  let data = '';
  
  res.on('data', chunk => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Response data:', JSON.parse(data));
  });
});

req.on('error', error => {
  console.error('Error:', error);
});

req.end();
