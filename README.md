# dev-space-audit

🔍 A CLI tool that scans and visualizes disk space used by development tools on macOS, organized by location and tool category.

## 📋 Overview

Ever wondered why your disk doesn't free up even after deleting projects? This tool explains it with **clear metrics** and breaks down the "System Data" black box from a **developer's perspective**.

## ✨ Features

- 📊 **Disk usage analysis by development tool** - Clear visualization of space used by each tool
- 🔍 **Support for major development tools** - Node.js, Xcode, Android Studio, and more
- 📈 **Grouped statistics and summaries** - Results organized by category
- 🎯 **Top 5 largest directories** - Quickly identify the biggest space consumers
- ⚡ **Fast scanning** - Efficiently analyzes only necessary paths
- 🗑️ **Optional safe deletion** - Delete only predefined cache paths (whitelist), with confirmation and dry-run

## 📦 Requirements

- Node.js >= 14.0.0
- macOS

## 🚀 Installation

### Global installation via npm

```bash
npm install -g dev-space-audit
```

### Install from source

```bash
git clone https://github.com/your-username/dev-space-audit.git
cd dev-space-audit
npm install
npm link
```

## 💻 Usage

Run the CLI in an interactive terminal; a menu lets you choose an action:

```bash
dev-space-audit
```

**Flow:**

1. **Main menu:** Scan | Quit (arrow keys + Enter).
2. **Scan** – Runs one scan, shows disk usage, then **“What next?”**: “Delete caches (choose targets)” | “Back to main menu”.
3. **Delete caches** – Checkbox list of deletable targets (**no loop**: cursor stops at first/last item). Space to toggle, Enter to confirm. Then confirm deletion (y/N). Same scan data is used (no second scan).
4. **Quit** – Exit.

The main menu is shown again after each flow. If stdin is not a TTY (e.g. when piping), the program exits with a short message; run without piping.

### Example Output

```
=== Dev Storage Inspector (macOS) ===

[Node.js / Frontend]
- npm Cache (~/.npm)                               465.75 MB
- Yarn Cache                                         1.21 GB
Subtotal:                                            1.67 GB

[Xcode]
- DerivedData                                        6.27 GB
- iOS Simulators                                   402.78 MB
- Archives                                          808.2 MB
Subtotal:                                            7.45 GB

[Android Studio]
- Gradle Cache                                       6.85 GB
- Android SDK                                       10.64 GB
- Android Config                                   649.07 MB
Subtotal:                                           18.12 GB

[macOS Common]
- Library Caches                                     6.32 GB
- Developer Directory                               17.26 GB
Subtotal:                                           23.58 GB

----------------------------------------
Total Developer-related Storage:                    50.82 GB

Top 5 Largest Directories:
1. Developer Directory                              17.26 GB
2. Android SDK                                      10.64 GB
3. Gradle Cache                                      6.85 GB
4. Library Caches                                    6.32 GB
5. DerivedData                                       6.27 GB
```

## 🛠 Supported Development Tools

### Node.js / Frontend
- npm cache (`~/.npm`, `~/Library/Caches/npm`)
- Yarn cache (`~/Library/Caches/Yarn`, `~/.yarn`)
- pnpm cache (`~/Library/pnpm`)

### Xcode
- DerivedData (`~/Library/Developer/Xcode/DerivedData`)
- iOS Simulators (`~/Library/Developer/CoreSimulator/Devices`)
- Archives (`~/Library/Developer/Xcode/Archives`)

### Android Studio
- Gradle cache (`~/.gradle`)
- Android SDK (`~/Library/Android/sdk`)
- Android Config (`~/.android`)
- Android Studio cache (`~/Library/Caches/Google/AndroidStudio*`)

### macOS Common
- Development-related caches (`~/Library/Caches`)
- Developer directory (`~/Library/Developer`)

## 🎯 Philosophy

- ✅ **Observation first** – Clearly shows disk usage and groups by tool
- ✅ **Safe deletion** – Delete only whitelisted paths (paths.js), only under home directory, with confirmation and `--dry-run`
- ✅ No elevated permissions, no system-wide cleanup, no real-time daemon

## 🤝 Contributing

Bug reports, feature suggestions, and Pull Requests are welcome!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the [MIT License](LICENSE).

## 🙏 Acknowledgments

Thank you for using this tool to help manage disk space in your macOS development environment.
