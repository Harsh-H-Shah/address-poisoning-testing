/**
 * Script to generate test transactions where a specific user address
 * (0x8a8b958c11397b82d094cf790ce76a4d6c506496) is always involved
 * either as sender (from) or recipient (to)
 */

const fs = require('fs');
const path = require('path');

const USER_ADDRESS = '0x8a8b958c11397b82d094cf790ce76a4d6c506496';

// Worst case scenario addresses for address poisoning
const INTENDED_ADDRESS = '0x78608f9fd1cf69fbd7ac08d3f2e9eeec32691345';
const LOOKALIKE_ADDRESS = '0x78664ce9c17937c552138254d5e906b18a8ba345';

// Generate random Ethereum address
function generateRandomAddress() {
  const chars = '0123456789abcdef';
  let address = '0x';
  for (let i = 0; i < 40; i++) {
    address += chars[Math.floor(Math.random() * chars.length)];
  }
  return address;
}

// Generate random transaction hash
function generateRandomTxHash() {
  const chars = '0123456789abcdef';
  let hash = '0x';
  for (let i = 0; i < 64; i++) {
    hash += chars[Math.floor(Math.random() * chars.length)];
  }
  return hash;
}

// Generate random value in wei (between 0.0001 and 10 ETH)
function generateRandomValue() {
  const minWei = 100000000000000; // 0.0001 ETH
  const maxWei = 10000000000000000000; // 10 ETH
  const value = Math.floor(Math.random() * (maxWei - minWei) + minWei);
  return '0x' + value.toString(16);
}

// Generate random gas price
function generateRandomGasPrice() {
  const minGwei = 1000000000; // 1 Gwei
  const maxGwei = 100000000000; // 100 Gwei
  const price = Math.floor(Math.random() * (maxGwei - minGwei) + minGwei);
  return '0x' + price.toString(16);
}

// Generate random block number
function generateRandomBlockNumber(baseBlock = 15000000) {
  const offset = Math.floor(Math.random() * 1000000);
  return (baseBlock + offset).toString();
}

// Generate timestamp (decreasing for older transactions)
function generateTimestamp(index, totalCount) {
  const now = Date.now();
  const daysAgo = Math.floor((totalCount - index) * (365 / totalCount)); // Spread over a year
  return now - (daysAgo * 24 * 60 * 60 * 1000);
}

// Create a transaction object
function createTransaction(index, totalCount, isOutgoing) {
  const timestamp = generateTimestamp(index, totalCount);
  const txId = Date.now().toString() + '-' + index;
  const hash = generateRandomTxHash();

  // Randomly decide if outgoing or incoming (60% outgoing, 40% incoming)
  const outgoing = isOutgoing !== undefined ? isOutgoing : Math.random() > 0.4;

  const from = outgoing ? USER_ADDRESS : generateRandomAddress();
  const to = outgoing ? generateRandomAddress() : USER_ADDRESS;

  return {
    actionId: null,
    blockNumber: generateRandomBlockNumber(),
    chainId: '0x1',
    dappSuggestedGasFees: null,
    defaultGasEstimates: {
      estimateType: 'medium',
      gas: '0x5208',
      gasPrice: generateRandomGasPrice(),
    },
    hash,
    history: [
      {
        actionId: null,
        chainId: '0x1',
        dappSuggestedGasFees: null,
        id: txId,
        loadingDefaults: false,
        metamaskNetworkId: '1',
        origin: 'metamask',
        status: 'unapproved',
        time: timestamp,
        txParams: {
          from,
          gas: '0x5208',
          gasPrice: generateRandomGasPrice(),
          to,
          value: generateRandomValue(),
        },
        type: 'simpleSend',
        userEditedGasLimit: false,
      },
      {
        op: 'replace',
        path: '/status',
        timestamp,
        value: 'approved',
      },
      {
        op: 'replace',
        path: '/status',
        timestamp: timestamp + 1000,
        value: 'signed',
      },
      {
        op: 'replace',
        path: '/status',
        timestamp: timestamp + 2000,
        value: 'submitted',
      },
      {
        op: 'replace',
        path: '/txParams/maxFeePerGas',
        timestamp: timestamp + 3000,
        value: generateRandomGasPrice(),
      },
      {
        op: 'replace',
        path: '/txParams/maxPriorityFeePerGas',
        timestamp: timestamp + 3000,
        value: '0x59682f00',
      },
      {
        op: 'replace',
        path: '/status',
        timestamp: timestamp + 5000,
        value: 'confirmed',
      },
    ],
    id: txId,
    loadingDefaults: false,
    metamaskNetworkId: '1',
    origin: 'metamask',
    status: 'confirmed',
    submittedTime: timestamp + 2000,
    time: timestamp,
    txParams: {
      from,
      gas: '0x5208',
      gasPrice: generateRandomGasPrice(),
      maxFeePerGas: generateRandomGasPrice(),
      maxPriorityFeePerGas: '0x59682f00',
      nonce: '0x' + index.toString(16),
      to,
      value: generateRandomValue(),
    },
    txReceipt: {
      blockHash: generateRandomTxHash(),
      blockNumber: generateRandomBlockNumber(),
      contractAddress: null,
      cumulativeGasUsed: '0x5208',
      effectiveGasPrice: generateRandomGasPrice(),
      from,
      gasUsed: '0x5208',
      logs: [],
      logsBloom: '0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
      status: '0x1',
      to,
      transactionHash: hash,
      transactionIndex: '0x' + Math.floor(Math.random() * 100).toString(16),
      type: '0x0',
    },
    type: 'simpleSend',
    userEditedGasLimit: false,
  };
}

// Generate similar addresses for address poisoning testing
function generateSimilarAddress(baseAddress) {
  // Keep first 5 and last 5 characters the same
  const prefix = baseAddress.substring(0, 7); // 0x + 5 chars
  const suffix = baseAddress.substring(baseAddress.length - 5);

  // Generate random middle part
  const chars = '0123456789abcdef';
  let middle = '';
  for (let i = 0; i < 28; i++) { // 40 - 5 - 5 = 30, but we need 28
    middle += chars[Math.floor(Math.random() * chars.length)];
  }

  return prefix + middle + suffix;
}

// Generate transactions with some poisoning attempts
function generateTransactions(count = 500) {
  const transactions = [];
  const frequentRecipients = [INTENDED_ADDRESS]; // Start with the intended address as a frequent recipient

  // Generate some additional random frequent recipients
  for (let i = 0; i < 4; i++) {
    frequentRecipients.push(generateRandomAddress());
  }

  // Calculate distribution
  const intendedCount = Math.floor(count * 0.3); // 30% to intended address
  const poisonCount = Math.floor(count * 0.15); // 15% from lookalike (poison attacks)
  const normalOutgoing = Math.floor(count * 0.35); // 35% normal outgoing
  const normalIncoming = count - intendedCount - poisonCount - normalOutgoing; // remaining incoming

  let transactionIndex = 0;

  // 1. Create transactions TO INTENDED_ADDRESS (30%)
  for (let i = 0; i < intendedCount; i++) {
    const tx = createTransaction(transactionIndex++, count, true);
    tx.txParams.to = INTENDED_ADDRESS;
    tx.history[0].txParams.to = INTENDED_ADDRESS;
    if (tx.txReceipt) {
      tx.txReceipt.to = INTENDED_ADDRESS;
    }
    transactions.push(tx);
  }

  // 2. Create transactions FROM LOOKALIKE_ADDRESS (15% - POISONING ATTACKS)
  for (let i = 0; i < poisonCount; i++) {
    const tx = createTransaction(transactionIndex++, count, false);
    tx.txParams.from = LOOKALIKE_ADDRESS;
    tx.history[0].txParams.from = LOOKALIKE_ADDRESS;
    if (tx.txReceipt) {
      tx.txReceipt.from = LOOKALIKE_ADDRESS;
    }
    // Poisoning transactions typically have very small values (dust)
    tx.txParams.value = '0x' + Math.floor(Math.random() * 1000 + 1).toString(16);
    tx.history[0].txParams.value = tx.txParams.value;
    transactions.push(tx);
  }

  // 3. Normal outgoing transactions (35%)
  for (let i = 0; i < normalOutgoing; i++) {
    const tx = createTransaction(transactionIndex++, count, true);
    
    // Some go to other frequent recipients
    if (Math.random() > 0.5 && frequentRecipients.length > 1) {
      const recipientIndex = Math.floor(Math.random() * (frequentRecipients.length - 1)) + 1; // Skip INTENDED_ADDRESS
      tx.txParams.to = frequentRecipients[recipientIndex];
      tx.history[0].txParams.to = frequentRecipients[recipientIndex];
      if (tx.txReceipt) {
        tx.txReceipt.to = frequentRecipients[recipientIndex];
      }
    }
    transactions.push(tx);
  }

  // 4. Normal incoming transactions (remaining ~20%)
  for (let i = 0; i < normalIncoming; i++) {
    const tx = createTransaction(transactionIndex++, count, false);
    transactions.push(tx);
  }

  // Sort by timestamp (oldest first)
  transactions.sort((a, b) => a.time - b.time);

  // WORST CASE SCENARIO OPTIMIZATION:
  // Move all transactions TO INTENDED_ADDRESS to the END of the array
  // This forces the detection algorithm to scan through ALL transactions
  // before finding the similarity match
  
  const transactionsToIntended = [];
  const otherTransactions = [];
  
  transactions.forEach(tx => {
    if (tx.txParams.to.toLowerCase() === INTENDED_ADDRESS.toLowerCase()) {
      transactionsToIntended.push(tx);
    } else {
      otherTransactions.push(tx);
    }
  });
  
  // Reorder: put all "to intended" transactions at the END
  const reorderedTransactions = [...otherTransactions, ...transactionsToIntended];
  
  // Re-assign IDs in this worst-case order
  reorderedTransactions.forEach((tx, idx) => {
    const newId = Date.now().toString() + '-' + idx;
    tx.id = newId;
    tx.history[0].id = newId;
    tx.txParams.nonce = '0x' + idx.toString(16);
  });

  return reorderedTransactions;
}

// Main execution
function main() {
  const counts = [500, 1000, 10000];

  counts.forEach(count => {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Generating ${count} transactions with user address: ${USER_ADDRESS}`);
    console.log('='.repeat(60));

    const transactions = generateTransactions(count);

    // Write to JSON file
    const outputPath = path.join(__dirname, `transactions_${count}.json`);
    fs.writeFileSync(outputPath, JSON.stringify(transactions, null, 2));

    console.log(`✅ Generated ${transactions.length} transactions`);
    console.log(`📝 Written to: ${outputPath}`);

    // Statistics
    const outgoing = transactions.filter(tx =>
      tx.txParams.from.toLowerCase() === USER_ADDRESS.toLowerCase()
    ).length;
    const incoming = transactions.filter(tx =>
      tx.txParams.to.toLowerCase() === USER_ADDRESS.toLowerCase()
    ).length;

    // Statistics
    const toIntended = transactions.filter(tx =>
      tx.txParams.to.toLowerCase() === INTENDED_ADDRESS.toLowerCase()
    ).length;
    const fromLookalike = transactions.filter(tx =>
      tx.txParams.from.toLowerCase() === LOOKALIKE_ADDRESS.toLowerCase()
    ).length;

    console.log('\n📊 Statistics:');
    console.log(`   Outgoing: ${outgoing}`);
    console.log(`   Incoming: ${incoming}`);
    console.log(`   To INTENDED address (${INTENDED_ADDRESS}): ${toIntended}`);
    console.log(`   From LOOKALIKE address (${LOOKALIKE_ADDRESS}): ${fromLookalike}`);
    console.log(`   Total: ${transactions.length}`);

    // Verify all transactions involve user address
    const allValid = transactions.every(tx =>
      tx.txParams.from.toLowerCase() === USER_ADDRESS.toLowerCase() ||
      tx.txParams.to.toLowerCase() === USER_ADDRESS.toLowerCase()
    );

    console.log(`✅ All transactions involve user address: ${allValid}`);
    console.log(`⚠️  WORST CASE SCENARIO: ${fromLookalike} poisoning attempts from lookalike address`);
    
    // Verify worst-case ordering
    const firstIntendedIndex = transactions.findIndex(tx => 
      tx.txParams.to.toLowerCase() === INTENDED_ADDRESS.toLowerCase()
    );
    const lastIntendedIndex = transactions.length - 1 - [...transactions].reverse().findIndex(tx => 
      tx.txParams.to.toLowerCase() === INTENDED_ADDRESS.toLowerCase()
    );
    
    console.log(`\n🔍 Worst-case verification:`);
    console.log(`   First "to intended" at index: ${firstIntendedIndex}`);
    console.log(`   Last "to intended" at index: ${lastIntendedIndex}`);
    console.log(`   Algorithm must scan ${firstIntendedIndex + 1} transactions before finding similarity`);
  });

  console.log(`\n${'='.repeat(60)}`);
  console.log('✅ All transaction files generated successfully!');
  console.log('='.repeat(60));
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { generateTransactions, USER_ADDRESS };
