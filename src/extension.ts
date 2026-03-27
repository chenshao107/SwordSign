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

export function activate(context: vscode.ExtensionContext) {
    // 初始化水印
    updateWatermark();

    // 监听配置变化
    context.subscriptions.push(
        vscode.workspace.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration('envlens')) {
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
        vscode.commands.registerCommand('envlens.refresh', () => {
            updateWatermark();
            vscode.window.showInformationMessage('EnvLens 水印已刷新');
        })
    );

    // 注册切换显示命令
    context.subscriptions.push(
        vscode.commands.registerCommand('envlens.toggle', () => {
            isEnabled = !isEnabled;
            if (isEnabled) {
                updateWatermark();
                vscode.window.showInformationMessage('EnvLens 水印已开启');
            } else {
                clearWatermark();
                vscode.window.showInformationMessage('EnvLens 水印已关闭');
            }
        })
    );
}

export function deactivate() {
    clearWatermark();
}

function updateWatermark() {
    const config = vscode.workspace.getConfiguration('envlens');
    
    // 检查是否启用
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
    
    const opacity = config.get<number>('opacity') ?? 0.08;
    const fontSize = config.get<number>('fontSize') ?? 24;
    const angle = config.get<number>('angle') ?? -30;
    const fontFamily = config.get<string>('fontFamily') || 'Microsoft YaHei, SimHei, sans-serif';
    const spacingX = config.get<number>('spacingX') ?? 200;
    const spacingY = config.get<number>('spacingY') ?? 150;
    const color = config.get<string>('color') || '#808080';

    // 创建装饰类型
    createDecorationType(text, opacity, fontSize, angle, fontFamily, spacingX, spacingY, color);
    
    // 应用到所有编辑器
    applyWatermarkToAllEditors();
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

    // 创建装饰类型 - 使用 after 装饰在编辑器背景层
    decorationType = vscode.window.createTextEditorDecorationType({
        isWholeLine: true,
        rangeBehavior: vscode.DecorationRangeBehavior.OpenOpen,
        // 使用 after 伪元素创建背景效果
        after: {
            contentText: '',
            textDecoration: `none; 
                position: fixed; 
                top: 0; 
                left: 0; 
                right: 0; 
                bottom: 0; 
                pointer-events: none; 
                z-index: -1000;
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
    if (decorationType) {
        decorationType.dispose();
        decorationType = undefined;
    }
}