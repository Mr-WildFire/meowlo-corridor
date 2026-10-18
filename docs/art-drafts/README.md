# 老八 AI 概念草稿

这些是 2026-10-18 用 Pollinations/Flux 生成的**概念测试图**，不是最终资源，也没有接入 `assets/`。

## 文件

- `laoba_ai_side_v1.jpg`：侧视，猫的解剖和轮廓较稳定，但花色不是参考图里的布偶猫重点色。
- `laoba_ai_front_v1.jpg`：正视，模型把花色漂移成了橘白，前后不一致。
- `laoba_four_directions.jpg`：四方向设定稿（正视/背视/左视/右视），布偶猫花色、蓝眼、项圈基本一致；目前仍是概念稿，未切图、未去背景。
- `laoba_four_directions_v2.png`：新版四方向设定稿，比例和一致性更好；仍是概念稿，奶油底色未抠透明，未切帧。

## 失败点

- 免费模型没有参考图条件控制，纯文本 prompt 很难稳定布偶猫的深色面罩/耳朵/尾巴。
- “character turnaround sheet” 容易让模型生成拟人化角色；后视尝试出现了人形/结构错误，已丢弃。
- 免费 API 有水印和速率限制。

## 下一版建议

1. 用参考图做 img2img / IP-Adapter / ControlNet，而不是纯文本。
2. 一次只生成一个视角，再人工拼三视图；不要直接让模型出整张三视图。
3. 固定 seed、风格前缀和参考图；必要时训练轻量 LoRA。
4. 生产稿用 ComfyUI + SDXL/Flux，或人工在 AI 稿上重绘。