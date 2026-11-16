# Fieldwork 实验工具

一个无需构建步骤的静态前端 demo。直接用浏览器打开 `index.html`，或从此目录启动本地静态服务：

```bash
python3 -m http.server 8080
```

然后访问 `http://localhost:8080`。

## 已实现

- 实验编号校验与任务会话。
- IC、HC、AC、SC 四种模式；每个模式包含 7 个认知阶段，共 28 个任务。
- 顶部进度仅呈现四种模式，任务卡展示当前模式内的阶段进度。
- IC 的类比推理任务内置 Keep 案例；每个模式均含情境构建、问题定义、方案构想、类比推理、反思、方案重构与合成。
- 每一任务先呈现阶段说明，再进入任务卡中的白底黑十字静息方框；点击十字或按 Enter / 空格键后，显示具体题目。
- IC 模式不呈现 AI 协作区；HC、AC、SC 通过右侧按钮打开 AI 抽屉。
- 90 秒倒计时与后台开始/结束时间锚点；结束页可导出 JSON 实验记录。
- 非 IC 条件在每个任务中各有一次内嵌 AI 协作机会；导出记录包含聊天内容。
- 响应式布局、语义化 HTML、键盘焦点和无障碍弹窗。

## GitHub Pages

推送到 `main` 后，GitHub Actions 会部署静态网页。首次部署后，在仓库 **Settings → Pages** 中将 Source 设为 **GitHub Actions**。

## 千问 API 接入

`worker/` 是 Cloudflare Worker 后端，前端的 `app.js` 仅请求其 `/api/ai` 接口。API Key 绝不能写入仓库、`config.js` 或浏览器代码。

1. 在 Cloudflare 创建 Worker 并部署 `worker/`：`npx wrangler deploy`。
2. 在 Worker 设置中添加：
   - Secret：`DASHSCOPE_API_KEY`
   - Variables：`ALLOWED_ORIGIN`、`QWEN_BASE_URL`、`QWEN_MODEL`
3. 将 `config.js` 中的 `aiApiUrl` 改为 Worker 的完整 `/api/ai` 地址后提交。

千问服务端根据 `condition` 选择 HC、AC、SC 三种固定 system prompt；浏览器无法提交或改写 system prompt。
