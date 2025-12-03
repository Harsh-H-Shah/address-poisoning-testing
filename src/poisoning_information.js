// parse_structured_data_clean.js
const fs = require('fs');

function parseStructuredData() {
  try {
    const data = fs.readFileSync('plaintext.txt', 'utf8');
    const lines = data.split('\n');

    const records = [];
    let currentRecord = {
      amount: null,
      date: null,
      lookalike: null,
      intended: null
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Extract stolen USD amount
      const amountMatch = line.match(/-\$([\d,]+\.\d{2})/);
      if (amountMatch) {
        currentRecord.amount = parseFloat(amountMatch[1].replace(/,/g, ''));
      }

      // Extract date (MM/DD/YYYY)
      const dateMatch = line.match(/(\d{1,2}\/\d{1,2}\/\d{4})/);
      if (dateMatch) {
        currentRecord.date = new Date(dateMatch[1]);
      }

      // Extract Lookalike
      if (line.toLowerCase().includes("lookalike")) {
        const addr = lines[i + 1]?.match(/0x[a-fA-F0-9]{40}/);
        if (addr) { currentRecord.lookalike = addr[0]; i++; }
      }

      // Extract Intended
      if (line.toLowerCase().includes("intended")) {
        const addr = lines[i + 1]?.match(/0x[a-fA-F0-9]{40}/);
        if (addr) { currentRecord.intended = addr[0]; i++; }
      }

      // If complete record found
      if (
        currentRecord.amount !== null &&
        currentRecord.date !== null &&
        currentRecord.lookalike &&
        currentRecord.intended
      ) {
        records.push(currentRecord);
        currentRecord = { amount: null, date: null, lookalike: null, intended: null };
      }
    }

    // -------------------------------
    //   Build Stats
    // -------------------------------

    // Total stolen
    const totalStolenUSD = records.reduce((sum, r) => sum + r.amount, 0);

    // Month-wise statistics
    const monthlyTrends = {};
    records.forEach(r => {
      const key = `${r.date.getFullYear()}-${String(r.date.getMonth() + 1).padStart(2, '0')}`;
      monthlyTrends[key] = (monthlyTrends[key] || 0) + r.amount;
    });

    // -------------------------------
    //   SAVE FILES (NO CONSOLE LOGS)
    // -------------------------------

    // CSV export
    const csvRows = [
      'amount_usd,date,lookalike_address,intended_address'
    ];
    records.forEach(r => {
      csvRows.push(`${r.amount},${r.date.toISOString().split("T")[0]},${r.lookalike},${r.intended}`);
    });
    fs.writeFileSync('poisoning_records.csv', csvRows.join('\n'));

    // JSON export with stats
    const jsonOutput = {
      summary: {
        total_events: records.length,
        total_stolen_usd: totalStolenUSD,
        monthly_trends: monthlyTrends
      },
      records
    };
    fs.writeFileSync('poisoning_data.json', JSON.stringify(jsonOutput, null, 2));

  } catch (err) {
    // Minimal error log
    console.error("Error:", err.message);
  }
}

parseStructuredData();
