const fs = require('fs');
const path = require('path');

function areAddressesSimilar(address1, address2) {
  if (!address1 || !address2) return false;

  const addr1 = address1.toLowerCase();
  const addr2 = address2.toLowerCase();
  if (addr1 === addr2) return false;

  const prefixMatch = addr1.slice(0, 3) === addr2.slice(0, 3);
  const suffixMatch = addr1.slice(-4) === addr2.slice(-4);
  
  if (prefixMatch && suffixMatch) return true;

  return false;
}

function testDetection() {
  const inputPath = path.join(__dirname, '../data/poisoning_records.csv');
  const csvData = fs.readFileSync(inputPath, 'utf8');
  const lines = csvData.split('\n').slice(1);
  
  let totalAttacks = 0;
  let detectedAttacks = 0;
  let totalStolenAmount = 0;
  const results = [];

  for (const line of lines) {
    if (!line.trim()) continue;
    
    // CSV format: amount_usd,date,lookalike_address,intended_address
    const [amountStr, date, lookalike, intended] = line.split(',');
    
    if (!lookalike || !intended) continue;
    
    totalAttacks++;
    const isDetected = areAddressesSimilar(lookalike, intended);
    const amount = parseFloat(amountStr);
    
    if (isDetected) {
      detectedAttacks++;
      if (!isNaN(amount)) {
        totalStolenAmount += amount;
      }
    }
    
    results.push({
      lookalike,
      intended,
      amount: amountStr,
      date,
      detected: isDetected
    });
  }

  // Generate CSV Output
  const outputContent = [
    'lookalike_address,intended_address,amount_usd,date,detected'
  ];

  results.forEach(result => {
    outputContent.push(`${result.lookalike},${result.intended},${result.amount},${result.date},${result.detected}`);
  });

  const outputPath = path.join(__dirname, '../results/detection_results.csv');
  fs.writeFileSync(outputPath, outputContent.join('\n'));

  // Generate Markdown Report
  const detectionRate = ((detectedAttacks / totalAttacks) * 100).toFixed(2);
  const formattedTotalStolen = totalStolenAmount.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

  const reportContent = `# Address Poisoning Detection Report

## Summary
- **Total Attacks Analyzed**: ${totalAttacks}
- **Attacks Detected**: ${detectedAttacks}
- **Detection Rate**: ${detectionRate}%
- **Total Stolen Amount**: ${formattedTotalStolen}

## Methodology
- **Prefix Matching**: Exact match of first 3 characters.
- **Suffix Matching**: Exact match of last 4 characters.

## Detailed Results
See [detection_results.csv](./detection_results.csv) for the full list of analyzed addresses.
`;

  const reportPath = path.join(__dirname, '../results/report.md');
  fs.writeFileSync(reportPath, reportContent);
  
  console.log(`Analysis complete.`);
  console.log(`Results saved to: ${outputPath}`);
  console.log(`Report saved to: ${reportPath}`);
}

testDetection();