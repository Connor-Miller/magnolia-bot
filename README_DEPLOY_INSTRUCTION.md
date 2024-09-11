# Discord Bot Deployment Guide

## 1. Set Up a Linode VPS

1. Create a Linode Account:
   - Go to Linode.com and sign up for an account.

2. Create a Linode:
   - Log into your Linode account and navigate to the Linodes tab.
   - Click on Create Linode.
   - Choose a distribution (e.g., Ubuntu 22.04 LTS).
   - Select the region closest to your location.
   - Choose a plan (e.g., a Nanode 1GB is suitable for small projects).
   - Set up a root password.
   - Click Create Linode.

## 2. Access Your VPS

1. Once the Linode is created, you'll see it in your dashboard. Click on it to view details.
2. Access the VPS via SSH:
   - Copy the IP address of your VPS and run the following command on your local terminal (replace IP_ADDRESS with your Linode's IP):

   ```
   ssh root@IP_ADDRESS
   ```

3. Enter the root password you set up earlier.

## 3. Set Up Node.js

1. Update your package list:

   ```
   sudo apt update && sudo apt upgrade -y
   ```

2. Install Node.js:

   ```
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt install -y nodejs
   ```

3. Verify Node.js installation:

   ```
   node -v
   npm -v
   ```

## 4. Set Up Your Discord Bot

1. Clone your bot repository (if you have one):

   ```
   git clone https://github.com/your-repo.git
   ```

   If you're starting from scratch, create a directory for your bot:

   ```
   mkdir discord-bot
   cd discord-bot
   ```

2. Initialize the project:

   ```
   npm init -y
   ```

3. Install the necessary packages:

   ```
   npm install discord.js dotenv
   ```

4. Create a .env file to store your Discord bot token securely:

   ```
   touch .env
   echo "DISCORD_TOKEN=your-bot-token" >> .env
   ```

5. Set up your bot's entry point (e.g., index.js):

   ```javascript
   require('dotenv').config();
   const { Client, GatewayIntentBits } = require('discord.js');
   const client = new Client({ intents: [GatewayIntentBits.Guilds] });

   client.once('ready', () => {
       console.log('Bot is online!');
   });

   client.login(process.env.DISCORD_TOKEN);
   ```

## 5. Run Your Bot

To run your bot, use the following command:
bash
Copy code
node index.js
6. Keep Your Bot Running with PM2
Install PM2, a process manager for Node.js:
bash
Copy code
npm install -g pm2
Start your bot with PM2:
bash
Copy code
pm2 start index.js --name discord-bot
To make PM2 start on boot:
bash
Copy code
pm2 startup
pm2 save
7. Set Up a Firewall (Optional but Recommended)
Allow only the necessary traffic (SSH and outbound traffic for your bot):
bash
Copy code
ufw allow OpenSSH
ufw enable
8. Maintain Your Server
Monitor your bot using PM2:
bash
Copy code
pm2 logs discord-bot
pm2 status
Secure your server by regularly updating it:
bash
Copy code
sudo apt update && sudo apt upgrade -y
Now your Discord bot should be up and running on your Linode VPS!





1. Check the Status of Your Processes
First, list all the processes being managed by PM2 to see the current status of your bot:

bash
Copy code
pm2 list
This will show you all running processes, including their names, status, and IDs.

2. Restart Your Bot
You can restart the bot using either its process name or its ID from the list. For example, if you named your bot discord-bot:

bash
Copy code
pm2 restart discord-bot
Or, if your bot’s process ID is 0:

bash
Copy code
pm2 restart 0
3. Check the Logs for Errors
To check the logs for any errors that occurred during the last run, use:

bash
Copy code
pm2 logs discord-bot
This will show you the real-time logs of your bot, helping you identify what went wrong.

4. Reloading or Re-running the Bot
If you’ve made changes to the bot's code, use this command to reload the bot and restart it:

bash
Copy code
pm2 reload discord-bot
Alternatively, if the bot process isn’t listed anymore (e.g., if you stopped it), you can simply start it again with:

bash
Copy code
pm2 start index.js --name discord-bot
By following these steps, you should be able to restart your Discord bot using PM2.








Steps:
Create a Bash Script Create a script that performs the git pull operation and restarts the bot if there are updates.

bash
Copy code
nano ~/update_bot.sh
Add the following content to the script:

bash
Copy code
#!/bin/bash

# Navigate to your bot directory
cd /root/dubois-bot

# Pull the latest changes from GitHub
git fetch origin

# Check if there are any new changes
LOCAL=$(git rev-parse @)
REMOTE=$(git rev-parse @{u})

if [ $LOCAL != $REMOTE ]; then
    echo "Changes detected, pulling updates..."
    git pull origin main
    
    # Restart the bot with PM2
    pm2 restart discord-bot

    echo "Bot restarted after pulling updates."
else
    echo "No changes detected."
fi
Replace /path/to/your/discord-bot with the actual path to your bot directory.
If your main branch is not called main, replace main with the correct branch name.
Make the Script Executable Make the script executable by running:

bash
Copy code
chmod +x /root/scripts/update_bot.sh
Set Up a Cron Job Set up a cron job that runs the script every two hours.

bash
Copy code
crontab -e
Add the following line at the end of the file:

bash
Copy code
0 */2 * * * /bin/bash /root/scripts/update_bot.sh >> /root/scripts/update_bot.log 2>&1

This cron job runs the script every two hours (on the hour).
Make sure to replace /home/your_username/update_bot.sh with the full path to your script.
The log file (update_bot.log) will contain the output of the script, which is useful for debugging.
Test the Setup You can manually run the script to test if it works as expected:

bash
Copy code
/bin/bash ~/update_bot.sh
After this setup, your Discord bot will automatically pull the latest code every two hours and restart via PM2 if there are any changes.



Test Your Script
You can manually run your script to ensure everything is working:

bash
Copy code
/bin/bash /root/scripts/update_bot.sh
This configuration will keep your bot up-to-date and restart it automatically if any changes are detected in your repository.