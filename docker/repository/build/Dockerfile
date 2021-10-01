FROM nginx
RUN apt update && apt install -y git
RUN mkdir -p /opt/pixel/datamodels
COPY git-credentials /root/.git-credentials
RUN cd /opt/pixel/datamodels && git init && git config credential.helper store && git remote add origin https://gitpixel.satrdlab.upv.es/iglaub/Data_Models.git && GIT_SSL_NO_VERIFY=true git pull origin master
COPY default.conf /etc/nginx/conf.d/default.conf