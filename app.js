"use strict";

const aiApiUrl = String(window.FIELDWORK_CONFIG?.aiApiUrl || "").trim();

const keepCase = `
  <p>Keep 是一款健身指导应用软件，可以记录训练进程，并根据不同人的情况制定具有针对性的健身减肥计划。用户可以及时查看自身的身体变化。</p>
  <p><strong>主要功能</strong></p>
  <ul>
    <li>多种健身训练供你选择：训练计划针对不同人群、器械和阶段目标组合编排，适用广泛健身场景。</li>
    <li>真人同步训练记录训练进度：全程语音督导，自动同步进度，不需要背动作、记组数。</li>
    <li>精准跑步记录：记录跑步路线，提供跑前热身与跑后拉伸等专业指导。</li>
    <li>用步伐丈量世界：记录跑步轨迹，制定有氧课程表，帮助用户达成跑步目标。</li>
    <li>分享健身成果：拍照记录每天的变化，分享好友相互勉励，让健身不再是孤独的坚持。</li>
  </ul>`;

const cases = {
  IC: `案例：Keep是一款健身指导应用软件，可以对训练进程进行记录，并根据不同人的情况制定具有针对性的健身减肥计划，通过该软件，你可以及时查看自身的身体变化。
主要功能：
① 多种健身训练供你选择：训练计划针对不同人群、各种器械和阶段健身目标组合编排，适用最广泛的健身场景。
② 真人同步训练记录训练进度：全程语音督导，自动同步进度，不需要背动作、记组数，跟着 Keep 马上练起来。
③ 精准跑步记录，让你的跑步更加系统：精准跑步路线记录，跑前热身与跑后拉伸，Keep 提供更加完善和专业的跑步指导。
④ 用步伐丈量世界：在 Keep 记录你的跑步轨迹，制定有氧课程表，助你更快达成你的跑步目标。
⑤ 分享健身成果，一起进步：拍照记录每一天的变化，分享好友相互勉励，在 Keep 健身不再是孤独的坚持。`,
  HC: `案例： Airbnb最初作为一种住宿共享服务开始，让用户可以租借私人住宿。随后，Airbnb推出了“体验”功能，这一功能扩展了其服务范围，从单纯的住宿共享转变为提供独特的本地体验和活动。
本地化体验：Airbnb的体验功能允许当地人创建并提供独特的活动和体验，让游客能够以一种全新的方式探索目的地。
多样性：从城市徒步游、烹饪课程到冒险活动，体验的种类多样，满足不同游客的兴趣和需求。
用户友好的界面：通过简洁直观的设计，用户可以轻松浏览和预订体验。
社交互动：这一功能鼓励游客与当地人和其他旅行者进行互动，增强了旅行的社交元素。
质量保证：Airbnb对体验提供者进行筛选，确保提供的体验质量和安全性。
可持续性和支持当地经济：通过支持当地小型企业和个人，这一服务模式有助于促进目的地的可持续发展。`,
  AC: `案例：潮汐是一款支持睡眠、冥想、专注与放松的身心健康应用，通过自然声音、引导练习和睡眠记录等功能，为用户提供从睡前放松、夜间记录到清晨唤醒的支持。
主要功能：
① 自然声音与助眠内容：提供海浪、雨声、森林等自然声音，以及睡眠故事和助眠冥想，用户可以选择或混合声音，营造适合自己的休息氛围。
② 冥想与呼吸引导：针对睡前、午休、减压等不同情境，提供冥想课程与呼吸练习，引导用户放松身心。
③ 睡眠监测与报告：记录夜间睡眠情况、梦话与鼾声，并以睡眠报告呈现睡眠阶段、时长和评分，帮助用户了解自己的睡眠状态。
④ 自然唤醒与小憩计时：提供自然声音唤醒、午休与小憩计时，让用户根据休息安排设置计时和唤醒方式。
⑤ 专注计时与过程回顾：提供番茄钟、倒计时等专注模式，搭配背景声音，并通过专注与冥想报告呈现练习次数和累计时长`,
  SC: `薄荷健康是一款支持饮食记录、营养查询与体重管理的健康应用，通过食物数据库、个性化饮食方案和身体数据记录，帮助用户了解日常饮食与身体变化，管理自己的健康目标。
主要功能：
① 食物热量与营养查询：提供多种食物的热量及营养素信息，帮助用户了解食物构成，为日常饮食选择提供参考。
② 饮食与运动记录：支持记录每日三餐、热量摄入和运动消耗，并对记录进行分析，帮助用户回顾日常饮食与活动情况。
③ 个性化饮食方案：根据用户的身体情况与体重管理目标，提供饮食计划和食谱，辅助用户安排日常饮食。
④ 身体变化追踪：记录体重、体脂和围度等数据，呈现一段时间内的变化，帮助用户回顾体重管理过程。
⑤ 社区交流与打卡：支持用户分享饮食记录和管理经验，参与打卡与挑战活动，与有相似目标的伙伴相互鼓励。`
};
const stages = [
  { key: "scene", name: "情境构建", description: "请根据题目构想一个场景，可以包含其中可能出现的事物、体验与感受。请先阅读完整题目，确认后再按铃开始思考。", prompt: (profile) => profile.scene },
  { key: "define", name: "问题定义", description: "根据场景，定义一类用户群体和他们的痛点需求。请先静息，确认阅读完整题目后按铃开始思考。", prompt: (profile) => `请思考____（用户）在${profile.domain}方面有____需求或痛点` },
  { key: "ideate", name: "方案构想", description: "围绕刚才确定的用户需求或痛点，构想一个可以解决问题的想法。先按铃开始思考，结束时再次按铃示意。", prompt: () => "请围绕你刚刚确定的用户需求 / 痛点，构想一个可以解决这个问题的想法" },
  { key: "analogy", name: "类比推理", description: "参照所给设计案例，基于刚刚的想法创造一个新的想法。先阅读案例与题目，确认后按铃开始。", prompt: () => "请参照以上案例，基于你刚刚的想法，创造一个新的想法", caseFor: (profile) => profile.condition === "IC" ? keepCase : "" },
  { key: "reflect", name: "反思", description: "请先静息。发布任务后按铃开始思考，结束后按铃示意，并对刚刚的思考过程进行说明。", prompt: () => "请思考你刚刚构想的想法的可行性" },
  { key: "reframe", name: "方案构想 · 重构", description: "请先静息。发布任务后先按铃再开始思考。思考结束后请按铃示意，并对刚刚的思考过程进行说明。", prompt: (profile) => `请抛弃之前的想法，依旧以____为用户，从${profile.reframeDomain}的方向重新构思一个想法`, note: "请口述刚刚的想法生成过程。" },
  { key: "synthesize", name: "合成", description: "下面会展示一个设计元素。请在 90 秒内，基于刚刚的想法加入这个新元素。先按铃开始思考，结束后按铃示意并说明过程。", prompt: (profile) => `请在你刚刚的想法中加入${profile.element}元素`, note: "请口述刚刚的想法生成过程。" }
];

const modeProfiles = [
  { condition: "IC", scene: "森林、动物、空气、声音、风景等", domain: "运动健身", reframeDomain: "疾病监控", element: "打卡", ai: false },
  { condition: "HC", scene: "工作室：布置你喜欢的桌椅和装饰物", domain: "旅行探险", reframeDomain: "睡眠健康", element: "好友圈", ai: true },
  { condition: "AC", scene: "城市公共空间：为通勤者创造一段可恢复精力的体验", domain: "日常通勤", reframeDomain: "健康习惯", element: "提醒", ai: true },
  { condition: "SC", scene: "社区夜行：让居民安心地在夜间步行和停留", domain: "社区生活", reframeDomain: "安全感知", element: "共创", ai: true }
];

const exactPrompts = {
  IC: ["题目：请根据以下关键词构想一个场景：森林、动物、空气、声音、风景等", "题目：构想一个设计方案：请思考_____（用户）在运动健身方面有______需求或痛点", "题目：请围绕你刚刚确定的用户需求/痛点 构想一个可以解决这个问题的想法", "问题：请参照以上案例，基于你刚刚的想法，创造一个新的想法。", "问题：请思考你刚刚构思的想法的可行性", "问题：请抛弃之前的想法依旧以___为用户从疾病监控的方向重新构思一个想法", "问题：请在你刚刚的想法中加入打卡元素"],
  HC: ["问题：请根据以下关键词构想一个场景：工作室、桌椅、装饰物等", "题目：请思考_____（用户）在旅行探险方面有______需求或痛点", "题目：请围绕你刚刚确定的用户需求/痛点 构想一个可以解决这个问题的想法", "问题：请参照以上案例，基于你刚刚的想法，创造一个新的想法(ChatGPT对话框中可直接粘贴此案例）。", "问题：请思考你刚刚构思的想法的可行性", "问题：请抛弃之前的想法依旧以___为用户从睡眠健康的方向重新构思一个想法", "问题：请在你刚刚的想法中加入好友圈元素"],
  AC: ["题目：请根据以下关键词构想一个场景：海边、夜晚、月光、海浪、微风等", "题目：构想一个设计方案：请思考________（用户）在睡眠与休息方面有________需求或痛点", "题目：请围绕你刚刚确定的用户需求/痛点 构想一个可以解决这个问题的想法", "问题：请参照以上案例，基于你刚刚的想法，创造一个新的想法。", "问题：请思考你刚刚构思的想法的可行性", "问题：请抛弃之前的想法依旧以___为用户从日间精力管理的方向重新构思一个设计方案。", "问题：请在你刚刚的想法中加入游戏闯关元素"],
  SC: ["题目：请根据以下关键词构想一个场景：田野、清晨、作物、泥土、阳光等。", "题目：构想一个设计方案：请思考_____（用户）在日常饮食与营养管理方面有______需求或痛点", "题目：请围绕你刚刚确定的用户需求/痛点 构想一个可以解决这个问题的想法", "问题：请参照以上案例，基于你刚刚的想法，创造一个新的想法。", "问题：请思考你刚刚构思的想法的可行性", "问题：请抛弃之前的想法依旧以___为用户从减少食物浪费的方向重新构思一个设计方案。", "问题：请在你刚刚的想法中加入积分奖励元素"]
};
const tasks = modeProfiles.flatMap((profile, modeIndex) => stages.map((stage, stageIndex) => ({
  condition: profile.condition,
  modeIndex,
  stageIndex,
  name: stageIndex === 5 ? "方案重构" : stage.name,
  description: "",
  prompt: exactPrompts[profile.condition][stageIndex],
  note: "请口述刚刚的想法生成的过程",
  caseHtml: stageIndex === 3 ? cases[profile.condition] : "",
  ai: profile.ai
})));

const state = {
  participantId: "",
  taskIndex: 0,
  phase: "ready",
  seconds: 90,
  timerId: null,
  anchors: [],
  chats: [],
  aiUsedTaskIds: new Set(),
  completedTaskIndexes: new Set(),
  modeTaskIndexes: modeProfiles.map((_, index) => index * stages.length)
};
const $ = (selector) => document.querySelector(selector);
const els = {
  intro: $("#introSection"), workspace: $("#workspace"), form: $("#participantForm"), participant: $("#participantId"), participantError: $("#participantError"), headerParticipant: $("#headerParticipant"),
  condition: $("#conditionLabel"), workspaceTitle: $("#workspaceTitle"), taskIndex: $("#taskIndex"), taskTitle: $("#taskTitle"), taskDescription: $("#taskDescription"), taskDetails: $("#taskDetails"), taskPrompt: $("#taskPrompt"), caseStudy: $("#caseStudy"), caseContent: $("#caseContent"), taskStatus: $("#taskStatus"), taskNote: $("#taskNote"),
  timer: $("#timer"), progress: $("#progressIndicator"), stepper: $("#stepper"), workLayout: $("#workLayout"), thinking: $("#thinkingButton"), next: $("#nextButton"),
  aiDescription: $("#aiDescription"), aiStatus: $("#aiStatus"), chatHistory: $("#chatHistory"), ideaInput: $("#ideaInput"), sendAi: $("#sendAi"), aiFootnote: $("#aiFootnote"), aiLauncher: $("#aiLauncher"), aiDrawer: $("#aiDrawer"), drawerBackdrop: $("#drawerBackdrop"), closeAiDrawer: $("#closeAiDrawer"),
  toast: $("#toast"), helpDialog: $("#helpDialog"), restScreen: $("#restScreen")
};

function currentTask() { return tasks[state.taskIndex]; }
function taskKey() { return `${state.taskIndex}-${currentTask().condition}`; }
function formatTime(seconds) { return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`; }
function toast(message) { els.toast.textContent = message; els.toast.classList.add("show"); window.clearTimeout(toast.timeout); toast.timeout = window.setTimeout(() => els.toast.classList.remove("show"), 2600); }

function renderSteps() {
  const currentMode = currentTask().modeIndex;
  els.stepper.innerHTML = modeProfiles.map((profile, index) => {
    const modeStart = index * stages.length;
    const modeCompleted = tasks.slice(modeStart, modeStart + stages.length).every((_, taskIndex) => state.completedTaskIndexes.has(modeStart + taskIndex));
    const stateClass = index === currentMode ? "active" : modeCompleted ? "done" : "";
    return `<button class="mode-tab ${stateClass}" type="button" role="tab" aria-selected="${index === currentMode}" aria-controls="taskPanel" data-mode-index="${index}"><span>${String(index + 1).padStart(2, "0")}</span><span>${profile.condition}</span></button>`;
  }).join("");
  els.progress.style.width = `${((currentMode + 1) / modeProfiles.length) * 100}%`;
}
function escapeHtml(value) { const node = document.createElement("div"); node.textContent = value; return node.innerHTML; }
function renderChat() {
  const messages = state.chats.filter((item) => item.taskIndex === state.taskIndex);
  els.chatHistory.innerHTML = messages.length
    ? messages.map((message) => `<div class="chat-message ${message.role}"><span class="chat-role">${message.role === "user" ? "参与者" : "AI"}</span>${escapeHtml(message.content)}</div>`).join("")
    : '<div class="chat-empty">此处会保留本任务的协作记录。</div>';
  els.chatHistory.scrollTop = els.chatHistory.scrollHeight;
}
function canUseAi() { return currentTask().ai && state.phase === "thinking" && !state.aiUsedTaskIds.has(taskKey()); }
function closeAiDrawer() {
  els.aiDrawer.classList.add("is-hidden");
  els.drawerBackdrop.classList.add("is-hidden");
  els.aiDrawer.setAttribute("aria-hidden", "true");
  els.aiLauncher.setAttribute("aria-expanded", "false");
}
function openAiDrawer() {
  if (!currentTask().ai) return;
  els.aiDrawer.classList.remove("is-hidden");
  els.drawerBackdrop.classList.remove("is-hidden");
  els.aiDrawer.setAttribute("aria-hidden", "false");
  els.aiLauncher.setAttribute("aria-expanded", "true");
  els.aiDrawer.focus();
}
function renderAiState() {
  const task = currentTask();
  const used = state.aiUsedTaskIds.has(taskKey());
  const enabled = canUseAi();
  els.aiLauncher.classList.toggle("is-hidden", !task.ai);
  if (!task.ai) closeAiDrawer();
  els.ideaInput.disabled = !enabled;
  els.sendAi.disabled = !enabled;
  els.ideaInput.value = "";
  if (!task.ai) {
    els.aiStatus.className = "ai-status";
    els.aiStatus.textContent = "IC 不开放";
    els.aiDescription.textContent = "IC 为独立构想模式。本任务不启用 AI 协作。";
    els.aiFootnote.textContent = "此条件不开放 AI 对话";
  } else if (used) {
    els.aiStatus.className = "ai-status used";
    els.aiStatus.textContent = "本任务已使用";
    els.aiDescription.textContent = "本任务的 AI 协作机会已用完；你仍可继续完成思考。";
    els.aiFootnote.textContent = "对话记录将在实验结束时一并导出";
  } else if (state.phase !== "thinking") {
    els.aiStatus.className = "ai-status";
    els.aiStatus.textContent = "等待思考开始";
    els.aiDescription.textContent = "本任务有一次协作机会。按铃开始思考后，可在 90 秒内直接输入。";
    els.aiFootnote.textContent = aiApiUrl ? "开始思考后可使用本阶段唯一一次 AI 协作。" : "AI 服务尚未配置。";
  } else {
    els.aiStatus.className = "ai-status ready";
    els.aiStatus.textContent = "本任务可用 1 次";
    els.aiDescription.textContent = "围绕当前任务与初步想法输入一次消息。该机会仅在本任务的 90 秒思考时间内有效。";
    els.aiFootnote.textContent = aiApiUrl ? "本阶段仅可发送一次；对话记录将在实验结束时一并导出。" : "AI 服务尚未配置。";
  }
}
function renderTask() {
  const task = currentTask();
  $("#taskPanel").classList.remove("is-resting");
  state.modeTaskIndexes[task.modeIndex] = state.taskIndex;
  state.seconds = 90;
  window.clearInterval(state.timerId);
  els.condition.textContent = `MODE / ${task.condition} · STAGE ${String(task.stageIndex + 1).padStart(2, "0")}`;
  els.workspaceTitle.textContent = task.condition;
  closeAiDrawer();
  els.taskIndex.textContent = `${task.condition} · ${String(task.stageIndex + 1).padStart(2, "0")} / ${String(stages.length).padStart(2, "0")}`;
  els.taskTitle.textContent = task.name;
  els.taskDescription.textContent = task.description;
  els.taskPrompt.textContent = task.prompt;
  els.caseContent.textContent = task.caseHtml;
  els.caseStudy.classList.toggle("is-hidden", !task.caseHtml);
  els.timer.value = els.timer.textContent = formatTime(state.seconds);
  const isBriefing = state.phase === "briefing";
  const isResting = state.phase === "resting";
  els.taskStatus.textContent = isBriefing ? "阅读中" : isResting ? "静息中" : "准备中";
  els.taskStatus.className = "status-badge";
  els.taskDetails.classList.toggle("is-hidden", isBriefing || isResting);
  els.restScreen.classList.toggle("is-hidden", !isResting);
  els.thinking.textContent = isBriefing ? "开始静息" : "按铃开始思考";
  els.thinking.disabled = isResting;
  els.next.disabled = true;
  els.taskNote.textContent = task.note;
  renderSteps();
  renderChat();
  renderAiState();
}
function startRest() {
  state.phase = "resting";
  $("#taskPanel").classList.add("is-resting");
  logAnchor("rest_started");
  els.taskStatus.textContent = "静息中";
  els.taskDetails.classList.add("is-hidden");
  els.restScreen.classList.remove("is-hidden");
  els.restScreen.focus();
  els.thinking.disabled = true;
}
function endRest() {
  if (state.phase !== "resting") return;
  logAnchor("rest_ended");
  state.phase = "ready";
  $("#taskPanel").classList.remove("is-resting");
  els.restScreen.classList.add("is-hidden");
  els.taskDetails.classList.remove("is-hidden");
  els.taskStatus.textContent = "准备中";
  els.thinking.disabled = false;
  els.thinking.textContent = "按铃开始思考";
  renderAiState();
}
function logAnchor(type) {
  const task = currentTask();
  state.anchors.push({ participantId: state.participantId, mode: task.condition, modeIndex: task.modeIndex + 1, stage: task.name, stageIndex: task.stageIndex + 1, type, timestamp: new Date().toISOString() });
}
function finishThinking(timedOut = false) {
  if (state.phase !== "thinking") return;
  window.clearInterval(state.timerId);
  state.phase = "complete";
  state.completedTaskIndexes.add(state.taskIndex);
  logAnchor(timedOut ? "time_up" : "thinking_ended");
  els.taskStatus.textContent = "已完成";
  els.taskStatus.className = "status-badge done";
  els.thinking.textContent = "本项已完成";
  els.thinking.disabled = true;
  els.next.disabled = false;
  renderAiState();
  toast(timedOut ? "90 秒结束，已完成后台记录" : "已完成后台记录");
}
function startThinking() {
  if (state.phase === "briefing") {
    startRest();
  } else if (state.phase === "ready") {
    state.phase = "thinking";
    logAnchor("thinking_started");
    els.taskStatus.textContent = "思考中";
    els.taskStatus.className = "status-badge active";
    els.thinking.textContent = "按铃结束思考";
    renderAiState();
    toast("已开始本项 90 秒思考");
    state.timerId = window.setInterval(() => {
      state.seconds -= 1;
      els.timer.value = els.timer.textContent = formatTime(state.seconds);
      if (state.seconds <= 0) finishThinking(true);
    }, 1000);
  } else if (state.phase === "thinking") finishThinking();
}
async function sendAiMessage() {
  const content = els.ideaInput.value.trim();
  if (!canUseAi() || !content) { if (!content && canUseAi()) toast("请先输入你的问题或初步想法"); return; }
  const task = currentTask();
  const metadata = { participantId: state.participantId, taskIndex: state.taskIndex, mode: task.condition, stage: task.name, timestamp: new Date().toISOString() };
  if (!aiApiUrl) { toast("AI 服务尚未配置，请联系实验管理员。 "); return; }
  els.sendAi.disabled = true;
  els.sendAi.textContent = "发送中…";
  try {
    const response = await fetch(aiApiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        condition: task.condition,
        stage: task.name,
        stageIndex: task.stageIndex + 1,
        taskPrompt: task.prompt,
        participantInput: content
      })
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || !payload.text) throw new Error(payload.error || "AI 服务暂时不可用，请稍后重试。");
    state.chats.push({ ...metadata, role: "user", content });
    state.chats.push({ ...metadata, role: "assistant", content: payload.text });
    state.aiUsedTaskIds.add(taskKey());
    renderChat();
    renderAiState();
    toast("已记录本阶段唯一一次 AI 协作");
  } catch (error) {
    els.sendAi.disabled = false;
    els.sendAi.textContent = "发送";
    toast(error.message || "AI 请求失败，请稍后重试。");
  }
}
function startExperiment(event) {
  event.preventDefault();
  const id = els.participant.value.trim();
  if (!id) { els.participantError.textContent = "请输入实验编号后继续。"; els.participant.focus(); return; }
  state.participantId = id;
  els.participantError.textContent = "";
  els.headerParticipant.textContent = id;
  els.intro.classList.add("is-hidden");
  els.workspace.classList.remove("is-hidden");
  state.phase = "briefing";
  renderTask();
}
function resetToHome() {
  window.clearInterval(state.timerId);
  Object.assign(state, {
    participantId: "",
    taskIndex: 0,
    phase: "ready",
    seconds: 90,
    timerId: null,
    anchors: [],
    chats: [],
    aiUsedTaskIds: new Set(),
    completedTaskIndexes: new Set(),
    modeTaskIndexes: modeProfiles.map((_, index) => index * stages.length)
  });
  closeAiDrawer();
  els.aiLauncher.classList.add("is-hidden");
  els.headerParticipant.textContent = "未开始";
  els.participant.value = "";
  els.restScreen.classList.add("is-hidden");
  els.workspace.classList.add("is-hidden");
  els.intro.classList.remove("is-hidden");
  els.participant.focus();
}
function exportData() {
  const data = { participantId: state.participantId, exportedAt: new Date().toISOString(), modes: modeProfiles.map((profile) => profile.condition), stagesPerMode: stages.map((stage) => stage.name), timeAnchors: state.anchors, aiChatRecords: state.chats };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `fieldwork-${state.participantId || "session"}.json`;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(link.href), 0);
  toast("已导出时间锚点与 AI 对话记录");
}
function completeExperiment() {
  const anchorCount = state.anchors.length;
  const chatCount = state.chats.filter((message) => message.role === "user").length;
  closeAiDrawer();
  els.aiLauncher.classList.add("is-hidden");
  els.workspace.innerHTML = `<section class="completion"><p class="eyebrow">SESSION COMPLETE</p><h1>本次实验已完成。</h1><p>已在后台记录 ${anchorCount} 个时间锚点与 ${chatCount} 次 AI 协作。请导出数据交给实验员，随后可返回首页开始下一位被试的实验。</p><div class="completion-actions"><button class="button button-primary" id="completionExport" type="button">导出实验数据</button><button class="button button-secondary" id="returnHome" type="button">返回首页</button></div></section>`;
  $("#completionExport").addEventListener("click", exportData);
  $("#returnHome").addEventListener("click", resetToHome);
}
function nextTask() {
  if (state.phase !== "complete") return;
  if (state.completedTaskIndexes.size === tasks.length) { completeExperiment(); return; }
  const task = currentTask();
  const nextStageIndex = task.stageIndex + 1;
  state.taskIndex = nextStageIndex < stages.length
    ? task.modeIndex * stages.length + nextStageIndex
    : tasks.findIndex((_, taskIndex) => !state.completedTaskIndexes.has(taskIndex));
  state.phase = "briefing";
  renderTask();
}

function switchMode(modeIndex) {
  const currentMode = currentTask().modeIndex;
  if (modeIndex === currentMode) return;
  if (state.phase === "thinking") {
    window.clearInterval(state.timerId);
    logAnchor("mode_switched");
  }
  state.modeTaskIndexes[currentMode] = state.taskIndex;
  const modeStart = modeIndex * stages.length;
  const firstIncomplete = tasks.slice(modeStart, modeStart + stages.length)
    .findIndex((_, taskIndex) => !state.completedTaskIndexes.has(modeStart + taskIndex));
  state.taskIndex = firstIncomplete === -1 ? state.modeTaskIndexes[modeIndex] : modeStart + firstIncomplete;
  state.phase = "briefing";
  renderTask();
  toast(`已切换至 ${modeProfiles[modeIndex].condition} 模式`);
}

els.form.addEventListener("submit", startExperiment);
els.thinking.addEventListener("click", startThinking);
els.next.addEventListener("click", nextTask);
els.stepper.addEventListener("click", (event) => {
  const tab = event.target.closest("[data-mode-index]");
  if (tab) switchMode(Number(tab.dataset.modeIndex));
});
els.restScreen.addEventListener("click", endRest);
els.sendAi.addEventListener("click", sendAiMessage);
els.aiLauncher.addEventListener("click", openAiDrawer);
els.closeAiDrawer.addEventListener("click", closeAiDrawer);
els.drawerBackdrop.addEventListener("click", closeAiDrawer);
els.ideaInput.addEventListener("keydown", (event) => { if ((event.metaKey || event.ctrlKey) && event.key === "Enter") sendAiMessage(); });
document.addEventListener("keydown", (event) => { if (event.key === "Escape") closeAiDrawer(); });
$("#helpButton").addEventListener("click", () => els.helpDialog.showModal());
$("#closeHelp").addEventListener("click", () => els.helpDialog.close());
