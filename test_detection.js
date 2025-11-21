// test_detection.js
const fs = require('fs');

function countMatchingChars(str1, str2) {
  let matches = 0;
  const minLen = Math.min(str1.length, str2.length);
  for (let i = 0; i < minLen; i++) {
    if (str1[i] === str2[i]) matches++;
  }
  return matches;
}

function getPrefixMatchingChars(address1, address2, prefixLength = 10) {
  const prefix1 = address1.slice(0, prefixLength);
  const prefix2 = address2.slice(0, prefixLength);
  return countMatchingChars(prefix1, prefix2);
}

function getSuffixMatchingChars(address1, address2, suffixLength = 10) {
  const suffix1 = address1.slice(-suffixLength);
  const suffix2 = address2.slice(-suffixLength);
  return countMatchingChars(suffix1, suffix2);
}

function areAddressesSimilar(address1, address2) {
  if (!address1 || !address2) return false;

  const addr1 = address1.toLowerCase();
  const addr2 = address2.toLowerCase();
  if (addr1 === addr2) return false;

  const prefixMatchCount = getPrefixMatchingChars(addr1, addr2, 10);
  const suffixMatchCount = getSuffixMatchingChars(addr1, addr2, 10);

  const prefix3 = addr1.slice(0, 5) === addr2.slice(0, 5);
  const suffix3 = addr1.slice(-5) === addr2.slice(-5);
  
  if (prefix3 && suffix3) return true;
  if (prefixMatchCount + suffixMatchCount >= 10) return true;

  return false;
}

function testDetection() {
  const csvData = fs.readFileSync('poisoning_addresses.csv', 'utf8');
  const lines = csvData.split('\n').slice(1);
  
  let totalAttacks = 0;
  let detectedAttacks = 0;
  const results = [];

  for (const line of lines) {
    if (!line.trim()) continue;
    
    const [lookalike, intended] = line.split(',');
    if (!lookalike || !intended) continue;
    
    totalAttacks++;
    const isDetected = areAddressesSimilar(lookalike, intended);
    
    if (isDetected) {
      detectedAttacks++;
    }
    
    results.push({
      lookalike,
      intended, 
      detected: isDetected
    });
  }

  const outputContent = [
    `Total attacks analyzed: ${totalAttacks}`,
    `Attacks detected: ${detectedAttacks}`,
    `Detection rate: ${((detectedAttacks / totalAttacks) * 100).toFixed(2)}%`,
    '',
    'Detailed results:',
    'lookalike_address,intended_address,detected'
  ];

  results.forEach(result => {
    outputContent.push(`${result.lookalike},${result.intended},${result.detected}`);
  });

  fs.writeFileSync('detection_results.csv', outputContent.join('\n'));
}

testDetection();