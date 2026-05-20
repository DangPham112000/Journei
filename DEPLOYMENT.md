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

### Set up SSH Key for GitHub Actions

GitHub Actions needs a way to securely connect to your VPS.

1. On your local machine (or any secure terminal), generate a new SSH key pair. **Do not set a passphrase.**
   ```bash
   ssh-keygen -t ed25519 -C "github-actions-deploy" -f ./github-actions-key
   ```
2. You will get two files: `github-actions-key` (private) and `github-actions-key.pub` (public).
3. Copy the contents of the **public key** (`cat ./github-actions-key.pub`).
4. On your **VPS**, add the public key to the `~/.ssh/authorized_keys` file:
   ```bash
   echo "YOUR_PUBLIC_KEY_CONTENTS_HERE" >> ~/.ssh/authorized_keys
   chmod 600 ~/.ssh/authorized_keys
   ```
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
   nano .env
   ```
4. Paste the following configuration, filling in your specific details:
   ```env
   # Frontend Variables
   VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
   VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id

   # Backend Variables
   GOOGLE_CLIENT_ID=your_google_oauth_client_id
   GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret
   JWT_SECRET=a_super_secure_random_string_here
   DOMAIN=journei.yourdomain.com
   ```
5. Save and exit (`Ctrl+O`, `Enter`, `Ctrl+X`).

6. You also need to manually copy the `docker-compose.yml` and `nginx/nginx.conf` files to your VPS for the first run.
   - Create `nginx/nginx.conf` matching the one in the repository.
   - Create `docker-compose.yml` matching the one in the repository.

---

## 4. GitHub Repository Setup (Secrets)

Your GitHub repository needs specific secrets to push Docker images and log into your VPS.

1. **Create a Personal Access Token (PAT):**
   - Go to your GitHub Settings -> Developer settings -> Personal access tokens -> Tokens (classic).
   - Click **Generate new token (classic)**.
   - Give it a name (e.g., `GHCR Deploy`).
   - Check the `write:packages` and `read:packages` scopes.
   - Generate and copy the token.
2. **Add Repository Secrets:**
   - Go to your GitHub repository -> Settings -> Secrets and variables -> Actions.
   - Click **New repository secret** and add the following:
     - `VPS_IP`: The IP address of your Ubuntu server.
     - `VPS_USERNAME`: Your SSH username on the VPS (e.g., `ubuntu` or `root`).
     - `VPS_SSH_KEY`: The entire contents of the **private** SSH key you generated in Step 1.
     - `GHCR_PAT`: The Personal Access Token you just created in Step 4.1.

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
   - It will SSH into your VPS, pull the latest images, and restart the containers.
5. Once the workflow is green, visit `https://journei.yourdomain.com` and your app will be live!
