#!/bin/sh

program_is_installed() {
  type "$1" >/dev/null 2>&1
  if [ $? -eq 0 ]; then
    echo 1
  else
    echo 0
  fi
}

sudo yum update -y
sudo yum install ruby -y
sudo yum install wget -y
cd /home/ec2-user
wget https://aws-codedeploy-ap-southeast-1.s3.ap-southeast-1.amazonaws.com/latest/install
sudo chmod +x ./install
sudo ./install auto

if [ $(program_is_installed node) == 0 ]; then
  curl -fsSL https://rpm.nodesource.com/setup_lts.x | sudo bash -
  sudo yum install -y nodejs
fi

if [ $(program_is_installed git) == 0 ]; then
  sudo yum install git -y
fi

if [ $(program_is_installed docker) == 0 ]; then
  sudo amazon-linux-extras install docker -y
  sudo systemctl start docker
  sudo docker run --name socialscamnet-redis -p 6379:6379 --restart always --detach redis
fi

if [ $(program_is_installed pm2) == 0 ]; then
  npm install -g pm2
fi

cd /home/ec2-user

git clone -b main https://github.com/SenpaiDevx/socialScamNet.git
cd socialScamNet
npm install
aws s3 sync s3://socialscamnet-env-file/develop/ .
unzip env-file.zip
cp .env.develop .env
npm run build
npm run start
