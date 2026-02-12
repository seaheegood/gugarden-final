# 배포 가이드

> 구의정원(GuGarden) 프로덕션 배포 및 운영 가이드

## 운영 환경 구성

```
사용자 ─→ https://gugarden.hongshin99.com
           │
      Apache2 (SSL/리버스 프록시)
           ├─ 정적 파일 (/, /login, /products...)  →  dist/
           ├─ /api/*                                →  localhost:9090 (Spring Boot)
           └─ /uploads/*                            →  /var/www/gugarden/uploads/
                                                          │
                                            Spring Boot ──┘──→ MySQL DB 서버 (외부)
```

| 구성 요소 | 상세 |
|-----------|------|
| OS | Ubuntu 24.04 LTS |
| Java | OpenJDK 21 |
| 웹서버 | Apache2 + mod_proxy + mod_ssl |
| SSL | Let's Encrypt (certbot) |
| 백엔드 | Spring Boot 3.5.7 (포트 9090) |
| DB | MySQL 8.0 (외부 서버) |
| 프로세스 관리 | systemd |

---

## 서버 디렉토리 구조

```
/var/www/gugarden/
├── repo/                              # git clone (소스 코드)
│   ├── client/
│   │   └── dist/                      # 프론트엔드 빌드 결과 (Apache DocumentRoot)
│   └── server/
│       ├── src/main/resources/
│       │   └── application-prod.yml   # 운영 설정 (git 미추적)
│       └── build/libs/
│           └── gugarden-*.jar         # 빌드된 JAR
└── uploads/                           # 업로드된 이미지 파일

/etc/systemd/system/gugarden.service   # 서비스 등록 파일
/etc/apache2/sites-available/
├── gugarden.hongshin99.com.conf       # HTTP → HTTPS 리다이렉트
└── gugarden.hongshin99.com-le-ssl.conf # SSL VirtualHost 설정
```

---

## git에 포함되지 않는 서버 전용 파일

배포 시 직접 관리해야 하는 파일:

| 파일 | 위치 | 설명 |
|------|------|------|
| `application-prod.yml` | `server/src/main/resources/` | DB 비밀번호, JWT 시크릿, OAuth 키 등 |
| `uploads/` | `/var/www/gugarden/uploads/` | 사용자 업로드 이미지 |
| `gugarden.service` | `/etc/systemd/system/` | systemd 서비스 설정 |
| Apache VirtualHost | `/etc/apache2/sites-available/` | 웹서버 설정 |

> `application-prod.yml`은 `.gitignore`에 포함되어 있으므로 서버에서 직접 생성/관리합니다.
> 템플릿은 `application-prod.yml.example`을 참고하세요.

---

## 코드 업데이트 배포

```bash
# 1. 서버 접속
ssh root@<서버IP>

# 2. 소스 업데이트
cd /var/www/gugarden/repo
git pull origin main

# 3. 프론트엔드 빌드
cd client
npm ci
npm run build

# 4. 백엔드 빌드
cd ../server
./gradlew clean build -x test --no-daemon

# 5. 서비스 재시작
systemctl restart gugarden

# 6. 확인
systemctl status gugarden
curl -s https://gugarden.hongshin99.com/api/health
```

---

## 서비스 관리 명령어

```bash
# 서비스 시작/중지/재시작
systemctl start gugarden
systemctl stop gugarden
systemctl restart gugarden

# 서비스 상태 확인
systemctl status gugarden

# 실시간 로그 확인
journalctl -u gugarden -f

# 최근 로그 100줄
journalctl -u gugarden --no-pager -n 100

# Apache 설정 검증 및 재시작
apache2ctl configtest
systemctl reload apache2
```

---

## 초기 배포 (처음부터 설정할 때)

### 1. 서버 패키지 설치

```bash
apt update
apt install openjdk-21-jdk-headless apache2 certbot python3-certbot-apache
a2enmod proxy proxy_http rewrite headers ssl
```

### 2. Node.js 설치

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install nodejs
```

### 3. 소스 클론 및 빌드

```bash
mkdir -p /var/www/gugarden/uploads
git clone https://github.com/seaheegood/gugarden-final.git /var/www/gugarden/repo

# 프론트엔드 빌드
cd /var/www/gugarden/repo/client
npm ci && npm run build

# 백엔드 빌드
cd ../server
./gradlew clean build -x test --no-daemon
```

### 4. 운영 설정 파일 생성

```bash
cp server/src/main/resources/application-prod.yml.example \
   server/src/main/resources/application-prod.yml
```

`application-prod.yml`에서 반드시 수정할 항목:

```yaml
server:
  port: 9090                          # 사용할 포트

spring:
  datasource:
    url: jdbc:mysql://<DB호스트>:3306/gugarden?...
    username: <DB유저>
    password: <DB비밀번호>

app:
  jwt:
    secret: <64자 이상 랜덤 키>       # openssl rand -base64 48
  cookie:
    secure: true
    domain: <도메인>
  client-url: https://<도메인>
  naver:
    client-id: <네이버 OAuth 클라이언트 ID>
    client-secret: <네이버 OAuth 시크릿>
    callback-url: https://<도메인>/api/auth/naver/callback
```

### 5. DB 스키마 생성

```bash
mysql -h <DB호스트> -u <유저> -p <DB명> < server/src/main/resources/schema.sql
```

### 6. systemd 서비스 등록

```bash
cat > /etc/systemd/system/gugarden.service << 'EOF'
[Unit]
Description=GuGarden Spring Boot Application
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/var/www/gugarden/repo/server
ExecStart=/usr/bin/java -jar /var/www/gugarden/repo/server/build/libs/gugarden-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=gugarden

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable gugarden
systemctl start gugarden
```

### 7. Apache VirtualHost 설정

HTTP (gugarden.hongshin99.com.conf):
```apache
<VirtualHost *:80>
    ServerName gugarden.hongshin99.com
    RewriteEngine On
    RewriteCond %{HTTPS} off
    RewriteRule ^(.*)$ https://%{HTTP_HOST}$1 [R=301,L]
</VirtualHost>
```

SSL (gugarden.hongshin99.com-le-ssl.conf):
```apache
<IfModule mod_ssl.c>
<VirtualHost *:443>
    ServerName gugarden.hongshin99.com

    DocumentRoot /var/www/gugarden/repo/client/dist

    <Directory /var/www/gugarden/repo/client/dist>
        Options -Indexes +FollowSymLinks
        AllowOverride None
        Require all granted
    </Directory>

    Alias /uploads /var/www/gugarden/uploads
    <Directory /var/www/gugarden/uploads>
        Options -Indexes
        AllowOverride None
        Require all granted
    </Directory>

    ProxyPreserveHost On
    ProxyPass /uploads !
    ProxyPass /api http://127.0.0.1:9090/api
    ProxyPassReverse /api http://127.0.0.1:9090/api

    RewriteEngine On
    RewriteCond %{REQUEST_URI} !^/api/
    RewriteCond %{REQUEST_URI} !^/uploads/
    RewriteCond %{DOCUMENT_ROOT}%{REQUEST_URI} !-f
    RewriteCond %{DOCUMENT_ROOT}%{REQUEST_URI} !-d
    RewriteRule ^ /index.html [L]

    <LocationMatch "\.(js|css|png|jpg|jpeg|gif|ico|svg|webp|woff2?)$">
        Header set Cache-Control "public, max-age=31536000, immutable"
    </LocationMatch>

    SSLCertificateFile /etc/letsencrypt/live/gugarden.hongshin99.com/fullchain.pem
    SSLCertificateKeyFile /etc/letsencrypt/live/gugarden.hongshin99.com/privkey.pem
    Include /etc/letsencrypt/options-ssl-apache.conf
</VirtualHost>
</IfModule>
```

### 8. SSL 인증서 발급

```bash
certbot --apache -d gugarden.hongshin99.com
```

---

## 트러블슈팅

### 서비스가 시작되지 않을 때

```bash
journalctl -u gugarden --no-pager -n 50    # 로그 확인
java -version                               # Java 21 확인
ss -tlnp | grep 9090                        # 포트 사용 중인지 확인
```

### DB 연결 실패

```bash
# 앱 서버에서 DB 접속 테스트
mysql -h <DB호스트> -u gugarden -p gugarden -e "SELECT 1;"
```

### 업로드 이미지가 안 보일 때

```bash
ls -la /var/www/gugarden/uploads/           # 파일 존재 확인
apache2ctl configtest                       # Apache 설정 검증
# Alias /uploads 설정이 다른 사이트 설정과 충돌하지 않는지 확인
```
