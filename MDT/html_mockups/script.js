// ==========================================
// 1. Data Source (Shared Mock Data)
// ==========================================
const caseData = {
    patient: {
        name: "丽丽",
        gender: "女",
        age: "57岁",
        id: "20251215001"
    },
    preDoc: {
        chiefComplaint: "眠差10余年，情绪低落半年",
        hpi: "患者10余年前无明显诱因下出现夜间眠差，表现为难以入睡，眠浅易醒，醒后难以再次入睡。日间感困倦，影响生活工作。患者至外院就诊，诊断考虑“睡眠障碍”，配服多种药物（具体不详），疗效一般。后患者自行服用“氟哌噻吨美利曲辛片[黛力新] 1片/晚”，开始时不规则服药，1年前开始患者几乎每日均需服用“黛力新片”，服药后睡眠尚可。半年前患者出现情绪低落，开心不起来，伴兴趣减退，做事提不起兴致，日间昏沉、乏力，需长时间躺在床上休息，严重影响工作、生活。2月前患者出现多思多虑，坐立不安，患者至当地医院就诊，具体诊断不详，治疗上予“奥沙西泮片15mg晚、盐酸丁螺环酮片5mg 3次/日”，患者服药后仍感难以入睡，遂自行同时服用“黛力新片”，服药后患者感头昏不适，全身乏力，患者因此对病情及用药方案较担心，害怕自己服药过多，开始自行减停“黛力新片”，期间患者出现腹部不适，夜间反酸、烧心。20天前患者停用“黛力新片”，目前患者每日睡眠时间3-4小时，3点醒来后便难以再次入睡，晨起乏力较前稍改善。",
        pastHistory: "有“高血压”病史，目前服用“苯磺酸氨氯地平片5mg/日”；有“高脂血症”病史，目前服用“阿托伐他汀钙片 20mg/日”；",
        personalHistory: "既往性格开朗外向。",
        familyHistory: "无。",
        diagnosis: "1.混合性焦虑和抑郁障碍 2.睡眠障碍 3.高血压1级 4.高脂血症",
        treatment: "奥沙西泮片15mg晚、盐酸丁螺环酮片5mg 3次/日、苯磺酸氨氯地平片5mg/日、阿托伐他汀钙片 20mg/日、奥美拉唑肠溶胶囊、铝碳酸镁咀嚼片",
        objective: "患者目前使用药物治疗效果不佳，提请MDT会诊协助调整治疗方案。"
    },
    asrText: "李三凤啊对，是自己挂了这个号子，对不对？好，然后今天我们有很多的专家啊，就是我们李院长，还有我们放是和药剂和很多的专家一起给你讨论一下，好吧，刚才我们呃呃这个美果医生说那里的情况，大致是这么一个情况嘛。嗯大致差不多啊，呃有一些细节，可能我们要再跟你核实一下... (此处省略5000字实时转录流)... 昨天晚上对，有的时候是被那个呼噜声那个好像吵醒一样...",
    dialogue: [
        {role: "doc", content: "李三凤啊对，是自己挂了这个号子，对不对？好，然后今天我们有很多的专家啊，就是我们李院长，还有我们放是和药剂和很多的专家一起给你讨论一下，好吧，刚才我们呃呃这个美果医生说那里的情况，大致是这么一个情况嘛。"},
        {role: "patient", content: "嗯大致差不多啊。"},
        {role: "doc", content: "呃有一些细节，可能我们要再跟你核实一下，就是你最早是1年前首先是睡眠不好。对，是吗？"},
        {role: "patient", content: "对啊，那个时候就是入睡困难。"},
        {role: "doc", content: "那个时候有其他的不舒服嘛，除了睡眠不好以外，别的没有没有那那时候睡眠不好就吃开始吃戴立新了吗？"},
        {role: "patient", content: "也是人家邻居告诉我的，他说吃戴立新去买点吃吃，我就去买来吃，也不是长期吃的，就是偶尔吃吃，要去上班了，偶尔就吃一片。"}
    ],
    postDoc: {
        hpi_revised: "患者10余年前无明确诱因下出现夜间睡眠差... 20天前停用黛力新，现每夜仅睡3-4小时（多凌晨3点醒后难再睡），晨起乏力稍缓，仍感心情差、兴趣低，坐立不安减轻但未完全缓解... 睡眠中打鼾明显，时有鼾声中断后惊醒坐起...",
        mentalStatus: "情感低落，兴趣明显减退... 存在情绪不稳定，有默默哭泣的情况。情感反应与内心体验相协调。意志活动明显减退，表现为生活被动，活动减少... 存在坐立不安的表现。有消极观念，但近期已减轻。",
        physicalExam: "四肢肌容积正常... 双侧指鼻试验稳准... 未引出其他病理征。",
        ranking: "1. 优先考虑情感障碍（抑郁障碍）类别... 2. 其次考虑焦虑障碍类别... 3. 需鉴别和评估睡眠-觉醒障碍..."
    },
    expertOpinions: [
        {
            name: "章晓英",
            dept: "内科",
            status: "done",
            content: "1. 患者有高血压、高脂血症病史，控制尚平稳。建议进一步检查低密度脂蛋白。2. 睡眠障碍明显，停用黛力新后出现戒断症状（如腹部不适、烧心）。3. 体型偏胖，颈部较粗，有打鼾史，高度怀疑OSAHS，强烈建议做多导睡眠监测。4. 药物处理：建议使用SSRIs或SNRIs（如度洛西汀或文拉法辛）改善焦虑抑郁，注意血压监测。5. 建议行头颅MRI排除缺血灶。"
        },
        {
            name: "精神科专家",
            dept: "精神科",
            status: "done",
            content: "1. 诊断考虑：F32.1 中度抑郁发作（伴焦虑痛苦）；G47.00 慢性失眠障碍。2. 鉴别诊断：排除广泛性焦虑障碍及单纯物质所致抑郁。3. 治疗计划：建议选用艾司西酞普兰，起始5mg/日，早餐后服用。停用奥沙西泮和丁螺环酮。4. 心理治疗：推荐CBT。5. 物理治疗：若效果不佳考虑rTMS。6. 风险：关注自杀风险及冲动行为。"
        },
        {
            name: "神经内科专家",
            dept: "神经内科",
            status: "done",
            content: "1. 排除神经变性病（帕金森、路易体痴呆）。2. 重点关注睡眠呼吸暂停综合征。3. 治疗建议：控制脑血管病危险因素。抗抑郁焦虑治疗建议SSRI/SNRI。逐步减停奥沙西泮。4. 检查建议：头颅MRI，多导睡眠监测，神经心理评估，相关实验室检查。"
        }
    ],
    copilotSuggestions: [
        {
            title: "药物及治疗推荐",
            content: "鉴于患者存在“黛力新”自行停药后的撤药反应及持续的抑郁焦虑症状，建议：1. 缓慢滴定SSRI/SNRI类药物（如文拉法辛）；2. 监测血压波动；3. 联合CBT治疗。",
            confidence: "High"
        },
        {
            title: "风险提示",
            content: "患者提及“害怕自己服药过多”，存在明显的服药焦虑，建议加强用药宣教，简化给药方案。",
            confidence: "Medium"
        }
    ]
};

// ==========================================
// 2. Global Init & Routing
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    const path = window.location.pathname;

    if (path.includes('assistant_detail.html')) {
        initAssistantDetail();
    } else if (path.includes('assistant_list.html')) {
        initAssistantList();
    } else if (path.includes('task_create.html')) {
        initTaskCreate();
    } else if (path.includes('expert_workbench.html')) {
        initExpertWorkbench();
    } else if (path.includes('expert_detail.html')) {
        initExpertDetail();
    } else {
        // Landing page or default
        console.log("Welcome to MDT System");
    }
});


// === Expert Signature Logic ===
let signaturePad = {
    isDrawing: false,
    canvas: null,
    ctx: null,
    points: []
};

function openSignatureModal() {
    const modal = document.getElementById('signature-modal');
    modal.style.display = 'flex';
    
    // Initialize canvas if not already done
    if (!signaturePad.canvas) {
        initSignatureCanvas();
    }
}

function closeSignatureModal() {
    document.getElementById('signature-modal').style.display = 'none';
}

function initSignatureCanvas() {
    const canvas = document.getElementById('signature-canvas');
    if (!canvas) return; // Guard clause

    signaturePad.canvas = canvas;
    signaturePad.ctx = canvas.getContext('2d');
    
    // Set styles
    signaturePad.ctx.lineWidth = 2;
    signaturePad.ctx.lineJoin = 'round';
    signaturePad.ctx.lineCap = 'round';
    signaturePad.ctx.strokeStyle = '#000';

    // Mouse events
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);

    // Touch events for tablets/mobile
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', stopDrawing);
}

function getPos(e) {
    const rect = signaturePad.canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches[0].clientX) - rect.left;
    const y = (e.clientY || e.touches[0].clientY) - rect.top;
    return { x, y };
}

function startDrawing(e) {
    signaturePad.isDrawing = true;
    const pos = getPos(e);
    signaturePad.ctx.beginPath();
    signaturePad.ctx.moveTo(pos.x, pos.y);
    signaturePad.points.push(pos);
    
    // Hide placeholder
    document.getElementById('sig-placeholder').classList.add('hidden');
}

function draw(e) {
    if (!signaturePad.isDrawing) return;
    e.preventDefault(); // Prevent scrolling on touch
    
    const pos = getPos(e);
    signaturePad.ctx.lineTo(pos.x, pos.y);
    signaturePad.ctx.stroke();
    signaturePad.points.push(pos);
}

function stopDrawing() {
    signaturePad.isDrawing = false;
}

function handleTouchStart(e) {
    e.preventDefault();
    if (e.touches.length > 1) return;
    startDrawing(e);
}

function handleTouchMove(e) {
    e.preventDefault();
    if (!signaturePad.isDrawing) return;
    draw(e);
}

function clearSignature() {
    if (!signaturePad.canvas) return;
    signaturePad.ctx.clearRect(0, 0, signaturePad.canvas.width, signaturePad.canvas.height);
    document.getElementById('sig-placeholder').classList.remove('hidden');
    signaturePad.points = [];
}

function saveSignature() {
    // Check if empty (simple check based on points)
    if (signaturePad.points.length === 0) {
        alert('请先绘制签名');
        return;
    }

    // In a real app, we would convert to base64 or blob and upload
    // const dataURL = signaturePad.canvas.toDataURL();
    // console.log(dataURL);

    alert('电子签名保存成功！');
    closeSignatureModal();
}
// === End Expert Signature Logic ===

// ==========================================
// 3. Page Logic: Assistant List
// ==========================================
function initAssistantList() {
    const tabs = document.querySelectorAll('.task-tab');
    
    // Tab Switching (Simulated)
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // In a real app, this would filter the list.
            // Here we just toggle the "badge" style or show a toast
            console.log(`Switched to list: ${tab.textContent.trim()}`);
        });
    });

    // Cancel Task Simulation
    window.cancelTask = () => {
        if(confirm("确认取消该会诊任务吗？此操作不可撤销。")) {
            alert("任务已取消");
            // Remove the card visually
            document.querySelector('.task-card').style.opacity = '0.5';
        }
    };
}


// ==========================================
// 4. Page Logic: Expert Workbench
// ==========================================
function initExpertWorkbench() {
    // Interaction for accepting invitations
    const acceptBtn = document.querySelector('.btn-primary');
    if(acceptBtn) {
        acceptBtn.addEventListener('click', () => {
            if(confirm("确认接受该会诊邀请？\n患者：张阿姨\n会诊时间：今日 15:30")) {
                alert("接受成功！请在 15:30 准时进入会诊间。");
                // Visually move card or update status (simulation)
                const card = acceptBtn.closest('.task-card');
                card.style.background = '#f0f9eb';
                card.querySelector('.btn-group').innerHTML = '<span style="color:var(--success-color)">已接受</span>';
            }
        });
    }

    // Interaction for rejecting
    const rejectBtn = document.querySelector('.btn-default');
    if(rejectBtn) {
        rejectBtn.addEventListener('click', () => {
            prompt("请输入拒绝理由：", "时间冲突");
            alert("已婉拒该邀请");
             const card = rejectBtn.closest('.task-card');
             card.remove();
        });
    }
}


// ==========================================
// 5. Page Logic: Assistant Detail Views
// ==========================================
let currentStep = 1; // 1: Prep, 2: Exec, 3: Doc/Opinion, 4: Report

function initAssistantDetail() {
    renderPreDoc(false); // Editable/Actionable
    setupAssistantListeners();
    updateUIState();
}

function setupAssistantListeners() {
    const tabs = document.querySelectorAll('.tab-btn');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            if (tab.classList.contains('disabled')) return;
            const targetId = tab.dataset.target;
            switchTab(targetId);
        });
    });

    // Action Helpers
    window.startConsultation = () => {
        if(confirm("确定开始会诊吗？这将解锁专家问诊功能。")) {
            currentStep = 2;
            updateUIState();
            switchTab('tab2');
            startASRSimulation();
        }
    };

    window.submitDialogue = () => {
        if(confirm("确定结束问诊并提交？系统将自动生成病历初稿。")) {
            currentStep = 3;
            updateUIState();
            switchTab('tab4'); // Jump to Expert Opinion/Doc review
            renderPostDoc();
            renderExpertOpinions(true); // Is Assistant View? Yes
        }
    };

    window.finishConsultation = () => {
        if(confirm("确定结束本次MDT会诊？\n即将进入报告生成阶段，请选择纳入的专家意见。")) {
            openExpertSelectModal();
        }
    };
}


// ==========================================
// 6. Page Logic: Expert Detail Views
// ==========================================
function initExpertDetail() {
    renderPreDoc(true); // Read-only mode
    setupExpertListeners();
    
    // Simulate Expert is already in "Consultation" or later phase
    // For demo purposes, we unlock relevant tabs assuming session is active or done
    // Let's assume the session is active (Phase 2/3)
    
    // Pre-inject Copilot suggestions for demo
    renderCopilotSuggestions();

    document.getElementById('save-status').innerText = "草稿已自动保存 " + new Date().toLocaleTimeString();
}

function setupExpertListeners() {
    const tabs = document.querySelectorAll('.tab-btn');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            if (tab.classList.contains('disabled')) return;
            const targetId = tab.dataset.target;
            switchTab(targetId);
        });
    });

    window.submitExpertOpinion = () => {
        const content = document.getElementById('opinion-editor').value;
        if(!content) {
            alert("请填写会诊意见");
            return;
        }
        if(confirm("确认提交您的会诊意见？\n提交后助理医生可见并整理至报告中。")) {
            alert("提交成功！");
            document.getElementById('opinion-editor').disabled = true;
            document.querySelector('.btn-primary').innerText = "已提交";
            document.querySelector('.btn-primary').disabled = true;
        }
    };
}

function renderCopilotSuggestions() {
    const container = document.getElementById('copilot-suggestions');
    if(!container) return;

    let html = '';
    caseData.copilotSuggestions.forEach(sug => {
        html += `
             <div class="suggestion-card">
                <div class="sugg-header">
                    <span style="font-weight:bold; font-size:14px;">${sug.title}</span>
                    <span class="sugg-add-btn" title="采纳此建议" onclick="acceptSuggestion(this)">+</span>
                </div>
                <div style="font-size:13px; color:#555; line-height:1.5;">${sug.content}</div>
                <div style="margin-top:8px; font-size:10px; color:#999;">置信度: ${sug.confidence}</div>
            </div>
        `;
    });
    
    // Simulate "Loading" -> "Done"
    setTimeout(() => {
        container.innerHTML = html;
    }, 1500);
    
    // Accept suggestion logic
    window.acceptSuggestion = (btn) => {
        const card = btn.closest('.suggestion-card');
        const text = card.querySelector('div:nth-child(2)').innerText; // Quick hack to get content
        const editor = document.getElementById('opinion-editor');
        editor.value = editor.value + (editor.value ? "\n" : "") + text;
        
        // Visual feedback
        btn.innerText = "✓";
        btn.style.color = "green";
        card.style.background = "#f6ffed";
        card.style.borderColor = "#b7eb8f";
    };
}


// ==========================================
// 7. Shared Helper Functions
// ==========================================

function switchTab(tabId) {
    const tabs = document.querySelectorAll('.tab-btn');
    const contents = document.querySelectorAll('.tab-content');

    // Deactivate all
    tabs.forEach(t => t.classList.remove('active'));
    contents.forEach(c => c.classList.remove('active'));
    
    // Activate target
    const targetTab = document.querySelector(`.tab-btn[data-target="${tabId}"]`);
    const targetContent = document.getElementById(tabId);
    
    if (targetTab) targetTab.classList.add('active');
    if (targetContent) targetContent.classList.add('active');
}

function updateUIState() {
    const stepItems = document.querySelectorAll('.step-item');
    if(!stepItems.length) return; // Might be absent in Expert view or List view

    // Update Step Indicator
    stepItems.forEach((item, index) => {
        const stepNum = index + 1;
        item.classList.remove('active', 'completed');
        if (stepNum < currentStep) item.classList.add('completed');
        if (stepNum === currentStep) item.classList.add('active');
    });

    // Unlock Tabs (Assistant View Logic)
    if (currentStep >= 2) unlockTab('tab2');
    if (currentStep >= 3) {
        unlockTab('tab3');
        unlockTab('tab4');
    }
    if (currentStep >= 4) unlockTab('tab5');
}

function unlockTab(tabId) {
    const tab = document.querySelector(`.tab-btn[data-target="${tabId}"]`);
    if(tab) {
        tab.classList.remove('disabled');
        const icon = tab.querySelector('.lock-icon');
        if(icon) icon.textContent = '🔓';
    }
}

function renderPreDoc(readOnly = false) {
    const container = document.getElementById('pre-doc-content');
    if(!container) return;

    const d = caseData.preDoc;
    
    let btnHtml = '';
    if (!readOnly) {
        btnHtml = `
        <div style="margin-top:20px; text-align:right;">
            <button class="btn btn-primary" onclick="startConsultation()" ${typeof currentStep !== 'undefined' && currentStep > 1 ? 'disabled style="background:#ccc;cursor:default;"' : ''}>开始会诊</button>
        </div>`;
    }

    container.innerHTML = `
        <div class="section-title">基本信息</div>
        <div class="info-grid">
            <div class="info-item"><span class="label">姓名</span><span class="value">${caseData.patient.name}</span></div>
            <div class="info-item"><span class="label">性别</span><span class="value">${caseData.patient.gender}</span></div>
            <div class="info-item"><span class="label">年龄</span><span class="value">${caseData.patient.age}</span></div>
        </div>
        
        <div class="section-title">病史详情</div>
        <div class="info-grid">
            <div class="info-item long-text"><span class="label">主诉</span><span class="value">${d.chiefComplaint}</span></div>
            <div class="info-item long-text"><span class="label">现病史</span><span class="value">${d.hpi}</span></div>
            <div class="info-item long-text"><span class="label">既往史</span><span class="value">${d.pastHistory}</span></div>
            <div class="info-item long-text"><span class="label">目前诊断</span><span class="value">${d.diagnosis}</span></div>
            <div class="info-item long-text"><span class="label">目前治疗</span><span class="value">${d.treatment}</span></div>
            <div class="info-item long-text"><span class="label">会诊目的</span><span class="value">${d.objective}</span></div>
        </div>
        ${btnHtml}
    `;
    
    // Virtual Expert Opinion
    const aiDiv = document.createElement('div');
    aiDiv.className = 'dialog-card';
    aiDiv.style.background = '#e6f7ff';
    aiDiv.style.borderColor = '#91d5ff';
    aiDiv.innerHTML = `
        <div style="font-weight:bold; color:#1890FF; margin-bottom:8px;">✨ AI 预分析建议 (基于临床指南)</div>
        <div style="font-size:12px; line-height:1.6;">
            根据患者长期失眠及近期抑郁焦虑症状，建议：<br>
            1. 评估抑郁/焦虑量表（HAMD/HAMA）。<br>
            2. 需鉴别药物源性焦虑（停用黛力新）。<br>
            3. 建议精神科、神经内科联合评估。
        </div>
    `;
    container.appendChild(aiDiv);
}

function startASRSimulation() {
    const asrContainer = document.querySelector('.asr-text');
    const dialogContainer = document.querySelector('.dialog-list');
    if(!asrContainer || !dialogContainer) return;
    
    // Simulate initial text
    asrContainer.textContent = caseData.asrText;
    
    // Render Dialog Cards
    let dialogHtml = '';
    caseData.dialogue.forEach(d => {
        const roleClass = d.role === 'doc' ? 'role-doc' : 'role-patient';
        const roleName = d.role === 'doc' ? '医生' : '患者';
        dialogHtml += `
            <div class="dialog-card">
                <div class="dialog-role ${roleClass}">${roleName}</div>
                <div class="dialog-content">${d.content}</div>
            </div>
        `;
    });
    dialogContainer.innerHTML = dialogHtml;
}

function renderPostDoc() {
    // 1. Render Right Panel (Form)
    const container = document.getElementById('post-doc-form');
    if(container) {
        const p = caseData.postDoc;
        
        container.innerHTML = `
            <div class="section-title">AI 生成病历 (可编辑)</div>
            <div style="background:#fff; padding:16px; border:1px solid #eee; border-radius:4px;">
                <div style="margin-bottom:16px;">
                    <label style="display:block; color:#666; font-size:12px; margin-bottom:4px;">现病史 ✨</label>
                    <textarea id="hpi_field" style="width:100%; height:150px; padding:8px; border:1px solid #d9d9d9; border-radius:4px; font-family:inherit;">${p.hpi_revised}</textarea>
                </div>
                <div style="margin-bottom:16px;">
                    <label style="display:block; color:#666; font-size:12px; margin-bottom:4px;">精神检查 ✨</label>
                    <textarea style="width:100%; height:100px; padding:8px; border:1px solid #d9d9d9; border-radius:4px; font-family:inherit;">${p.mentalStatus}</textarea>
                </div>
                <div style="margin-bottom:16px;">
                    <label style="display:block; color:#666; font-size:12px; margin-bottom:4px;">神经系统检查 ✨</label>
                    <textarea style="width:100%; height:80px; padding:8px; border:1px solid #d9d9d9; border-radius:4px; font-family:inherit;">${p.physicalExam}</textarea>
                </div>
                 <div style="margin-bottom:16px;">
                    <label style="display:block; color:#666; font-size:12px; margin-bottom:4px;">诊断排序逻辑 ✨</label>
                    <textarea style="width:100%; height:80px; padding:8px; border:1px solid #d9d9d9; border-radius:4px; font-family:inherit;">${p.ranking}</textarea>
                </div>
            </div>
            <div style="margin-top:16px; text-align:right;">
                 <button class="btn btn-default">暂存草稿</button>
                 <button class="btn btn-primary">提交标星版本 (同步给专家)</button>
            </div>
        `;
    }

    // 2. Render Left Panel (Reference List)
    const refContainer = document.getElementById('ref-dialog-list');
    if(refContainer) {
        refContainer.innerHTML = '';
        
        if(caseData.dialogue && caseData.dialogue.length > 0) {
            caseData.dialogue.forEach(d => {
                const item = document.createElement('div');
                item.className = 'ref-dialog-item';
                item.innerHTML = `
                    <div class="ref-dialog-time">10:3${Math.floor(Math.random()*9)} (模拟时间)</div>
                    <div>
                        <span class="ref-dialog-speaker">${d.role === 'doc' ? '医生' : '患者'}:</span>
                        ${d.content.substring(0, 50)}${d.content.length > 50 ? '...' : ''}
                    </div>
                `;
                
                // Add click event to insert text into active textarea
                item.onclick = (e) => {
                   // Prevent focus loss from textarea if possible, or assume user clicked textarea first.
                   // Actually, clicking the div will blur the textarea. 
                   // We need to rely on the last focused textarea or the default one.
                   insertTextToActiveElement(`[引用${d.role === 'doc' ? '医生' : '患者'}: ${d.content}]`);
                };
                
                refContainer.appendChild(item);
            });
        } else {
             refContainer.innerHTML = '<div style="text-align: center; color: #999; padding: 20px;">暂无问诊记录</div>';
        }
    }
}

// Helper to insert text
function insertTextToActiveElement(text) {
    let target = document.getElementById('hpi_field'); 
    // Try to find if any textarea was focused recently? 
    // Since clicking the div blurs the textarea, document.activeElement might be body or the div.
    // For prototype simplicity, we just append to the HPI field or alert.
    
    if (target) {
        const start = target.selectionStart;
        const end = target.selectionEnd;
        const value = target.value;
        target.value = value.substring(0, start) + text + value.substring(end);
        // Move cursor
        // target.selectionStart = target.selectionEnd = start + text.length; 
        // We might want to append at end if no selection
        if(start === end && start === 0) {
             target.value += "\n" + text;
        }
        
        // Flash effect
        target.style.borderColor = '#1890ff';
        setTimeout(() => target.style.borderColor = '#d9d9d9', 500);
    }
}

function renderExpertOpinions(isAssistantView = true) {
    const grid = document.getElementById('expert-grid');
    if(!grid) return;

    let html = '';
    
    caseData.expertOpinions.forEach((exp, index) => {
        // Status Text Mapping
        let statusText = '在线';
        if(exp.status === 'speaking') statusText = '发言中';
        if(exp.status === 'done') statusText = '已提交';

        // Control Button (Only for Assistant View)
        let controlBtn = '';
        if (isAssistantView) {
            const isSpeaking = exp.status === 'speaking';
            // Use different icon/style based on state
            controlBtn = `
                <button class="btn btn-sm ${isSpeaking ? 'btn-danger' : 'btn-default'}" 
                        onclick="toggleExpertSpeaking(${index})" 
                        title="${isSpeaking ? '停止发言' : '允许发言'}"
                        style="margin-left:8px; border-radius:50%; width:32px; height:32px; display:flex; align-items:center; justify-content:center; padding:0; border:none; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    ${isSpeaking ? '🛑' : '🎤'}
                </button>
            `;
        }

        html += `
            <div class="expert-card ${exp.status === 'speaking' ? 'speaking' : ''}" id="expert-card-${index}">
                <div class="expert-header">
                    <div style="display:flex; align-items:center;">
                        <div>
                            <div class="expert-name">${exp.name}</div>
                            <div class="expert-dept">${exp.dept}</div>
                        </div>
                    </div>
                    <div style="display:flex; align-items:center; gap:8px;">
                        <div class="status-badge status-${exp.status}">
                            ${statusText}
                        </div>
                        ${controlBtn}
                    </div>
                </div>
                <div style="font-size:12px; color:#666; max-height:150px; overflow-y:auto;">
                    ${exp.content || '<span style="color:#ccc; font-style:italic;">暂无意见内容...</span>'}
                </div>
            </div>
        `;
    });
    
    grid.innerHTML = html;
    
    const actionArea = document.getElementById('expert-actions');
    if(actionArea && isAssistantView) {
         actionArea.innerHTML = `
         <button class="btn btn-primary" onclick="finishConsultation()">会诊结束 & 生成报告</button>
        `;
    }
}

function toggleExpertSpeaking(index) {
    const expert = caseData.expertOpinions[index];
    if(!expert) return;
    
    if(expert.status === 'speaking') {
        // Toggle OFF
        // If they have content, revert to 'done', else 'online'
        expert.status = expert.content && expert.content.length > 5 ? 'done' : 'online';
    } else {
        // Toggle ON
        // First disable others
        caseData.expertOpinions.forEach(e => {
            if(e.status === 'speaking') {
                 e.status = e.content && e.content.length > 5 ? 'done' : 'online';
            }
        });
        expert.status = 'speaking';
    }
    
    // Refresh
    renderExpertOpinions(true);
}

function renderReport(selectedIndices = null) {
    const container = document.getElementById('report-preview');
    if(!container) return;

    const date = new Date().toLocaleDateString();
    
    let opinionsHtml = '';
    caseData.expertOpinions.forEach((exp, index) => {
        // Filter if selectedIndices is provided
        if (selectedIndices && !selectedIndices.includes(index)) {
            return;
        }

        let badgesHtml = '';
        if (exp.isStarred) {
            badgesHtml = '<span class="expert-badges"><span class="badge-core">核心专家</span></span>';
        }

        opinionsHtml += `
            <div class="report-section">
                <div class="report-section-title">
                    ${exp.dept} - ${exp.name} 意见
                    ${badgesHtml}
                </div>
                <div>${exp.content}</div>
                <div style="text-align:right; margin-top:10px;">
                     <img class="sign-img" src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMzAiPjx0ZXh0IHg9IjEwIiB5PSIyMCIgZm9udC1mYW1pbHk9ImN1cnNpdmUiIHN0eWxlPSJmb250LXN0eWxlOml0YWxpYyI+U2lnbmVkPC90ZXh0Pjwvc3ZnPg==" alt="sign">
                </div>
            </div>
        `;
    });

    container.innerHTML = `
        <div class="report-header">
            <div class="report-title">MDT 多学科会诊报告</div>
            <div>会诊日期: 2025-12-16 &nbsp;&nbsp; 会诊号: 20251216-001</div>
        </div>
        
        <div class="report-section">
            <div class="report-section-title">患者信息</div>
            <div>姓名：${caseData.patient.name} &nbsp;&nbsp; 性别：${caseData.patient.gender} &nbsp;&nbsp; 年龄：${caseData.patient.age}</div>
            <div style="margin-top:8px;"><strong>主诉：</strong>${caseData.preDoc.chiefComplaint}</div>
            <div style="margin-top:8px;"><strong>诊断：</strong>${caseData.preDoc.diagnosis}</div>
        </div>

        <div class="report-section">
            <div class="report-section-title">会诊总结</div>
            <div>
                患者虽以长期失眠为主诉，但目前核心症状表现为抑郁发作（中度）伴明显焦虑。需警惕OSHAS及药物戒断反应。<br>
                治疗原则：调整为SSRI类抗抑郁药，改善情绪与睡眠；逐步停用苯二氮卓类药物；完善睡眠监测与神经影像学检查。
            </div>
        </div>

        ${opinionsHtml}
        
    `;
}

// ==========================================
// 8. Expert Selection Modal Logic
// ==========================================

function openExpertSelectModal() {
    const modal = document.getElementById('expert-select-modal');
    if(modal) {
        renderExpertSelectList();
        modal.style.display = 'flex';
    }
}

function closeExpertSelectModal() {
    const modal = document.getElementById('expert-select-modal');
    if(modal) {
        modal.style.display = 'none';
    }
}

function renderExpertSelectList() {
    const list = document.getElementById('expert-select-list');
    if(!list) return;

    let html = '';
    caseData.expertOpinions.forEach((exp, index) => {
        // Only show experts who have content or status 'done'/'speaking'
        // We assume 'done' means they submitted something.
        // Or if they have content.
        const canSelect = exp.status === 'done' || (exp.content && exp.content.length > 0);
        
        html += `
            <div style="padding: 10px; border-bottom: 1px solid #eee; display: flex; align-items: flex-start; gap: 10px;">
                <input type="checkbox" id="expert-check-${index}" value="${index}" ${canSelect ? 'checked' : ''}>
                <div style="flex:1;">
                    <div style="font-weight: bold; margin-bottom: 4px;">
                        ${exp.name} <span style="font-weight:normal; color:#666; font-size:12px;">(${exp.dept})</span>
                    </div>
                    <div style="font-size: 12px; color: #555; max-height: 60px; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">
                        ${exp.content || '<span style="color:#999; font-style:italic;">暂无意见内容</span>'}
                    </div>
                </div>
            </div>
        `;
    });
    list.innerHTML = html;
}

function generateFinalReport() {
    const checkboxes = document.querySelectorAll('#expert-select-list input[type="checkbox"]:checked');
    const selectedIndices = Array.from(checkboxes).map(cb => parseInt(cb.value));

    if (selectedIndices.length === 0) {
        if(!confirm("未选择任何专家意见，报告将不包含专家部分。确定继续吗？")) {
            return;
        }
    }

    closeExpertSelectModal();

    // Proceed to Step 4 (Report)
    currentStep = 4;
    updateUIState();
    switchTab('tab5');
    
    // Render report with selected experts
    renderReport(selectedIndices);
}

// ==========================================
// 9. Task Create Page Logic
// ==========================================
function initTaskCreate() {
    renderExpertListForSelect();
    setupRecTags();
    
    // Anchor navigation helper
    window.scrollToSection = (id) => {
        document.getElementById(id).scrollIntoView({ behavior: 'smooth' });
    };
    
    // Manual active class toggle for anchor items
    const anchors = document.querySelectorAll('.anchor-item');
    anchors.forEach(a => {
        a.addEventListener('click', function() {
            anchors.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

function renderExpertListForSelect() {
    const container = document.getElementById('expert-list-container');
    if(!container) return;
    
    // Mock Expert Pool
    const experts = [
        { name: "张三", dept: "内科", title: "主任医师" },
        { name: "李四", dept: "精神科", title: "副主任医师" },
        { name: "王五", dept: "神经内科", title: "主任医师" },
        { name: "赵六", dept: "心血管科", title: "副主任医师" },
        { name: "孙八", dept: "心理科", title: "治疗师" },
        { name: "周九", dept: "儿科", title: "主任医师" },
        { name: "吴十", dept: "中医科", title: "主任中医师" }
    ];
    
    let html = '';
    experts.forEach((exp, i) => {
        html += `
            <div class="expert-item" onclick="toggleExpertSelect(this)">
                <input type="checkbox">
                <div>
                   <div style="font-weight:bold;">${exp.name}</div>
                   <div style="font-size:12px; color:#666;">${exp.dept} | ${exp.title}</div>
                </div>
            </div>
        `;
    });
    container.innerHTML = html;
    
    window.toggleExpertSelect = (div) => {
        // Prevent double toggle if clicking checkbox directly
        if(event.target.type === 'checkbox') return;
        
        const cb = div.querySelector('input[type="checkbox"]');
        cb.checked = !cb.checked;
        if(cb.checked) {
            div.style.background = '#e6f7ff';
        } else {
            div.style.background = '';
        }
    };
}

function setupRecTags() {
    const tags = document.querySelectorAll('.rec-tag');
    tags.forEach(tag => {
        tag.addEventListener('click', () => {
            tag.classList.toggle('checked');
        });
    });
}

window.saveTask = () => {
    // Basic validation
    const nameInput = document.querySelector('input[name="name"]');
    if(nameInput && !nameInput.value) {
        // Just for demo, auto-fill if empty so user doesn't get stuck
        nameInput.value = "测试患者";
    }
    
    if(confirm("确定发布该会诊任务吗？\n相关专家将收到通知。")) {
        alert("发布成功！");
        window.location.href = 'assistant_list.html';
    }
};
