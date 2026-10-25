# Deployment Guide

This guide provides step-by-step instructions for deploying the Journey Planner application to an Ubuntu VPS using Docker, GitHub Actions, and Cloudflare.

## Table of Contents
1. [VPS Preparation (Ubuntu)](#1-vps-preparation-ubuntu)
2. [Domain and Cloudflare Setup](#2-domain-and-cloudflare-setup)
3. [VPS Application Setup](#3-vps-application-setup)
4. [GitHub Repository Setup (Secrets)](#4-github-repository-setup-secrets)
5. [Deployment Workflow](#5-deployment-workflow)

---

## 1. VPS Preparation (Ubuntu)

First, SSH into your Ubuntu VPS. You will need to install Docker and Docker Compose.

### Install Docker

Run the following commands on your server:

```bash
# Update the apt package index
sudo apt-get update

# Install dependencies
sudo apt-get install ca-certificates curl gnupg

# Add Docker's official GPG key
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

# Set up the Docker repository
echo \
  "deb [arch="$(dpkg --print-architecture)" signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  "$(. /etc/os-release && echo "$VERSION_CODENAME")" stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker Engine and Docker Compose
sudo apt-get update
sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Verify Docker installation
sudo docker --version
sudo docker compose version

# Add your user to the docker group (so you don't need 'sudo' for docker commands)
sudo usermod -aG docker $USER
```
*(Note: After adding your user to the docker group, you may need to log out and log back in, or run `su - $USER`)*

**Command Explanations:**
* `sudo apt-get update`: Refreshes the local package index to ensure you have access to the latest available versions of software packages.
* `sudo apt-get install ca-certificates curl gnupg`: Installs essential tools required to securely download and verify the Docker repository. `ca-certificates` allows SSL-based applications to check for the authenticity of connections, `curl` is used to download files from the internet, and `gnupg` handles encryption and signing keys.
* `sudo install -m 0755 -d /etc/apt/keyrings`: Creates a directory with specific permissions (`0755`) to securely store repository keys.
* `curl -fsSL ... | sudo gpg --dearmor ...`: Securely downloads Docker's official GPG encryption key and converts it into a format that the package manager (`apt`) can read, saving it to the newly created keyrings directory.
* `sudo chmod a+r ...`: Modifies the permissions of the GPG key file so that it is readable by all users, which is necessary for `apt` to verify packages.
* `echo "deb ..."`: Sets up the official Docker repository source location so your system knows exactly where to download Docker Engine packages for your specific Ubuntu version (`$VERSION_CODENAME`) and architecture.
* `sudo apt-get install docker-ce ...`: Installs the core components of Docker: `docker-ce` (Community Edition engine), `docker-ce-cli` (command-line interface), `containerd.io` (container runtime), `docker-buildx-plugin` (build capabilities), and `docker-compose-plugin` (to run multi-container applications).
* `sudo usermod -aG docker $USER`: Appends (`-a`) your current user to the `docker` group (`-G`), granting the necessary permissions to execute Docker commands without having to prefix them with `sudo`.

### Set up SSH Key for GitHub Actions

GitHub Actions needs a way to securely connect to your VPS.

1. On your local machine (or any secure terminal), generate a new SSH key pair. **Do not set a passphrase.**
   ```bash
   ssh-keygen -t ed25519 -C "github-actions-deploy" -f ./github-actions-key
   ```
   **Command Explanations:**
   * `ssh-keygen`: The utility used to generate a new SSH key pair for secure authentication.
   * `-t ed25519`: Specifies the type of key to create. `ed25519` is a modern, highly secure, and fast cryptographic algorithm recommended for SSH keys.
   * `-C "github-actions-deploy"`: Adds a comment to the key, making it easier to identify its purpose later.
   * `-f ./github-actions-key`: Specifies the filename and path where the generated key pair should be saved in the current directory, instead of the default `~/.ssh/id_ed25519`.

2. You will get two files: `github-actions-key` (private) and `github-actions-key.pub` (public).
3. Copy the contents of the **public key** (`cat ./github-actions-key.pub`).
4. On your **VPS**, add the public key to the `~/.ssh/authorized_keys` file:
   ```bash
   echo "YOUR_PUBLIC_KEY_CONTENTS_HERE" >> ~/.ssh/authorized_keys
   chmod 600 ~/.ssh/authorized_keys
   ```
   **Command Explanations:**
   * `echo ... >> ~/.ssh/authorized_keys`: Appends the public key you generated to the `authorized_keys` file on the server. This file acts as a whitelist; anyone presenting the corresponding private key will be granted access. The `>>` operator ensures the key is added to the end of the file without overwriting any existing keys.
   * `chmod 600 ~/.ssh/authorized_keys`: Restricts the file permissions so that only the owner can read and write to it. SSH enforces strict permission checks for security reasons; if this file is readable by other users, SSH will refuse to use it.

5. Save the **private key** (`github-actions-key`) for Step 4.

---

## 2. Domain and Cloudflare Setup

To serve your app nicely (e.g., `journei.yourdomain.com`), use Cloudflare to manage your DNS.

1. **Create a Cloudflare Account:** If you don't have one, sign up and add your domain. You will need to change your domain registrar's nameservers to point to Cloudflare.
2. **Add a DNS Record:**
   - Go to the **DNS** settings for your domain in Cloudflare.
   - Click **Add record**.
   - Type: `A`
   - Name: `journei` (This creates the subdomain `journei.yourdomain.com`. Use `@` if you want it on the root domain).
   - IPv4 address: `YOUR_VPS_IP_ADDRESS`
   - Proxy status: **Proxied (Orange Cloud)**. (This is important! Cloudflare will handle SSL/HTTPS automatically).
   - Click **Save**.
3. **Configure SSL/TLS Settings:**
   - Go to the **SSL/TLS** tab in Cloudflare.
   - Set the encryption mode to **Flexible** or **Full**. (Since our Nginx currently listens on port 80, Flexible is usually easiest to start with. If you configure SSL on Nginx later, use Full).

4. **Shared host Nginx:**
   - Ports 80/443 on the VPS belong to an Nginx installed on the host (`/etc/nginx/sites-enabled/`), so several apps can share the server.
   - The `nginx-proxy` container only listens on `127.0.0.1:8081`, and the host site for `journei.<domain>` proxies to it.
   - Do not publish `80:80` or `443:443` from `docker-compose.yml` again: the container would fail to start because the host Nginx already holds those ports.

---

## 3. VPS Application Setup

Before the first deployment, you need to prepare the application directory and environment variables on the VPS.

1. SSH into your VPS.
2. Create the application directory:
   ```bash
   mkdir -p /opt/journei/nginx
   cd /opt/journei
   ```
3. Secrets come from Doppler, not a `.env` file. In Doppler project `journei`, config `prd`, set:
   - `CLERK_SECRET_KEY` = `${shared.prd.CLERK_SECRET_KEY}`
   - `CLERK_PUBLISHABLE_KEY` = `${shared.prd.CLERK_PUBLISHABLE_KEY}`
   - `VITE_GOOGLE_MAPS_API_KEY` = your Google Maps API key (optional; maps do not load without it)
   - `DOMAIN` = `journei.yourdomain.com`
4. Create a read-only service token on `journei/prd` for the VPS and scope it to the app directory (the deploy runs `doppler run -- docker compose up -d` there):
   ```bash
   export HISTIGNORE='doppler*'
   doppler configure set token <service token> --scope /opt/journei
   cd /opt/journei && doppler secrets get DOMAIN --plain   # check
   ```

---

## 4. GitHub Repository Setup (Secrets)

GitHub keeps a **single** secret, and everything else lives in Doppler, where values can be read again later (GitHub never shows a secret's value after it is saved).

### 4.1 Doppler: deploy settings

In Doppler project `journei`, config `prd`, add these references. The values themselves live once in `shared/prd`, because every app deploys to the same VPS:

| Variable | Value |
| --- | --- |
| `VPS_HOST` | `${shared.prd.VPS_HOST}` |
| `VPS_USERNAME` | `${shared.prd.VPS_USERNAME}` |
| `VPS_SSH_KEY` | `${shared.prd.VPS_SSH_KEY}` (the **private** key from step 1; its public half is in the VPS user's `authorized_keys`) |

The workflows read them with `DOPPLER_TOKEN` and mask them in the logs.

### 4.2 GitHub: the only repository secret

Settings → Secrets and variables → Actions → **New repository secret**:

- **Name:** `DOPPLER_TOKEN`
  - **Secret:** A read-only Doppler service token on `journei/prd` (separate from the VPS one). The build reads `CLERK_PUBLISHABLE_KEY` (passed to the frontend as `VITE_CLERK_PUBLISHABLE_KEY`) and `VITE_GOOGLE_MAPS_API_KEY` with it, and the deploy and clear-database workflows read the `VPS_*` settings.

There is no personal access token: pushing images to GHCR and pulling them on the VPS use the job's own `GITHUB_TOKEN`, which expires when the job ends.

---

## 5. Deployment Workflow

Once everything above is set up, the deployment process is entirely automated!

1. Commit your code changes locally.
2. Push to the `main` branch:
   ```bash
   git push origin main
   ```
3. Go to the **Actions** tab in your GitHub repository.
4. You will see the `Deploy to VPS` workflow running.
   - It will build the Frontend and Backend Docker images.
   - It will push those images to the GitHub Container Registry.
   - It will securely copy the `docker-compose.yml` and `nginx/` directory to your VPS.
   - It will SSH into your VPS, pull the latest images, and restart the containers.
5. Once the workflow is green, visit `https://journei.yourdomain.com` and your app will be live!

---

## Troubleshooting

### "502 Bad Gateway" or "Connection Refused" after deployment

When deploying using Docker Compose, you may sometimes encounter a "502 Bad Gateway" error from Nginx, or see "Connection Refused" in the Nginx logs indicating it cannot reach the `frontend` or `backend` containers.

**Cause:**
By default, Nginx resolves domain names (like `frontend` and `backend`) to IP addresses exactly once when the Nginx process starts. When GitHub Actions triggers a new deployment, Docker Compose recreates the frontend and backend containers, which causes them to swap internal IP addresses or receive new ones. If the `nginx-proxy` container is not restarted, it continues attempting to proxy traffic to the old IP addresses, resulting in `502 Bad Gateway` and `Connection Refused` errors until it is restarted.

Additionally, our deployment script uses `sed -i` to inject the domain name into `nginx/nginx.conf`. Because `sed -i` creates a new file inode under the hood, a running container with a single-file bind mount (`./nginx/nginx.conf:/etc/nginx/nginx.conf:ro`) becomes detached from the updated file on the host.

**Solution:**
The project's GitHub Actions workflow (`.github/workflows/deploy.yml`) handles this by forcefully recreating the `nginx-proxy` container after updating the configuration file and pulling new images:

```bash
docker compose up -d --force-recreate nginx-proxy
docker compose up -d
```

Forcing recreation ensures that the proxy cleanly restarts (flushing its internal DNS cache and picking up the new IPs) and successfully mounts the new `nginx.conf` inode. No variable-based `proxy_pass` tricks or custom `resolver` settings are required in `nginx.conf` when the container is recreated on every deployment.
