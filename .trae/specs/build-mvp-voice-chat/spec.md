# AI 英语口语陪练 MVP Spec

## Why
用户需要一个可以实时语音对话的 AI 英语口语陪练应用，通过语音交互提高英语口语能力。当前没有可运行的 MVP 版本，需要在两天内用 AI 完成开发。

## What Changes
- 创建后端 WebSocket 服务器，处理语音对话流程
- 集成 SiliconFlow API 实现 ASR、LLM、TTS 功能
- 创建前端录音和播放功能
- 创建极简 UI 界面
- 实现完整的语音对话流程

## Impact
- 新增项目：完整的 AI 英语口语陪练应用
- 技术栈：Vue 3 + Pinia + Node.js + Express + WebSocket
- 第三方依赖：SiliconFlow API

## ADDED Requirements

### Requirement: 后端 WebSocket 服务器
系统 SHALL 提供 WebSocket 服务器，处理客户端的语音对话请求。

#### Scenario: 客户端连接成功
- **WHEN** 客户端发起 WebSocket 连接
- **THEN** 服务器接受连接并返回连接成功消息

#### Scenario: 接收音频数据
- **WHEN** 客户端发送音频数据
- **THEN** 服务器接收音频并开始处理流程

### Requirement: ASR 语音识别服务
系统 SHALL 提供 ASR 服务，将用户语音转换为文字。

#### Scenario: 语音识别成功
- **WHEN** 服务器接收到音频数据
- **THEN** 调用 SiliconFlow ASR API 返回识别的文字

#### Scenario: 语音识别失败
- **WHEN** ASR API 调用失败
- **THEN** 返回错误消息给客户端

### Requirement: LLM 对话服务
系统 SHALL 提供 LLM 服务，生成英语回复。

#### Scenario: 生成回复成功
- **WHEN** 服务器接收到用户文字
- **THEN** 调用 SiliconFlow LLM API 生成英语回复

#### Scenario: 流式返回
- **WHEN** LLM 生成回复
- **THEN** 以流式方式返回给客户端

### Requirement: TTS 语音合成服务
系统 SHALL 提供 TTS 服务，将文字转换为语音。

#### Scenario: 语音合成成功
- **WHEN** 服务器接收到 AI 回复文字
- **THEN** 调用 SiliconFlow TTS API 生成语音

#### Scenario: 返回音频数据
- **WHEN** TTS 生成语音
- **THEN** 将音频数据返回给客户端

### Requirement: 前端录音功能
系统 SHALL 提供录音功能，允许用户录制语音。

#### Scenario: 开始录音
- **WHEN** 用户按下录音按钮
- **THEN** 开始录制音频并显示录音状态

#### Scenario: 停止录音
- **WHEN** 用户松开录音按钮
- **THEN** 停止录音并发送音频数据

### Requirement: 前端播放功能
系统 SHALL 提供播放功能，播放 AI 回复的语音。

#### Scenario: 播放音频
- **WHEN** 接收到 AI 音频数据
- **THEN** 播放音频并显示播放状态

### Requirement: 极简 UI 界面
系统 SHALL 提供极简的 UI 界面，包含录音按钮和聊天面板。

#### Scenario: 显示聊天记录
- **WHEN** 用户和 AI 进行对话
- **THEN** 在聊天面板显示对话记录

#### Scenario: 显示状态
- **WHEN** 系统处理中
- **THEN** 显示当前处理状态（录音中、识别中、生成中、播放中）
