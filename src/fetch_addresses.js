// parse_structured_data.js
const fs = require('fs');

function parseStructuredData() {
  try {
    // Read the plaintext file
    const data = fs.readFileSync('plaintext.txt', 'utf8');
    const lines = data.split('\n');
    
    const pairs = [];
    let currentLookalike = null;
    let currentIntended = null;
    
    console.log(`Processing ${lines.length} lines...`);
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // More flexible matching for Lookalike lines
      if (line.toLowerCase().includes('lookalike')) {
        // Extract address - handle different formats
        const addressMatch = line.match(/0x[a-fA-F0-9]{40}/);
        if (addressMatch) {
          currentLookalike = addressMatch[0];
          console.log(`Found Lookalike: ${currentLookalike}`);
        } else {
          // Check if address is on next line
          if (i + 1 < lines.length) {
            const nextLine = lines[i + 1].trim();
            const nextAddressMatch = nextLine.match(/0x[a-fA-F0-9]{40}/);
            if (nextAddressMatch) {
              currentLookalike = nextAddressMatch[0];
              console.log(`Found Lookalike (next line): ${currentLookalike}`);
              i++; // Skip next line since we used it
            }
          }
        }
      }
      // More flexible matching for Intended lines
      else if (line.toLowerCase().includes('intended') && currentLookalike) {
        // Extract address - handle different formats
        const addressMatch = line.match(/0x[a-fA-F0-9]{40}/);
        if (addressMatch) {
          currentIntended = addressMatch[0];
          console.log(`Found Intended: ${currentIntended}`);
        } else {
          // Check if address is on next line
          if (i + 1 < lines.length) {
            const nextLine = lines[i + 1].trim();
            const nextAddressMatch = nextLine.match(/0x[a-fA-F0-9]{40}/);
            if (nextAddressMatch) {
              currentIntended = nextAddressMatch[0];
              console.log(`Found Intended (next line): ${currentIntended}`);
              i++; // Skip next line since we used it
            }
          }
        }
        
        // If we have both, create the pair
        if (currentLookalike && currentIntended) {
          pairs.push({
            lookalike: currentLookalike,
            intended: currentIntended
          });
          console.log(`✅ Created pair: ${currentLookalike.substring(0, 12)}... -> ${currentIntended.substring(0, 12)}...`);
          
          // Reset for next pair
          currentLookalike = null;
          currentIntended = null;
        }
      }
    }
    
    console.log(`\nFound ${pairs.length} lookalike/intended pairs`);
    
    if (pairs.length === 0) {
      console.log('\nDebug: Let me try a different approach...');
      // Alternative approach: just extract all addresses and see what we find
      const allAddresses = data.match(/0x[a-fA-F0-9]{40}/g) || [];
      console.log(`Found ${allAddresses.length} total addresses in file`);
      console.log('First 10 addresses:', allAddresses.slice(0, 10));
    }
    
    // Save to CSV
    const csvContent = ['lookalike_address,intended_address'];
    pairs.forEach(pair => {
      csvContent.push(`${pair.lookalike},${pair.intended}`);
    });
    
    fs.writeFileSync('poisoning_addresses.csv', csvContent.join('\n'));
    console.log(`✅ Saved ${pairs.length} pairs to poisoning_addresses.csv`);
    
  } catch (error) {
    console.error('Error:', error.message);
    console.log('Make sure plaintext.txt exists in the current directory');
  }
}

parseStructuredData();