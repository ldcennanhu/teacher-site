# 孤登塔客语文馆

这是一个面向高中语文教学的个人资料网站，适合老师整理资料，也适合学生日常查阅。网站采用纯静态 HTML + CSS + JavaScript，不需要数据库，不需要登录系统，可以免费部署到 GitHub + Vercel。

网站目前支持：

- 首页栏目导航
- 作文、文言文、诗词、现代文阅读、名著、备课资源栏目页
- Markdown 写资料，自动生成 HTML 文章页
- 栏目页自动显示本栏目文章
- 标签筛选
- 站内搜索
- 首页“最新更新”
- 手机端适配
- 文章打印样式

## 网站目录结构

```text
teacher-site/
  index.html                 首页
  zuowen.html                作文专区
  wenyan.html                文言文研习
  shici.html                 诗词曲赋
  yuedu.html                 现代文阅读
  mingzhu.html               名著导读
  beike.html                 备课资源
  about.html                 关于师者
  search.html                站内搜索
  css/styles.css             全站样式
  js/search.js               搜索功能
  js/articles.js             栏目文章列表与标签筛选
  data/search-index.json     搜索索引
  data/articles.json         文章索引
  data/*-data.js             本地直接打开网页时的备用索引
  content/                   Markdown 原始资料
  articles/                  自动生成的 HTML 文章
  scripts/build-articles.js  文章生成脚本
  vercel.json                Vercel 部署配置
```

## 如何本地预览网站

最简单方式：

1. 打开项目文件夹。
2. 双击 `index.html`。
3. 浏览器会打开网站首页。

如果搜索或文章列表没有显示，请先运行一次生成脚本：

```bash
npm run build
```

如果电脑提示没有 `npm`，可以先安装 Node.js，或者运行：

```bash
node scripts/build-articles.js
```

## 如何新增 Markdown 文章

先判断文章属于哪个栏目，再放到对应文件夹：

```text
content/zuowen/    作文专区
content/wenyan/    文言文研习
content/shici/     诗词曲赋
content/yuedu/     现代文阅读
content/mingzhu/   名著导读
content/beike/     备课资源
```

文件名建议使用拼音或英文，例如：

```text
content/zuowen/xin-qingnian.md
```

## Markdown 格式怎么写

每篇文章顶部都要写 front matter：

```markdown
---
title: 青年成长类作文素材
category: 作文专区
section: zuowen
tags: [青年, 成长, 奋斗]
date: 2026-05-17
summary: 适用于成长、突破、时代青年等作文主题。
---

# 青年成长类作文素材

正文内容写在这里。
```

`section` 必须填写下面其中一个：

- `zuowen`
- `wenyan`
- `shici`
- `yuedu`
- `mingzhu`
- `beike`

## 如何生成文章页

在项目根目录运行：

```bash
npm run build
```

这个命令会自动完成：

1. 把 `content/` 里的 Markdown 生成到 `articles/`。
2. 更新 `data/articles.json`，让栏目页和首页“最新更新”显示新文章。
3. 更新 `data/search-index.json`，让搜索页能搜到新文章。
4. 更新 `data/articles-data.js` 和 `data/search-index-data.js`，保证本地双击网页时也能读取索引。

## 如何更新搜索索引

新增、修改、删除 Markdown 后，只需要运行：

```bash
npm run build
```

然后打开 `search.html` 搜索标题、栏目、摘要或标签即可。

## 如何修改首页栏目文字

打开：

```text
index.html
```

找到栏目卡片区域，修改对应的标题、简介和标签文字即可。只改文字时，不需要运行构建脚本。

## 如何修改网站颜色和站名

网站颜色在：

```text
css/styles.css
```

顶部 `:root` 里可以修改主色：

```css
--bg: #f9f5ee;
--qing: #5a7085;
--orange: #d48a6a;
```

网站站名一般在各页面的：

```html
孤登塔客语文馆
```

如果要全站统一改名，可以用编辑器的“查找替换”功能。

## 如何推送到 GitHub

如果使用 GitHub Desktop：

1. 打开 GitHub Desktop。
2. 选择 `teacher-site` 仓库。
3. 在左下角 Summary 写一句更新说明，例如“更新语文资料”。
4. 点击 `Commit to main`。
5. 点击 `Push origin`。

如果使用 GitHub 网页：

1. 打开仓库 `ldcennanhu/teacher-site`。
2. 点击 `Add file`。
3. 上传修改后的文件。
4. 点击 `Commit changes`。

## 如何连接 Vercel 自动部署

1. 打开 Vercel。
2. 选择从 GitHub 导入 `ldcennanhu/teacher-site`。
3. Framework Preset 选择 `Other`。
4. Build Command 使用：

```bash
node scripts/build-articles.js
```

5. Output Directory 保持：

```text
.
```

项目中已经有 `vercel.json`，Vercel 会按这个配置构建静态网站。

以后只要推送到 GitHub，Vercel 会自动重新部署。

## 常见问题排查

### 搜索索引加载失败

先运行：

```bash
npm run build
```

如果是本地双击打开网页，本项目已经提供 `data/search-index-data.js` 作为备用索引。仍然失败时，检查 `data/search-index.json` 和 `data/search-index-data.js` 是否存在。

### 文章索引加载失败

先运行：

```bash
npm run build
```

然后检查：

```text
data/articles.json
data/articles-data.js
```

是否已经生成。

### 栏目页没有出现新文章

检查 Markdown 顶部的 `section` 是否写对。例如作文专区必须是：

```yaml
section: zuowen
```

### Vercel 没有更新

检查 GitHub 是否已经提交并推送成功。Vercel 只会部署 GitHub 仓库里的最新内容。

### 页面文字变乱码

确认文件使用 UTF-8 编码保存。不要用会自动改编码的旧版文本编辑器。

## 新增一篇资料的完整流程

1. 在 `content/` 对应栏目中新建 Markdown 文件。
2. 写好 front matter 和正文。
3. 运行 `npm run build`。
4. 打开栏目页检查文章是否出现。
5. 打开 `search.html` 搜索文章标题或标签。
6. 提交并推送到 GitHub。
7. 等 Vercel 自动部署完成。
