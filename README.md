# Address Poisoning Detection

A Node.js tool for detecting and analyzing cryptocurrency address poisoning attacks. Address poisoning is a social engineering attack where malicious actors create fake addresses that closely resemble legitimate ones, hoping victims will copy the wrong address from their transaction history.

## 🔍 Overview

This project provides automated detection of address poisoning attempts by analyzing the similarity between lookalike addresses and their intended targets. The detection algorithm identifies suspicious address pairs based on matching prefixes and suffixes.

## ✨ Features

- **Automated Detection**: Analyzes address pairs to detect potential poisoning attacks
- **Similarity Algorithm**: Uses prefix/suffix matching to identify lookalike addresses
- **CSV Data Processing**: Reads and processes address pairs from CSV files
- **Detection Reporting**: Generates detailed reports with detection rates and results
- **Web Scraping Support**: Includes tools for fetching address data (Puppeteer-based)

## 📋 Prerequisites

- Node.js (v14 or higher recommended)
- npm or yarn package manager

## 🚀 Installation

1. Clone the repository:

```bash
git clone https://github.com/Harsh-H-Shah/address-poisoning-testing.git
cd address-poisoning-testing
```

2. Install dependencies:

```bash
npm install
```

## 📦 Dependencies

- **cheerio**: HTML parsing for web scraping
- **puppeteer**: Headless browser automation for fetching addresses

## 🎯 Usage

### Running Detection Tests

Analyze address pairs from the CSV file:

```bash
node test_detection.js
```

This will:

1. Read address pairs from `poisoning_addresses.csv`
2. Analyze each pair for similarity
3. Generate a detection report in `detection_results.csv`

### Input Format

The `poisoning_addresses.csv` file should contain:

```csv
lookalike_address,intended_address
0xdbfaa66be7a1463304caa72d3f1d7025000580da,0xdbfa1702f1721580507c2f2c3d961e5c5fc780da
0x62c8da4101719f3f00d9de124cf156720039d494,0x62c84de317794a1a6ff3487d3fd51e20c314d494
...
```

### Data Source

The address poisoning attack data used in this project is sourced from the **CMU CyLab Crypto Trading Project**:

- [Ethereum Address Poisoning Database](https://cryptotrade.cylab.cmu.edu/poisoning/ethereum)

This dataset contains real-world examples of address poisoning attacks detected on the Ethereum blockchain.

### Output

The tool generates `detection_results.csv` with:

- Total attacks analyzed
- Number of attacks detected
- Detection rate percentage
- Detailed results for each address pair

Example output:

```
Total attacks analyzed: 100
Attacks detected: 95
Detection rate: 95.00%

Detailed results:
lookalike_address,intended_address,detected
0xdbfaa66be7a1463304caa72d3f1d7025000580da,0xdbfa1702f1721580507c2f2c3d961e5c5fc780da,true
...
```

## 🧮 Detection Algorithm

The algorithm detects address poisoning using two main criteria:

1. **Prefix/Suffix Matching**:
   - Checks if the first 5 characters match AND the last 5 characters match
2. **Combined Similarity Score**:
   - Counts matching characters in first 10 characters (prefix)
   - Counts matching characters in last 10 characters (suffix)
   - Flags as suspicious if total matches ≥ 10

### Example

```
Intended:   0xdbfa1702f1721580507c2f2c3d961e5c5fc780da
Lookalike:  0xdbfaa66be7a1463304caa72d3f1d7025000580da
            ^^^^^                              ^^^^^
            Match                              Match
            ✓ Detected as poisoning attempt
```

## 📊 Project Structure

```
.
├── test_detection.js           # Main detection script
├── fetch_addresses.js          # Address scraping utility (fetch_structured_data.js)
├── poisoning_addresses.csv     # Input: address pairs to analyze
├── detection_results.csv       # Output: detection results
├── plaintext.txt              # Raw text data (if applicable)
├── package.json               # Project dependencies
└── README.md                  # This file
```

## 🔧 Configuration

You can modify the detection sensitivity by adjusting these parameters in `test_detection.js`:

```javascript
const prefixMatchCount = getPrefixMatchingChars(addr1, addr2, 10); // Default: 10 chars
const suffixMatchCount = getSuffixMatchingChars(addr1, addr2, 10); // Default: 10 chars
const prefix3 = addr1.slice(0, 5) === addr2.slice(0, 5); // Default: 5 chars
const suffix3 = addr1.slice(-5) === addr2.slice(-5); // Default: 5 chars
```

## 🛡️ Understanding Address Poisoning

Address poisoning attacks work by:

1. Monitoring blockchain transactions to identify active addresses
2. Generating vanity addresses that match the first and last characters of target addresses
3. Sending small amounts of tokens to create transaction history
4. Hoping users copy the wrong address from their history

**Example Attack Scenario**:

- User's real address: `0xdbfa1702f1721580507c2f2c3d961e5c5fc780da`
- Attacker creates: `0xdbfaa66be7a1463304caa72d3f1d7025000580da`
- Both start with `0xdbfa` and end with `80da`
- User might copy the wrong address from transaction history

## 📈 Performance

The detection algorithm achieves high accuracy rates (typically >90%) by focusing on the most commonly matched portions of poisoned addresses (first and last characters).

## 🤝 Contributing

Contributions are welcome! Feel free to:

- Report bugs
- Suggest new features
- Submit pull requests
- Improve detection algorithms

## 📝 License

This project is available for educational and research purposes.

## ⚠️ Disclaimer

This tool is for educational and research purposes only. Always verify addresses carefully before sending cryptocurrency transactions. The detection algorithm may have false positives or false negatives.

## 👤 Author

**Harsh H Shah**

- GitHub: [@Harsh-H-Shah](https://github.com/Harsh-H-Shah)

## 🔗 Resources

- [CMU CyLab - Ethereum Address Poisoning Database](https://cryptotrade.cylab.cmu.edu/poisoning/ethereum) - Source of attack data
- [Understanding Address Poisoning Attacks](https://www.certik.com/resources/blog/address-poisoning)
- [Ethereum Address Format](https://ethereum.org/en/developers/docs/accounts/)
- [Vanity Address Generation](https://github.com/bokub/vanity-eth)

---

**Stay safe! Always double-check cryptocurrency addresses before sending transactions.** 🔐
