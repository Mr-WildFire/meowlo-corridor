import { ItemType } from '../game/DemoTypes';
import { Difficulty } from '../game/LevelConfig';

export type Language = 'zh' | 'en';

const DICT: Record<Language, Record<string, string>> = {
    zh: {
        'tutorial.title': '新手教程',
        'tutorial.video': '教学视频待接入',
        'tutorial.body': '妈妈的唱片被蝙蝠抢走，碎在迷宫深处。小八，沿着回廊找回每一块碎片，把唱片带回给妈妈——出口，就藏在音乐重新响起的地方。',
        'tutorial.start': '开始教学',
        'tutorial.tapToPlay': '点击播放',
        'tutorial.skip': '跳过视频',
        'tutorial.swipe': '滑动屏幕移动小猫',
        'tutorial.goalTitle': '胜利目标',
        'tutorial.goalBody': '找齐 2 块碎片，找到出口\n把唱片带回给妈妈；蝶/萤火虫会自动使用',
        'tutorial.fragmentTitle': '碎片',
        'tutorial.fragmentBody': '碰到碎片即可收集',
        'tutorial.itemTitle': '道具',
        'tutorial.itemBody': '地图上有蝴蝶和萤火虫，碰到会自动使用',
        'tutorial.exitTitle': '出口',
        'tutorial.exitBody': '走到出口完成教学',
        'fragment.vocals': '收集到了歌声碎片',
        'fragment.drums': '收集到了鼓点碎片',
        'fragment.bass': '收集到了低音碎片',
        'fragment.other': '收集到奇特的碎片',
        'fragment.final': '终于收集完了',
        'tutorial.label': '新手教程',
        'tutorial.completeTitle': '教学完成',
        'tutorial.completeBody': '你已经学会移动、拾取碎片和使用道具，回主菜单开始正式冒险吧。',
        'tutorial.settings': '新手教程',
        'menu.title': '喵音回廊',
        'menu.subtitle': '选择难度',
        'menu.hint': '点击难度开始',
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
        'hud.track': '碎片 {n}/{total}　出口未开启',
        'hud.trackOpen': '碎片 {n}/{total}　出口已开启',
        'hud.timeLeft': '剩余 {time}',
        'hud.timeCaption': '剩余',
        'hud.musicComplete': '音乐完整',
        'hud.steps': '步数 {steps}',
        'hud.none': '无道具效果',
        'hud.seed': '种子 {seed} · {cols}×{rows}',
        'hud.help': '',
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
        'game.fragmentProgress': '碎片 {n}/{total} · 音乐更完整了',
        'game.finaleLast': '最后一段……',
        'game.finaleDone': '唱片完整了，妈妈还在等我们。回家吧。',
        'game.exitNoPos': '出口找不到位置，请重开一局',
        'game.sewerBlocked': '下水道堵住了。',
        'game.sewerTeleport': '下水道：被冲到了别处。',
        'game.muted': '已静音',
        'game.unmuted': '声音已恢复',
        'game.debugTime': '调试：剩余时间 -30 秒',
        'finale.title': '把碎片拼回 CD',
        'finale.subtitle': '最后一块碎片归位……',
        'finale.silence': '最后一段……',
        'finale.done': '音乐重新完整了。',
        'finale.hint': '唱片完整 · 该寻找出口了',
        'game.pauseTitle': '暂停',
        'game.pauseBody': '倒计时与道具效果已冻结。',
        'game.pauseHint': '',
        'game.backToMenu': '返回主菜单',
        'game.resume': '继续',
        'game.restart': '重开',
        'game.again': '再来一次',
        'hud.menu': '菜单',
        'game.ownerDoor': '主人走进回廊，看见了小八。',
        'game.timeoutTitle': '被主人抱回家',
        'game.timeoutBody': '碎片 {n}/{total}　用时 {time}\n主人循着猫叫找到了回廊深处。',
        'game.timeoutHint': '选择下一步',
        'game.winTitle': '带回家了',
        'game.winBody': '碎片 {n}/{total}　步数 {steps}　用时 {time}{best}\n小八把唱片带回家，主人露出了笑容。',
        'game.winHint': '选择下一步',
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
        'tutorial.title': 'Tutorial',
        'tutorial.video': 'Tutorial video coming soon',
        'tutorial.body': 'The bat stole Mom’s record and shattered it deep in the maze. Lao Ba, follow the corridor, recover every shard, and bring the record back to Mom—the exit lies where the music begins again.',
        'tutorial.start': 'Start tutorial',
        'tutorial.tapToPlay': 'Tap to play',
        'tutorial.skip': 'Skip video',
        'tutorial.swipe': 'Swipe the screen to move the cat',
        'tutorial.goalTitle': 'Goal',
        'tutorial.goalBody': 'Find 2 shards and the exit\nBring the record back to Mom; butterflies/fireflies activate on touch',
        'tutorial.fragmentTitle': 'Shards',
        'tutorial.fragmentBody': 'Walk into a shard to collect it',
        'tutorial.itemTitle': 'Items',
        'tutorial.itemBody': 'Butterflies and fireflies are on the map; walk into one to use it',
        'tutorial.exitTitle': 'Exit',
        'tutorial.exitBody': 'Reach the exit to finish the tutorial',
        'fragment.vocals': 'Collected a vocal shard',
        'fragment.drums': 'Collected a drum shard',
        'fragment.bass': 'Collected a bass shard',
        'fragment.other': 'Collected a strange shard',
        'fragment.final': 'Finally, every shard is collected',
        'tutorial.label': 'Tutorial',
        'tutorial.completeTitle': 'Tutorial complete',
        'tutorial.completeBody': 'You learned movement, shard pickup and items. Return to the main menu and begin.',
        'tutorial.settings': 'Tutorial',
        'menu.title': 'Meowlo Corridor',
        'menu.subtitle': 'SELECT DIFFICULTY',
        'menu.hint': 'Tap a difficulty',
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
        'hud.track': 'Shards {n}/{total} · Exit locked',
        'hud.trackOpen': 'Shards {n}/{total} · Exit open',
        'hud.timeLeft': '{time} left',
        'hud.timeCaption': 'LEFT',
        'hud.musicComplete': 'Music complete',
        'hud.steps': 'Steps {steps}',
        'hud.none': 'No effects',
        'hud.seed': 'Seed {seed} · {cols}×{rows}',
        'hud.help': '',
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
        'game.fragmentProgress': 'Shard {n}/{total} · the music grows',
        'game.finaleLast': 'The last part…',
        'game.finaleDone': 'The record is whole. Mom is waiting—let’s go home.',
        'game.exitNoPos': 'No room for the exit — restart the run.',
        'game.sewerBlocked': 'The sewer is blocked.',
        'game.sewerTeleport': 'Sewer: washed somewhere else.',
        'game.muted': 'Muted',
        'game.unmuted': 'Sound restored',
        'game.debugTime': 'Debug: -30 seconds',
        'finale.title': 'Rebuilding the CD',
        'finale.subtitle': 'The last shard returns…',
        'finale.silence': 'The last part…',
        'finale.done': 'The music is whole again.',
        'finale.hint': 'Record complete · Time to find the exit',
        'game.pauseTitle': 'Paused',
        'game.pauseBody': 'Timer and item effects are frozen.',
        'game.pauseHint': '',
        'game.backToMenu': 'Back to main menu',
        'game.resume': 'Resume',
        'game.restart': 'Restart',
        'game.again': 'Play again',
        'hud.menu': 'MENU',
        'game.ownerDoor': 'The owner walks into the corridor and sees Lao Ba.',
        'game.timeoutTitle': 'Carried home',
        'game.timeoutBody': 'Shards {n}/{total}　Time {time}\nThe owner followed the meows into the corridor.',
        'game.timeoutHint': 'Choose next step',
        'game.winTitle': 'Home at last',
        'game.winBody': 'Shards {n}/{total}　Steps {steps}　Time {time}{best}\nLao Ba brings the record home, and the owner smiles.',
        'game.winHint': 'Choose next step',
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












