---
title: 'Aux空调接入home assistant'
description: '通过 broadlink_ac_mqtt、Mosquitto 和 MQTT 自动发现，把奥克斯空调接入 Home Assistant 的记录。'
pubDate: '2021-11-10'
---

**插件原作者 Github [broadlink\_ac\_mqtt](https://web.archive.org/web/20250121082012/https://github.com/liaan/broadlink_ac_mqtt)**

## 前言

奥克斯的官方的APP简直难用，延迟经常十来秒。

最近在折腾hass，官方集成好像不支持aux。

在路由器看到几台空调的主机名都是BroadLink\_OEM-T1-XX-XX-XX类似的，猜测用的都是博联的集成方案。

一番搜索找了个还行的插件，特来分享安装过程。

## 步骤

### 1. 安装 docker

安装后确认命令

```bash
docker --version
```

### 2. 安装MQTT broker

* 创建目录

```bash
mkdir -p /docker/mosquitto/config
mkdir -p /docker/mosquitto/data
mkdir -p /docker/mosquitto/log
```

* 初始化配置文件

```bash
vi /mosquitto/config/mosquitto.conf
```

```text
persistence true
persistence_location /mosquitto/data/
log_dest file /mosquitto/log/mosquitto.log

listener 1883
# 关闭匿名模式
allow_anonymous false
# 指定密码文件
password_file /mosquitto/config/pwfile.conf

```

6、运行

```bash
docker run -it --name=mosquitto --privileged \
-p 1883:1883  \
-v /mosquitto/config/mosquitto.conf:/mosquitto/config/mosquitto.conf \
-v /mosquitto/data:/mosquitto/data \
-v /mosquitto/log:/mosquitto/log \
eclipse-mosquitto
```

### 3. 安装broadlink\_ac\_mqtt 插件

* 创建配置文件config.yml ，根据自己的环境修改MQTT的配置和设备的信息

```yaml
service:
   daemon_mode: True
   #更新间隔
   update_interval: 10
   #在局域网中自动发现博联设备 
   #但是不支持中文设备 所以关闭
   self_discovery: False
   bind_to_ip: False

mqtt:
   #mqtt服务的ip地址
   host: mqtt
   #mqtt服务的端口
   port: 1883
   client_id: ac_to_mqtt
   #mqtt服务的用户名
   user: user
   #mqtt服务的用户名
   passwd: 'passwork'
   #空调信息的topic 不需要改
   topic_prefix: /aircon
   #HA 自动发现实体的topic 不需要改
   auto_discovery_topic: homeassistant
   auto_discovery_topic_retain: True
   #HA 自动发现实体的开关
   discovery: True

##设备配置
devices:
   - ip: 192.168.xxx.xxx
      #设备MAC地址，去掉冒号(a1:b2:c3:d4:e5:f6 填写为a1b2c3d4e5f6)
     mac: a1b2c3d4e5f6
      #设备名 注意不能用中文
     name: Master bedroom ac
      #端口号 为80 （仅在奥克斯空调测试）
     port: 80
   - ip: 192.168.xxx.xxx
     mac: a1b2c3d4e5f6
     name: Living room ac
     port: 80
   - ip: 192.168.xxx.xxx
     mac: a1b2c3d4e5f6
     name: Second bedroom
     port: 80
   - ip: 192.168.xxx.xxx
     mac: a1b2c3d4e5f6
     name: Guest bedroom
     port: 80
```

* 新建文件夹 /docker/ac2mqtt 并将配置文件放入其中（**这里只是示例，建议放HA配置文件夹同级**）

```bash
mkdir -p /docker/ac2mqtt
cp config.yml /docker/ac2mqtt/
```

* 启动 broadlink\_ac\_mqtt 插件容器

```bash
docker run -d --name ac2mqtt broadlinkac/broadlink_ac_mqtt:latest  --net="host" -v /docker/ac2mqtt:/config -e TZ="Asia/Shanghai"
```

### 4. 启动HA自动发现MQTT实体

安装mqtt集成

在HA的配置文件中加入

```yaml
mqtt:
  discovery: true
  discovery_prefix: homeassistant
```
