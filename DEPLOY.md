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
git clone https://github.com/XCredits/test-webrtc.git
~~~
~~~
cd test-webrtc
~~~

8) Install the dependencies.
~~~
npm install
~~~

9) Install AngularCLI.
~~~
npm install @angular/cli@latest -g
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