document.addEventListener('DOMContentLoaded', function() {
    // DOM元素
    const uploadArea = document.getElementById('uploadArea');
    const imageUpload = document.getElementById('imageUpload');
    const memeImage = document.getElementById('memeImage');
    const memeCanvas = document.getElementById('memeCanvas');
    const memeDisplay = document.getElementById('memeDisplay');
    const textInput = document.getElementById('textInput');
    const applyTextBtn = document.getElementById('applyTextBtn');
    const emotionInput = document.getElementById('emotionInput');
    const useTypeSelect = document.getElementById('useTypeSelect');
    const quickGenerateBtn = document.getElementById('quickGenerateBtn');
    const tagChipsContainer = document.getElementById('tagChips');
    const generateBtn = document.getElementById('generateBtn');
    const suggestionsList = document.getElementById('suggestionsList');
    const topText = document.getElementById('topText');
    const bottomText = document.getElementById('bottomText');
    const selectedText = document.getElementById('selectedText');
    const downloadBtn = document.getElementById('downloadBtn');
    const editTextBtn = document.getElementById('editTextBtn');
    const textEditInput = document.getElementById('textEditInput');
    const textEditControls = document.getElementById('textEditControls');
    const saveEditBtn = document.getElementById('saveEditBtn');
    const cancelEditBtn = document.getElementById('cancelEditBtn');
    const templateImages = document.querySelectorAll('.template-image');
    const imageSearchInput = document.getElementById('imageSearchInput');
    const searchBtn = document.getElementById('searchBtn');
    const searchResults = document.getElementById('searchResults');
    const searchResultsGrid = document.getElementById('searchResultsGrid');
    const searchLoading = document.getElementById('searchLoading');
    const searchError = document.getElementById('searchError');
    const closeSearchBtn = document.getElementById('closeSearchBtn');
    const aiPromptInput = document.getElementById('aiPromptInput');
    const aiApiKeyInput = document.getElementById('aiApiKeyInput');
    const aiGenerateBtn = document.getElementById('aiGenerateBtn');
    
    // 工作台相关元素
    const toggleWorkspaceBtn = document.getElementById('toggleWorkspaceBtn');
    const normalMode = document.getElementById('normalMode');
    const workspaceMode = document.getElementById('workspaceMode');
    const workspaceCanvas = document.getElementById('workspaceCanvas');
    const layerList = document.getElementById('layerList');
    const propertyPanel = document.getElementById('propertyPanel');
    const addTextLayerBtn = document.getElementById('addTextLayerBtn');
    const exitWorkspaceBtn = document.getElementById('exitWorkspaceBtn');
    const exportBtn = document.getElementById('exportBtn');
    const historyList = document.getElementById('historyList');
    const clearHistoryBtn = document.getElementById('clearHistoryBtn');
    const savePreview = document.getElementById('savePreview');
    
    // 裁剪相关元素
    const cropSection = document.getElementById('cropSection');
    const cropCanvas = document.getElementById('cropCanvas');
    const cropOverlay = document.getElementById('cropOverlay');
    const cropBtn = document.getElementById('cropBtn');
    const cancelCropBtn = document.getElementById('cancelCropBtn');
    const cropImageBtn = document.getElementById('cropImageBtn');
    
    // 文字样式相关元素
    const fontSizeSelect = document.getElementById('fontSizeSelect');
    const fontSizeValue = document.getElementById('fontSizeValue');
    const fontFamilySelect = document.getElementById('fontFamilySelect');
    const textColorSelect = document.getElementById('textColorSelect');
    const strokeColorSelect = document.getElementById('strokeColorSelect');
    
    // 文字样式变量
    let currentFontSize = 40;
    let currentFontFamily = '"Microsoft YaHei", "PingFang SC", "Hiragino Sans GB", Arial, sans-serif';
    let currentTextColor = '#FFFFFF';
    let currentStrokeColor = '#000000';
    
    // 裁剪相关变量
    let isCropping = false;
    let cropStartX = 0;
    let cropStartY = 0;
    let cropEndX = 0;
    let cropEndY = 0;
    let isDraggingCrop = false;

    // 存储当前选中的图片和文案
    let currentImage = null;
    let currentText = '';
    let displayCanvasCtx = null;
    let isGifImage = false;  // 标记当前图片是否为 GIF
    let gifFrames = null;  // 存储 GIF 的帧数据
    
    // 工作台相关数据
    let workspaceCtx = null;
    let layers = [];  // 图层数组
    let selectedLayerIndex = -1;  // 当前选中的图层索引
    let historyStack = [];  // 历史记录栈
    let maxHistorySize = 20;  // 最大历史记录数
    let selectedTags = [];
    const emotionTags = ['无语','狂喜','摸鱼','emo','暴躁','感动','期待','惊讶','无聊','委屈','疑惑','开心'];
    
    // 文字位置和拖拽状态
    let textPosition = {
        x: null,  // null 表示使用默认位置
        y: null
    };
    let isDragging = false;
    let dragOffset = { x: 0, y: 0 };
    let textBounds = null;  // 存储文字边界框，用于检测点击

    // 模板图片数据
    const templateData = {
        dog: {
            name: "狗头",
            url: "images/dog.webp"
        },
        panda: {
            name: "猫头",
            url: "images/cat.jpg"
        },
        cat: {
            name: "猫头",
            url: "images/cat2.jpg"
        },
        bear: {
            name: "黄油小熊",
            url: "images/bear.png"
        },
        nailong: {
            name: "奶龙",
            url: "images/nailong.jpg"
        }
    };

    // 事件监听器
    uploadArea.addEventListener('click', () => imageUpload.click());
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('drop', handleDrop);
    imageUpload.addEventListener('change', handleImageUpload);
    generateBtn && generateBtn.addEventListener('click', generateMemeText);
    downloadBtn && downloadBtn.addEventListener('click', downloadMeme);
    if (editTextBtn && saveEditBtn && cancelEditBtn && textEditInput) {
        editTextBtn.addEventListener('click', showTextEditor);
        saveEditBtn.addEventListener('click', saveTextEdit);
        cancelEditBtn.addEventListener('click', cancelTextEdit);
        textEditInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                saveTextEdit();
            } else if (e.key === 'Escape') {
                cancelTextEdit();
            }
        });
    }

    // 工作台按钮事件监听器
    if (toggleWorkspaceBtn) {
        toggleWorkspaceBtn.addEventListener('click', enterWorkspace);
    }
    if (exitWorkspaceBtn) {
        exitWorkspaceBtn.addEventListener('click', exitWorkspace);
    }
    if (addTextLayerBtn) {
        addTextLayerBtn.addEventListener('click', addTextLayer);
    }
    if (exportBtn) {
        exportBtn.addEventListener('click', exportWorkspace);
    }
    if (clearHistoryBtn) {
        clearHistoryBtn.addEventListener('click', clearHistory);
    }
    
    // 裁剪功能事件监听器
    if (cropImageBtn) {
        cropImageBtn.addEventListener('click', startCrop);
    }
    if (cropBtn) {
        cropBtn.addEventListener('click', confirmCrop);
    }
    if (cancelCropBtn) {
        cancelCropBtn.addEventListener('click', cancelCrop);
    }
    
    // 文字样式事件监听器
    if (fontSizeSelect && fontSizeValue) {
        fontSizeSelect.addEventListener('input', function() {
            currentFontSize = parseInt(this.value);
            fontSizeValue.textContent = currentFontSize;
            if (currentText) {
                applyTextToCanvas(currentText);
            }
        });
    }
    if (fontFamilySelect) {
        fontFamilySelect.addEventListener('change', function() {
            currentFontFamily = this.value;
            if (currentText) {
                applyTextToCanvas(currentText);
            }
        });
    }
    if (textColorSelect) {
        textColorSelect.addEventListener('change', function() {
            currentTextColor = this.value;
            if (currentText) {
                applyTextToCanvas(currentText);
            }
        });
    }
    if (strokeColorSelect) {
        strokeColorSelect.addEventListener('change', function() {
            currentStrokeColor = this.value;
            if (currentText) {
                applyTextToCanvas(currentText);
            }
        });
    }

    // ==================== 通义大模型生成图片+文案 ====================
    async function generateWithQwen() {
        if (!aiPromptInput || !aiApiKeyInput) {
            alert('当前页面未加载 AI 生成控件');
            return;
        }

        const prompt = aiPromptInput.value.trim();
        const apiKey = aiApiKeyInput.value.trim();

        if (!prompt) {
            alert('请输入生成描述！');
            return;
        }
        if (!apiKey) {
            alert('请填写通义 API Key（仅本地使用，不会上传）。');
            return;
        }

        setAiStatus('处理中，请稍候...', 'info');

        const useInfo = getUseTypeInfo();

        // 文案生成：调用通义千问文本接口（简单提示）
        let generatedText = '';
        try {
            generatedText = await callQwenText(apiKey, prompt, useInfo);
        } catch (e) {
            console.warn('文案生成失败，使用原始描述作为文案', e);
            generatedText = prompt;
            setAiStatus('文案生成失败，已用原描述代替；请检查 key/网络或 CORS。', 'warn');
        }

        // 图片生成：调用通义万相（文本生图）
        try {
            const imgUrl = await callQwenImage(apiKey, prompt, useInfo);
            if (!imgUrl) {
                setAiStatus('图片生成失败，请稍后再试', 'error');
                return;
            }
            // 加载生成的图片
            currentImage = imgUrl;
            isGifImage = false;
            displayImage(imgUrl);
            // 应用生成文案
            if (generatedText) {
                applyTextToCanvas(generatedText);
            }
            setAiStatus('AI 生成完成，已自动应用图片与文案', 'success');
        } catch (e) {
            console.error('AI 图片生成失败:', e);
            setAiStatus('AI 图片生成失败：' + e.message + '；请检查 API Key/网络或使用代理避免 CORS。', 'error');
        }
    }

    function setAiStatus(msg, type = 'info') {
        if (!window.aiStatus && typeof document !== 'undefined') {
            window.aiStatus = document.getElementById('aiStatus');
        }
        const el = window.aiStatus;
        if (!el) return;
        el.textContent = msg;
        el.className = 'ai-status ' + type;
    }

    function isMobile() {
        return typeof window !== 'undefined' && window.innerWidth <= 768;
    }

    const DASH_BASE = (typeof window !== 'undefined' && window.DASH_BASE) ?
        window.DASH_BASE :
        'https://dashscope.aliyuncs.com/compatible-mode/v1';

    // 调用通义千问文本接口（简化版）
    async function callQwenText(apiKey, prompt, useInfo) {
        const url = `${DASH_BASE}/services/aigc/text-generation/generation`;
        const useHint = useInfo && useInfo.label ? `【用途：${useInfo.label}】` : '';
        const body = {
            model: 'qwen-plus',
            input: {
                prompt: `请为以下场景生成一句中文文案，简短有趣，<=30字。${useHint} 描述：${prompt}`
            }
        };
        const resp = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify(body)
        });
        if (!resp.ok) {
            const errText = await resp.text().catch(() => '');
            throw new Error('文本接口返回错误：' + resp.status + ' ' + errText);
        }
        const data = await resp.json();
        // 根据通义返回结构提取文本
        const text = data?.output?.text || data?.output?.choices?.[0]?.message?.content || '';
        return (text || '').trim();
    }

    // 调用通义万相文本生图接口（简化版）
    async function callQwenImage(apiKey, prompt, useInfo) {
        // 通义万相 text-to-image
        const url = `${DASH_BASE}/services/aigc/image-generation/generation`;
        const useHint = useInfo && useInfo.label ? `【用途：${useInfo.label}】` : '';
        // 可选的尺寸提示
        let sizeHint = '';
        if (useInfo && useInfo.width && useInfo.height) {
            sizeHint = ` 尺寸参考：${useInfo.width}x${useInfo.height}`;
        }
        const body = {
            model: 'wanx-v1', // 文生图模型
            input: {
                prompt: `${useHint} ${prompt}${sizeHint}`
            }
        };
        const resp = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify(body)
        });
        if (!resp.ok) {
            const errText = await resp.text().catch(() => '');
            throw new Error('图片接口返回错误：' + resp.status + ' ' + errText);
        }
        const data = await resp.json();
        // 万相返回的图片地址
        const urlResult = data?.output?.results?.[0]?.url || data?.output?.url;
        return urlResult;
    }

    // 用途信息
    function getUseTypeInfo() {
        if (!useTypeSelect) return { key: 'original', label: '原始尺寸', width: null, height: null };
        const val = useTypeSelect.value || 'original';
        const map = {
            original: { key: 'original', label: '原始尺寸', width: null, height: null }, // 保留原始尺寸比例
            meme: { key: 'meme', label: '表情包', width: 800, height: 800 },
            poster: { key: 'poster', label: '海报', width: 1080, height: 1440 },
            weixin: { key: 'weixin', label: '公众号首图', width: 900, height: 383 },
            promo: { key: 'promo', label: '宣传图', width: 1080, height: 1350 }
        };
        return map[val] || map.original;
    }
    const baiduSearchBtn = document.getElementById('baiduSearchBtn');
    
    searchBtn && searchBtn.addEventListener('click', searchImages);
    imageSearchInput && imageSearchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchImages();
        }
    });
    closeSearchBtn && closeSearchBtn.addEventListener('click', function() {
        searchResults.style.display = 'none';
    });
    baiduSearchBtn && baiduSearchBtn.addEventListener('click', function() {
        const keyword = imageSearchInput.value.trim();
        if (!keyword) {
            alert('请输入搜索关键词！');
            return;
        }
        // 打开百度图片搜索页面
        const baiduUrl = `https://image.baidu.com/search/index?tn=baiduimage&word=${encodeURIComponent(keyword)}`;
        window.open(baiduUrl, '_blank');
    });

    // 标签渲染与事件
    if (tagChipsContainer) {
        renderEmotionTags();
    }

    // 直接应用文案
    if (applyTextBtn && textInput) {
        applyTextBtn.addEventListener('click', function() {
            const text = textInput.value.trim();
            if (!text) {
                alert('请输入文案！');
                return;
            }
            if (!currentImage) {
                alert('请先上传图片或选择模板！');
                return;
            }
            applyTextToCanvas(text);
        });
        
        // 支持Enter键快速应用（Shift+Enter换行）
        textInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                applyTextBtn.click();
            }
        });
    }

    // 一键生成
    if (quickGenerateBtn) {
        quickGenerateBtn.addEventListener('click', quickGenerate);
    }

    // AI 生成（通义 API）
    if (aiGenerateBtn) {
        aiGenerateBtn.addEventListener('click', generateWithQwen);
    }

    // 模板图片点击事件
    templateImages.forEach(img => {
        img.addEventListener('click', function() {
            const templateName = this.dataset.name;
            loadTemplate(templateName);
        });
    });
    
    // 添加canvas拖拽事件（鼠标）
    memeCanvas.addEventListener('mousedown', handleCanvasMouseDown);
    memeCanvas.addEventListener('mousemove', handleCanvasMouseMove);
    memeCanvas.addEventListener('mouseup', handleCanvasMouseUp);
    memeCanvas.addEventListener('mouseleave', handleCanvasMouseUp); // 鼠标离开canvas时也停止拖拽
    
    // 添加触摸事件支持（移动设备）
    memeCanvas.addEventListener('touchstart', handleCanvasTouchStart);
    memeCanvas.addEventListener('touchmove', handleCanvasTouchMove);
    memeCanvas.addEventListener('touchend', handleCanvasTouchEnd);
    
    memeCanvas.style.cursor = 'default';

    // 拖拽事件处理
    function handleDragOver(e) {
        e.preventDefault();
        e.stopPropagation();
        uploadArea.style.borderColor = '#667eea';
        uploadArea.style.backgroundColor = '#f0f4ff';
    }

    function handleDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        uploadArea.style.borderColor = '#ccc';
        uploadArea.style.backgroundColor = '';
        
        const files = e.dataTransfer.files;
        if (files.length) {
            handleImage(files[0]);
        }
    }

    // 图片上传处理
    function handleImageUpload(e) {
        if (e.target.files.length) {
            handleImage(e.target.files[0]);
        }
    }

    // 处理图片
    function handleImage(file) {
        if (!file.type.match('image.*')) {
            alert('请选择图片文件！');
            return;
        }

        // 检测是否为 GIF
        isGifImage = file.type === 'image/gif';
        gifFrames = null;

        const reader = new FileReader();
        reader.onload = function(e) {
            if (isGifImage) {
                // 如果是 GIF，需要特殊处理
                loadGifImage(e.target.result);
            } else {
                // 普通图片
            displayImage(e.target.result);
            }
        };
        reader.readAsDataURL(file);
    }

    // 加载 GIF 图片
    function loadGifImage(dataUrl) {
        // 重置文字位置
        textPosition.x = null;
        textPosition.y = null;
        
        // 对于 GIF，我们先用第一帧显示
        const img = new Image();
        img.onload = function() {
            currentImage = dataUrl;
            renderImageToCanvas(dataUrl);
        };
        img.onerror = function() {
            alert('GIF 图片加载失败，请重试！');
        };
        img.src = dataUrl;
    }

    // 将图片URL转换为data URL（避免canvas污染）
    function convertImageToDataURL(url, callback) {
        // 如果已经是data URL，直接返回
        if (url.startsWith('data:image')) {
            callback(url);
            return;
        }
        
        // 如果是 GIF，直接使用 fetch 获取，保持 GIF 格式
        if (isGifImage || url.toLowerCase().endsWith('.gif')) {
            isGifImage = true;
            loadGifImageDirectly(url, callback);
            return;
        }
        
        // 如果是相对路径，转换为绝对路径
        let imageUrl = url;
        if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('data:')) {
            const baseUrl = window.location.href.substring(0, window.location.href.lastIndexOf('/') + 1);
            imageUrl = baseUrl + url;
        }
        
        // 检测是否是 file:// 协议
        const isFileProtocol = window.location.protocol === 'file:';
        
        // 如果是 file:// 协议，尝试使用 fetch 读取文件
        if (isFileProtocol && imageUrl.startsWith('file://')) {
            // 对于 file:// 协议，直接使用原URL，让浏览器处理
            // 但这样可能会导致 canvas 污染，所以我们需要一个备用方案
            const img = new Image();
            img.onload = function() {
                try {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    ctx.drawImage(img, 0, 0);
                    const dataURL = canvas.toDataURL('image/png');
                    callback(dataURL);
                } catch (error) {
                    console.warn('图片转换失败（可能是浏览器安全限制）:', error.message);
                    // 静默失败，直接使用原URL，在下载时再处理
                    callback(imageUrl);
                }
            };
            img.onerror = function() {
                console.error('图片加载失败:', imageUrl);
                callback(imageUrl);
            };
            img.src = imageUrl;
            return;
        }
        
        // 对于 HTTP/HTTPS 协议，正常转换
        const img = new Image();
        img.onload = function() {
            try {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);
                const dataURL = canvas.toDataURL('image/png');
                callback(dataURL);
            } catch (error) {
                console.warn('图片转换失败:', error.message);
                // 静默失败，直接使用原URL
                callback(imageUrl);
            }
        };
        img.onerror = function() {
            console.error('图片加载失败:', imageUrl);
            callback(imageUrl);
        };
        img.src = imageUrl;
    }

    // 显示图片到canvas
    function displayImage(src) {
        // 如果是模板图片，先转换为data URL
        if (!src.startsWith('data:image')) {
            // 检测是否为 GIF（通过 URL 判断）
            if (!isGifImage) {
                isGifImage = src.toLowerCase().endsWith('.gif');
            }
            
            convertImageToDataURL(src, function(dataURL) {
                currentImage = dataURL; // 更新为data URL
                // 如果是 GIF，保持 GIF 格式的 data URL
                if (isGifImage && !dataURL.startsWith('data:image/gif')) {
                    // 如果转换后不是 GIF，需要重新获取原始 GIF
                    loadGifImageDirectly(src);
                } else {
                    renderImageToCanvas(dataURL);
                }
            });
        } else {
            currentImage = src;
            // 检测 data URL 是否为 GIF
            if (!isGifImage) {
                isGifImage = src.startsWith('data:image/gif');
            }
            renderImageToCanvas(src);
        }
    }
    
    // 直接加载 GIF（不转换，保持动画）
    function loadGifImageDirectly(url, callback) {
        // 获取绝对路径
        let imageUrl = url;
        if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('data:')) {
            const baseUrl = window.location.href.substring(0, window.location.href.lastIndexOf('/') + 1);
            imageUrl = baseUrl + url;
        }
        
        // 使用 fetch 获取 GIF 文件
        fetch(imageUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error('HTTP error: ' + response.status);
                }
                return response.blob();
            })
            .then(blob => {
                const reader = new FileReader();
                reader.onload = function(e) {
                    currentImage = e.target.result;
                    isGifImage = true; // 确保标志正确
                    renderImageToCanvas(e.target.result);
                    if (callback) callback(e.target.result);
                };
                reader.onerror = function() {
                    console.error('读取 GIF 文件失败');
                    // 降级为普通图片加载
                    convertImageToDataURL(url, function(dataURL) {
                        currentImage = dataURL;
                        isGifImage = false;
                        renderImageToCanvas(dataURL);
                        if (callback) callback(dataURL);
                    });
                };
                reader.readAsDataURL(blob);
            })
            .catch(error => {
                console.error('加载 GIF 失败:', error);
                // 降级为普通图片加载
                convertImageToDataURL(url, function(dataURL) {
                    currentImage = dataURL;
                    isGifImage = false;
                    renderImageToCanvas(dataURL);
                    if (callback) callback(dataURL);
                });
            });
    }
    
    // 渲染图片到canvas
    function renderImageToCanvas(imageSrc) {
        // 如果是 GIF，使用 img 标签显示以保持动画
        if (isGifImage && imageSrc.startsWith('data:image/gif')) {
            memeImage.src = imageSrc;
        memeImage.style.display = 'block';
            memeCanvas.style.display = 'none';
        memeDisplay.style.backgroundColor = 'transparent';
            currentImage = imageSrc; // 保存原始 GIF data URL
            
            // 更新文字显示
            updateTextDisplay();
            return;
        }
        
        // 普通图片处理
        const img = new Image();
        img.onload = function() {
            // 设置canvas尺寸
            memeCanvas.width = img.width;
            memeCanvas.height = img.height;
            
            // 获取canvas上下文
            if (!displayCanvasCtx) {
                displayCanvasCtx = memeCanvas.getContext('2d');
            }
            
            // 绘制图片
            displayCanvasCtx.drawImage(img, 0, 0);
            
            // 显示canvas
            memeCanvas.style.display = 'block';
            memeImage.style.display = 'none';
            memeDisplay.style.backgroundColor = 'transparent';
            
            // 更新文字显示
            updateTextDisplay();
        };
        img.onerror = function() {
            console.error('图片加载失败:', imageSrc);
            alert('图片加载失败，请重试！');
        };
        img.src = imageSrc;
    }
    
    // 更新文字显示（在canvas上绘制文字）
    function updateTextDisplay() {
        if (!currentImage) return;
        
        // 如果是 GIF 且正在使用 img 标签显示，文字通过 overlay 显示
        if (isGifImage && memeImage.style.display === 'block') {
            // GIF 动画时，文字通过 CSS overlay 显示
            topText.style.display = topText.textContent ? 'block' : 'none';
            bottomText.style.display = bottomText.textContent ? 'block' : 'none';

            // 移动端不再额外显示第二张预览图，避免重复
            if (savePreview) {
                savePreview.style.display = 'none';
            }
            return;
        }
        
        // 普通图片：在 canvas 上绘制文字
        if (!displayCanvasCtx) return;
        
        // 重新绘制图片
        const img = new Image();
        img.onload = function() {
            displayCanvasCtx.clearRect(0, 0, memeCanvas.width, memeCanvas.height);
            displayCanvasCtx.drawImage(img, 0, 0);
            
            // 绘制文字
            if (topText.textContent || bottomText.textContent) {
                drawTextToCanvas(displayCanvasCtx, memeCanvas.width, memeCanvas.height);
            }

            // 不再在移动端额外显示第二张预览图，避免重复
            if (savePreview) {
                savePreview.style.display = 'none';
            }
        };
        img.onerror = function() {
            console.error('更新文字时图片加载失败');
        };
        img.src = currentImage;
    }
    
    // 在canvas上绘制文字
    function drawTextToCanvas(ctx, width, height) {
        // 检测安全区域（避免遮挡人脸）
        // 注意：此时图片应该已经绘制在 canvas 上
        const safeAreas = detectSafeAreas(ctx, width, height);
        
        // 计算默认位置（图片下方居中）
        let defaultX = width / 2;
        let defaultY = height - 30; // 距离底部30像素
        
        // 使用自定义位置或默认位置
        const textX = textPosition.x !== null ? textPosition.x : defaultX;
        const textY = textPosition.y !== null ? textPosition.y : defaultY;
        
        // 合并所有文字内容
        let allText = '';
        if (topText.textContent && bottomText.textContent) {
            allText = topText.textContent + '\n' + bottomText.textContent;
        } else if (topText.textContent) {
            allText = topText.textContent;
        } else if (bottomText.textContent) {
            allText = bottomText.textContent;
        }
        
        // 绘制文字（使用自定义位置）
        if (allText) {
            textBounds = drawMultilineText(ctx, allText, textX, textY, width, 'center', safeAreas, true);
        }
        
        // 添加装饰
        drawCuteDecorations(ctx, width, height);
    }
    
    // 鼠标按下事件
    function handleCanvasMouseDown(e) {
        if (!currentText || !textBounds) return;
        
        const rect = memeCanvas.getBoundingClientRect();
        const scaleX = memeCanvas.width / rect.width;
        const scaleY = memeCanvas.height / rect.height;
        const mouseX = (e.clientX - rect.left) * scaleX;
        const mouseY = (e.clientY - rect.top) * scaleY;
        
        // 检测是否点击在文字区域内
        if (isPointInTextBounds(mouseX, mouseY, textBounds)) {
            isDragging = true;
            dragOffset.x = mouseX - textBounds.x;
            dragOffset.y = mouseY - textBounds.y;
            memeCanvas.style.cursor = 'move';
        }
    }
    
    // 鼠标移动事件
    function handleCanvasMouseMove(e) {
        if (!currentText) return;
        
        const rect = memeCanvas.getBoundingClientRect();
        const scaleX = memeCanvas.width / rect.width;
        const scaleY = memeCanvas.height / rect.height;
        const mouseX = (e.clientX - rect.left) * scaleX;
        const mouseY = (e.clientY - rect.top) * scaleY;
        
        if (isDragging) {
            // 更新文字位置
            textPosition.x = mouseX - dragOffset.x;
            textPosition.y = mouseY - dragOffset.y;
            
            // 限制在canvas范围内
            textPosition.x = Math.max(0, Math.min(memeCanvas.width, textPosition.x));
            textPosition.y = Math.max(0, Math.min(memeCanvas.height, textPosition.y));
            
            // 重新绘制
            updateTextDisplay();
        } else if (textBounds && isPointInTextBounds(mouseX, mouseY, textBounds)) {
            memeCanvas.style.cursor = 'move';
        } else {
            memeCanvas.style.cursor = 'default';
        }
    }
    
    // 鼠标释放事件
    function handleCanvasMouseUp(e) {
        if (isDragging) {
            isDragging = false;
            memeCanvas.style.cursor = 'default';
        }
    }
    
    // 触摸开始事件
    function handleCanvasTouchStart(e) {
        e.preventDefault();
        if (!currentText || !textBounds) return;
        
        const touch = e.touches[0];
        const rect = memeCanvas.getBoundingClientRect();
        const scaleX = memeCanvas.width / rect.width;
        const scaleY = memeCanvas.height / rect.height;
        const touchX = (touch.clientX - rect.left) * scaleX;
        const touchY = (touch.clientY - rect.top) * scaleY;
        
        // 检测是否点击在文字区域内
        if (isPointInTextBounds(touchX, touchY, textBounds)) {
            isDragging = true;
            dragOffset.x = touchX - textBounds.x;
            dragOffset.y = touchY - textBounds.y;
        }
    }
    
    // 触摸移动事件
    function handleCanvasTouchMove(e) {
        e.preventDefault();
        if (!isDragging || !currentText) return;
        
        const touch = e.touches[0];
        const rect = memeCanvas.getBoundingClientRect();
        const scaleX = memeCanvas.width / rect.width;
        const scaleY = memeCanvas.height / rect.height;
        const touchX = (touch.clientX - rect.left) * scaleX;
        const touchY = (touch.clientY - rect.top) * scaleY;
        
        // 更新文字位置
        textPosition.x = touchX - dragOffset.x;
        textPosition.y = touchY - dragOffset.y;
        
        // 限制在canvas范围内
        textPosition.x = Math.max(0, Math.min(memeCanvas.width, textPosition.x));
        textPosition.y = Math.max(0, Math.min(memeCanvas.height, textPosition.y));
        
        // 重新绘制
        updateTextDisplay();
    }
    
    // 触摸结束事件
    function handleCanvasTouchEnd(e) {
        e.preventDefault();
        if (isDragging) {
            isDragging = false;
        }
    }
    
    // 检测点是否在文字边界内
    function isPointInTextBounds(x, y, bounds) {
        if (!bounds) return false;
        return x >= bounds.x - bounds.width / 2 - 10 && 
               x <= bounds.x + bounds.width / 2 + 10 &&
               y >= bounds.y - bounds.height - 10 &&
               y <= bounds.y + 10;
    }
    
    // 检测安全区域（避免遮挡人脸）
    function detectSafeAreas(ctx, width, height) {
        // 默认安全区域：
        // 1. 顶部区域：使用图片上方 15% 的区域
        // 2. 底部区域：使用图片下方 15% 的区域
        // 3. 中间区域（人脸可能的位置）：图片中间 40% 的区域，避免在此放置文字
        
        let topSafeArea = height * 0.15;  // 顶部安全区域高度
        let bottomSafeArea = height * 0.15;  // 底部安全区域高度
        const centerStart = height * 0.3;  // 中心区域开始位置
        const centerEnd = height * 0.7;  // 中心区域结束位置
        let hasFace = false;
        
        // 尝试检测图片中心区域是否有较多细节（可能是人脸）
        // 简单方法：检测中心区域的亮度变化和边缘密度
        try {
            const centerHeight = centerEnd - centerStart;
            const sampleHeight = Math.min(centerHeight, height * 0.3); // 采样高度
            const sampleY = centerStart + (centerHeight - sampleHeight) / 2;
            
            const imageData = ctx.getImageData(0, sampleY, width, sampleHeight);
            const pixels = imageData.data;
            
            if (pixels.length > 0) {
                let variance = 0;
                let mean = 0;
                let edgeCount = 0;
                
                // 计算亮度和边缘
                for (let i = 0; i < pixels.length; i += 4) {
                    const r = pixels[i];
                    const g = pixels[i + 1];
                    const b = pixels[i + 2];
                    const brightness = (r + g + b) / 3;
                    mean += brightness;
                }
                mean /= (pixels.length / 4);
                
                // 计算方差和边缘
                for (let i = 0; i < pixels.length - 16; i += 4) {
                    const r = pixels[i];
                    const g = pixels[i + 1];
                    const b = pixels[i + 2];
                    const brightness = (r + g + b) / 3;
                    variance += Math.pow(brightness - mean, 2);
                    
                    // 简单的边缘检测（相邻像素差异大）
                    if (i + 4 < pixels.length) {
                        const nextR = pixels[i + 4];
                        const nextG = pixels[i + 5];
                        const nextB = pixels[i + 6];
                        const nextBrightness = (nextR + nextG + nextB) / 3;
                        if (Math.abs(brightness - nextBrightness) > 30) {
                            edgeCount++;
                        }
                    }
                }
                variance /= (pixels.length / 4);
                
                // 如果中心区域方差较大或边缘较多（细节丰富），可能是人脸区域
                if (variance > 500 || edgeCount > pixels.length / 100) {
                    hasFace = true;
                    // 检测到可能的人脸区域，扩大安全区域
                    topSafeArea = Math.max(topSafeArea, centerStart - 10);
                    bottomSafeArea = Math.max(bottomSafeArea, height - centerEnd - 10);
                }
            }
        } catch (e) {
            // 如果无法读取图像数据（可能是跨域问题），使用默认值
            console.warn('无法检测安全区域，使用默认值:', e.message);
        }
        
        return {
            top: topSafeArea,
            bottom: height - bottomSafeArea,
            centerStart: centerStart,
            centerEnd: centerEnd,
            hasFace: hasFace
        };
    }
    
    // 绘制多行文本（支持自动换行、字体自适应）
    function drawMultilineText(ctx, text, x, y, maxWidth, align, safeAreas, returnBounds = false) {
        if (!text) return null;
        
        // 使用用户选择的字体大小，如果没有选择则自动计算
        const fontSize = currentFontSize || calculateOptimalFontSize(ctx, text, maxWidth, safeAreas);
        ctx.font = `bold ${fontSize}px ${currentFontFamily || '"Microsoft YaHei", "PingFang SC", "Hiragino Sans GB", Arial, sans-serif'}`;
        
        // 使用用户选择的颜色
        ctx.fillStyle = currentTextColor || 'white';
        ctx.strokeStyle = currentStrokeColor || 'black';
        ctx.lineWidth = Math.max(2, fontSize * 0.05);
        ctx.textAlign = 'center';
        
        // 自动换行：将文本分割成多行
        const lines = wrapText(ctx, text, maxWidth * 0.9); // 留出 10% 的边距
        const lineHeight = fontSize * 1.3; // 行高为字体大小的 1.3 倍
        
        // 计算总高度和最大宽度
        const totalHeight = lines.length * lineHeight;
        let maxLineWidth = 0;
        lines.forEach(line => {
            const metrics = ctx.measureText(line);
            maxLineWidth = Math.max(maxLineWidth, metrics.width);
        });
        
        // 根据对齐方式计算起始 Y 坐标
        let startY;
        if (align === 'top') {
            startY = y;
            // 确保不超出顶部安全区域
            if (startY + totalHeight > safeAreas.centerStart) {
                startY = Math.max(safeAreas.top, safeAreas.centerStart - totalHeight - 10);
            }
        } else if (align === 'center') {
            // 居中对齐：y 是文字中心点
            startY = y - totalHeight / 2;
        } else {
            // bottom 对齐
            startY = y - totalHeight;
            // 确保不超出底部安全区域
            if (startY < safeAreas.centerEnd) {
                startY = Math.min(safeAreas.bottom - totalHeight, safeAreas.centerEnd + 10);
            }
        }
        
        // 绘制每一行
        lines.forEach((line, index) => {
            const lineY = startY + index * lineHeight;
            
            // 绘制描边（黑色）
            ctx.strokeText(line, x, lineY);
            // 绘制填充（白色）
            ctx.fillText(line, x, lineY);
        });
        
        // 如果需要返回边界信息（用于拖拽检测）
        if (returnBounds) {
            return {
                x: x,
                y: startY + totalHeight / 2,  // 文字中心点
                width: maxLineWidth,
                height: totalHeight
            };
        }
        
        return null;
    }
    
    // 计算最佳字体大小
    function calculateOptimalFontSize(ctx, text, maxWidth, safeAreas) {
        // 基础字体大小：根据图片宽度计算
        const baseFontSize = Math.min(maxWidth * 0.08, 60);
        const minFontSize = Math.max(20, maxWidth * 0.04);
        const maxFontSize = Math.min(80, maxWidth * 0.15);
        
        // 根据文字长度调整
        let fontSize = baseFontSize;
        if (text.length > 20) {
            fontSize *= 0.9; // 长文本稍微缩小
        } else if (text.length < 10) {
            fontSize *= 1.1; // 短文本稍微放大
        }
        
        // 确保在合理范围内
        fontSize = Math.max(minFontSize, Math.min(maxFontSize, fontSize));
        
        // 测试字体大小是否合适（检查文字宽度）
        ctx.font = `bold ${fontSize}px ${currentFontFamily || '"Microsoft YaHei", "PingFang SC", "Hiragino Sans GB", Arial, sans-serif'}`;
        const textMetrics = ctx.measureText(text);
        
        // 如果文字太宽，减小字体
        if (textMetrics.width > maxWidth * 0.9) {
            fontSize = (maxWidth * 0.9 / textMetrics.width) * fontSize;
            fontSize = Math.max(minFontSize, fontSize);
        }
        
        return Math.round(fontSize);
    }
    
    // 文本自动换行（支持中文字符）
    function wrapText(ctx, text, maxWidth) {
        if (!text) return [''];
        
        const chars = text.split('');
        const lines = [];
        let currentLine = '';
        
        for (let i = 0; i < chars.length; i++) {
            const char = chars[i];
            const testLine = currentLine + char;
            const metrics = ctx.measureText(testLine);
            
            if (metrics.width > maxWidth && currentLine.length > 0) {
                // 当前行已满，开始新行
                lines.push(currentLine);
                currentLine = char;
            } else {
                currentLine = testLine;
            }
        }
        
        // 添加最后一行
        if (currentLine.length > 0) {
            lines.push(currentLine);
        }
        
        // 如果没有任何行（空文本），返回包含空字符串的数组
        return lines.length > 0 ? lines : [''];
    }

    // 加载模板
    function loadTemplate(templateName) {
        const template = templateData[templateName];
        if (template) {
            // 检测模板是否为 GIF
            isGifImage = template.url.toLowerCase().endsWith('.gif');
            gifFrames = null;
            
            // 重置文字位置
            textPosition.x = null;
            textPosition.y = null;
            
            // 清空当前文字
            currentText = '';
            topText.textContent = '';
            bottomText.textContent = '';
            selectedText.textContent = '';

            // 预先记录当前图片，避免切换到工作台时 currentImage 为空
            currentImage = template.url;
            
            // 直接加载模板图片
            if (isGifImage) {
                // GIF 模板直接加载
                loadGifImageDirectly(template.url);
            } else {
                // 普通图片模板
            displayImage(template.url);
            }
        }
    }
    
    // 搜索网络图片（使用Pexels API，免费且不需要API key）
    async function searchImages() {
        const keyword = imageSearchInput.value.trim();
        if (!keyword) {
            alert('请输入搜索关键词！');
            return;
        }
        
        // 显示加载状态
        searchResults.style.display = 'block';
        searchLoading.style.display = 'block';
        searchError.style.display = 'none';
        searchResultsGrid.innerHTML = '';
        
        try {
            let imageResults = null;
            
            // 方法1: 使用Pexels API（免费，需要API key）
            // Pexels提供免费的API，每小时200次请求
            // 申请地址：https://www.pexels.com/api/
            try {
                // 注意：这里使用示例key，可能已失效
                // 建议申请自己的API key：https://www.pexels.com/api/
                const pexelsKey = '563492ad6f91700001000001b8c8e8e8e8e8e8e8e8e8e8e8e8e8e8';
                const pexelsUrl = `https://api.pexels.com/v1/search?query=${encodeURIComponent(keyword)}&per_page=20`;
                const response = await fetch(pexelsUrl, {
                    headers: {
                        'Authorization': pexelsKey
                    }
                });
                
                if (response.ok) {
                    const data = await response.json();
                    if (data.photos && data.photos.length > 0) {
                        imageResults = data.photos.map(photo => ({
                            url: photo.src.large || photo.src.medium,
                            thumbnail: photo.src.medium || photo.src.small,
                            tags: photo.alt || keyword
                        }));
                    }
                } else if (response.status === 401 || response.status === 429) {
                    // API key无效或达到限制
                    console.warn('Pexels API key无效或达到限制');
                }
            } catch (e) {
                console.warn('Pexels API失败:', e);
            }
            
            // 方法2: 尝试使用Unsplash API（如果Pexels失败）
            if (!imageResults || imageResults.length === 0) {
                try {
                    // Unsplash的公开访问（有限制，需要API key）
                    // 这里暂时跳过，因为需要用户配置API key
                } catch (e) {
                    console.warn('Unsplash API需要配置:', e);
                }
            }
            
            // 如果所有API都失败，提示用户
            if (!imageResults || imageResults.length === 0) {
                searchLoading.style.display = 'none';
                searchError.innerHTML = `
                    <div style="text-align: center;">
                        <p style="font-size: 1.1rem; margin-bottom: 1rem; color: #e74c3c;">
                            <strong>在线搜索暂时不可用</strong>
                        </p>
                        <div style="background: #f9f9f9; padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
                            <p style="margin-bottom: 0.5rem;"><strong>方案1：使用在线搜索（推荐）</strong></p>
                            <p style="font-size: 0.9rem; color: #666; margin-bottom: 0.5rem;">
                                申请免费的Pexels API key，即可在页面下方直接显示搜索结果并一键加载
                            </p>
                            <a href="https://www.pexels.com/api/" target="_blank" 
                               style="display: inline-block; padding: 0.5rem 1rem; background: #667eea; color: white; 
                                      text-decoration: none; border-radius: 4px; margin-top: 0.5rem;">
                                免费申请 API Key →
                            </a>
                        </div>
                        <div style="background: #f0f4ff; padding: 1rem; border-radius: 8px;">
                            <p style="margin-bottom: 0.5rem;"><strong>方案2：使用百度搜索（备选）</strong></p>
                            <p style="font-size: 0.9rem; color: #666;">
                                点击"在百度搜索"按钮，在新窗口搜索后手动保存并上传图片
                            </p>
                        </div>
                    </div>
                `;
                searchError.style.display = 'block';
                return;
            }
            
            // 显示搜索结果
            searchLoading.style.display = 'none';
            searchResultsGrid.innerHTML = '';
            
            imageResults.forEach(result => {
                const item = document.createElement('div');
                item.className = 'search-result-item';
                item.innerHTML = `<img src="${result.thumbnail}" alt="${result.tags || keyword}" loading="lazy">`;
                item.addEventListener('click', function() {
                    // 加载选中的图片
                    loadImageFromUrl(result.url);
                    searchResults.style.display = 'none';
                });
                searchResultsGrid.appendChild(item);
            });
            
        } catch (error) {
            console.error('搜索图片失败:', error);
            searchLoading.style.display = 'none';
            searchError.innerHTML = `
                <p>搜索失败：${error.message}</p>
                <p style="margin-top: 1rem;">建议使用"在百度搜索"功能，然后上传图片。</p>
            `;
            searchError.style.display = 'block';
        }
    }
    
    // 从URL加载图片
    function loadImageFromUrl(url) {
        // 重置文字位置
        textPosition.x = null;
        textPosition.y = null;
        
        // 创建图片对象来加载
        const img = new Image();
        img.crossOrigin = 'anonymous'; // 尝试设置跨域
        
        img.onload = function() {
            try {
                // 将图片转换为data URL
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);
                const dataURL = canvas.toDataURL('image/png');
                
                // 显示图片
                currentImage = dataURL;
                renderImageToCanvas(dataURL);
            } catch (error) {
                console.error('转换图片失败:', error);
                // 如果转换失败（可能是跨域问题），直接使用URL
                alert('注意：由于跨域限制，某些图片可能无法下载。但可以正常显示和右键保存。');
                currentImage = url;
                renderImageToCanvas(url);
            }
        };
        
        img.onerror = function() {
            alert('图片加载失败，请重试！可能的原因：\n1. 网络问题\n2. 图片链接失效\n3. 跨域限制');
        };
        
        img.src = url;
    }

    // 生成表情包文案
    function generateMemeText() {
        const emotion = emotionInput ? emotionInput.value.trim() : '';

        if (!currentImage) {
            alert('请先上传图片或选择模板！');
            return;
        }

        // 根据情绪关键词+标签生成文案
        const texts = generateTextsWithTags(emotion, selectedTags, getUseTypeInfo());
        
        if (!texts.length) {
            alert('未生成文案，请尝试其它关键词或标签');
            return;
        }
        
        // 显示建议文案
        displaySuggestions(texts);
    }

    // 根据情绪关键词和标签生成文案
    function generateTextsWithTags(emotion, tags = [], useInfo = null) {
        const combined = [];
        if (emotion) combined.push(emotion);
        tags.forEach(t => combined.push(t));
        if (useInfo && useInfo.label) combined.push(useInfo.label);
        const keywordStr = combined.join('、');

        const texts = generateTexts(keywordStr || emotion || 'default');
        return texts;
    }

    // 根据情绪关键词生成文案（原有逻辑保留）
    function generateTexts(emotion) {
        // 更多可爱的文案生成逻辑
        const memeTexts = {
            // 无语相关
            '无语': [
                '我竟无言以对，只能默默喝水',
                '这操作让我怀疑人生',
                '不是我不想说，是我说不出来',
                '此时无声胜有声',
                '我选择狗带',
                '还能不能好好玩耍了？',
                '我...你随意',
                '这届网友不行啊',
                '我读书少，你别骗我',
                '请告诉我，刚才发生了什么？',
                '大脑已死机，正在重启中...',
                '我需要冷静一下'
            ],
            // 狂喜相关
            '狂喜': [
                '高兴得快要飞起',
                '开心到模糊',
                '这快乐来的太突然',
                '今天也是充满希望的一天',
                '感动哭了，是真的哭了',
                '笑得像个200斤的孩子',
                '开心到劈叉',
                '高兴到转圈圈',
                '乐得冒泡了',
                '心情美美哒~',
                '开心到飞起★',
                '快乐到冒星星~',
                '笑出强大★★★',
                '高兴到发光啦~'
            ],
            // 摸鱼相关
            '摸鱼': [
                '工作五分钟，摸鱼两小时',
                '我不是在摸鱼，我是在养精蓄锐',
                '假装很忙，实际在思考人生',
                '上班不摸鱼，和咸鱼有什么区别',
                '摸鱼使我快乐，工作使我贫穷',
                '今日摸鱼，明日加班',
                '摸鱼是第一生产力',
                '工作诚可贵，摸鱼价更高',
                '一边摸鱼一边思考宇宙的奥秘',
                '摸鱼使我快乐★',
                '偷偷摸鱼中...',
                '表面上在工作，实际上在...'
            ],
            // 生气相关
            '生气': [
                '气得我想砸键盘',
                '怒火中烧ing',
                '别惹我，我脾气爆',
                '生气气(╯°□°)╯︵ ┻━┻',
                '怒气值已爆表',
                '我要炸了！',
                '气到变形★',
                '愤怒的小鸟都没我气',
                '怒火★'
            ],
            // 困倦相关
            '困': [
                '困得睁不开眼',
                '我想睡觉💤',
                '眼皮在打架',
                '困成一滩泥',
                '急需咖啡续命',
                '我的床在召唤我',
                '困困困zzz',
                '瞌睡虫附体~',
                '眼睛快闭上了~'
            ],
            // 默认文案
            'default': [
                '我不是胖，是毛茸茸的可爱',
                '今天的我，依然魅力无敌',
                '生活就像一盒巧克力，但我更喜欢吃糖',
                '别慌，问题不大',
                '一切皆有可能，除了不可能',
                '做人最重要的是开心',
                '稳住，我们能赢',
                '我太难了，真的太难了',
                '道理我都懂，但还是过不好这一生',
                '人生如戏，全靠演技',
                '躺平使我快乐',
                '我emo了',
                '内卷使我贫穷',
                '摆烂到底，快乐第一',
                '今天也是元气满满的一天呢',
                '生活嘛，就是要有点乐趣',
                '冲鸭★',
                '奥利给★',
                '加油鸭~',
                '冲冲冲✦',
                '元气满满♡',
                '今天也要加油鸭~'
            ]
        };

        // 根据关键词查找匹配文案
        let texts = [];
        for (const key in memeTexts) {
            if (emotion.includes(key)) {
                texts = texts.concat(memeTexts[key]);
            }
        }

        // 如果没有匹配的文案，使用默认文案
        if (texts.length === 0) {
            texts = memeTexts['default'];
        }

        // 添加一些随机的谐音梗和网络用语
        const additionalTexts = [
            `这${emotion}的感觉，就像喝了假酒`,
            `${emotion}到飞起，感觉自己萌萌哒`,
            `别问我为什么${emotion}，问就是懂的都懂`,
            `一入${emotion}深似海，从此节操是路人`,
            `报告老板，这里有个${emotion}的`,
            `听说${emotion}和熬夜更配哦`,
            `我${emotion}，我快乐，我${emotion}我快乐`,
            `人生如戏，全靠${emotion}`,
            `${emotion}使我快乐，快乐使我进步`,
            `不${emotion}不散，散了不${emotion}`,
            `${emotion}是第一生产力`,
            `听说${emotion}的人都很可爱`,
            `今天的${emotion}是送给自己的`,
            `${emotion}一下，烦恼拜拜`,
            `把${emotion}装进口袋`,
            `${emotion}小精灵上线啦~`
        ];

        // 合并文案并随机排序
        return shuffleArray(texts.concat(additionalTexts)).slice(0, 15);
    }

    // 数组随机排序
    function shuffleArray(array) {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    }

    // 渲染情绪标签
    function renderEmotionTags() {
        if (!tagChipsContainer) return;
        tagChipsContainer.innerHTML = '';
        emotionTags.forEach(tag => {
            const chip = document.createElement('span');
            chip.className = 'tag-chip';
            chip.textContent = tag;
            chip.addEventListener('click', function() {
                toggleTag(tag, chip);
            });
            tagChipsContainer.appendChild(chip);
        });
    }

    function toggleTag(tag, chipEl) {
        const idx = selectedTags.indexOf(tag);
        if (idx >= 0) {
            selectedTags.splice(idx, 1);
            chipEl.classList.remove('active');
        } else {
            selectedTags.push(tag);
            chipEl.classList.add('active');
        }
    }

    // 快速一键生成：检查图片→生成文案→自动选首条→更新预览
    function quickGenerate() {
        if (!currentImage) {
            alert('请先上传图片或选择模板！');
            return;
        }
        const emotion = emotionInput ? emotionInput.value.trim() : '';
        const texts = generateTextsWithTags(emotion, selectedTags, getUseTypeInfo());
        if (texts.length === 0) {
            alert('未生成文案，请尝试其它关键词');
            return;
        }
        displaySuggestions(texts);
        selectText(texts[0]);
    }

    // 显示建议文案
    function displaySuggestions(texts) {
        suggestionsList.innerHTML = '';
        texts.forEach(text => {
            const li = document.createElement('li');
            li.textContent = text;
            li.addEventListener('click', function() {
                selectText(text);
            });
            suggestionsList.appendChild(li);
        });
    }

    // 选择文案
    function selectText(text) {
        applyTextToCanvas(text);
    }
    
    // 应用文案到canvas（内部函数，供选择和编辑使用）
    function applyTextToCanvas(text) {
        currentText = text;
        selectedText.textContent = text;
        
        // 同步到直接输入框（如果存在）
        if (textInput) {
            textInput.value = text;
        }
        
        // 智能分割文案：根据标点符号和长度判断
        // 如果文案较长（>15字符）且包含逗号、句号等，尝试分割
        if (text.length > 15) {
            // 查找合适的分割点（逗号、句号、问号、感叹号等）
            const splitPoints = [',', '，', '。', '.', '？', '?', '！', '!', '；', ';'];
            let splitIndex = -1;
            
            for (let i = 0; i < splitPoints.length; i++) {
                const midPoint = Math.floor(text.length / 2);
                // 在中间位置附近查找分割点
                for (let j = midPoint - 5; j <= midPoint + 5; j++) {
                    if (j >= 0 && j < text.length && text[j] === splitPoints[i]) {
                        splitIndex = j + 1;
                        break;
                    }
                }
                if (splitIndex > 0) break;
            }
            
            if (splitIndex > 0 && splitIndex < text.length) {
                // 找到分割点，按分割点分割
                topText.textContent = text.substring(0, splitIndex).trim();
                bottomText.textContent = text.substring(splitIndex).trim();
        } else {
                // 没找到合适的分割点，按长度分割
                const midPoint = Math.ceil(text.length / 2);
                // 尝试在词语边界分割（避免在汉字中间分割）
                let actualSplit = midPoint;
                for (let i = midPoint - 3; i <= midPoint + 3; i++) {
                    if (i > 0 && i < text.length && /[\s，。、]/.test(text[i])) {
                        actualSplit = i + 1;
                        break;
                    }
                }
                topText.textContent = text.substring(0, actualSplit).trim();
                bottomText.textContent = text.substring(actualSplit).trim();
            }
        } else {
            // 短文案只显示在底部
            topText.textContent = '';
            bottomText.textContent = text;
        }
        
        // 重置文字位置为默认（图片下方居中）
        textPosition.x = null;
        textPosition.y = null;
        
        // 更新canvas显示
        updateTextDisplay();
        
        // 显示编辑按钮
        if (editTextBtn) {
            editTextBtn.style.display = 'inline-block';
        }
    }
    
    // 显示文案编辑器
    function showTextEditor() {
        if (!textEditControls || !textEditInput || !editTextBtn) return;
        if (!currentText) {
            alert('请先选择文案！');
            return;
        }
        textEditInput.value = currentText;
        textEditControls.style.display = 'flex';
        editTextBtn.style.display = 'none';
        textEditInput.focus();
        textEditInput.select();
    }
    
    // 保存编辑的文案
    function saveTextEdit() {
        if (!textEditControls || !textEditInput || !editTextBtn) return;
        const editedText = textEditInput.value.trim();
        if (!editedText) {
            alert('文案不能为空！');
            return;
        }
        applyTextToCanvas(editedText);
        textEditControls.style.display = 'none';
        editTextBtn.style.display = 'inline-block';
    }
    
    // 取消编辑
    function cancelTextEdit() {
        if (!textEditControls || !editTextBtn || !textEditInput) return;
        textEditControls.style.display = 'none';
        editTextBtn.style.display = 'inline-block';
        textEditInput.value = '';
    }

    // 下载表情包
    function downloadMeme() {
        if (!currentImage || !currentText) {
            alert('请先上传图片并选择文案！');
            return;
        }

        // 如果是 GIF，使用特殊处理
        if (isGifImage) {
            downloadGifMeme();
            return;
        }

        // 普通图片处理
        downloadStaticMeme();
    }
    
    // 下载静态图片（PNG）
    function downloadStaticMeme() {
        // 确保图片是data URL格式（避免canvas污染）
        function ensureDataURL(url, callback) {
            if (url.startsWith('data:image')) {
                callback(url);
            } else {
                convertImageToDataURL(url, callback);
            }
        }
        
        ensureDataURL(currentImage, function(dataURL) {
            // 检查是否成功转换为 data URL
            if (!dataURL.startsWith('data:image')) {
                // 转换失败，可能是 file:// 协议的限制
                const isFileProtocol = window.location.protocol === 'file:';
                if (isFileProtocol) {
                    const message = '由于浏览器安全限制，直接打开文件时无法下载图片。\n\n' +
                                  '解决方法：\n' +
                                  '1. 使用 VS Code 的 Live Server 扩展\n' +
                                  '2. 或使用 Python：在文件夹中打开命令行，运行：python -m http.server 8000\n' +
                                  '   然后在浏览器访问：http://localhost:8000/meme-generator.html\n' +
                                  '3. 或使用 Node.js：npx http-server\n\n' +
                                  '或者：右键点击图片，选择"另存为"来保存（图片已包含文字）';
                    alert(message);
                    return;
                }
        }

        // 创建canvas来绘制图片和文字
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
            const useInfo = getUseTypeInfo();
        
        // 创建图片对象
        const img = new Image();
        
        img.onload = function() {
                try {
                    // 设置canvas尺寸（按用途目标尺寸，若无则用原图）
                    if (useInfo && useInfo.width && useInfo.height) {
                        // 使用指定的尺寸（会缩放并居中）
                        canvas.width = useInfo.width;
                        canvas.height = useInfo.height;
                        
                        // 计算缩放居中绘制
                        const scale = Math.min(canvas.width / img.width, canvas.height / img.height);
                        const drawW = img.width * scale;
                        const drawH = img.height * scale;
                        const dx = (canvas.width - drawW) / 2;
                        const dy = (canvas.height - drawH) / 2;
                        
                        // 绘制图片（缩放并居中）
                        ctx.drawImage(img, dx, dy, drawW, drawH);
                    } else {
                        // 保留原始尺寸比例，直接使用原图尺寸
            canvas.width = img.width;
            canvas.height = img.height;
            
                        // 直接绘制原图，不缩放
            ctx.drawImage(img, 0, 0);
                    }
            
                    // 绘制文字
                    drawTextToCanvas(ctx, canvas.width, canvas.height);
                    
                    // 清理文件名中的特殊字符
                    const cleanText = selectedText.textContent.replace(/[<>:"/\\|?*]/g, '_').substring(0, 50);
                    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
                    const useKey = useInfo ? useInfo.key : 'original';
                    const fileName = `${useKey}_${cleanText}_${timestamp}.png`;
            
            // 创建下载链接
            const link = document.createElement('a');
            link.download = fileName;
                    
                    // 使用 toBlob 下载
                    canvas.toBlob(function(blob) {
                        if (!blob) {
                            // 如果 toBlob 失败，使用 toDataURL 作为后备
                            try {
            link.href = canvas.toDataURL('image/png');
                                triggerDownload(link, false);
                            } catch (dataUrlError) {
                                console.error('toDataURL 也失败:', dataUrlError);
                                alert('生成图片失败：' + dataUrlError.message + '\n\n提示：请使用 HTTP 服务器运行网页。');
                            }
                            return;
                        }
                        
                        link.href = URL.createObjectURL(blob);
                        triggerDownload(link, true);
                    }, 'image/png');
                    
                    // 触发下载的通用函数
                    function triggerDownload(downloadLink, useBlob) {
                        // 将链接添加到DOM（某些浏览器需要）
                        downloadLink.style.display = 'none';
                        document.body.appendChild(downloadLink);
            
            // 触发下载
                setTimeout(() => {
                            downloadLink.click();
                            // 清理：移除链接和释放URL
                            setTimeout(() => {
                                document.body.removeChild(downloadLink);
                                if (useBlob) {
                                    URL.revokeObjectURL(downloadLink.href);
                                }
                }, 100);
                        }, 50);
                    }
                } catch (error) {
                    console.error('生成图片时出错:', error);
                    alert('生成图片失败：' + error.message);
            }
        };
        
        // 错误处理
        img.onerror = function() {
                console.error('图片加载失败:', dataURL.substring(0, 50) + '...');
                alert('图片加载失败，请重试！');
            };
            
            img.src = dataURL;
        });
    }
    
    // 下载 GIF 动图
    function downloadGifMeme() {
        // 检查 GIF.js 是否加载
        if (typeof GIF === 'undefined') {
            console.error('GIF.js 未加载');
            alert('GIF 处理库未加载，请刷新页面重试！\n\n如果问题持续，请检查网络连接或使用静态图片。');
            // 降级为静态图片
            isGifImage = false;
            downloadStaticMeme();
            return;
    }
    
        // 检查 gifuct-js 是否加载（可能以不同方式暴露）
        const hasGifuct = typeof parseGIF !== 'undefined' || 
                         typeof gifuct !== 'undefined' || 
                         (typeof window !== 'undefined' && window.gifuct);
        
        if (!hasGifuct) {
            console.error('gifuct-js 未加载');
            alert('GIF 解析库未加载，请刷新页面重试！\n\n如果问题持续，请检查网络连接或使用静态图片。');
            // 降级为静态图片
            isGifImage = false;
            downloadStaticMeme();
            return;
        }
        
        // 显示处理提示
        const processingMsg = alert('正在处理 GIF 动图，请稍候...\n\n注意：处理 GIF 可能需要一些时间，请耐心等待。');
        
        // 获取 GIF 数据
        // 如果 currentImage 是 data URL，需要转换为 blob
        let gifPromise;
        if (currentImage.startsWith('data:image/gif')) {
            // 将 data URL 转换为 blob
            gifPromise = fetch(currentImage)
                .then(response => response.blob())
                .then(blob => blob.arrayBuffer());
        } else {
            // 直接获取
            gifPromise = fetch(currentImage)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('HTTP error: ' + response.status);
                    }
                    return response.arrayBuffer();
                });
        }
        
        gifPromise.then(buffer => {
                try {
                    // 获取 parseGIF 函数（可能在不同的命名空间）
                    const parseGifFunc = typeof parseGIF !== 'undefined' ? parseGIF :
                                        (typeof gifuct !== 'undefined' && gifuct.parseGIF) ? gifuct.parseGIF :
                                        (typeof window !== 'undefined' && window.gifuct && window.gifuct.parseGIF) ? window.gifuct.parseGIF :
                                        null;
                    
                    if (!parseGifFunc) {
                        throw new Error('GIF 解析库未加载');
                    }
                    
                    // 解析 GIF
                    const gif = parseGifFunc(buffer);
                    
                    // 获取 decompressFrames 函数
                    const decompressFunc = typeof decompressFrames !== 'undefined' ? decompressFrames :
                                         (typeof gifuct !== 'undefined' && gifuct.decompressFrames) ? gifuct.decompressFrames :
                                         (typeof window !== 'undefined' && window.gifuct && window.gifuct.decompressFrames) ? window.gifuct.decompressFrames :
                                         null;
                    
                    if (!decompressFunc) {
                        throw new Error('GIF 解压函数未找到');
                    }
                    
                    const frames = decompressFunc(gif, true);
                    
                    if (!frames || frames.length === 0) {
                        alert('无法解析 GIF 文件，请尝试使用静态图片。');
                        return;
                    }
                    
                    // 创建 GIF 编码器
                    const gifEncoder = new GIF({
                        workers: 2,
                        quality: 10,
                        width: gif.lsd.width,
                        height: gif.lsd.height
                    });
                    
                    // 处理每一帧
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    canvas.width = gif.lsd.width;
                    canvas.height = gif.lsd.height;
                    
                    let frameIndex = 0;
                    
                    function processNextFrame() {
                        if (frameIndex >= frames.length) {
                            // 所有帧处理完成，生成 GIF
                            gifEncoder.on('finished', function(blob) {
                                // 清理文件名中的特殊字符
                                const cleanText = selectedText.textContent.replace(/[<>:"/\\|?*]/g, '_').substring(0, 50);
                                const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
                                const fileName = `meme_${cleanText}_${timestamp}.gif`;
        
                                // 创建下载链接
                                const link = document.createElement('a');
                                link.download = fileName;
                                link.href = URL.createObjectURL(blob);
                                
                                // 触发下载
                                link.style.display = 'none';
                                document.body.appendChild(link);
                                setTimeout(() => {
                                    link.click();
                                    setTimeout(() => {
                                        document.body.removeChild(link);
                                        URL.revokeObjectURL(link.href);
                                    }, 100);
                                }, 50);
                            });
                            
                            gifEncoder.render();
                            return;
                        }
                        
                        const frame = frames[frameIndex];
        
                        // 创建帧图像
                        const frameCanvas = document.createElement('canvas');
                        const frameCtx = frameCanvas.getContext('2d');
                        frameCanvas.width = gif.lsd.width;
                        frameCanvas.height = gif.lsd.height;
                        
                        try {
                            // 如果是第一帧，绘制完整图像
                            if (frameIndex === 0) {
                                // 第一帧需要完整绘制
                                if (frame.patch && frame.dims) {
                                    const patchImage = new ImageData(
                                        new Uint8ClampedArray(frame.patch),
                                        frame.dims.width,
                                        frame.dims.height
                                    );
                                    frameCtx.putImageData(patchImage, frame.dims.left, frame.dims.top);
                                } else {
                                    // 如果结构不同，尝试其他方式
                                    console.warn('帧结构异常，尝试备用方法');
                                    // 使用原始 GIF 的第一帧
                                    const img = new Image();
                                    img.onload = function() {
                                        frameCtx.drawImage(img, 0, 0);
                                    };
                                    img.src = currentImage;
                                }
                            } else {
                                // 复制上一帧
                                frameCtx.drawImage(canvas, 0, 0);
                                // 应用当前帧的补丁
                                if (frame.patch && frame.dims) {
                                    const patchImage = new ImageData(
                                        new Uint8ClampedArray(frame.patch),
                                        frame.dims.width,
                                        frame.dims.height
                                    );
                                    frameCtx.putImageData(patchImage, frame.dims.left, frame.dims.top);
                                }
                            }
                            
                            // 绘制文字（在每一帧上）
                            drawTextToCanvas(frameCtx, frameCanvas.width, frameCanvas.height);
                            
                            // 更新主 canvas
                            ctx.clearRect(0, 0, canvas.width, canvas.height);
                            ctx.drawImage(frameCanvas, 0, 0);
                            
                            // 添加到 GIF 编码器
                            const delay = frame.delay ? (frame.delay * 10) : 100; // 转换为毫秒
                            gifEncoder.addFrame(frameCanvas, {
                                delay: delay
                            });
                        } catch (frameError) {
                            console.error('处理帧时出错:', frameError, frame);
                            // 跳过这一帧，继续处理下一帧
                        }
                        
                        frameIndex++;
                        // 继续处理下一帧
                        setTimeout(processNextFrame, 10);
                    }
                    
                    // 开始处理
                    processNextFrame();
                    
                } catch (error) {
                    console.error('处理 GIF 失败:', error);
                    alert('处理 GIF 失败：' + error.message + '\n\n将导出为静态图片。\n\n提示：如果 GIF 文件过大或帧数过多，处理可能会失败。');
                    // 失败时导出为静态图片
                    isGifImage = false;
                    downloadStaticMeme();
                }
            })
            .catch(error => {
                console.error('加载 GIF 失败:', error);
                alert('加载 GIF 文件失败：' + error.message + '\n\n将导出为静态图片。');
                // 失败时导出为静态图片
                isGifImage = false;
                downloadStaticMeme();
            });
    }
    
    // 绘制文字（使用更圆润的字体，去除阴影效果）
    // 保留旧的 drawText 函数作为备用（已弃用，使用 drawMultilineText 代替）
    function drawText(ctx, text, x, y, maxWidth) {
        // 使用新的多行文本绘制函数
        drawMultilineText(ctx, text, x, y, maxWidth, 'top', {
            top: 20,
            bottom: ctx.canvas.height - 20,
            centerStart: ctx.canvas.height * 0.3,
            centerEnd: ctx.canvas.height * 0.7,
            hasFace: false
        });
    }
    
    // 绘制可爱装饰
    function drawCuteDecorations(ctx, width, height) {
        ctx.font = `${Math.min(width * 0.04, 30)}px Arial`;
        ctx.fillStyle = 'rgba(255, 182, 193, 0.7)'; // 粉色
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        
        // 在角落添加一些小装饰
        ctx.fillText('★', width * 0.1, height * 0.1);
        ctx.fillText('♥', width * 0.85, height * 0.15);
        ctx.fillText('✦', width * 0.15, height * 0.85);
        ctx.fillText('✧', width * 0.8, height * 0.8);
        
        ctx.fillStyle = 'rgba(135, 206, 250, 0.7)'; // 天蓝色
        ctx.fillText('☆', width * 0.2, height * 0.2);
        ctx.fillText('♡', width * 0.75, height * 0.25);
    }
    
    // ==================== 可视化编辑工作台功能 ====================
    
    // 进入工作台
    function enterWorkspace() {
        if (!currentImage) {
            alert('请先上传图片或选择模板！');
            return;
        }
        
        // 保存当前状态到历史
        saveToHistory();
        
        // 初始化图层
        initializeLayers();
        
        // 切换到工作台模式
        if (normalMode) normalMode.style.display = 'none';
        if (workspaceMode) workspaceMode.style.display = 'block';
        
        // 初始化工作台canvas
        initializeWorkspaceCanvas();
        
        // 更新预览
        updateWorkspacePreview();
        
        // 滚动至工作台区域
        if (workspaceMode && workspaceMode.scrollIntoView) {
            workspaceMode.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }
    
    // 退出工作台
    function exitWorkspace() {
        workspaceMode.style.display = 'none';
        normalMode.style.display = 'block';
    }
    
    // 初始化图层
    function initializeLayers() {
        layers = [];
        
        // 添加背景图片层
        if (currentImage) {
            layers.push({
                id: 'bg_' + Date.now(),
                type: 'image',
                name: '背景图片',
                visible: true,
                order: 0,
                data: {
                    src: currentImage,
                    x: 0,
                    y: 0,
                    width: 0,  // 将在加载时设置
                    height: 0
                }
            });
        }
        
        // 添加现有文字层
        if (topText.textContent) {
            layers.push({
                id: 'text_top_' + Date.now(),
                type: 'text',
                name: '顶部文字',
                visible: true,
                order: 1,
                data: {
                    text: topText.textContent,
                    x: textPosition.x !== null ? textPosition.x : null,
                    y: textPosition.y !== null ? textPosition.y : null,
                    fontSize: 40,
                    fontFamily: '"Microsoft YaHei", "PingFang SC", "Hiragino Sans GB", Arial, sans-serif',
                    color: '#FFFFFF',
                    strokeColor: '#000000',
                    strokeWidth: 2,
                    align: 'center',
                    opacity: 1
                }
            });
        }
        
        if (bottomText.textContent) {
            layers.push({
                id: 'text_bottom_' + Date.now(),
                type: 'text',
                name: '底部文字',
                visible: true,
                order: 2,
                data: {
                    text: bottomText.textContent,
                    x: textPosition.x !== null ? textPosition.x : null,
                    y: textPosition.y !== null ? textPosition.y : null,
                    fontSize: 40,
                    fontFamily: '"Microsoft YaHei", "PingFang SC", "Hiragino Sans GB", Arial, sans-serif',
                    color: '#FFFFFF',
                    strokeColor: '#000000',
                    strokeWidth: 2,
                    align: 'center',
                    opacity: 1
                }
            });
        }
        
        // 更新图层列表显示
        updateLayerList();
    }
    
    // 初始化工作台canvas
    function initializeWorkspaceCanvas() {
        if (!workspaceCanvas) return;
        
        // 获取背景图片尺寸
        const img = new Image();
        img.onload = function() {
            workspaceCanvas.width = img.width;
            workspaceCanvas.height = img.height;
            workspaceCtx = workspaceCanvas.getContext('2d');
            updateWorkspacePreview();
        };
        img.src = currentImage;
    }
    
    // 更新图层列表显示
    function updateLayerList() {
        if (!layerList) return;
        
        layerList.innerHTML = '';
        
        // 按顺序排序
        const sortedLayers = [...layers].sort((a, b) => a.order - b.order);
        
        sortedLayers.forEach((layer, index) => {
            const li = document.createElement('li');
            li.className = 'layer-item';
            if (index === selectedLayerIndex) {
                li.classList.add('active');
            }
            
            li.innerHTML = `
                <span class="layer-item-name">${layer.name}</span>
                <div class="layer-item-controls">
                    <button class="layer-toggle-btn" data-index="${index}">
                        ${layer.visible ? '👁' : '🚫'}
                    </button>
                    <button class="layer-delete-btn" data-index="${index}">×</button>
                </div>
            `;
            
            li.addEventListener('click', function(e) {
                if (!e.target.classList.contains('layer-toggle-btn') && 
                    !e.target.classList.contains('layer-delete-btn')) {
                    selectLayer(index);
                }
            });
            
            // 切换显示/隐藏
            const toggleBtn = li.querySelector('.layer-toggle-btn');
            toggleBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                toggleLayerVisibility(index);
            });
            
            // 删除图层
            const deleteBtn = li.querySelector('.layer-delete-btn');
            deleteBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                deleteLayer(index);
            });
            
            layerList.appendChild(li);
        });
        
        // 使图层可拖拽排序
        makeLayersSortable();
    }
    
    // 使图层可拖拽排序
    function makeLayersSortable() {
        // 简单的拖拽实现
        const items = layerList.querySelectorAll('.layer-item');
        items.forEach((item, index) => {
            item.draggable = true;
            item.addEventListener('dragstart', function(e) {
                e.dataTransfer.setData('text/plain', index);
            });
            item.addEventListener('dragover', function(e) {
                e.preventDefault();
            });
            item.addEventListener('drop', function(e) {
                e.preventDefault();
                const draggedIndex = parseInt(e.dataTransfer.getData('text/plain'));
                const targetIndex = index;
                if (draggedIndex !== targetIndex) {
                    reorderLayer(draggedIndex, targetIndex);
                }
            });
        });
    }
    
    // 重新排序图层
    function reorderLayer(fromIndex, toIndex) {
        const sortedLayers = [...layers].sort((a, b) => a.order - b.order);
        const movedLayer = sortedLayers[fromIndex];
        
        if (fromIndex < toIndex) {
            for (let i = fromIndex; i < toIndex; i++) {
                sortedLayers[i].order = sortedLayers[i + 1].order;
            }
        } else {
            for (let i = fromIndex; i > toIndex; i--) {
                sortedLayers[i].order = sortedLayers[i - 1].order;
            }
        }
        movedLayer.order = sortedLayers[toIndex].order;
        
        // 重新分配order值
        sortedLayers.forEach((layer, index) => {
            layer.order = index;
        });
        
        saveToHistory();
        updateLayerList();
        updateWorkspacePreview();
    }
    
    // 选择图层
    function selectLayer(index) {
        selectedLayerIndex = index;
        updateLayerList();
        updatePropertyPanel();
    }
    
    // 切换图层可见性
    function toggleLayerVisibility(index) {
        const sortedLayers = [...layers].sort((a, b) => a.order - b.order);
        sortedLayers[index].visible = !sortedLayers[index].visible;
        saveToHistory();
        updateLayerList();
        updateWorkspacePreview();
    }
    
    // 删除图层
    function deleteLayer(index) {
        if (!confirm('确定要删除这个图层吗？')) return;
        
        const sortedLayers = [...layers].sort((a, b) => a.order - b.order);
        const layer = sortedLayers[index];
        
        // 不能删除背景层
        if (layer.type === 'image') {
            alert('不能删除背景图片层！');
            return;
        }
        
        layers = layers.filter(l => l.id !== layer.id);
        selectedLayerIndex = -1;
        saveToHistory();
        updateLayerList();
        updatePropertyPanel();
        updateWorkspacePreview();
    }
    
    // 添加文字层
    function addTextLayer() {
        const text = prompt('请输入文字内容：');
        if (!text) return;
        
        const newLayer = {
            id: 'text_' + Date.now(),
            type: 'text',
            name: '文字层 ' + (layers.filter(l => l.type === 'text').length + 1),
            visible: true,
            order: layers.length,
            data: {
                text: text,
                x: workspaceCanvas ? workspaceCanvas.width / 2 : 250,
                y: workspaceCanvas ? workspaceCanvas.height / 2 : 250,
                fontSize: 40,
                fontFamily: '"Microsoft YaHei", "PingFang SC", "Hiragino Sans GB", Arial, sans-serif',
                color: '#FFFFFF',
                strokeColor: '#000000',
                strokeWidth: 2,
                align: 'center',
                opacity: 1
            }
        };
        
        layers.push(newLayer);
        selectedLayerIndex = layers.length - 1;
        saveToHistory();
        updateLayerList();
        updatePropertyPanel();
        updateWorkspacePreview();
    }
    
    // 更新属性面板
    function updatePropertyPanel() {
        if (!propertyPanel) return;
        
        if (selectedLayerIndex === -1) {
            propertyPanel.innerHTML = '<p class="no-selection">请选择一个图层进行编辑</p>';
            return;
        }
        
        const sortedLayers = [...layers].sort((a, b) => a.order - b.order);
        const layer = sortedLayers[selectedLayerIndex];
        
        if (layer.type === 'text') {
            propertyPanel.innerHTML = `
                <div class="property-group">
                    <div class="property-item">
                        <label>文字内容</label>
                        <input type="text" id="prop-text" value="${layer.data.text}" 
                               onchange="updateLayerProperty('text', this.value)">
                    </div>
                    <div class="property-item">
                        <label>字体大小</label>
                        <input type="number" id="prop-fontSize" value="${layer.data.fontSize}" 
                               min="10" max="200" 
                               onchange="updateLayerProperty('fontSize', parseFloat(this.value))">
                    </div>
                    <div class="property-item">
                        <label>文字颜色</label>
                        <input type="color" id="prop-color" value="${layer.data.color}" 
                               onchange="updateLayerProperty('color', this.value)">
                    </div>
                    <div class="property-item">
                        <label>描边颜色</label>
                        <input type="color" id="prop-strokeColor" value="${layer.data.strokeColor}" 
                               onchange="updateLayerProperty('strokeColor', this.value)">
                    </div>
                    <div class="property-item">
                        <label>描边宽度</label>
                        <input type="number" id="prop-strokeWidth" value="${layer.data.strokeWidth}" 
                               min="0" max="10" step="0.5"
                               onchange="updateLayerProperty('strokeWidth', parseFloat(this.value))">
                    </div>
                    <div class="property-item">
                        <label>X 坐标</label>
                        <input type="number" id="prop-x" value="${layer.data.x || 0}" 
                               onchange="updateLayerProperty('x', parseFloat(this.value))">
                    </div>
                    <div class="property-item">
                        <label>Y 坐标</label>
                        <input type="number" id="prop-y" value="${layer.data.y || 0}" 
                               onchange="updateLayerProperty('y', parseFloat(this.value))">
                    </div>
                    <div class="property-item">
                        <label>透明度</label>
                        <input type="range" id="prop-opacity" value="${layer.data.opacity * 100}" 
                               min="0" max="100" 
                               oninput="updateLayerProperty('opacity', parseFloat(this.value) / 100)">
                        <span>${Math.round(layer.data.opacity * 100)}%</span>
                    </div>
                    <div class="property-item">
                        <label>对齐方式</label>
                        <select id="prop-align" onchange="updateLayerProperty('align', this.value)">
                            <option value="left" ${layer.data.align === 'left' ? 'selected' : ''}>左对齐</option>
                            <option value="center" ${layer.data.align === 'center' ? 'selected' : ''}>居中</option>
                            <option value="right" ${layer.data.align === 'right' ? 'selected' : ''}>右对齐</option>
                        </select>
                    </div>
                </div>
            `;
        } else if (layer.type === 'image') {
            propertyPanel.innerHTML = `
                <div class="property-group">
                    <div class="property-item">
                        <label>图层名称</label>
                        <input type="text" id="prop-name" value="${layer.name}" 
                               onchange="updateLayerName(this.value)">
                    </div>
                    <p class="no-selection">背景图片层，不可编辑属性</p>
                </div>
            `;
        }
    }
    
    // 更新图层属性（全局函数，供HTML调用）
    window.updateLayerProperty = function(property, value) {
        if (selectedLayerIndex === -1) return;
        
        const sortedLayers = [...layers].sort((a, b) => a.order - b.order);
        const layer = sortedLayers[selectedLayerIndex];
        
        if (layer.data[property] !== undefined) {
            layer.data[property] = value;
            saveToHistory();
            updateWorkspacePreview();
        }
    };
    
    // 更新图层名称
    window.updateLayerName = function(name) {
        if (selectedLayerIndex === -1) return;
        
        const sortedLayers = [...layers].sort((a, b) => a.order - b.order);
        sortedLayers[selectedLayerIndex].name = name;
        updateLayerList();
    };
    
    // 更新工作台预览
    function updateWorkspacePreview() {
        if (!workspaceCtx || !workspaceCanvas) return;
        
        // 清空canvas
        workspaceCtx.clearRect(0, 0, workspaceCanvas.width, workspaceCanvas.height);
        
        // 按顺序绘制所有可见图层
        const sortedLayers = [...layers].sort((a, b) => a.order - b.order);
        
        sortedLayers.forEach(layer => {
            if (!layer.visible) return;
            
            if (layer.type === 'image') {
                // 绘制图片
                const img = new Image();
                img.onload = function() {
                    workspaceCtx.globalAlpha = layer.data.opacity || 1;
                    workspaceCtx.drawImage(img, 0, 0, workspaceCanvas.width, workspaceCanvas.height);
                    workspaceCtx.globalAlpha = 1;
                };
                img.src = layer.data.src;
            } else if (layer.type === 'text') {
                // 绘制文字
                workspaceCtx.save();
                workspaceCtx.globalAlpha = layer.data.opacity || 1;
                workspaceCtx.font = `bold ${layer.data.fontSize}px ${layer.data.fontFamily}`;
                workspaceCtx.fillStyle = layer.data.color;
                workspaceCtx.strokeStyle = layer.data.strokeColor;
                workspaceCtx.lineWidth = layer.data.strokeWidth;
                workspaceCtx.textAlign = layer.data.align;
                workspaceCtx.textBaseline = 'middle';
                
                // 计算文字位置
                const x = layer.data.x !== null ? layer.data.x : workspaceCanvas.width / 2;
                const y = layer.data.y !== null ? layer.data.y : workspaceCanvas.height / 2;
                
                // 绘制描边
                workspaceCtx.strokeText(layer.data.text, x, y);
                // 绘制填充
                workspaceCtx.fillText(layer.data.text, x, y);
                
                workspaceCtx.restore();
            }
        });
    }
    
    // 保存到历史记录
    function saveToHistory() {
        const state = {
            timestamp: Date.now(),
            layers: JSON.parse(JSON.stringify(layers)),
            selectedLayerIndex: selectedLayerIndex
        };
        
        historyStack.push(state);
        
        // 限制历史记录数量
        if (historyStack.length > maxHistorySize) {
            historyStack.shift();
        }
        
        updateHistoryList();
    }
    
    // 更新历史记录列表
    function updateHistoryList() {
        if (!historyList) return;
        
        historyList.innerHTML = '';
        
        // 显示最近的历史记录（倒序）
        const recentHistory = historyStack.slice(-10).reverse();
        
        recentHistory.forEach((history, index) => {
            const item = document.createElement('div');
            item.className = 'history-item';
            const date = new Date(history.timestamp);
            item.textContent = `版本 ${historyStack.length - index} - ${date.toLocaleTimeString()}`;
            
            item.addEventListener('click', function() {
                restoreFromHistory(historyStack.length - 1 - index);
            });
            
            historyList.appendChild(item);
        });
    }
    
    // 从历史记录恢复
    function restoreFromHistory(index) {
        if (index < 0 || index >= historyStack.length) return;
        
        const history = historyStack[index];
        layers = JSON.parse(JSON.stringify(history.layers));
        selectedLayerIndex = history.selectedLayerIndex;
        
        updateLayerList();
        updatePropertyPanel();
        updateWorkspacePreview();
    }
    
    // 清空历史记录
    function clearHistory() {
        if (!confirm('确定要清空所有历史记录吗？')) return;
        historyStack = [];
        updateHistoryList();
    }
    
    // 导出工作台内容
    function exportWorkspace() {
        if (!workspaceCanvas) return;
        
        // 保存到历史
        saveToHistory();
        
        // 创建下载
        workspaceCanvas.toBlob(function(blob) {
            if (!blob) {
                alert('导出失败，请重试！');
                return;
            }
            
            const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
            const fileName = `meme_workspace_${timestamp}.png`;
            
            const link = document.createElement('a');
            link.download = fileName;
            link.href = URL.createObjectURL(blob);
            link.style.display = 'none';
            document.body.appendChild(link);
            link.click();
            setTimeout(() => {
                document.body.removeChild(link);
                URL.revokeObjectURL(link.href);
            }, 100);
        }, 'image/png');
    }
    
    // ==================== 图片裁剪功能 ====================
    
    // 开始裁剪
    function startCrop() {
        if (!currentImage) {
            alert('请先上传图片！');
            return;
        }
        
        if (isGifImage) {
            alert('GIF 图片暂不支持裁剪功能！');
            return;
        }
        
        isCropping = true;
        if (cropSection) cropSection.style.display = 'block';
        
        // 加载图片到裁剪canvas
        const img = new Image();
        img.onload = function() {
            if (!cropCanvas) return;
            
            // 设置canvas尺寸
            const maxWidth = 800;
            const maxHeight = 600;
            let displayWidth = img.width;
            let displayHeight = img.height;
            
            // 缩放以适应显示区域
            if (displayWidth > maxWidth || displayHeight > maxHeight) {
                const scale = Math.min(maxWidth / displayWidth, maxHeight / displayHeight);
                displayWidth = displayWidth * scale;
                displayHeight = displayHeight * scale;
            }
            
            cropCanvas.width = displayWidth;
            cropCanvas.height = displayHeight;
            
            const ctx = cropCanvas.getContext('2d');
            ctx.drawImage(img, 0, 0, displayWidth, displayHeight);
            
            // 初始化裁剪区域（默认选择整个图片）
            cropStartX = 0;
            cropStartY = 0;
            cropEndX = displayWidth;
            cropEndY = displayHeight;
            
            // 绘制裁剪框
            drawCropOverlay();
            
            // 添加事件监听器（鼠标和触摸）
            if (cropCanvas) {
                cropCanvas.addEventListener('mousedown', handleCropMouseDown);
                cropCanvas.addEventListener('mousemove', handleCropMouseMove);
                cropCanvas.addEventListener('mouseup', handleCropMouseUp);
                cropCanvas.addEventListener('mouseleave', handleCropMouseUp);
                // 触摸事件支持
                cropCanvas.addEventListener('touchstart', handleCropTouchStart, { passive: false });
                cropCanvas.addEventListener('touchmove', handleCropTouchMove, { passive: false });
                cropCanvas.addEventListener('touchend', handleCropTouchEnd, { passive: false });
            }
        };
        img.src = currentImage;
    }
    
    // 绘制裁剪覆盖层
    function drawCropOverlay() {
        if (!cropCanvas) return;
        
        const ctx = cropCanvas.getContext('2d');
        const width = cropCanvas.width;
        const height = cropCanvas.height;
        
        // 重新绘制图片
        const img = new Image();
        img.onload = function() {
            ctx.drawImage(img, 0, 0, width, height);
            
            // 绘制半透明遮罩
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.fillRect(0, 0, width, height);
            
            // 清除裁剪区域
            ctx.clearRect(cropStartX, cropStartY, cropEndX - cropStartX, cropEndY - cropStartY);
            
            // 重新绘制裁剪区域的图片
            ctx.drawImage(img, cropStartX, cropStartY, cropEndX - cropStartX, cropEndY - cropStartY, 
                         cropStartX, cropStartY, cropEndX - cropStartX, cropEndY - cropStartY);
            
            // 绘制裁剪框边框
            ctx.strokeStyle = '#667eea';
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);
            ctx.strokeRect(cropStartX, cropStartY, cropEndX - cropStartX, cropEndY - cropStartY);
            ctx.setLineDash([]);
            
            // 绘制控制点
            const handleSize = 10;
            ctx.fillStyle = '#667eea';
            // 四个角
            ctx.fillRect(cropStartX - handleSize/2, cropStartY - handleSize/2, handleSize, handleSize);
            ctx.fillRect(cropEndX - handleSize/2, cropStartY - handleSize/2, handleSize, handleSize);
            ctx.fillRect(cropStartX - handleSize/2, cropEndY - handleSize/2, handleSize, handleSize);
            ctx.fillRect(cropEndX - handleSize/2, cropEndY - handleSize/2, handleSize, handleSize);
            // 四个边中点
            ctx.fillRect((cropStartX + cropEndX)/2 - handleSize/2, cropStartY - handleSize/2, handleSize, handleSize);
            ctx.fillRect((cropStartX + cropEndX)/2 - handleSize/2, cropEndY - handleSize/2, handleSize, handleSize);
            ctx.fillRect(cropStartX - handleSize/2, (cropStartY + cropEndY)/2 - handleSize/2, handleSize, handleSize);
            ctx.fillRect(cropEndX - handleSize/2, (cropStartY + cropEndY)/2 - handleSize/2, handleSize, handleSize);
        };
        img.src = currentImage;
    }
    
    // 裁剪鼠标按下
    function handleCropMouseDown(e) {
        if (!isCropping) return;
        
        const pos = getCropEventPos(e);
        
        // 检测是否点击在裁剪框内
        if (pos.x >= cropStartX && pos.x <= cropEndX && pos.y >= cropStartY && pos.y <= cropEndY) {
            isDraggingCrop = true;
            dragOffset.x = pos.x - cropStartX;
            dragOffset.y = pos.y - cropStartY;
        }
    }
    
    // 裁剪鼠标移动
    function handleCropMouseMove(e) {
        if (!isCropping || !isDraggingCrop) return;
        
        const pos = getCropEventPos(e);
        
        // 移动裁剪框
        cropStartX = Math.max(0, Math.min(pos.x - dragOffset.x, cropCanvas.width));
        cropStartY = Math.max(0, Math.min(pos.y - dragOffset.y, cropCanvas.height));
        cropEndX = Math.min(cropCanvas.width, Math.max(cropStartX + 50, cropStartX + (cropEndX - cropStartX)));
        cropEndY = Math.min(cropCanvas.height, Math.max(cropStartY + 50, cropStartY + (cropEndY - cropStartY)));
        
        drawCropOverlay();
    }
    
    // 裁剪鼠标释放
    function handleCropMouseUp(e) {
        if (isDraggingCrop) {
            isDraggingCrop = false;
        }
    }
    
    // 获取事件坐标（支持鼠标和触摸）
    function getCropEventPos(e) {
        const rect = cropCanvas.getBoundingClientRect();
        if (e.touches && e.touches.length > 0) {
            // 触摸事件
            return {
                x: e.touches[0].clientX - rect.left,
                y: e.touches[0].clientY - rect.top
            };
        } else {
            // 鼠标事件
            return {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            };
        }
    }
    
    // 裁剪触摸开始
    function handleCropTouchStart(e) {
        e.preventDefault();
        if (!isCropping) return;
        
        const pos = getCropEventPos(e);
        
        // 检测是否点击在裁剪框内
        if (pos.x >= cropStartX && pos.x <= cropEndX && pos.y >= cropStartY && pos.y <= cropEndY) {
            isDraggingCrop = true;
            dragOffset.x = pos.x - cropStartX;
            dragOffset.y = pos.y - cropStartY;
        }
    }
    
    // 裁剪触摸移动
    function handleCropTouchMove(e) {
        e.preventDefault();
        if (!isCropping || !isDraggingCrop) return;
        
        const pos = getCropEventPos(e);
        
        // 移动裁剪框
        cropStartX = Math.max(0, Math.min(pos.x - dragOffset.x, cropCanvas.width));
        cropStartY = Math.max(0, Math.min(pos.y - dragOffset.y, cropCanvas.height));
        cropEndX = Math.min(cropCanvas.width, Math.max(cropStartX + 50, cropStartX + (cropEndX - cropStartX)));
        cropEndY = Math.min(cropCanvas.height, Math.max(cropStartY + 50, cropStartY + (cropEndY - cropStartY)));
        
        drawCropOverlay();
    }
    
    // 裁剪触摸结束
    function handleCropTouchEnd(e) {
        e.preventDefault();
        if (isDraggingCrop) {
            isDraggingCrop = false;
        }
    }
    
    // 确认裁剪
    function confirmCrop() {
        if (!currentImage || !cropCanvas) return;
        
        // 计算原始图片的裁剪区域
        const img = new Image();
        img.onload = function() {
            const scaleX = img.width / cropCanvas.width;
            const scaleY = img.height / cropCanvas.height;
            
            const srcX = cropStartX * scaleX;
            const srcY = cropStartY * scaleY;
            const srcWidth = (cropEndX - cropStartX) * scaleX;
            const srcHeight = (cropEndY - cropStartY) * scaleY;
            
            // 创建新的canvas来保存裁剪后的图片
            const newCanvas = document.createElement('canvas');
            newCanvas.width = srcWidth;
            newCanvas.height = srcHeight;
            const newCtx = newCanvas.getContext('2d');
            
            // 绘制裁剪后的图片
            newCtx.drawImage(img, srcX, srcY, srcWidth, srcHeight, 0, 0, srcWidth, srcHeight);
            
            // 转换为data URL并更新当前图片
            currentImage = newCanvas.toDataURL('image/png');
            
            // 更新显示
            displayImage(currentImage);
            
            // 如果有文字，重新应用
            if (currentText) {
                applyTextToCanvas(currentText);
            }
            
            // 关闭裁剪界面
            cancelCrop();
        };
        img.src = currentImage;
    }
    
    // 取消裁剪
    function cancelCrop() {
        isCropping = false;
        isDraggingCrop = false;
        if (cropSection) cropSection.style.display = 'none';
        if (cropCanvas) {
            cropCanvas.removeEventListener('mousedown', handleCropMouseDown);
            cropCanvas.removeEventListener('mousemove', handleCropMouseMove);
            cropCanvas.removeEventListener('mouseup', handleCropMouseUp);
            cropCanvas.removeEventListener('mouseleave', handleCropMouseUp);
            cropCanvas.removeEventListener('touchstart', handleCropTouchStart);
            cropCanvas.removeEventListener('touchmove', handleCropTouchMove);
            cropCanvas.removeEventListener('touchend', handleCropTouchEnd);
        }
    }
});
