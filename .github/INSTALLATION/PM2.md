# ⚡ Installing Liora with PM2

This document provides a **complete step-by-step guide** to installing and managing **Liora** using **PM2** on a VPS or Dedicated Server.
Using **PM2** ensures that the bot will run **continuously in the background**, automatically **restart on crashes or server reboots**, and gives you advanced tools for monitoring and maintenance.

---

## 1. Prerequisites

Before installation, make sure your environment is ready:

- **Operating System**: Linux (Debian/Ubuntu recommended), CentOS/RHEL, or equivalent
- **Node.js**: Version **22 or later** is recommended for maximum compatibility with Liora’s libraries
- **Git**: For cloning and updating the source code
- **Build Tools**: Required for native modules like `better-sqlite3`, `sharp`, and `canvas`

### Debian/Ubuntu

```bash
apt update && apt install -y \
 build-essential pkg-config cmake \
 python3 python3-dev \
 ffmpeg git curl wget zip unzip
```

### CentOS/RHEL 7

```bash
yum groupinstall -y "Development Tools"
yum install -y epel-release
yum install -y \
 cmake \
 python3 python3-devel \
 ffmpeg git curl wget zip unzip
```

### CentOS/RHEL 8+

```bash
dnf groupinstall -y "Development Tools"
dnf install -y epel-release
dnf install -y \
 cmake \
 python3 python3-devel \
 ffmpeg git curl wget zip unzip
```

### Install Node.js (Recommended via NodeSource)

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt install -y nodejs
```

### Verify Installations

```bash
node -v && npm -v
```

### Install PM2 Globally

```bash
npm install -g pm2
```

Verify PM2:

```bash
pm2 -v
```

---

## 2. Downloading Liora Source Code

You can either use Git for easier updates, or download the latest release ZIP.

### Option 1: Clone with Git

```bash
git clone https://github.com/naruyaizumi/liora
cd liora
```

### Option 2: Download Release ZIP

1. Go to: [Liora Latest Release](https://github.com/naruyaizumi/liora/releases/latest)
2. Download the ZIP file
3. Upload to your server and extract:

```bash
unzip liora.zip -d liora
cd liora
```

> 💡 **Tip**: Use Git if you plan to update Liora frequently. ZIP is better for panel-based hosting (like Pterodactyl).

---

## 3. Installing Dependencies

Liora requires Node.js dependencies listed in `package.json`.

Install them with:

```bash
npm install
```

Or use other package managers if preferred:

```bash
yarn install
pnpm install
```

> ⚠️ Do not mix package managers. Pick one and stick with it. Mixing may cause broken lockfiles and inconsistent modules.

If you see errors related to **better-sqlite3**, ensure build tools are installed (step 1).

---

## 4. Running Liora with PM2

Start the bot for the first time:

```bash
pm2 start index.js --name "liora"
```

Save the current PM2 process list so it persists after reboot:

```bash
pm2 save
```

Enable auto-start on boot:

```bash
pm2 startup
```

Follow the instructions shown after running `pm2 startup` (copy and paste the command given).

---

## 5. Monitoring & Logs

Check running processes:

```bash
pm2 list
```

View logs in real-time:

```bash
pm2 logs liora
```

Inspect CPU & memory usage:

```bash
pm2 monit
```

---

## 6. Maintenance & Operations

### Restart Bot

```bash
pm2 restart liora
```

### Stop Bot

```bash
pm2 stop liora
```

### Delete Bot Process

```bash
pm2 delete liora
```

### Update Liora (Git Users Only)

```bash
git pull origin main
npm install
pm2 restart liora
```

### Update Dependencies

```bash
npm update
```

---

## 7. Troubleshooting

- **Error: better-sqlite3 failed to build**
  → Ensure `python3`, `make`, and `g++` are installed.

- **Bot doesn’t restart after reboot**  
  → Run:
    ```bash
     pm2 save && pm2 startup
    ```
- **High memory usage**
  → Use `pm2 monit` to check usage. Consider log rotation:
    ```bash
     pm2 install pm2-logrotate
    ```
- **Session not working**
  → Delete `auth` folder and re-pair with WhatsApp.

---

## 8. Advanced Features with PM2

- **Log Rotation** (prevents logs from consuming disk space):

    ```bash
    pm2 install pm2-logrotate
    ```

- **JSON Configuration** (instead of CLI):
  Create `ecosystem.config.js`:

```javascript
module.exports = {
    apps: [
        {
            name: "liora",
            script: "index.js",
            watch: true,
            max_memory_restart: "512M",
        },
    ],
};
```

Start with:

```bash
pm2 start ecosystem.config.js
```

---

🌸 Conclusion

- By running Liora with PM2, you benefit from:
- Automatic background execution
- Crash recovery and auto-restart
- Log management and monitoring tools
- Easier process control (start/stop/restart)

> Your bot is now ready to pair and operate in a production environment. 🚀
