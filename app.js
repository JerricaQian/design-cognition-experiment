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

const tasks = modeProfiles.flatMap((profile, modeIndex) => stages.map((stage, stageIndex) => ({
  condition: profile.condition,
  modeIndex,
  stageIndex,
  name: stage.name,
  description: stage.description,
  prompt: stage.prompt(profile),
  note: stage.note || "思考结束后，按铃示意，并准备口述说明刚才的思考过程。",
  caseHtml: stage.caseFor ? stage.caseFor(profile) : "",
  ai: profile.ai
})));

const state = { participantId: "", taskIndex: 0, phase: "ready", seconds: 90, timerId: null, anchors: [], chats: [], aiUsedTaskIds: new Set() };
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
  els.stepper.innerHTML = modeProfiles.map((profile, index) => `<li class="${index === currentMode ? "active" : index < currentMode ? "done" : ""}"><span>${String(index + 1).padStart(2, "0")}</span><span>${profile.condition}</span></li>`).join("");
  els.progress.style.width = `${((currentMode + 1) / modeProfiles.length) * 100}%`;
}
function escapeHtml(value) { const node = document.createElement("div"); node.textContent = value; return node.innerHTML; }
function renderChat() {
  const messages = state.chats.filter((item) => item.taskIndex === state.taskIndex);
  els.chatHistory.innerHTML = messages.length
    ? messages.map((message) => `<div class="chat-message ${message.role}"><span class="chat-role">${message.role === "user" ? "参与者" : "AI · DEMO"}</span>${escapeHtml(message.content)}</div>`).join("")
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
    els.aiFootnote.textContent = "API 尚未接入 · 入口已预留";
  } else {
    els.aiStatus.className = "ai-status ready";
    els.aiStatus.textContent = "本任务可用 1 次";
    els.aiDescription.textContent = "围绕当前任务与初步想法输入一次消息。该机会仅在本任务的 90 秒思考时间内有效。";
    els.aiFootnote.textContent = "API 尚未接入 · 发送会记录为 Demo 对话";
  }
}
function renderTask() {
  const task = currentTask();
  state.seconds = 90;
  window.clearInterval(state.timerId);
  els.condition.textContent = `MODE / ${task.condition} · STAGE ${String(task.stageIndex + 1).padStart(2, "0")}`;
  els.workspaceTitle.textContent = task.condition;
  closeAiDrawer();
  els.taskIndex.textContent = `${task.condition} · ${String(task.stageIndex + 1).padStart(2, "0")} / ${String(stages.length).padStart(2, "0")}`;
  els.taskTitle.textContent = task.name;
  els.taskDescription.textContent = task.description;
  els.taskPrompt.textContent = task.prompt;
  els.caseContent.innerHTML = task.caseHtml;
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
  logAnchor(timedOut ? "time_up" : "thinking_ended");
  els.taskStatus.textContent = "已完成";
  els.taskStatus.className = "status-badge done";
  els.thinking.textContent = "本项已完成";
  els.thinking.disabled = true;
  els.next.disabled = false;
  els.taskNote.textContent = "已记录完成时间。请向实验员口述回顾思考过程，然后继续下一阶段。";
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
    els.taskNote.textContent = "正在计时。完成时按铃，或等待计时结束。";
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
  Object.assign(state, { participantId: "", taskIndex: 0, phase: "ready", seconds: 90, timerId: null, anchors: [], chats: [], aiUsedTaskIds: new Set() });
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
  if (state.taskIndex === tasks.length - 1) { completeExperiment(); return; }
  state.taskIndex += 1;
  state.phase = "briefing";
  renderTask();
}

els.form.addEventListener("submit", startExperiment);
els.thinking.addEventListener("click", startThinking);
els.next.addEventListener("click", nextTask);
els.restScreen.addEventListener("click", endRest);
els.sendAi.addEventListener("click", sendAiMessage);
els.aiLauncher.addEventListener("click", openAiDrawer);
els.closeAiDrawer.addEventListener("click", closeAiDrawer);
els.drawerBackdrop.addEventListener("click", closeAiDrawer);
els.ideaInput.addEventListener("keydown", (event) => { if ((event.metaKey || event.ctrlKey) && event.key === "Enter") sendAiMessage(); });
document.addEventListener("keydown", (event) => { if (event.key === "Escape") closeAiDrawer(); });
$("#helpButton").addEventListener("click", () => els.helpDialog.showModal());
$("#closeHelp").addEventListener("click", () => els.helpDialog.close());
