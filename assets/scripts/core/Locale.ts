import { ItemType } from '../game/DemoTypes';
import { Difficulty } from '../game/LevelConfig';

export type Language = 'zh' | 'en';

const DICT: Record<Language, Record<string, string>> = {
    zh: {
        'menu.title': '喵音回廊',
        'menu.subtitle': '选择难度',
        'menu.hint': '点击难度开始　·　1 / 2 / 3 也可选择',
        'menu.meta': '{cols}×{rows} · {fragments} 块碎片 · {time}',
        'menu.best': '最佳 {stars} · {time}',
        'menu.bestNone': '最佳 —',
        'menu.sound': '音',
        'menu.muted': '静',
        'menu.settings': '设',

        'difficulty.easy.name': '轻松',
        'difficulty.easy.sub': '先熟悉黑暗与声音',
        'difficulty.normal.name': '标准',
        'difficulty.normal.sub': '完整的回廊体验',
        'difficulty.hard.name': '困难',
        'difficulty.hard.sub': '更大、更暗、更少回头路',

        'hud.title': '喵音回廊',
        'hud.track': '音轨 {n}/{total}　出口未开启',
        'hud.trackOpen': '音轨 {n}/{total}　出口已开启',
        'hud.timeLeft': '剩余 {time}',
        'hud.musicComplete': '音乐完整',
        'hud.steps': '步数 {steps}　用时 {time}',
        'hud.none': '无道具效果',
        'hud.seed': '种子 {seed} · {level} · {cols}×{rows} · {time}',
        'hud.help': 'WASD / 滑动移动　P 暂停　R 重开　M 难度　V 静音　O 设置',
        'hud.tutorial': '第一次遇到 · {name}',
        'hud.mute': '静',
        'hud.sound': '音',
        'hud.settings': '设',
        'hud.firefly': '萤火虫 {n}s',
        'hud.wine': '鲜花酒 {n}s 反向',
        'hud.catStrip': '猫条 {n}s ×2',
        'hud.yarn': '毛线球 {n}s',
        'hud.butterfly': '蝴蝶 {n}步',

        'settings.title': '设置',
        'settings.volume': '主音量',
        'settings.volumeValue': '音量 {n}%',
        'settings.muteOn': '静音：开',
        'settings.muteOff': '静音：关',
        'settings.language': '语言：{value}',
        'settings.languageValue': '中文',
        'settings.languageHint': '切换语言会返回难度菜单',
        'settings.vibration': '震动：{value}',
        'settings.vibrationOn': '开',
        'settings.vibrationOff': '关',
        'settings.reset': '清除最佳记录',
        'settings.resetConfirm': '再次点击确认',
        'settings.resetDone': '已清除',
        'settings.close': '关闭',

        'game.warn60': '还剩 1 分钟。',
        'game.warn30': '只剩 30 秒，门还没开。',
        'game.fragmentHint': '找到 {n} 块碎片。集齐后音乐完整，出口才会出现。',
        'game.fragmentProgress': '音轨 {n}/{total} · 音乐更完整了',
        'game.finaleLast': '最后一段……',
        'game.finaleDone': '整首歌回来了。门开了。',
        'game.exitNoPos': '出口找不到位置，请重开一局',
        'game.sewerBlocked': '下水道堵住了。',
        'game.sewerTeleport': '下水道：被冲到了别处。',
        'game.muted': '已静音',
        'game.unmuted': '声音已恢复',
        'game.debugTime': '调试：剩余时间 -30 秒',
        'finale.title': '把音轨拼回 CD',
        'finale.subtitle': '最后一块碎片归位……',
        'finale.silence': '最后一段……',
        'finale.done': '整首歌回来了。',
        'finale.hint': 'CD 完整 · 出口已开启',
        'game.pauseTitle': '暂停',
        'game.pauseBody': '倒计时与道具效果已冻结。',
        'game.pauseHint': '按 P 继续　R 重开　V 静音',
        'game.ownerDoor': '主人推门进来了……',
        'game.timeoutTitle': '被主人抱回家  ☆☆☆',
        'game.timeoutBody': '音轨 {n}/{total}　用时 {time}\n主人循着猫叫找到了回廊深处。',
        'game.timeoutHint': '按 R 重开　M 选难度　或点击屏幕再试一次',
        'game.winTitle': '带回家了  {stars}',
        'game.winBody': '音轨 {n}/{total}　步数 {steps}　用时 {time}{best}\n主人把 CD 放进了唱机。',
        'game.winHint': '按 R 重开　M 选难度　或点击屏幕再走一次',
        'game.newRecord': '　新纪录！',

        'maze.entry': '入口',
        'maze.exit': '门',
        'maze.fragment': '音',
        'maze.player': '八',

        'item.butterfly.name': '蝴蝶',
        'item.butterfly.tut': '蝴蝶会为你指路 10 步。',
        'item.firefly.name': '萤火虫',
        'item.firefly.tut': '萤火虫把视野扩大到 4 格，持续 10 秒。',
        'item.wine.name': '鲜花酒',
        'item.wine.tut': '鲜花酒让你方向颠倒 10 秒。',
        'item.catStrip.name': '猫条',
        'item.catStrip.tut': '猫条让你每次移动 2 格，持续 10 秒。',
        'item.sewer.name': '下水道',
        'item.sewer.tut': '下水道会把你随机冲走。',
        'item.fish.name': '小鱼干',
        'item.fish.tut': '小鱼干增加 20 秒倒计时。',
        'item.yarn.name': '毛线球',
        'item.yarn.tut': '毛线球记住走过的路，持续 15 秒。',
        'item.feather.name': '蝙蝠黑羽',
        'item.feather.tut': '蝙蝠黑羽会减少 10 秒倒计时。',
    },
    en: {
        'menu.title': 'Meowlo Corridor',
        'menu.subtitle': 'SELECT DIFFICULTY',
        'menu.hint': 'Tap a difficulty　·　1 / 2 / 3 also works',
        'menu.meta': '{cols}×{rows} · {fragments} shards · {time}',
        'menu.best': 'Best {stars} · {time}',
        'menu.bestNone': 'Best —',
        'menu.sound': 'SND',
        'menu.muted': 'MUTE',
        'menu.settings': 'SET',

        'difficulty.easy.name': 'Easy',
        'difficulty.easy.sub': 'Learn the dark and the sound',
        'difficulty.normal.name': 'Normal',
        'difficulty.normal.sub': 'The complete corridor',
        'difficulty.hard.name': 'Hard',
        'difficulty.hard.sub': 'Bigger, darker, fewer shortcuts',

        'hud.title': 'Meowlo Corridor',
        'hud.track': 'Tracks {n}/{total} · Exit locked',
        'hud.trackOpen': 'Tracks {n}/{total} · Exit open',
        'hud.timeLeft': '{time} left',
        'hud.musicComplete': 'Music complete',
        'hud.steps': 'Steps {steps} · {time}',
        'hud.none': 'No effects',
        'hud.seed': 'Seed {seed} · {level} · {cols}×{rows} · {time}',
        'hud.help': 'WASD / swipe　P pause　R restart　M difficulty　V mute　O settings',
        'hud.tutorial': 'First time · {name}',
        'hud.mute': 'MUTE',
        'hud.sound': 'SND',
        'hud.settings': 'SET',
        'hud.firefly': 'Firefly {n}s',
        'hud.wine': 'Wine {n}s reversed',
        'hud.catStrip': 'Treat {n}s ×2',
        'hud.yarn': 'Yarn {n}s',
        'hud.butterfly': 'Butterfly {n} steps',

        'settings.title': 'Settings',
        'settings.volume': 'Master volume',
        'settings.volumeValue': 'Volume {n}%',
        'settings.muteOn': 'Mute: ON',
        'settings.muteOff': 'Mute: OFF',
        'settings.language': 'Language: {value}',
        'settings.languageValue': 'English',
        'settings.languageHint': 'Changing language returns to the difficulty menu',
        'settings.vibration': 'Vibration: {value}',
        'settings.vibrationOn': 'ON',
        'settings.vibrationOff': 'OFF',
        'settings.reset': 'Reset best records',
        'settings.resetConfirm': 'Tap again to confirm',
        'settings.resetDone': 'Cleared',
        'settings.close': 'Close',

        'game.warn60': 'One minute left.',
        'game.warn30': '30 seconds left — the exit is not open.',
        'game.fragmentHint': 'Find {n} shards. The music completes and the exit appears only when all are found.',
        'game.fragmentProgress': 'Track {n}/{total} · the music grows',
        'game.finaleLast': 'The last part…',
        'game.finaleDone': 'The whole song is back. The door is open.',
        'game.exitNoPos': 'No room for the exit — restart the run.',
        'game.sewerBlocked': 'The sewer is blocked.',
        'game.sewerTeleport': 'Sewer: washed somewhere else.',
        'game.muted': 'Muted',
        'game.unmuted': 'Sound restored',
        'game.debugTime': 'Debug: -30 seconds',
        'finale.title': 'Rebuilding the CD',
        'finale.subtitle': 'The last shard returns…',
        'finale.silence': 'The last part…',
        'finale.done': 'The whole song is back.',
        'finale.hint': 'CD complete · Exit open',
        'game.pauseTitle': 'Paused',
        'game.pauseBody': 'Timer and item effects are frozen.',
        'game.pauseHint': 'P resume　R restart　V mute',
        'game.ownerDoor': 'The owner opens the door…',
        'game.timeoutTitle': 'Carried home  ☆☆☆',
        'game.timeoutBody': 'Tracks {n}/{total}　Time {time}\nThe owner followed the meows into the corridor.',
        'game.timeoutHint': 'R restart　M difficulty　or tap to try again',
        'game.winTitle': 'Home at last  {stars}',
        'game.winBody': 'Tracks {n}/{total}　Steps {steps}　Time {time}{best}\nThe owner puts the CD back on.',
        'game.winHint': 'R restart　M difficulty　or tap to run again',
        'game.newRecord': '  New record!',

        'maze.entry': 'IN',
        'maze.exit': 'EXIT',
        'maze.fragment': '♪',
        'maze.player': '8',

        'item.butterfly.name': 'Butterfly',
        'item.butterfly.tut': 'The butterfly shows the way for 10 steps.',
        'item.firefly.name': 'Firefly',
        'item.firefly.tut': 'The firefly widens your vision to 4 cells for 10 seconds.',
        'item.wine.name': 'Flower Wine',
        'item.wine.tut': 'The wine reverses your controls for 10 seconds.',
        'item.catStrip.name': 'Cat Treat',
        'item.catStrip.tut': 'The treat moves you 2 cells per step for 10 seconds.',
        'item.sewer.name': 'Sewer',
        'item.sewer.tut': 'The sewer washes you to a random cell.',
        'item.fish.name': 'Dried Fish',
        'item.fish.tut': 'The fish adds 20 seconds to the timer.',
        'item.yarn.name': 'Yarn Ball',
        'item.yarn.tut': 'The yarn remembers your trail for 15 seconds.',
        'item.feather.name': 'Black Feather',
        'item.feather.tut': 'The black feather removes 10 seconds from the timer.',
    },
};

class Locale {
    private lang: Language = 'zh';

    get language(): Language {
        return this.lang;
    }

    setLanguage(lang: Language): void {
        this.lang = lang;
    }

    t(key: string, vars?: Record<string, string | number>): string {
        const raw = DICT[this.lang][key] ?? DICT.zh[key] ?? key;
        if (!vars) return raw;
        return raw.replace(/\{(\w+)\}/g, (_m, name: string) => String(vars[name] ?? ''));
    }

    difficultyName(d: Difficulty): string {
        return this.t(`difficulty.${d}.name`);
    }

    difficultySubtitle(d: Difficulty): string {
        return this.t(`difficulty.${d}.sub`);
    }

    itemName(type: ItemType): string {
        return this.t(`item.${type}.name`);
    }

    itemShort(type: ItemType): string {
        const zh: Record<ItemType, string> = {
            butterfly: '蝶',
            firefly: '萤',
            wine: '酒',
            catStrip: '条',
            sewer: '井',
            fish: '鱼',
            yarn: '线',
            feather: '羽',
        };
        const en: Record<ItemType, string> = {
            butterfly: 'B',
            firefly: 'F',
            wine: 'W',
            catStrip: 'C',
            sewer: 'S',
            fish: 'D',
            yarn: 'Y',
            feather: 'N',
        };
        return this.lang === 'zh' ? zh[type] : en[type];
    }

    itemTutorial(type: ItemType): string {
        return this.t(`item.${type}.tut`);
    }
}

export const locale = new Locale();
