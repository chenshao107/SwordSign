import * as vscode from 'vscode';

// 名剑列表 - 历史上的名剑 + 秦时明月剑谱
const SWORDS = [
    "轩辕剑", "湛卢", "赤霄", "泰阿", "七星龙渊", "干将", "莫邪", "鱼肠", "纯钧", "承影",
    "巨阙", "辟闾", "纯钩", "掩日", "断水", "转魄", "黑白玄翦", "惊鲵", "灭魂", "却邪",
    "真刚", "含光", "宵练", "定秦", "倚天", "青釭", "雌雄双股", "青龙偃月", "丈八蛇矛",
    "涯角", "宛天", "照胆",
    "天问", "渊虹", "太阿", "雪霁", "水寒", "墨眉", "秋骊", "凌虚", "巨阙", "潜蛟",
    "赤霄", "天照", "含光", "霜魂", "镇岳", "乱神", "魍魉", "转魂", "灭魄",
    "断水", "八尺", "逆鳞", "鲨齿", "虎魄", "天罡", "地煞"
];

let decorationType: vscode.TextEditorDecorationType | undefined;
let isEnabled: boolean = true;
let statusBarItem: vscode.StatusBarItem | undefined;
let currentSwordName: string = '';

export function activate(context: vscode.ExtensionContext) {
    // 初始化
    updateWatermark();

    // 监听配置变化
    context.subscriptions.push(
        vscode.workspace.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration('swordsign')) {
                updateWatermark();
            }
        })
    );

    // 监听编辑器变化 - 新打开编辑器时应用水印
    context.subscriptions.push(
        vscode.window.onDidChangeVisibleTextEditors(() => {
            if (isEnabled) {
                applyWatermarkToAllEditors();
            }
        })
    );

    // 注册刷新命令
    context.subscriptions.push(
        vscode.commands.registerCommand('swordsign.refresh', () => {
            updateWatermark();
            vscode.window.showInformationMessage(`SwordSign 已切换为 [${currentSwordName}]`);
        })
    );

    // 注册总开关命令
    context.subscriptions.push(
        vscode.commands.registerCommand('swordsign.toggle', () => {
            const config = vscode.workspace.getConfiguration('swordsign');
            const newValue = !config.get<boolean>('enabled');
            config.update('enabled', newValue, vscode.ConfigurationTarget.Workspace);
            vscode.window.showInformationMessage(`SwordSign 总开关: ${newValue ? '开启' : '关闭'}`);
        })
    );

    // 注册水印开关命令
    context.subscriptions.push(
        vscode.commands.registerCommand('swordsign.toggleWatermark', () => {
            const config = vscode.workspace.getConfiguration('swordsign');
            const newValue = !config.get<boolean>('showWatermark');
            config.update('showWatermark', newValue, vscode.ConfigurationTarget.Workspace);
            vscode.window.showInformationMessage(`背景水印: ${newValue ? '开启' : '关闭'}`);
        })
    );

    // 注册状态栏开关命令
    context.subscriptions.push(
        vscode.commands.registerCommand('swordsign.toggleStatusBar', () => {
            const config = vscode.workspace.getConfiguration('swordsign');
            const newValue = !config.get<boolean>('showStatusBar');
            config.update('showStatusBar', newValue, vscode.ConfigurationTarget.Workspace);
            vscode.window.showInformationMessage(`状态栏标识: ${newValue ? '开启' : '关闭'}`);
        })
    );

    // 注册窗口标题开关命令
    context.subscriptions.push(
        vscode.commands.registerCommand('swordsign.toggleWindowTitle', () => {
            const config = vscode.workspace.getConfiguration('swordsign');
            const newValue = !config.get<boolean>('showWindowTitle');
            config.update('showWindowTitle', newValue, vscode.ConfigurationTarget.Workspace);
            vscode.window.showInformationMessage(`窗口标题标识: ${newValue ? '开启' : '关闭'}`);
        })
    );

    // 注册设置文字命令
    context.subscriptions.push(
        vscode.commands.registerCommand('swordsign.setText', async () => {
            const input = await vscode.window.showInputBox({
                prompt: '输入自定义标识文字（留空则使用随机名剑）',
                placeHolder: '例如：开发环境、测试环境、项目A...',
                value: currentSwordName
            });
            if (input !== undefined) {
                const config = vscode.workspace.getConfiguration('swordsign');
                await config.update('text', input, vscode.ConfigurationTarget.Workspace);
                vscode.window.showInformationMessage(`标识已设置为: ${input || '随机名剑'}`);
            }
        })
    );
}

export function deactivate() {
    clearWatermark();
}

function updateWatermark() {
    const config = vscode.workspace.getConfiguration('swordsign');
    
    // 检查总开关
    isEnabled = config.get<boolean>('enabled') ?? true;
    if (!isEnabled) {
        clearWatermark();
        return;
    }

    // 获取配置
    let text = config.get<string>('text') || '';
    // 如果没有配置文字，随机从名剑列表中选择
    if (!text.trim()) {
        text = SWORDS[Math.floor(Math.random() * SWORDS.length)];
    }
    currentSwordName = text;
    
    // 获取各功能开关
    const showWatermark = config.get<boolean>('showWatermark') ?? true;
    const showStatusBar = config.get<boolean>('showStatusBar') ?? true;
    const showWindowTitle = config.get<boolean>('showWindowTitle') ?? true;
    
    // 背景水印
    if (showWatermark) {
        const opacity = config.get<number>('opacity') ?? 0.08;
        const fontSize = config.get<number>('fontSize') ?? 24;
        const angle = config.get<number>('angle') ?? -30;
        const fontFamily = config.get<string>('fontFamily') || 'Microsoft YaHei, SimHei, sans-serif';
        const spacingX = config.get<number>('spacingX') ?? 200;
        const spacingY = config.get<number>('spacingY') ?? 150;
        const color = config.get<string>('color') || '#808080';
        createDecorationType(text, opacity, fontSize, angle, fontFamily, spacingX, spacingY, color);
        applyWatermarkToAllEditors();
    } else {
        clearDecoration();
    }
    
    // 状态栏
    if (showStatusBar) {
        updateStatusBar(text);
    } else if (statusBarItem) {
        statusBarItem.hide();
    }
    
    // 窗口标题
    if (showWindowTitle) {
        updateWindowTitle(text);
    } else {
        restoreWindowTitle();
    }
}

function updateStatusBar(text: string) {
    if (!statusBarItem) {
        statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
    }
    const config = vscode.workspace.getConfiguration('swordsign');
    const color = config.get<string>('statusBarColor') || '';
    const backgroundColor = config.get<string>('statusBarBackground') || '';
    
    statusBarItem.text = `$(sword) ${text}`;
    statusBarItem.tooltip = `当前窗口标识: ${text}`;
    statusBarItem.command = 'swordsign.refresh';
    
    // 设置颜色（如果配置了）
    if (color) {
        statusBarItem.color = color;
    }
    if (backgroundColor) {
        statusBarItem.backgroundColor = new vscode.ThemeColor(backgroundColor);
    }
    
    statusBarItem.show();
}

function updateWindowTitle(text: string) {
    const config = vscode.workspace.getConfiguration();
    // 直接设置为固定格式，避免重复追加
    const newTitle = `[${text}] \${dirty}\${activeEditorShort}\${separator}\${rootName}\${separator}\${profileName}\${separator}\${appName}`;
    config.update('window.title', newTitle, vscode.ConfigurationTarget.Workspace);
}

function createDecorationType(
    text: string, 
    opacity: number, 
    fontSize: number, 
    angle: number, 
    fontFamily: string,
    spacingX: number,
    spacingY: number,
    color: string
) {
    // 清除旧的装饰类型
    if (decorationType) {
        decorationType.dispose();
    }

    // 生成 SVG 背景图
    const svgUri = createSvgDataUri(text, opacity, fontSize, angle, fontFamily, spacingX, spacingY, color);

    // 创建装饰类型 - 使用 before 装饰在编辑器背景层，优先级更高
    decorationType = vscode.window.createTextEditorDecorationType({
        isWholeLine: true,
        rangeBehavior: vscode.DecorationRangeBehavior.OpenOpen,
        // 使用 before 伪元素创建背景效果，避免与其他装饰器冲突
        before: {
            contentText: '',
            textDecoration: `none; 
                position: fixed; 
                top: 0; 
                left: 0; 
                right: 0; 
                bottom: 0; 
                pointer-events: none; 
                z-index: -9999;
                background-image: ${svgUri}; 
                background-repeat: repeat;
                background-position: center center;`
        }
    });
}

function createSvgDataUri(
    text: string, 
    opacity: number, 
    fontSize: number, 
    angle: number, 
    fontFamily: string,
    spacingX: number,
    spacingY: number,
    color: string
): string {
    // 计算 SVG 尺寸以适应重复模式
    const width = spacingX;
    const height = spacingY;
    const centerX = width / 2;
    const centerY = height / 2;

    // 构建 SVG - 使用 pattern 实现无缝平铺
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
        <text 
            x="${centerX}" 
            y="${centerY}" 
            font-size="${fontSize}" 
            font-family="${fontFamily}"
            fill="${color}" 
            fill-opacity="${opacity}" 
            text-anchor="middle" 
            dominant-baseline="middle"
            transform="rotate(${angle}, ${centerX}, ${centerY})">
            ${escapeXml(text)}
        </text>
    </svg>`;
    
    return `url('data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}')`;
}

function escapeXml(text: string): string {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

function applyWatermarkToAllEditors() {
    if (!decorationType || !isEnabled) {
        return;
    }

    // 应用到所有可见编辑器
    const editors = vscode.window.visibleTextEditors;
    editors.forEach(editor => {
        // 获取文档的最大行数
        const lineCount = editor.document.lineCount;
        // 创建一个覆盖整个文档的装饰范围
        const range = new vscode.Range(0, 0, lineCount - 1, editor.document.lineAt(lineCount - 1).text.length);
        editor.setDecorations(decorationType!, [range]);
    });
}

function clearWatermark() {
    clearDecoration();
    if (statusBarItem) {
        statusBarItem.hide();
    }
    restoreWindowTitle();
}

function clearDecoration() {
    if (decorationType) {
        decorationType.dispose();
        decorationType = undefined;
    }
}

function restoreWindowTitle() {
    const config = vscode.workspace.getConfiguration();
    // 恢复为 VS Code 默认标题格式
    const defaultTitle = '${dirty}${activeEditorShort}${separator}${rootName}${separator}${profileName}${separator}${appName}';
    config.update('window.title', defaultTitle, vscode.ConfigurationTarget.Workspace);
}