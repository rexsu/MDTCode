#!/bin/bash

# 定义输出文件名
OUTPUT_FILE="mdt-system-package.zip"

# 如果文件已存在则删除
if [ -f "$OUTPUT_FILE" ]; then
    rm "$OUTPUT_FILE"
fi

echo "正在打包项目..."
echo "排除 node_modules, dist, .git 等目录..."

# 使用 zip 命令打包
# -r: 递归
# -x: 排除模式
zip -r "$OUTPUT_FILE" . \
    -x "**/node_modules/*" \
    -x "**/dist/*" \
    -x "**/.git/*" \
    -x "**/.DS_Store" \
    -x "$OUTPUT_FILE"

echo "打包完成: $OUTPUT_FILE"
echo "您可以将此文件发送给其他人。"
