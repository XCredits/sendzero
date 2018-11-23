# Instructions to deploy this app
1)  [Set up Google Cloud Platform](https://cloud.google.com/)

2) Create a new project

![Create a project](/readme/img/gcp12.png)

3) Make sure the project is selected

![Select the project](/readme/img/gcp4.png)

4) Set up a VM instance using Google Compute by following the guide [here](https://cloud.google.com/compute/docs/quickstart-linux).

5) SSH into the VM.

![SSH](/readme/img/ssh.png)

6) Install Node.js and git.
~~~
curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -
~~~
~~~
sudo apt-get install -y nodejs git
~~~

7) Clone the repo and `cd` into the folder.
~~~
git clone https://github.com/XCredits/sendzero.git
~~~
~~~
cd sendzero
~~~

8) Install the dependencies.
~~~
npm install
~~~

9) Install AngularCLI. Also install the correct version of `typescript` that works with Angular.
~~~
npm install @angular/cli@latest -g

npm install --save-dev typescript@2.7.2
~~~

10) Run `ng build --prod` to compile the frontend files.

11) Install `tmux` to allow the server to run even after exiting the SSH session.
~~~
sudo apt-get install tmux
~~~

12) Start `tmux` by running the command `tmux`.

13) Start the server inside the `tmux` session.
~~~
sudo PORT=80 node server.js
~~~

14) You can now exit the `tmux` session by pressing `Ctrl`+`b` and then `d`. You can then safely exit the session and your server will continue to run.

15) You can check the status of your process when you come back using `tmux attach`.

16) You have now deployed a very simple version of your app. It can be accessed by following the external IP for your Google Compute Engine VM Instance.

## Setting up your domain

1) Make sure you've purchased a domain first and that you have access to its DNS settings.

2) Make your VM instance's IP static. This can be done by going to Google Cloud &rarr; VPC Network &rarr; External IP addresses and clicking on **Reserve static address**. Make sure you attach it to your VM instance if it doesn't automatically do so. You get one static IP for free.

3) Now that we've attached a static address to our VM instance we can now make our domain point to this IP. To do this head to the site of the registrar from where you purchased your domain. This example will use Google Domains.

4) Once you've reached the page where you can add custom resource records for your domain, add an `@` name of type `A` and `www` name of type `A`, both of them having value/data as your VM's IP address.

![Custom Records](/readme/img/record.png)

5) The DNS changes should take approximately 10-15 minutes to propagate. You will not be able to see anything yet, as we don't have a server running. So let's set up an `nginx` server. SSH into your VM by following the steps outlined earlier.

6) Install `nginx`.
~~~
sudo apt-get install ngnix
~~~

7) Start a simple `nginx` server. After this you should be able to see the `nginx` default landing page by going to your website.
~~~
sudo systemctl start nginx
~~~

8) Now we have to configure our `nginx` files. Start by making a new directory which will hold our site. (Note that the examples below will all use `example.com`. This should be replaced by your own domain.)
~~~
sudo mkdir -p /var/www/example.com
~~~

9) Change ownership of this folder to your Google Cloud user.
~~~
sudo chown -R $USER:$USER /var/www/example.com
~~~

10) Change permissions on these folders so that they can be read by the system.
~~~
sudo chmod -R 755 /var/www/example.com #755 for folders
sudo chmod -R 644 /var/www/example.com/* #644 for files
~~~

11) Create and `nginx` config file. The `nginx` server will act as a reverse proxy for our `node.js` server. We can do this by creating the `sites-enabled` and `sites-available` folder or by just creating our file in the `conf.d` folder. We'll opt for the latter.
~~~
sudo touch /etc/nginx/conf.d/example.com.conf
~~~

12) Edit this file to resemble the config below.
```nginx
server {
    server_name localhost; #example.com www.example.com;

    location / {
        root  /var/www/example.com;
        index  index.html index.htm;
        try_files $uri $uri/ =404;
    }

    error_page  500 502 503 504  /50x.html;
    location = /50x.html {
        root  /usr/share/nginx/html;
    }
}
```

13) Now we need to disable the default `nginx` page. This can be done by commenting out the `include /etc/nginx/sites-enabled/*;` line in the `nginx.conf` file. The file can be found at `/etc/nginx/nginx.conf`. You can find the above line underneath the Virtual Host Configs section. Make sure to **not** comment out the line `include /etc/nginx/conf.d/*.conf;`.

14) Before we set up a reverse proxy to run our `node.js` server via `nginx`, let's first make sure our `nginx` config works. Let's create a small *index.html* file to test it.
```
echo "Hello World" > /var/www/example.com/index.html
```

15) Restart `nginx`.
```
sudo systemctl restart nginx
```

16) Open a browser tab and navigate to your site. You should see a "Hello World" message. If you instead see a 403 Forbidden message, you might need to set up SELinux for your system. Different distributions of Linux have different methods of doing this. Make sure to set it up before proceeding to the next step.

17) So we've set up a static webpage and made the domain point to our IP address. Let's now set up a reverse proxy for our `node.js` server. Edit your `example.com.conf` file to match the config below.
```nginx
server {
    server_name example.com www.example.com;
    location / {
        #root  /var/www/example.com;
        #index  index.html index.htm;
        #try_files $uri $uri/ =404;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header Host $http_host;
        proxy_set_header X-NginX-Proxy true;
        proxy_pass    http://127.0.0.1:3000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_cache_bypass $http_upgrade;
    }
    error_page  500 502 503 504  /50x.html;
    location = /50x.html {
        root  /usr/share/nginx/html;
    }
}
server {
    server_name example.com www.example.com;
    listen 80;
}
```
18) This will allow your `node` app to be accessed via the `nginx` server. Let's test it out now. Start up your `node.js` server in a new `tmux` window (remember to stop and kill any previous sessions) using the command `sudo node server.js` (if you're working with Compute Engine, run `sudo GOOGLE_CLOUD_PROJECT='example-prod' node server`). Do not override the port this time. With your node server running in the background, restart your `nginx` server so it uses the new configuration using `sudo systemctl restart nginx`.

19) Congrats! You should now have your app showing up when you navigate to your website. Remeber to use tools like [pm2](http://pm2.keymetrics.io/) to manage your `node` instances. Also don't forget to `ng build --prod` everytime you delpoy.

## Setting up SSL

1) Now that the `nginx` configurations have been sorted out, let's work on setting up SSL and HTTPS for our website. We'll be using Let's Encrypt and `certbot` to do this. Start by allowing access through the firewall on ports 80 and 443. (You can skip this step if you allowed both HTTP and HTTPS while setting up your VM instance).
```bash
# for systems with firewalld firewall
sudo firewall-cmd --add-service=http
sudo firewall-cmd --add-service=https
sudo firewall-cmd --runtime-to-permanent

# for systems with iptables firewall
sudo iptables -I INPUT -p tcp -m tcp --dport 80 -j ACCEPT
```

2) Now head to certbot's website [here](https://certbot.eff.org/) and follow the instructions to download the correct flavor of `certbot`. You can then follow the instructions on the site to set it up. For an `nginx` server on a `debian` installation, run the command `sudo certbot certonly --webroot --webroot-path=/home/your-username/your-app/dist -d example.com -d www.example.com`. To renew, use `sudo certbot renew` and `sudo certbot renew --dry-run` to do a dry run first.

3) And it's as easy as that. Restart your `nginx` server and you're good to go!

4) To set up a cronjob to take care of renewal for you, first run `crontab -e` to edit your cron jobs. Then add `0 0,12 * * * sudo certbot renew && sudo service nginx reload` at the bottom of the file and exit the editor. This will try renew your SSL certificates everyday at 12 AM and 12 PM. Easy as that!


## Deploying a new version

1) Log in to the Compute Engine VM.

2) Go into the repo with `cd sendzero` and the pull the latest version using `git pull`.

3) Run `npm install` if you've updated/installed any packages. Then run `ng build --prod` to build the app.

4) Restart the `pm2` instance on the server using `sudo pm2 reload --env production -i 1 pm2.config.js`.

5) Restart the `nginx` server using `sudo service nginx reload`.

6) You can restart the TURN server by logging into its VM and first entering the `tmux` window using `tmux a` and then restarting with `sudo turnserver -L 10.152.0.4 -X 35.189.37.86 -v -a -f -r sendzero.net` after you have killed the current server using `ctrl + c`. Note that these values will change if you are using a different instance of Compute Engine. 

7) You can exit `tmux` with `ctrl + b` and the `d`.

