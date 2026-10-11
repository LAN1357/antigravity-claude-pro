/**
 * Claude Enhancer for Antigravity (Award-Winning UX & Interaction System)
 * 1. 置顶 / 项目 / 最近 侧边栏三段式结构（全部支持折叠/展开与 SPA 秒开）
 * 2. 呼吸指示灯与工具调用折叠管理（流式输出不跳动、不遮挡）
 * 3. 侧边栏导航条目与核心操作本土化与微交互增强
 * 4. 文件单机即开 + 右键 Apple 级原质毛玻璃上下文菜单
 * 5. 全局零延迟按压反馈 (Pointer-Down Tactile Spring Response)
 */
(function() {
  const DAILY_SECTION_ID = '3f37f9eb-e69b-4496-b230-dd157ff2f379';
  const CACHE_KEY = '__claude_recent_conversations_cache';
  const COLLAPSED_KEY = '__claude_recent_collapsed';

  // 清除旧药丸栏残留
  const oldBar = document.getElementById('claude-projects-pills-bar');
  if (oldBar) oldBar.remove();

  // 清除旧定时器
  if (window.__claude_enhancer_interval) {
    clearInterval(window.__claude_enhancer_interval);
    window.__claude_enhancer_interval = null;
  }

  // 清除旧文件交互监听器与上下文菜单残留
  if (window.__claude_file_handlers_cleanup) {
    window.__claude_file_handlers_cleanup();
    window.__claude_file_handlers_cleanup = null;
  }

  // 1. 获取路由器实例
  function getRouter() {
    return window.__antigravity_router || window.__TSR_ROUTER__ || null;
  }

  // 2. 劫持顶部全局“+ 新建对话”按钮：无刷新秒开日常工作区 + 本土化
  function hookNewChat() {
    const newChatBtn = document.querySelector('[data-testid="new-conversation-button"]');
    if (newChatBtn) {
      const span = newChatBtn.querySelector('span.truncate');
      if (span && span.textContent.trim() === 'New Conversation') {
        span.textContent = '新建对话';
      }

      if (!newChatBtn.dataset.hookedDailySpa) {
        newChatBtn.dataset.hookedDailySpa = 'true';
        newChatBtn.setAttribute('href', `/?section=${DAILY_SECTION_ID}`);
        newChatBtn.addEventListener('click', (e) => {
          if (!e.metaKey && !e.ctrlKey && !e.shiftKey) {
            e.preventDefault();
            e.stopPropagation();
            const router = getRouter();
            if (router && typeof router.navigate === 'function') {
              router.navigate({ to: '/', search: { section: DAILY_SECTION_ID } });
            } else {
              window.location.href = `/?section=${DAILY_SECTION_ID}`;
            }
          }
        }, true);
      }
    }
  }

  // 3. 导航项与分组标题全量本土化与细节打磨
  function refineNavigationAndHeaders() {
    // 侧边栏快捷功能按钮汉化（遍历匹配，绝对可靠）
    document.querySelectorAll('a, button').forEach(el => {
      const text = el.textContent.trim();
      if (text.includes('Conversation History')) {
        el.querySelectorAll('span, div').forEach(s => {
          if (s.children.length === 0 && s.textContent.trim() === 'Conversation History') s.textContent = '会话历史';
        });
      } else if (text.includes('Automations')) {
        el.querySelectorAll('span, div').forEach(s => {
          if (s.children.length === 0 && s.textContent.trim() === 'Automations') s.textContent = '自动化';
        });
      } else if (text.includes('Customizations')) {
        el.querySelectorAll('span, div').forEach(s => {
          if (s.children.length === 0 && s.textContent.trim() === 'Customizations') s.textContent = '扩展与技能';
        });
      } else if (text.includes('Settings')) {
        el.querySelectorAll('span, div').forEach(s => {
          if (s.children.length === 0 && s.textContent.trim() === 'Settings') s.textContent = '系统设置';
        });
      }
    });

    // 针对 TreeWalker 全局兜底汉化微文本
    try {
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
        acceptNode: function(node) {
          const p = node.parentElement;
          if (!p || p.tagName === 'SCRIPT' || p.tagName === 'STYLE' || p.tagName === 'HEAD' || p.tagName === 'TITLE') {
            return NodeFilter.FILTER_REJECT;
          }
          return NodeFilter.FILTER_ACCEPT;
        }
      });
      let node;
      while ((node = walker.nextNode())) {
        const val = node.nodeValue?.trim();
        if (val === 'Customizations') {
          node.nodeValue = '扩展与技能';
        } else if (val === 'Conversation History') {
          node.nodeValue = '会话历史';
        } else if (val === 'Automations') {
          node.nodeValue = '自动化';
        } else if (val === 'Settings') {
          node.nodeValue = '系统设置';
        }
      }
    } catch (e) {}

    // 分组标题
    const headers = document.querySelectorAll('[data-testid="section-header"]');
    headers.forEach(h => {
      const title = h.getAttribute('data-title');
      const span = h.querySelector('button > span.truncate') || h.querySelector('span.truncate');
      if (span) {
        if (title === 'Pinned Conversations' || span.textContent.includes('Pinned') || span.textContent === '置顶') {
          if (span.textContent !== '置顶') span.textContent = '置顶';
        } else if (title === 'Projects' || span.textContent.includes('项目') || span.textContent === '项目') {
          if (span.textContent !== '项目') span.textContent = '项目';
        }
      }
    });
  }

  // 4. 渲染最近对话列表 (Section 3: 最近，带优雅平滑手风琴折叠)
  function renderRecents() {
    const scrollContainer = document.querySelector('.relative.w-full.h-full.overflow-y-auto') ||
                            document.querySelector('[data-testid="conversation-list-sidebar"]');
    if (!scrollContainer) return;

    let recents = window.__claude_recent_conversations;
    if (Array.isArray(recents) && recents.length > 0) {
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(recents));
      } catch (e) {}
    } else {
      try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) recents = JSON.parse(cached);
      } catch (e) {}
    }

    if (!Array.isArray(recents) || recents.length === 0) return;

    let recentSec = document.getElementById('claude-recent-section');
    if (!recentSec) {
      recentSec = document.createElement('div');
      recentSec.id = 'claude-recent-section';
      recentSec.className = 'claude-recent-section';
      scrollContainer.appendChild(recentSec);
    }

    if (recentSec.dataset.hookedVersion !== '3') {
      recentSec.dataset.hookedVersion = '3';
      recentSec.addEventListener('click', (e) => {
        // A. 折叠/展开
        const toggleBtn = e.target.closest('.claude-recent-toggle-btn');
        if (toggleBtn) {
          e.preventDefault();
          e.stopPropagation();
          const isCurrentlyCollapsed = recentSec.classList.contains('is-collapsed');
          const nextCollapsed = !isCurrentlyCollapsed;
          if (nextCollapsed) {
            recentSec.classList.add('is-collapsed');
            toggleBtn.setAttribute('aria-expanded', 'false');
          } else {
            recentSec.classList.remove('is-collapsed');
            toggleBtn.setAttribute('aria-expanded', 'true');
          }
          try {
            localStorage.setItem(COLLAPSED_KEY, nextCollapsed ? 'true' : 'false');
          } catch (err) {}
          return;
        }

        // B. 点击会话项：SPA 无刷新秒开
        const link = e.target.closest('.claude-recent-item');
        if (link && !e.metaKey && !e.ctrlKey && !e.shiftKey) {
          e.preventDefault();
          e.stopPropagation();
          const id = link.getAttribute('data-id');
          const router = getRouter();
          if (router && typeof router.navigate === 'function') {
            router.navigate({ to: '/c/' + id });
          } else {
            window.location.href = '/c/' + id;
          }
        }
      }, true);
    }

    const isCollapsed = localStorage.getItem(COLLAPSED_KEY) === 'true';
    if (isCollapsed) {
      if (!recentSec.classList.contains('is-collapsed')) recentSec.classList.add('is-collapsed');
    } else {
      if (recentSec.classList.contains('is-collapsed')) recentSec.classList.remove('is-collapsed');
    }

    const currentPath = window.location.pathname;
    const currentId = currentPath.startsWith('/c/') ? currentPath.split('/c/')[1]?.split('?')[0] : '';

    const listHtml = recents.map(item => {
      const isActive = item.id === currentId;
      const safeTitle = (item.title || '新对话')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
      return `<a class="claude-recent-item ${isActive ? 'active' : ''}" data-id="${item.id}" href="/c/${item.id}" title="${safeTitle}">${safeTitle}</a>`;
    }).join('');

    const newHtml = `
      <div class="claude-recent-header">
        <button type="button" class="claude-recent-toggle-btn" aria-expanded="${!isCollapsed}">
          <span class="truncate">最近</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 -960 960 960" fill="currentColor" class="claude-recent-chevron">
            <path d="M517.85-480l-184-184L376-706.15L602.15-480L376-253.85L333.85-296l184-184Z"></path>
          </svg>
        </button>
      </div>
      <div class="claude-recent-list">
        ${listHtml}
      </div>
    `;

    if (recentSec.dataset.lastHtml !== newHtml) {
      recentSec.innerHTML = newHtml;
      recentSec.dataset.lastHtml = newHtml;
    } else {
      recentSec.querySelectorAll('.claude-recent-item').forEach(link => {
        const id = link.getAttribute('data-id');
        if (id === currentId) {
          if (!link.classList.contains('active')) link.classList.add('active');
        } else {
          if (link.classList.contains('active')) link.classList.remove('active');
        }
      });
    }
  }

  // 5. 隐藏非必要推广元素
  function hidePromoButtons() {
    const btns = document.querySelectorAll('button');
    btns.forEach(b => {
      if (b.textContent.trim() === '安装 IDE') {
        b.style.display = 'none';
      }
    });
  }

  // 6. 统一思考与工具调用抽屉控制器
  if (!window.__claude_thought_events_bound) {
    window.__claude_thought_events_bound = true;

    document.addEventListener('click', (e) => {
      // 复制原始命令
      const copyBtn = e.target.closest('.claude-btn-copy');
      if (copyBtn) {
        e.preventDefault();
        e.stopPropagation();
        const cmd = copyBtn.getAttribute('data-cmd');
        if (cmd && navigator.clipboard) {
          navigator.clipboard.writeText(cmd).then(() => {
            copyBtn.textContent = '已复制';
            setTimeout(() => { copyBtn.textContent = '复制'; }, 1500);
          }).catch(() => {});
        }
        return;
      }

      // 展开/收起原始完整命令
      const expandBtn = e.target.closest('.claude-btn-expand');
      if (expandBtn) {
        e.preventDefault();
        e.stopPropagation();
        const drawer = expandBtn.closest('[data-testid="run-command-step"]')?.querySelector('.claude-cmd-drawer');
        if (drawer) {
          const isHidden = drawer.style.display === 'none';
          drawer.style.display = isHidden ? 'block' : 'none';
          expandBtn.textContent = isHidden ? '收起' : '展开';
        }
        return;
      }

      // 用户手动点击主栏展开/折叠
      const triggerBtn = e.target.closest('button[data-testid="tool-group-collapsible"], button[data-testid="thinking-collapsible-trigger"], button[data-testid="worked-for-collapsible"]');
      if (triggerBtn) {
        const wasExpanded = triggerBtn.getAttribute('aria-expanded') === 'true';
        if (!wasExpanded) {
          triggerBtn.dataset.claudeUserOpened = 'true';
          delete triggerBtn.dataset.claudeUserClosed;
        } else {
          delete triggerBtn.dataset.claudeUserOpened;
          triggerBtn.dataset.claudeUserClosed = 'true';
        }
      }
    }, true);
  }

  // 汉化词典映射
  function translateChinese(str) {
    if (!str || typeof str !== 'string') return str;
    return str
      .replace(/Exploring (\d+) files?/gi, '探索 $1 个文件')
      .replace(/Explored (\d+) files?/gi, '已探索 $1 个文件')
      .replace(/Exploring (\d+) search(?:es)?/gi, '探索 $1 次搜索')
      .replace(/Explored (\d+) search(?:es)?/gi, '已探索 $1 次搜索')
      .replace(/(\d+)\s*tasks?\s*running/gi, '$1 个任务正在执行')
      .replace(/^1 task running/gi, '1 个任务正在执行')
      .replace(/(\d+)\s*tasks?/gi, '$1 个任务')
      .replace(/running (\d+) commands?/gi, '运行 $1 条命令')
      .replace(/ran (\d+) commands?/gi, '已运行 $1 条命令')
      .replace(/Worked for (\d+)m\s*(\d+)s/gi, '耗时 $1 分 $2 秒')
      .replace(/Worked for (\d+)m/gi, '耗时 $1 分钟')
      .replace(/Worked for (\d+)s/gi, '耗时 $1 秒')
      .replace(/Thought for (\d+)m\s*(\d+)s/gi, '思考 $1 分 $2 秒')
      .replace(/Thought for (\d+)m/gi, '思考 $1 分钟')
      .replace(/Thought for (\d+)s/gi, '思考 $1 秒')
      .replace(/^Thinking\.*/gi, '思考中...')
      .replace(/^Running\.*/gi, '执行中...')
      .replace(/^Working\.*/gi, '执行中...')
      .replace(/^Searching\s+(.+)$/gi, '正在搜索 $1')
      .replace(/^Searched\s+(.+)$/gi, '已搜索 $1')
      .replace(/^Edited/gi, '已编辑')
      .replace(/^Load older messages$/gi, '加载更早消息');
  }

  function processThoughtAndToolDocks() {
    const turns = document.querySelectorAll('div.group.w-full.scroll-mt-4');

    turns.forEach((turn) => {
      const triggers = turn.querySelectorAll('button[data-testid="tool-group-collapsible"], button[data-testid="thinking-collapsible-trigger"], button[data-testid="worked-for-collapsible"]');

      triggers.forEach((btn) => {
        // 如果是原生 hidden 的元素，直接跳过处理
        if (btn.classList.contains('hidden')) return;

        // (1) 标题文本汉化
        const span = btn.querySelector('span');
        if (span && span.textContent) {
          const translated = translateChinese(span.textContent.trim());
          if (span.textContent !== translated) {
            span.textContent = translated;
          }
        }
        if (btn.hasAttribute('title')) {
          btn.setAttribute('title', translateChinese(btn.getAttribute('title')));
        }
        if (btn.hasAttribute('aria-label')) {
          btn.setAttribute('aria-label', translateChinese(btn.getAttribute('aria-label')));
        }

        // (2) 呼吸指示灯管理
        const isRunning = /思考中|执行中|Running|Thinking|Working/i.test(btn.textContent || '');
        let pulseDot = btn.querySelector('.claude-pulse-dot');
        if (isRunning) {
          if (!pulseDot) {
            pulseDot = document.createElement('span');
            pulseDot.className = 'claude-pulse-dot';
            btn.prepend(pulseDot);
          }
        } else if (pulseDot) {
          pulseDot.remove();
        }

        // (3) 默认折叠：非用户手动展开时，保持折叠
        const isExpanded = btn.getAttribute('aria-expanded') === 'true';
        if (isExpanded && btn.dataset.claudeUserOpened !== 'true') {
          btn.click();
          btn.dataset.claudeAutoCollapsed = 'true';
        }

        // (4) 异常/权限确认介入提醒
        const parentRelative = btn.parentElement;
        const scrollContainer = parentRelative?.querySelector('div.overflow-y-auto');

        if (scrollContainer) {
          const hasDestructive = !!scrollContainer.querySelector('.text-destructive, .text-danger, .text-red-500, [data-testid*="error"], [data-testid*="fail"], [data-status="error"]');
          const permBtn = Array.from(scrollContainer.querySelectorAll('button[data-testid*="allow"], button[data-testid*="approval"], button[data-testid*="permission"]'))[0];
          const termOutput = scrollContainer.querySelector('.xterm, [data-testid*="terminal"], [data-testid*="output"]');
          const hasTermError = termOutput ? /command failed|exit code [1-9]/i.test(termOutput.textContent) : false;

          if (hasDestructive || permBtn || hasTermError) {
            btn.dataset.claudeHasAlert = 'true';
            if (permBtn) btn.dataset.claudeAlertMsg = '待确认：需要权限许可后继续执行';
            else btn.dataset.claudeAlertMsg = '步骤提示：包含异常退出或未完成命令';
          } else {
            delete btn.dataset.claudeHasAlert;
            delete btn.dataset.claudeAlertMsg;
          }
        }

        const hasAlert = btn.dataset.claudeHasAlert === 'true';
        if (parentRelative) {
          let alertStrip = parentRelative.querySelector(':scope > .claude-intervention-strip');
          if (hasAlert) {
            btn.classList.add('has-intervention');
            const alertMsg = btn.dataset.claudeAlertMsg || '检测到待确认事项，点击展开查看详情';
            if (!alertStrip) {
              alertStrip = document.createElement('div');
              alertStrip.className = 'claude-intervention-strip';
              alertStrip.innerHTML = `<span class="claude-step-badge">介入提醒</span><span>${alertMsg}</span>`;
              parentRelative.appendChild(alertStrip);
            }
          } else {
            btn.classList.remove('has-intervention');
            if (alertStrip) alertStrip.remove();
          }
        }

        // (5) 展开区向上翻阅保护
        if (scrollContainer) {
          if (!scrollContainer.dataset.claudeScrollBound) {
            scrollContainer.dataset.claudeScrollBound = 'true';
            scrollContainer.addEventListener('scroll', () => {
              const distanceToBottom = scrollContainer.scrollHeight - scrollContainer.scrollTop - scrollContainer.clientHeight;
              if (distanceToBottom > 25) {
                scrollContainer.dataset.userScrolledUp = 'true';
              } else {
                delete scrollContainer.dataset.userScrolledUp;
              }
            }, { passive: true });
          }

          if (scrollContainer.dataset.userScrolledUp !== 'true') {
            scrollContainer.scrollTop = scrollContainer.scrollHeight;
          }

          // (6) 步骤单行截断与连续调用合并
          const rowDivs = Array.from(scrollContainer.querySelectorAll('div.flex.flex-col.gap-0\\.5 > div.flex.flex-row'));
          let prevSig = null;
          let prevRow = null;
          let dupCount = 1;

          rowDivs.forEach((row) => {
            const cmdStep = row.querySelector('[data-testid="run-command-step"]');
            const fileStep = row.querySelector('[data-testid="view-file-step"]');
            const thinkStep = row.querySelector('[data-testid="thinking-collapsible-trigger"]');

            let sig = '';
            let rawCmd = '';

            if (cmdStep) {
              const mono = cmdStep.querySelector('.font-mono');
              rawCmd = mono?.textContent || '';
              sig = 'cmd:' + rawCmd.trim();

              const ranSpan = cmdStep.querySelector('.text-secondary-foreground span:first-child');
              if (ranSpan && (ranSpan.textContent === 'Ran' || ranSpan.textContent === 'Run')) {
                ranSpan.className = 'claude-step-badge';
                ranSpan.textContent = '运行命令';
              }

              if (!cmdStep.querySelector('.claude-step-actions')) {
                const actionGroup = document.createElement('div');
                actionGroup.className = 'claude-step-actions';
                actionGroup.innerHTML = `
                  <button type="button" class="claude-step-btn claude-btn-copy" data-cmd="${rawCmd.replace(/"/g, '&quot;')}" title="复制原始命令">复制</button>
                  <button type="button" class="claude-step-btn claude-btn-expand" title="展开完整命令">展开</button>
                `;
                const stepHeader = cmdStep.querySelector('[role="button"]') || cmdStep.children[0];
                if (stepHeader) {
                  stepHeader.appendChild(actionGroup);
                }

                const drawer = document.createElement('div');
                drawer.className = 'claude-cmd-drawer';
                drawer.style.display = 'none';
                const pre = document.createElement('pre');
                pre.className = 'claude-cmd-raw';
                const code = document.createElement('code');
                code.textContent = rawCmd;
                pre.appendChild(code);
                drawer.appendChild(pre);
                cmdStep.appendChild(drawer);
              }
            } else if (fileStep) {
              sig = 'file:' + fileStep.textContent.trim();
              const viewSpan = fileStep.querySelector('.text-secondary-foreground span:first-child');
              if (viewSpan && (viewSpan.textContent === 'Analyzed' || viewSpan.textContent === 'Read')) {
                viewSpan.className = 'claude-step-badge';
                viewSpan.textContent = '查看文件';
              }
            } else if (thinkStep) {
              sig = 'think:' + thinkStep.textContent.trim();
            } else {
              sig = 'other:' + row.textContent.trim().slice(0, 60);
            }

            if (sig && sig === prevSig) {
              dupCount++;
              row.classList.add('claude-merged-row');
              if (prevRow) {
                let pill = prevRow.querySelector('.claude-dup-pill');
                if (!pill) {
                  pill = document.createElement('span');
                  pill.className = 'claude-dup-pill';
                  const target = prevRow.querySelector('.truncate > div') || prevRow.querySelector('.truncate') || prevRow.querySelector('.min-w-0');
                  if (target) target.appendChild(pill);
                }
                pill.textContent = '×' + dupCount;
              }
            } else {
              prevSig = sig;
              prevRow = row;
              dupCount = 1;
              row.classList.remove('claude-merged-row');
              const oldPill = row.querySelector('.claude-dup-pill');
              if (oldPill) oldPill.remove();
            }
          });
        }
      });

      // 扫描状态文字
      const statusSpans = turn.querySelectorAll('span, button');
      statusSpans.forEach((sp) => {
        if (sp.children.length === 0 && sp.textContent) {
          const txt = sp.textContent.trim();
          if (/^(Edited|Worked for|Thought for|Searching|Searched|Exploring|Explored|Load older messages)/i.test(txt)) {
            const trans = translateChinese(txt);
            if (txt !== trans) {
              sp.textContent = trans;
            }
          }
        }
      });
    });

    // 扫描输入框顶部运行中任务抽屉
    const runningPanel = document.querySelector('[data-testid="running-items-panel"]');
    if (runningPanel) {
      const panelBtnSpan = runningPanel.querySelector('button span');
      if (panelBtnSpan && panelBtnSpan.textContent) {
        const trans = translateChinese(panelBtnSpan.textContent.trim());
        if (panelBtnSpan.textContent !== trans) {
          panelBtnSpan.textContent = trans;
        }
      }
    }

    // 动态全局微文字汉化 (严格排除脚本与样式节点)
    try {
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
        acceptNode: function(node) {
          const p = node.parentElement;
          if (!p || p.tagName === 'SCRIPT' || p.tagName === 'STYLE' || p.tagName === 'HEAD' || p.tagName === 'TITLE') {
            return NodeFilter.FILTER_REJECT;
          }
          return NodeFilter.FILTER_ACCEPT;
        }
      });
      let node;
      while ((node = walker.nextNode())) {
        const val = node.nodeValue?.trim();
        if (val && /^Working\.*/i.test(val)) {
          node.nodeValue = node.nodeValue.replace(/Working/i, '执行中');
        } else if (val && /^Thinking\.*/i.test(val)) {
          node.nodeValue = node.nodeValue.replace(/Thinking/i, '思考中');
        } else if (val && /^Running\.*/i.test(val)) {
          node.nodeValue = node.nodeValue.replace(/Running/i, '执行中');
        } else if (val && /\d+\s*tasks?\s*running/i.test(val)) {
          node.nodeValue = translateChinese(val);
        }
      }
    } catch (e) {}
  }

  // 7. 实时监听器
  let dockDebounceTimer = null;
  function setupDockObserver() {
    const convView = document.querySelector('[data-testid="conversation-view"]');
    if (!convView || convView.dataset.claudeDockObserved) return;
    convView.dataset.claudeDockObserved = 'true';

    const observer = new MutationObserver(() => {
      clearTimeout(dockDebounceTimer);
      dockDebounceTimer = setTimeout(processThoughtAndToolDocks, 50);
    });

    observer.observe(convView, {
      childList: true,
      subtree: true,
      characterData: true
    });
  }

  // =========================================================================
  // 8. 文件单击即开 + Apple 级原质毛玻璃上下文菜单
  // =========================================================================
  let activeContextMenu = null;

  function removeContextMenu() {
    if (activeContextMenu) {
      activeContextMenu.remove();
      activeContextMenu = null;
    }
  }

  function isLikelyFilePath(str) {
    if (!str || typeof str !== 'string') return false;
    str = str.trim();
    if (str.startsWith('http://') || str.startsWith('https://')) return false;
    if (str.startsWith('/c/') || str.startsWith('/projects') || str.startsWith('/?') || str === '#' || str === '/' || str === '\\') return false;
    if (str.startsWith('file://')) return true;
    if (str.startsWith('/Users/') || str.startsWith('/System/') || str.startsWith('/Applications/') || str.startsWith('/Library/') || str.startsWith('/private/')) return true;
    if (/^[a-zA-Z]:[\\/]/.test(str) || /^\\\\[a-zA-Z0-9_-]+[\\/]/.test(str)) return true;
    if ((str.startsWith('/') || str.startsWith('\\') || /^[a-zA-Z]:/.test(str)) && /\.[a-zA-Z0-9_-]{1,10}(#.*)?$/.test(str)) return true;
    return false;
  }

  function extractFileInfo(el) {
    if (!el || !el.closest) return null;
    const target = el.closest(
      'button.inline-pill, [data-uri], a[href], [data-testid*="file"], [title*="/"], [title*="\\\\"]'
    );
    if (!target) return null;

    let rawUri = target.getAttribute('data-uri') || target.getAttribute('href') || target.getAttribute('title');
    if (!rawUri) {
      const text = target.textContent?.trim();
      if (text && isLikelyFilePath(text) && !text.includes('\n')) {
        rawUri = text;
      }
    }
    if (!rawUri || !isLikelyFilePath(rawUri)) return null;
    rawUri = rawUri.trim();

    let uri = rawUri;
    if (uri.startsWith('/')) {
      uri = 'file://' + uri;
    } else if (/^[a-zA-Z]:[\\/]/.test(uri)) {
      uri = 'file:///' + uri.replace(/\\/g, '/');
    } else if (/^\\\\[a-zA-Z0-9_-]+[\\/]/.test(uri)) {
      uri = 'file:' + uri.replace(/\\/g, '/');
    }
    if (!uri.startsWith('file://')) return null;

    const cleanUri = uri.replace(/#[^#]*$/, '');
    let cleanPath = cleanUri.replace(/^file:\/\//, '');
    let displayPath = cleanPath;
    try {
      displayPath = decodeURIComponent(cleanPath);
    } catch (e) {}

    if (/^\/[a-zA-Z]:[\\/]/.test(displayPath)) {
      displayPath = displayPath.slice(1);
    }

    const isWindows = typeof navigator !== 'undefined' && (/win/i.test(navigator.platform) || /win/i.test(navigator.userAgent));
    if (isWindows && /^[a-zA-Z]:\//.test(displayPath)) {
      displayPath = displayPath.replace(/\//g, '\\');
    }

    if (!displayPath || displayPath === '/' || displayPath === '\\' || /^[a-zA-Z]:[\\/]?$/.test(displayPath)) {
      return null;
    }

    const fileName = displayPath.split(/[/\\]/).filter(Boolean).pop() || displayPath;

    return {
      element: target,
      rawUri,
      cleanUri,
      cleanPath,
      displayPath,
      fileName
    };
  }

  function showFileContextMenu(e, fileInfo) {
    removeContextMenu();

    const isMac = typeof navigator !== 'undefined' && (/mac/i.test(navigator.platform) || /mac/i.test(navigator.userAgent));
    const revealText = isMac ? '在访达中显示' : '在资源管理器中显示';

    const menu = document.createElement('div');
    menu.id = 'claude-file-context-menu';
    menu.className = 'claude-file-context-menu';

    const iconDoc = `<svg class="claude-fcm-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>`;
    const iconFolder = `<svg class="claude-fcm-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>`;
    const iconCopy = `<svg class="claude-fcm-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`;
    const iconTag = `<svg class="claude-fcm-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>`;

    menu.innerHTML = `
      <div class="claude-fcm-header" title="${fileInfo.displayPath}">
        <span class="claude-fcm-filename">${fileInfo.fileName}</span>
      </div>
      <div class="claude-fcm-item" data-action="open">
        ${iconDoc}
        <span class="claude-fcm-text">打开文件</span>
      </div>
      <div class="claude-fcm-item" data-action="reveal">
        ${iconFolder}
        <span class="claude-fcm-text">${revealText}</span>
      </div>
      <div class="claude-fcm-divider"></div>
      <div class="claude-fcm-item" data-action="copy-path">
        ${iconCopy}
        <span class="claude-fcm-text">复制完整路径</span>
      </div>
      <div class="claude-fcm-item" data-action="copy-name">
        ${iconTag}
        <span class="claude-fcm-text">复制文件名</span>
      </div>
    `;

    document.body.appendChild(menu);
    activeContextMenu = menu;

    const menuW = 200;
    const menuH = 175;
    let posX = e.clientX;
    let posY = e.clientY;

    if (posX + menuW > window.innerWidth - 8) {
      posX = Math.max(8, posX - menuW);
    }
    if (posY + menuH > window.innerHeight - 8) {
      posY = Math.max(8, posY - menuH);
    }

    menu.style.left = `${posX}px`;
    menu.style.top = `${posY}px`;

    menu.addEventListener('click', async (ev) => {
      const item = ev.target.closest('.claude-fcm-item');
      if (!item) return;
      ev.preventDefault();
      ev.stopPropagation();

      const action = item.getAttribute('data-action');
      if (action === 'open') {
        removeContextMenu();
        if (window.electronNative?.openExternal) {
          window.electronNative.openExternal(fileInfo.cleanUri).catch(() => {});
        }
      } else if (action === 'reveal') {
        removeContextMenu();
        if (window.electronNative?.revealInFilePicker) {
          window.electronNative.revealInFilePicker(fileInfo.cleanUri).catch(() => {});
        }
      } else if (action === 'copy-path') {
        try {
          if (navigator.clipboard?.writeText) {
            await navigator.clipboard.writeText(fileInfo.displayPath);
          } else {
            const ta = document.createElement('textarea');
            ta.value = fileInfo.displayPath;
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            ta.remove();
          }
          const textSpan = item.querySelector('.claude-fcm-text');
          if (textSpan) textSpan.textContent = '已复制路径 ✓';
          setTimeout(() => removeContextMenu(), 450);
        } catch (err) {
          removeContextMenu();
        }
      } else if (action === 'copy-name') {
        try {
          if (navigator.clipboard?.writeText) {
            await navigator.clipboard.writeText(fileInfo.fileName);
          } else {
            const ta = document.createElement('textarea');
            ta.value = fileInfo.fileName;
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            ta.remove();
          }
          const textSpan = item.querySelector('.claude-fcm-text');
          if (textSpan) textSpan.textContent = '已复制名称 ✓';
          setTimeout(() => removeContextMenu(), 450);
        } catch (err) {
          removeContextMenu();
        }
      }
    });
  }

  function setupFileInteractions() {
    const handleClick = (e) => {
      if (e.button !== 0) return;
      if (e.target.closest('#claude-file-context-menu')) return;

      const fileInfo = extractFileInfo(e.target);
      if (fileInfo) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        removeContextMenu();

        fileInfo.element.classList.add('claude-file-active-click');
        setTimeout(() => fileInfo.element.classList.remove('claude-file-active-click'), 200);

        if (window.electronNative?.openExternal) {
          window.electronNative.openExternal(fileInfo.cleanUri).catch(() => {});
        }
      }
    };

    const handleContextMenu = (e) => {
      const fileInfo = extractFileInfo(e.target);
      if (fileInfo) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        showFileContextMenu(e, fileInfo);
      } else {
        removeContextMenu();
      }
    };

    const handleGlobalClick = (e) => {
      if (!e.target.closest('#claude-file-context-menu')) {
        removeContextMenu();
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        removeContextMenu();
      }
    };

    const handleScroll = () => {
      removeContextMenu();
    };

    document.addEventListener('click', handleClick, true);
    document.addEventListener('contextmenu', handleContextMenu, true);
    document.addEventListener('click', handleGlobalClick, false);
    document.addEventListener('keydown', handleKeyDown, true);
    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', handleScroll, true);

    return () => {
      document.removeEventListener('click', handleClick, true);
      document.removeEventListener('contextmenu', handleContextMenu, true);
      document.removeEventListener('click', handleGlobalClick, false);
      document.removeEventListener('keydown', handleKeyDown, true);
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleScroll, true);
      removeContextMenu();
    };
  }

  if (window.__claude_file_handlers_cleanup) {
    window.__claude_file_handlers_cleanup();
  }
  window.__claude_file_handlers_cleanup = setupFileInteractions();

  window.__claude_render_recents = renderRecents;
  window.__claude_process_docks = processThoughtAndToolDocks;

  function tick() {
    hookNewChat();
    refineNavigationAndHeaders();
    renderRecents();
    hidePromoButtons();
    processThoughtAndToolDocks();
    setupDockObserver();
  }

  window.__claude_enhancer_interval = setInterval(tick, 600);
  tick();
})();
