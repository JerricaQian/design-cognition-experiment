"use strict";

const hcSessions = new Map();
const hcPanel = document.createElement("section");
hcPanel.id = "hcPanel";
$("#aiCard").append(hcPanel);

function hcSession() {
  const key = `${state.participantId}:${state.taskIndex}`;
  if (!hcSessions.has(key)) hcSessions.set(key, { step: 1, stepSeconds: 30, initial: "", direction: "", instruction: "", judgment: "", pending: false, error: "" });
  return hcSessions.get(key);
}
function hcRecord(kind, content, task = currentTask(), taskIndex = state.taskIndex) {
  state.chats.push({ participantId: state.participantId, taskIndex, mode: task.condition, stage: task.name, timestamp: new Date().toISOString(), role: "user", kind, content });
}
function renderHc() {
  const session = hcSession();
  const isAc = currentTask().condition === "AC";
  const enabled = state.phase === "thinking";
  els.aiLauncher.classList.remove("is-hidden");
  els.aiStatus.textContent = `步骤 ${session.step} / 3`;
  els.aiDescription.textContent = "";
  renderChat();
  const field = (id, label, value) => `<label for="${id}">${label}</label><textarea id="${id}" rows="3" ${!enabled || session.pending ? "disabled" : ""}>${escapeHtml(value)}</textarea>`;
  let content;
  if (session.step === 1) content = `<h3>阶段 1：初步独立思考</h3><p>请先独立思考：根据你目前的理解，写下你认为值得关注的问题。</p><p>建议思考时间：30 秒。</p>${field("hcInitial", "初步理解或判断", session.initial)}<button class="button button-primary" id="hcSubmit" ${!enabled ? "disabled" : ""}>提交初步想法</button>`;
  else if (session.step === 2) content = isAc
    ? `<button class="button button-primary" id="hcSubmit" ${!enabled || session.pending ? "disabled" : ""}>${session.pending ? "等待 AI 回应…" : "重试 AI 回应"}</button>`
    : `<h3>阶段 2：用户决定协作方向</h3><p class="hc-initial">${escapeHtml(session.initial)}</p>${field("hcDirection", "问题 1：你希望下一步探索什么？", session.direction)}${field("hcInstruction", "问题 2：你希望 AI 具体完成什么？", session.instruction)}<button class="button button-primary" id="hcSubmit" ${!enabled || session.pending ? "disabled" : ""}>${session.pending ? "等待 AI 回应…" : "提交指令"}</button>`;
  else content = `<h3>阶段 3：后续独立思考</h3><p>请再次独立思考：结合你最初的想法和 AI 的回应，你现在如何理解这个问题？请写下你的判断。</p><p>建议思考时间：60 秒。</p>${field("hcJudgment", "你的判断", session.judgment)}<button class="button button-primary" id="hcSubmit" ${!enabled ? "disabled" : ""}>保存判断</button>`;
  hcPanel.innerHTML = (session.step !== 2 ? `<output id="hcStepTimer" aria-label="当前步骤剩余时间">${formatTime(session.stepSeconds)}</output>` : "") + content + `<p role="status">${escapeHtml(session.error)}</p>`;
  const fields = { hcInitial: "initial", hcDirection: "direction", hcInstruction: "instruction", hcJudgment: "judgment" };
  for (const [id, key] of Object.entries(fields)) $("#" + id)?.addEventListener("input", event => { session[key] = event.target.value; });
  $("#hcSubmit").addEventListener("click", submitHc);
}
async function submitHc() {
  const session = hcSession();
  if (state.phase !== "thinking" || session.pending) return;
  session.error = "";
  if (session.step === 1) {
    if (!session.initial.trim()) { session.error = "请先填写初步想法。"; renderHc(); return; }
    hcRecord("initial_thought", session.initial.trim());
    session.step = 2;
    logAnchor(`${currentTask().condition.toLowerCase()}_initial_submitted`);
    renderHc();
    if (currentTask().condition === "AC") await submitHc();
  } else if (session.step === 2) {
    if (currentTask().condition === "HC" && (!session.direction.trim() || !session.instruction.trim())) { session.error = "请填写探索方向和希望 AI 完成的任务。"; renderHc(); return; }
    const task = currentTask(), taskIndex = state.taskIndex, key = taskKey();
    session.pending = true;
    renderHc();
    try {
      if (!aiApiUrl) throw new Error("AI 服务尚未配置。");
      const content = task.condition === "AC"
        ? `初步想法：${session.initial}\n请根据当前任务和以上初步想法，自主确定下一步协作方向。请使用以下四个标题逐项给出简洁、具体的回应，每项均须有内容：\nAI对当前想法的判断：\nAI确定的下一步方向：\nAI的创造性贡献：\n给设计师的思考切入点：\n不要要求参与者先指定方向，不要生成完整最终方案。`
        : `初步想法：${session.initial}\n探索方向：${session.direction}\n希望 AI 完成的任务：${session.instruction}`;
      const response = await fetch(aiApiUrl, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ condition: task.condition, stage: task.name, stageIndex: task.stageIndex + 1, taskPrompt: task.prompt, participantInput: content }) });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || !payload.text) throw new Error(payload.error || "AI 请求失败，请重试。");
      if (task.condition === "HC") hcRecord("collaboration_instruction", content, task, taskIndex);
      state.chats.push({ participantId: state.participantId, taskIndex, mode: task.condition, stage: task.name, timestamp: new Date().toISOString(), role: "assistant", content: payload.text });
      state.aiUsedTaskIds.add(key);
      session.step = 3;
      session.stepSeconds = 60;
    } catch (error) { session.error = error.message; }
    finally { session.pending = false; if (state.taskIndex === taskIndex && currentTask().condition === task.condition) renderHc(); }
  } else {
    if (!session.judgment.trim()) { session.error = "请填写你的判断。"; renderHc(); return; }
    hcRecord("final_judgment", session.judgment.trim());
    logAnchor(`${currentTask().condition.toLowerCase()}_judgment_saved`);
    session.saved = true;
    session.error = "判断已保存。";
    renderHc();
  }
}
