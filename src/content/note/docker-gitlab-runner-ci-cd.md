---
title: '基于docker和gitlab-runner的一次CI/CD实践'
description: '记录 Java 项目容器化、docker-compose 编排，以及 GitLab Runner 流水线部署的一次实践。'
timestamp: 2021-06-08 00:00:00+08:00
toc: true
---

## 项目以容器方式构建

### 添加dockerFile

编写dockerFile

```dockerfile
FROM openjdk:8-jdk-alpine
RUN adduser --disabled-password --gecos '' testuser
USER testuser
ARG JAR_FILE=target/*.jar
COPY ${JAR_FILE} /home/testuser/app.jar
ENTRYPOINT ["java","-jar","/home/testuser/app.jar"]
```

### maven中集成docker镜像构建

添加spotify的dockerFile maven 插件

```xml
<plugin>
    <groupId>com.spotify</groupId>
    <artifactId>dockerfile-maven-plugin</artifactId>
    <version>1.4.13</version>
    <executions>
        <execution>
            <id>default</id>
            <goals>
                <goal>build</goal>
            </goals>
        </execution>
    </executions>
    <configuration>
        <repository>${docker.image.prefix}/${project.name}</repository>
        <tag>${project.version}</tag>
        <buildArgs>
            <JAR_FILE>${project.build.finalName}.jar</JAR_FILE>
        </buildArgs>
        <dockerfile>${project.basedir}/Dockerfile</dockerfile>
    </configuration>
</plugin>
```

## 使用docker-compose在开发和测试环境中编排容器

- 修改application.yml，加入环境变量。

```yaml

server:
  port: ${SERVER_PORT:8080}
logging:
  level:
    com.demo: ${LOG_LEVEL:debug}
  file:
    name: ${LOG_PATH:./logs}/demo.log

```

- 编写docker-compose.yml

```yaml
version: '3'

services:
  web:
    ports:
      - 8080:8080
    image: test/demo:1.0-SNAPSHOT
    networks:
      - test_network
    volumes:
      - ./logs:/logs
    environment:
      - LOG_LEVEL=${LOG_LEVEL}
      - LOG_PATH=${LOG_PATH}

networks:
  test_network:
    driver: bridge
    ipam:
      driver: default
      config:
        - subnet: 172.16.1.0/24
```

## 添加 gitlab-runner 流水线

### 安装Docker Engine - Community

检查docker是否安装以及版本

```bash
$ sudo docker version
```

若输出如下则表示Docker Client和Server均安装成功。

```text
Client: Docker Engine - Community
 Version:           20.10.7
 API version:       1.41
 Go version:        go1.13.15
 Git commit:        f0df350
 Built:             Wed Jun  2 11:58:10 2021
 OS/Arch:           linux/amd64
 Context:           default
 Experimental:      true

Server: Docker Engine - Community
 Engine:
  Version:          20.10.7
  API version:      1.41 (minimum version 1.12)
  Go version:       go1.13.15
  Git commit:       b0f5bc3
  Built:            Wed Jun  2 11:56:35 2021
  OS/Arch:          linux/amd64
  Experimental:     false
 containerd:
  Version:          1.4.6
  GitCommit:        d71fcd7d8303cbf684402823e425e9dd2e99285d
 runc:
  Version:          1.0.0-rc95
  GitCommit:        b9ee9c6314599f1b4a7f497e1f1f856fe433d3b7
 docker-init:
  Version:          0.19.0
  GitCommit:        de40ad0
```

若未安装则参考：[docker 安装文档](https://docs.docker.com/engine/install/centos/)。

### 安装docker-compose

- 下载

```bash
sudo curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
```

- 权限

```bash
sudo chmod +x /usr/local/bin/docker-compose
```

- 链接

```bash
sudo ln -s /usr/local/bin/docker-compose /usr/bin/docker-compose
```

- 校验

```bash
$ docker-compose --version
docker-compose version 1.29.2, build 5becea4c
```

参考：[docker-compose 安装文档](https://docs.docker.com/compose/install/)。

### 安装Gitlab-runner

- 安装git maven

```bash
sudo yum install git maven
```

- 下载

```bash
curl -LJO "https://gitlab-runner-downloads.s3.amazonaws.com/latest/rpm/gitlab-runner_${arch}.rpm"
```

- 安装

```bash
rpm -i gitlab-runner_${arch}.rpm
```

- 校验

```bash
$ systemctl status gitlab-runner.service
● gitlab-runner.service - GitLab Runner
   Loaded: loaded (/etc/systemd/system/gitlab-runner.service; enabled; vendor preset: disabled)
   Active: active (running) since Tue 2021-06-15 15:03:31 CST; 51s ago
 Main PID: 31521 (gitlab-runner)
    Tasks: 10
   Memory: 5.5M
   CGroup: /system.slice/gitlab-runner.service
           └─31521 /usr/bin/gitlab-runner run --working-directory /home/gitlab-runner --config /etc/gitlab-runner/config.toml --service gitlab-runner --user gitlab-runner

```

```text
参考：
```

[Gitlab-runner安装文档](https://docs.gitlab.com/runner/install/linux-manually.html)

- 修改启动用户，文件：/etc/systemd/system/gitlab-runner.service。

### 注册runner并编写.gitlab-ci.yml

- 注册，见[注册文档](https://docs.gitlab.com/runner/register/index.html#linux)。
- 编写.gitlab-ci.yml。

  ```yml
  stages:
    - build
    - deploy-dev

  build:
    stage: build
    tags:
      - demo-runner
    only:
      refs:
        - dev/1.0
    script:
      - mvn clean package -Dmaven.test.skip=true

  deploy-dev:
    stage: deploy-dev
    tags:
      - demo-runner
    only:
      refs:
        - dev/1.0
    script:
      - sudo -u testuser whoami
      - sudo -u testuser mkdir -p /home/testuser/demo-project
      - sudo -u testuser cp -r ./docker-compose/. /home/testuser/demo-project
      - cd /home/testuser/demo-project
      - chmod +x ./init.sh
      - sudo -u testuser ./init.sh
      - sudo -u testuser sudo docker-compose up -d
    needs:
      - job: build


  ```
