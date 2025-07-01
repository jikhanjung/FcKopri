#!/bin/bash

echo "Playwright 의존성 설치 시작..."

# 시스템 업데이트
sudo apt-get update

# 기본 의존성 설치
sudo apt-get install -y \
    libnspr4 \
    libnss3 \
    libasound2t64 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libxkbcommon0 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxrandr2 \
    libgbm1 \
    libgtk-3-0 \
    libxss1 \
    libxtst6

# GTK4 및 관련 라이브러리
sudo apt-get install -y \
    libgtk-4-1 \
    libgraphene-1.0-0

# 멀티미디어 관련 라이브러리
sudo apt-get install -y \
    libatomic1 \
    libxslt1.1 \
    libwoff1 \
    libvpx7 \
    libevent-2.1-7 \
    libopus0

# GStreamer 관련 라이브러리
sudo apt-get install -y \
    gstreamer1.0-libav \
    gstreamer1.0-plugins-base \
    gstreamer1.0-plugins-good \
    gstreamer1.0-plugins-bad \
    libgstreamer1.0-0 \
    libgstreamer-plugins-base1.0-0 \
    libgstreamer-gl1.0-0

# Flite (음성 합성) 관련 라이브러리
sudo apt-get install -y \
    flite1-dev \
    libflite1

# 이미지 처리 라이브러리
sudo apt-get install -y \
    libwebp7 \
    libwebpdemux2 \
    libwebpmux3 \
    libavif15

# 텍스트 처리 라이브러리
sudo apt-get install -y \
    libharfbuzz-icu0 \
    libenchant-2-2 \
    libsecret-1-0 \
    libhyphen0

# 기타 라이브러리
sudo apt-get install -y \
    libmanette-0.2-0 \
    libgles2 \
    libx264-dev

# 추가로 필요할 수 있는 라이브러리
sudo apt-get install -y \
    libxcb-dri3-0 \
    libxshmfence1 \
    libglu1-mesa \
    libegl1-mesa \
    libxcb-cursor0 \
    libxcb-icccm4 \
    libxcb-image0 \
    libxcb-keysyms1 \
    libxcb-randr0 \
    libxcb-render-util0 \
    libxcb-shape0 \
    libxcb-xfixes0

echo "의존성 설치 완료!"
echo "이제 다음 명령어를 실행하세요:"
echo "npx playwright install"