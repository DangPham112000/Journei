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

---

## 3. VPS Application Setup

Before the first deployment, you need to prepare the application directory and environment variables on the VPS.

1. SSH into your VPS.
2. Create the application directory:
   ```bash
   mkdir -p ~/journei/nginx
   cd ~/journei
   ```
3. Create the `.env` file for Docker Compose:
   ```bash
   vim .env
   ```
4. Paste the following configuration, filling in your specific details (press `i` to enter insert mode):
   ```env
   # Backend Variables
   GOOGLE_CLIENT_ID=your_google_oauth_client_id
   GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret
   JWT_SECRET=a_super_secure_random_string_here
   DOMAIN=journei.yourdomain.com
   ```
5. Save and exit (press `Esc`, type `:wq`, and press `Enter`).

---

## 4. GitHub Repository Setup (Secrets)

Your GitHub Actions automated workflow needs special permissions and sensitive information to do its job. Specifically, it needs to be able to upload (push) the Docker images it builds to GitHub's Container Registry, and it needs to securely log into your VPS to tell it to pull those new images.

Because this information is sensitive (like passwords and private keys), you should never hardcode it into your files. Instead, GitHub provides a secure feature called "Secrets".

Here is how to set them up:

### 4.1 Create a Personal Access Token (PAT)

A Personal Access Token (PAT) acts as a secure password or an API key. Our automated workflow uses this token to prove to GitHub that it is allowed to upload our Docker images to the GitHub Container Registry (GHCR).

1. **Navigate to Developer Settings:** Click on your profile picture in the top right corner of GitHub, then click **Settings**. Scroll down the left sidebar to the very bottom and click **Developer settings**.
2. **Go to Tokens:** In the left sidebar, expand **Personal access tokens** and select **Tokens (classic)**.
3. **Generate a new token:** Click the **Generate new token** button in the top right, and choose **Generate new token (classic)**. You may be asked to confirm your password.
4. **Configure the token:**
   - **Note:** Give it a descriptive name so you remember what it's for, like `GHCR Deploy`.
   - **Expiration:** Choose how long the token is valid for (e.g., 30 days, 90 days, or No expiration). For security, it's generally better to set an expiration, but "No expiration" is easier for setting up and forgetting.
   - **Select scopes:** This is where you give the token specific permissions. Scroll down to the **write:packages** option and check the box. Doing so will automatically check the **read:packages** box as well. This allows the workflow to upload and download Docker images associated with your account.
5. **Save the token:** Scroll to the bottom and click **Generate token**.
   - **IMPORTANT:** Copy the token immediately and save it somewhere temporarily (like a secure notepad). **You will not be able to see it again once you leave the page!**

### 4.2 Add Repository Secrets

Now that you have your PAT and your SSH keys from Step 1, you need to store them securely inside your specific repository.

1. **Navigate to Repository Secrets:** Go to your project's main repository page on GitHub. Click the **Settings** tab near the top. On the left sidebar, expand **Secrets and variables** and click on **Actions**.
2. **Add new secrets:** Click the green **New repository secret** button. You will repeat this process four times to create four different secrets. The "Name" must match exactly what is written below, as the workflow specifically looks for these names.

Add the following secrets:

- **Name:** `VPS_IP`
  - **Secret:** `123.45.67.89` (Replace this with the actual IP address of your Ubuntu server. The workflow uses this to know where your server is located on the internet).
- **Name:** `VPS_USERNAME`
  - **Secret:** `ubuntu` (or `root`, or whatever username you use to log into your server. The workflow uses this alongside the IP address to initiate the connection).
- **Name:** `VPS_SSH_KEY`
  - **Secret:** Paste the entire contents of the **private** SSH key (`github-actions-key`) you generated in Step 1. (This acts as the highly secure password that proves the automated workflow has the right to log into your server as the `VPS_USERNAME`).
- **Name:** `GHCR_PAT`
  - **Secret:** Paste the Personal Access Token you generated in step 4.1. (The workflow uses this to log into the GitHub Container Registry to upload the Docker images).
- **Name:** `VITE_GOOGLE_CLIENT_ID`
  - **Secret:** Paste your Google OAuth Client ID here. This is required to build the frontend application correctly.
- **Name:** `VITE_GOOGLE_MAPS_API_KEY`
  - **Secret:** Paste your Google Maps API Key here. This is required to build the frontend application correctly.

*Note: Since `VITE_GOOGLE_CLIENT_ID` and `VITE_GOOGLE_MAPS_API_KEY` are built directly into the frontend image using GitHub Secrets, you no longer need them in the `.env` file on your VPS.*

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
