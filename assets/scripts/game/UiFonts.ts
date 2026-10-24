import { Font, Label, resources } from 'cc';

/**
 * Optional UI fonts. Body copy stays on HarmonyOS Sans/system; the bundled
 * title/numbers fonts are only applied where they improve hierarchy.
 */
export class UiFonts {
    static title: Font | null = null;
    static numbers: Font | null = null;

    static async load(): Promise<void> {
        await Promise.all([
            new Promise<void>((resolve) => {
                resources.load('fonts/title', Font, (err, font) => {
                    if (!err && font) UiFonts.title = font;
                    else console.warn('[UiFonts] title font load failed', err);
                    resolve();
                });
            }),
            new Promise<void>((resolve) => {
                resources.load('fonts/numbers', Font, (err, font) => {
                    if (!err && font) UiFonts.numbers = font;
                    else console.warn('[UiFonts] numbers font load failed', err);
                    resolve();
                });
            }),
        ]);
    }

    static titleLabel(label: Label): void {
        if (!UiFonts.title) return;
        label.useSystemFont = false;
        label.font = UiFonts.title;
    }

    static numberLabel(label: Label): void {
        if (!UiFonts.numbers) return;
        label.useSystemFont = false;
        label.font = UiFonts.numbers;
    }
}