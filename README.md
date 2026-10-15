# Life Achievements · 人生成就

**人生是一场开放世界游戏，每个人都有自己的成就列表。**

**Life is an open-world game. Everyone has their own achievement list.**

A local-first achievement collection app for real-life experiences, built with Next.js, TypeScript, Prisma, and SQLite.

[简体中文](#简体中文) · [English](#english)

## 简体中文

### 项目简介

Life Achievements 将现实生活中的探索、学习、运动和体验变成可收藏的成就。采用深蓝游戏社区风格，提供原创徽章、解锁反馈和个人展示柜。

这是一个 **本地单用户 MVP**。数据存储在 SQLite 中，刷新页面、关闭浏览器或重启服务不会丢失。无需云服务、付费 API 或第三方账号。

### 已实现功能

- 首页：原创 CSS 山峦与轨道视觉、个人统计、最近解锁、推荐探索和稀有度说明。
- 60 个成就：探索世界、学习与技能、运动与健康、财富与事业、情感与关系、生活与体验，每类 10 个。
- 图鉴：关键词搜索，分类、解锁状态、稀有度组合筛选；按解锁率、稀有程度和挑战难度排序。
- 详情及解锁：达成条件、完成日期、可选经历、确认保存和解锁动画；取消解锁需要二次确认。
- 个人档案：昵称、4 种默认头像、简介、总完成率、分类进度和最近成就。
- 展示柜：最多 6 个已解锁成就，按选择顺序展示。
- 持久化：重复解锁不重复计数；取消解锁在数据库事务中清理对应展示记录。
- 桌面和手机布局、键盘可操作原生弹窗、悬停反馈及减少动画偏好支持。

### 技术栈

| 技术               | 用途                               | 已验证版本      |
| ------------------ | ---------------------------------- | --------------- |
| Next.js / React    | App Router、服务端渲染、客户端交互 | 16.4.0 / 19.3.0 |
| TypeScript         | 类型检查                           | 5.9.3           |
| Tailwind CSS / CSS | 深色主题、布局与动画               | 4.3.3           |
| Lucide React       | 图标与徽章                         | 0.468.0         |
| Prisma / SQLite    | 数据模型与持久化                   | Prisma 6.19.3   |

附带 `pnpm-lock.yaml` 以复现经过验证的依赖。运行时无需外部图片、网络字体或付费 API。

### 本地启动

建议使用 **Node.js 22 或 24 LTS**。进入项目根目录，在 Windows PowerShell 中运行：

```powershell
Copy-Item .env.example .env
npm install
npm run db:init
npm run dev
```

macOS / Linux 将第一行替换为 `cp .env.example .env`。如果已有 `.env`，保留原配置，不要覆盖。

打开 [http://127.0.0.1:3000](http://127.0.0.1:3000)，点击「创建档案」，然后进入图鉴开始解锁。

如已安装 pnpm，可使用锁定依赖安装；同样需要先复制 `.env.example`：

```powershell
pnpm install --frozen-lockfile
pnpm run db:init
pnpm run dev
```

生产模式运行：

```powershell
npm run build
npm start
```

服务默认仅监听 `127.0.0.1`。按 Ctrl+C 停止。端口占用时使用 `npm run dev -- --port 3001`。

### 数据库、备份与重置

`.env.example` 提供默认配置：

```dotenv
DATABASE_URL="file:./dev.db"
```

数据库实际位于 `prisma/dev.db`。**源码仓库及源码包不包含个人数据库或实际 `.env`**，首次使用需初始化。

```powershell
# 创建表并写入或更新成就，保留个人记录
npm run db:init

# 删除所有个人档案、解锁记录和展示柜，再重新初始化
npm run db:reset
```

**重置不可恢复，请先备份。** 备份时停止服务并复制 `prisma/dev.db`；恢复时停止服务并将备份放回原位置。初始化脚本按固定 ID upsert，可重复执行。更新成就内容无需 reset。

| 模型              | 内容                                   |
| ----------------- | -------------------------------------- |
| `Achievement`     | 名称、描述、条件、分类、图标、挑战难度 |
| `User`            | 本地个人档案及有效统计状态             |
| `UserAchievement` | 唯一解锁记录、完成日期和经历           |
| `Showcase`        | 展示成就及排列顺序                     |

### 稀有度与统计

`解锁率 = 解锁该成就的有效用户数 / 有效用户总数 × 100%`

有效统计用户当前定义为 `User.active = true`，并不代表已核验的真人身份。至少 **100 位有效用户**才显示解锁率和稀有度；样本不足时显示「数据不足」。没有注入虚构用户或演示比例。

| 稀有度   | 解锁率       |
| -------- | ------------ |
| 普通     | ≥20%         |
| 稀有     | ≥5% 且 <20%  |
| 极其稀有 | ≥1% 且 <5%   |
| 史诗     | ≥0.1% 且 <1% |
| 传说     | <0.1%        |

这是网站自定义规则。**挑战难度与稀有度相互独立**。本地单用户模式无法达到统计阈值，因此相关区域显示说明或空状态，计算及排序逻辑已实现。数据不足时按解锁率或稀有度排序会保持原顺序。

### 检查与测试

```powershell
npm run typecheck
npm run lint
npm test
npm run build
node tests/integration.mjs
```

集成测试需要先初始化数据库并完成生产构建，确保 **3101 端口可用**。测试复制数据库到临时目录，在副本中清理用户并运行独立服务，完成后删除副本，不修改个人数据库。

已验证 TypeScript、无警告 Lint、生产构建、5 项单元测试和真实 API 集成测试。覆盖稀有度边界、日期校验、本地来源兼容、跨来源拒绝、成就完整性、建档、重复解锁防重、展示柜约束、重启持久化、取消解锁及统计更新。已检查桌面及 390px 手机布局。

### 当前范围

这是本地个人体验应用，**没有多用户认证，不应直接暴露到公网**。GitHub 存放源码，不等于托管部署；本项目需要 Node.js 服务及 SQLite，不能直接运行在仅支持静态文件的 GitHub Pages 上。

成就采用自主申报；**审核、证明上传和 AI 核验尚未实现**。OAuth、好友、排行榜、社区互动、付费、移动 App、第三方同步也不在本次 MVP 范围内。成就是自选经历，不是人生义务或评分。

## English

### Overview

Life Achievements turns exploration, learning, exercise, and everyday experiences into a personal achievement collection. Its dark blue interface features original badges, unlock feedback, and a player-style showcase.

This is a **local, single-user MVP**. SQLite preserves your profile and unlocks across page reloads and server restarts. No cloud setup, paid API, or third-party account is required.

**The application UI and achievement catalog are currently in Simplified Chinese. This README is bilingual; an English UI is not implemented.**

### Features

- Home page with original CSS scenery, personal statistics, recent unlocks, suggested achievements, and rarity information.
- 60 achievements, with 10 each across World Exploration, Learning & Skills, Sports & Health, Wealth & Career, Emotions & Relationships, and Life & Experiences.
- Keyword search, combined category/status/rarity filters, and sorting by unlock rate, rarity, or difficulty.
- Achievement details, completion dates, optional notes, confirmation dialogs, and unlock notifications. Revoking an achievement requires confirmation.
- Player profile with nickname, four preset avatars, biography, completion statistics, and category progress.
- Showcase of up to six unlocked achievements in selection order.
- Prisma and SQLite persistence, idempotent unlocks, and transactional cleanup of revoked showcase entries.
- Responsive desktop/mobile layouts, keyboard-operable dialogs, hover feedback, and reduced-motion support.

### Technology

Validated with Next.js 16.4.0 (App Router), React 19.3.0, TypeScript 5.9.3, Tailwind CSS 4.3.3, Lucide React 0.468.0, Prisma 6.19.3, and SQLite. The included `pnpm-lock.yaml` records the tested dependency resolution. No external images, web fonts, or paid APIs are required at runtime.

### Getting started

Use **Node.js 22 or 24 LTS**. From the project root, run in Windows PowerShell:

```powershell
Copy-Item .env.example .env
npm install
npm run db:init
npm run dev
```

On macOS or Linux, replace the first command with `cp .env.example .env`. Preserve an existing `.env` rather than overwriting it.

Visit [http://127.0.0.1:3000](http://127.0.0.1:3000), select **Create profile** , and explore the atlas.

For a reproducible install with the included lockfile, use pnpm after copying `.env.example`:

```powershell
pnpm install --frozen-lockfile
pnpm run db:init
pnpm run dev
```

Run a production build locally:

```powershell
npm run build
npm start
```

Servers bind to `127.0.0.1` by default. Stop with Ctrl+C. To use another development port, run `npm run dev -- --port 3001`.

### Database and backups

Copy `.env.example` to `.env`; the default is:

```dotenv
DATABASE_URL="file:./dev.db"
```

The database is stored at `prisma/dev.db`. **Personal databases and actual `.env` files are excluded from the repository and source archives.** Initialize the database after a fresh checkout.

```powershell
# Create tables and upsert definitions; preserve personal records
npm run db:init

# Delete all local profiles, unlocks, and showcase entries, then reseed
npm run db:reset
```

**Reset is destructive. Back up first.** Stop the server before copying `prisma/dev.db`. To restore, stop the server and replace that file with your backup. Seeding uses stable IDs and can be rerun without deleting personal records.

The four models are `Achievement` (definitions and difficulty), `User` (profile and active status), `UserAchievement` (unique unlock, completion date, and note), and `Showcase` (selected achievements and display order).

### Rarity and statistics

`Unlock rate = active users who unlocked an achievement / all active users × 100%`

An active statistical user currently means `User.active = true`, not a verified real-world identity. Rates and rarity are shown only with **at least 100 active users**. Smaller samples display **Insufficient data** . No fictional users or simulated percentages are supplied.

| Rarity    | Unlock rate   |
| --------- | ------------- |
| Common    | ≥20%          |
| Rare      | ≥5% and <20%  |
| Very rare | ≥1% and <5%   |
| Epic      | ≥0.1% and <1% |
| Legendary | <0.1%         |

These are custom platform thresholds. **Difficulty is an independent editorial rating, not rarity.** Single-user mode cannot reach the sample threshold, so rarity sections show an explanation or empty state. Calculation and sorting are implemented; insufficient-data entries retain their original order when sorted by rate or rarity.

### Validation

```powershell
npm run typecheck
npm run lint
npm test
npm run build
node tests/integration.mjs
```

Integration tests require an initialized database, a production build, and **port 3101 available**. Tests use a temporary database copy, clear users only in that copy, start a separate production server, and remove the copy afterward. Your personal database remains unchanged.

Validated: TypeScript, warning-free ESLint, production build, five unit tests, and real HTTP integration tests. Coverage includes rarity boundaries, date validation, loopback-origin compatibility, cross-origin rejection, catalog integrity, profile creation, idempotent unlocks, showcase constraints, restart persistence, and revoke/count updates. Desktop and 390px mobile layouts were manually inspected.

### Scope and limitations

This app is for local personal use. **It has no multi-user authentication and must not be exposed directly to the public Internet.** Publishing source to GitHub is not a hosted deployment. A Node.js server and SQLite are required; static-only GitHub Pages cannot run this application directly.

Achievements are self-reported. **Review workflows, evidence uploads, and AI verification are not implemented.** OAuth, friends, leaderboards, social features, payments, mobile apps, and third-party synchronization are outside this MVP. Achievements are optional experiences, not a universal life checklist.

## 项目结构 / Project structure

```text
prisma/
  schema.prisma                # 数据模型 / Database schema
  seed.ts                      # 幂等初始化 / Idempotent seeding
src/app/
  [[...slug]]/page.tsx          # 页面入口 / Page entry points
  api/state/route.ts           # 读取与写入 / Read and mutation API
  globals.css                  # 主题及布局 / Theme and responsive styles
src/components/
  experience.tsx               # 页面与交互 / Pages and interactions
  badge.tsx                    # 徽章 / Badge component
  modal.tsx                    # 弹窗 / Native dialog component
src/lib/
  catalog.ts                   # 60 个成就 / Achievement definitions
  db.ts                        # Prisma 单例 / Prisma singleton
  data.ts                      # 数据聚合 / Data aggregation
  rules.ts                     # 稀有度和日期 / Rarity and date rules
  origin.ts                    # 来源校验 / Origin validation
tests/
  rules.test.ts                # 规则测试 / Rule tests
  origin.test.ts               # 来源测试 / Origin tests
  integration.mjs              # 真实接口测试 / HTTP integration tests
.env.example                   # 配置模板 / Configuration template
pnpm-lock.yaml                 # 锁定依赖 / Dependency lockfile
```
