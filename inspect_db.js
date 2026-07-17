// Script mejorado para inspeccionar turismo.db
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'turismo.db');
const buf = fs.readFileSync(dbPath);

// SQLite stores the schema in sqlite_master
// Pages are 4096 bytes by default, the first page has the header (100 bytes)
// Let's read as text and extract all SQL statements

// Convert to string and find all SQL
const rawText = buf.toString('utf8', 0, buf.length);

// Find CREATE TABLE patterns more aggressively
const allSql = [];
let i = 0;
const searchStr = 'CREATE TABLE';

while (i < rawText.length) {
  const idx = rawText.indexOf(searchStr, i);
  if (idx === -1) break;
  
  // Find the end of the statement
  let end = rawText.indexOf(';', idx);
  if (end === -1) end = Math.min(idx + 2000, rawText.length);
  
  const stmt = rawText.substring(idx, end + 1)
    .replace(/[^\x09\x0A\x0D\x20-\x7E]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  
  if (stmt.length > 20) {
    allSql.push(stmt);
  }
  i = idx + 1;
}

// Also find table names from binary
const tableNames = new Set();
const pattern = Buffer.from('table');
for (let j = 0; j < buf.length - 100; j++) {
  if (buf[j] === 0x74 && buf.slice(j, j+5).toString() === 'table') {
    // Read next word as potential table name
    let nameStart = j + 5;
    while (nameStart < buf.length && buf[nameStart] < 32) nameStart++;
    let nameEnd = nameStart;
    while (nameEnd < buf.length && buf[nameEnd] > 32 && buf[nameEnd] < 127) nameEnd++;
    const name = buf.slice(nameStart, nameEnd).toString();
    if (name.length > 2 && name.length < 50 && /^[a-z_]/i.test(name)) {
      tableNames.add(name);
    }
  }
}

console.log('=== CREATE TABLE statements ===');
allSql.forEach((s, i) => {
  console.log(`\n--- Statement ${i+1} ---`);
  console.log(s.substring(0, 800));
});

console.log('\n=== Possible table names from binary ===');
console.log([...tableNames].filter(n => !n.includes('sqlite') && !n.includes('.') && n.length > 2));
