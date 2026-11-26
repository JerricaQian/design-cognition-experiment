"use strict";

(() => {
  const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const selectors = "#taskReview, #ideaInput, #hcInitial, #hcDirection, #hcInstruction, #hcJudgment";
  let active = null;
  const icon = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10v2a7 7 0 0 0 14 0v-2M12 19v3M8 22h8"/></svg>';
  const status = document.createElement("span");
  status.className = "sr-only";
  status.setAttribute("role", "status");
  document.body.append(status);
  function stop() { if (active) active.recognition.stop(); }
  function start(field, button) {
    if (active?.field === field) { stop(); return; }
    if (active) { stop(); toast("请先停止当前语音输入，再切换输入框。"); return; }
    if (field.disabled || field.readOnly) return;
    if (!Recognition) { toast("当前浏览器不支持语音转文字，请使用支持该功能的 Chrome 或 Safari，或手动输入。"); return; }
    const recognition = new Recognition();
    recognition.lang = "zh-CN";
    recognition.continuous = true;
    recognition.interimResults = true;
    const session = { recognition, field, button, base: field.value, readOnly: field.readOnly };
    active = session;
    field.readOnly = true;
    button.classList.add("is-listening");
    button.setAttribute("aria-pressed", "true");
    button.setAttribute("aria-label", "停止语音输入");
    button.title = "正在语音输入，点击停止";
    status.textContent = "正在语音输入，点击麦克风停止。";
    recognition.onresult = event => {
      if (active !== session || !field.isConnected || !field.getClientRects().length || field.disabled) { recognition.stop(); return; }
      let transcript = "";
      for (let i = 0; i < event.results.length; i++) transcript += event.results[i][0].transcript;
      field.value = session.base + (session.base && transcript ? "\n" : "") + transcript;
      field.dispatchEvent(new Event("input", { bubbles: true }));
    };
    const cleanup = () => {
      if (active !== session) return;
      active = null;
      field.readOnly = session.readOnly;
      button.classList.remove("is-listening");
      button.setAttribute("aria-pressed", "false");
      button.setAttribute("aria-label", "语音输入");
      button.title = "语音输入（普通话）";
      status.textContent = "语音输入已停止，可以继续编辑文字。";
    };
    recognition.onend = cleanup;
    recognition.onerror = event => {
      const messages = { "not-allowed": "麦克风权限未开启，请在浏览器的网站权限中允许麦克风。", "service-not-allowed": "浏览器的语音识别服务不可用，请手动输入。", "audio-capture": "未检测到可用的麦克风。", "network": "语音识别服务连接失败，请检查网络或手动输入。", "no-speech": "未识别到语音，请点击麦克风重试。" };
      if (event.error !== "aborted") toast(messages[event.error] || "语音识别中断，请重试或手动输入。");
      cleanup();
    };
    try { recognition.start(); } catch { cleanup(); toast("无法启动语音输入，请重试。"); }
  }
  function attach() {
    document.querySelectorAll(selectors).forEach(field => {
      if (field.parentElement.classList.contains("voice-field")) return;
      const wrapper = document.createElement("div");
      wrapper.className = "voice-field";
      field.before(wrapper);
      wrapper.append(field);
      const button = document.createElement("button");
      button.type = "button";
      button.className = "voice-button";
      button.innerHTML = icon;
      button.title = "语音输入（普通话）";
      button.setAttribute("aria-label", "语音输入");
      button.setAttribute("aria-pressed", "false");
      button.setAttribute("aria-controls", field.id);
      button.addEventListener("click", () => start(field, button));
      wrapper.append(button);
    });
    document.querySelectorAll(".voice-field").forEach(wrapper => {
      const disabled = wrapper.querySelector("textarea").disabled;
      const button = wrapper.querySelector("button");
      if (button.disabled !== disabled) button.disabled = disabled;
    });
    if (active && (!active.field.isConnected || !active.field.getClientRects().length || active.field.disabled)) stop();
  }
  // HC/AC rebuild their input controls whenever the collaboration step changes.
  new MutationObserver(attach).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["disabled", "class"] });
  document.addEventListener("visibilitychange", () => { if (document.hidden) stop(); });
  window.addEventListener("pagehide", stop);
  attach();
})();
