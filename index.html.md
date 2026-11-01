# Pavu App

> Official plain-Markdown guide to Pavu, the local-first application security assistant developed by Pavu Labs. English and 简体中文 describe the same product and limitations.

Canonical website: https://pavu.org/
Reviewed: 2026-11-01
Discovery index: [llms.txt](https://pavu.org/llms.txt)

## English

### What Pavu is

Pavu is a desktop application security assistant for individuals, including people who use applications and AI coding agents with broad local permissions. It aims to make application network behavior and system changes visible, explain findings with evidence, and let the user decide what to do. The macOS application has a SwiftUI interface, a Network Content Filter system extension, an inventory helper, and a local Rust core for rules and storage.

Pavu is currently an early preview. An implemented feature, a signed package, and a successful installation are different from a complete functional acceptance result.

### Current download and verified limits

- Version: **0.1.57-preview**, bundle version **0.1.57**, build **82**.
- Package: signed, Apple-notarized universal DMG; the main App, network extension, and inventory helper contain **arm64 and x86_64** slices.
- Minimum OS for this package: **macOS 14**. macOS 13 compatibility is a target, not a supported configuration of this download.
- **Known acceptance limitation, checked 2026-11-01:** upgrades on Apple silicon Macs running macOS 27.0.1 installed and launched successfully, but the App's connection to the enabled collection extension failed. Retry or normal relaunch also reproduced a connection failure. The underlying cause remains unconfirmed. End-to-end network collection and blocking must not be presented as verified working in this package.
- Physical Intel acceptance and complete UI/flow-display acceptance remain unperformed. Universal binary checks alone do not establish those results.

The implemented product model, subject to available collection capabilities, includes:

- Application-attributed connection metadata: destination address/domain when available, port, protocol, direction, timestamps, and system-reported byte counts.
- Local IP-location lookup for country, city, network provider, and ASN when available.
- Host inventory such as launch items, listening ports, installed applications, system extensions, and security-setting state. Coverage depends on OS access and helper availability.
- Local rules and evidence-based findings, plus macOS notifications. Examples include unusual ports, large transfers, repeated connections, unsigned programs online, or suspicious system changes. A finding needs investigation; it does not prove malicious intent or that file contents were uploaded.
- User-controlled blocking of a program's **new** connections and optional per-rule automatic blocking, off by default. Programs supplied with macOS are excluded, and decisions can be undone. This describes the implementation, not a successful blocking acceptance result for the current download.

### Privacy and evidence boundaries

Core monitoring, rules, and history operate locally. Activity history is kept for 24 hours by default; preferences and user decisions have a separate lifetime. Users can pause monitoring or clear activity history. IP locations are queried against a local database. Its periodic public database download can be switched to manual updating; observed IP addresses are not sent to a geolocation lookup service.

Pavu does not capture network payloads, decrypt TLS, or collect file/message contents, passwords, cookies, or login tokens. **Current macOS builds do not collect file-access events** because the Apple Endpoint Security entitlement has not been approved. Network byte counts and process/time proximity cannot establish what a file contained or prove its upload.

Missing permissions, unavailable collectors, and skipped rules must remain visible. An empty connection list while collection is unavailable does not mean the device is inactive or safe. The public preview does not establish a generally available hosted AI-analysis service; local rule analysis is the product's baseline.

### Install or evaluate

1. Read the [current download notes](https://pavu.org/#download), including the known limitation above.
2. Download the [universal DMG](https://pavu.org/downloads/Pavu-0.1.57-preview-universal.dmg) and compare it with the [SHA-256 checksum](https://pavu.org/downloads/Pavu-0.1.57-preview-universal.dmg.sha256).
3. Drag `Pavu.app` to Applications and open it there. Follow macOS prompts for its network extension and content filter when needed.
4. Confirm the App explicitly reports **Collection running** before treating network records as live collection. The present preview's connection failure remains an unresolved acceptance issue; installation alone is insufficient.

For upgrades from 0.1.17-preview or earlier, follow the homepage's migration note: unblock everything in the old App, quit it, and move it to the Trash before installing the new identity. Those older data/settings are not shared with the newer App identity.

### Other platforms, source, and licensing

- **Linux:** collector prototype; no supported Linux App is offered on this website.
- **Windows:** observe-only prototype work; no supported Windows product download is offered on this website.
- **Android:** planned.
- **License:** Pavu uses Apache License 2.0; bundled dependencies keep their own licenses. See [licenses](https://pavu.org/product-license.html). Product source is being prepared for public access; do not assume a private repository is publicly readable.

## 简体中文

### Pavu 是什么

Pavu 是 Pavu Labs 开发的、面向个人用户的桌面应用安全助手，也面向使用高权限应用和 AI 编程 Agent 的用户。它希望让应用的联网行为和系统变化可见，用证据解释风险发现，并由用户决定如何处理。macOS App 包含 SwiftUI 界面、Network Content Filter 系统扩展、主机清单辅助服务，以及负责规则和存储的本地 Rust Core。

Pavu 目前是早期预览版。功能已有实现、安装包通过签名检查、能够成功安装，与完整功能验收通过是不同的事实。

### 当前下载及验证边界

- 版本：**0.1.57-preview**，App 版本 **0.1.57**，构建号 **82**。
- 安装包：已签名并通过 Apple 公证的通用 DMG；主 App、网络扩展和主机清单辅助服务均包含 **arm64 与 x86_64** 架构。
- 此安装包的最低系统为 **macOS 14**。兼容 macOS 13 是目标，不代表当前下载已支持。
- **已知验收限制，核实于 2026-11-01：**在运行 macOS 27.0.1 的 Apple 芯片 Mac 上，升级安装和启动通过，但 App 无法连接已启用的采集扩展，界面重试或正常退出重开后仍复现连接失败。根因尚未确定，不能把当前安装包的完整网络采集或阻断描述为已经验证可用。
- Intel 真机验收以及完整界面、连接记录展示验收尚未完成。通用二进制检查不能替代这些结果。

在对应采集能力可用时，产品已实现的功能包括：

- 按应用展示连接元数据：系统可提供的目标地址或域名、端口、协议、方向、时间和收发字节数。
- 使用本地 IP 位置数据库查询可用的国家、城市、网络运营商和 ASN 信息。
- 查看自启动项、监听端口、已安装应用、系统扩展和安全设置等主机清单；覆盖范围取决于系统权限及辅助服务是否可用。
- 本地规则、带证据的风险发现和 macOS 通知，例如非常用端口、大量传输、周期性连接、未签名程序联网或可疑系统变化。发现表示需要核实，不证明恶意意图，也不证明文件正文已上传。
- 用户禁止某个程序新建连接，或为单条规则开启默认关闭的自动阻断；macOS 自带程序不在阻断范围内，决定可以撤销。这是实现范围，不代表当前下载的阻断验收已经通过。

### 隐私与证据边界

核心监测、规则和历史查询在本机运行。活动历史默认保留 24 小时，偏好和用户决定有独立的保留周期；用户可以暂停监测或清除活动历史。IP 位置在本地数据库查询，定期下载公开数据库更新可改为手动更新；观察到的 IP 地址不会发送给远程位置查询服务。

Pavu 不采集网络 payload，不解密 TLS，不读取文件或消息正文、密码、Cookie 或登录令牌。**当前 macOS 版不采集文件访问事件**，因为尚未获批 Apple Endpoint Security entitlement。网络字节数、同一进程或时间接近，都不能证明文件正文是什么或证明其已被上传。

缺失权限、采集不可用和规则跳过必须明确显示。采集不可用时连接列表为空，不能理解为没有活动或安全。公开预览版尚未建立普遍可用的托管 AI 分析服务，本地规则分析是产品基础。

### 安装与试用

1. 阅读[当前下载说明](https://pavu.org/#download)及上方已知限制。
2. 下载[通用 DMG](https://pavu.org/downloads/Pavu-0.1.57-preview-universal.dmg)，并对照 [SHA-256 校验值](https://pavu.org/downloads/Pavu-0.1.57-preview-universal.dmg.sha256)。
3. 将 `Pavu.app` 拖到“应用程序”文件夹，在那里打开；需要时按 macOS 提示批准网络扩展和内容过滤器。
4. 只有界面明确显示“真实采集运行中”，才可把连接记录当作实时采集。当前预览版的连接失败仍未通过验收，安装完成不足以证明采集正常。

从 0.1.17-preview 或更早版本升级时，遵照首页的迁移说明：先在旧 App 中解除全部阻断，退出并将旧 App 移到废纸篓，再安装使用新标识的版本。更早版本的数据和设置不与新标识共用。

### 其他平台、源码与许可

- **Linux：**采集原型阶段，本站不提供已受支持的 Linux App。
- **Windows：**仅观测原型阶段，本站不提供已受支持的 Windows 产品下载。
- **Android：**规划中。
- **许可：**Pavu 采用 Apache License 2.0，所含依赖各自遵循其许可证，见[许可证页面](https://pavu.org/product-license.html)。产品源码正在准备公开，不应假设私有仓库可公开读取。

## Official links / 官方入口

- [Pavu homepage / 官网](https://pavu.org/)
- [Privacy / 隐私](https://pavu.org/#privacy)
- [Downloads / 下载](https://pavu.org/#download)
- [Pavu Labs on GitHub](https://github.com/pavulabs)
- [About and feedback / 关于与反馈](https://pavu.org/#about)
