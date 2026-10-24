import { Font, Label, resources } from 'cc';

/**
 * Single UI font for the whole game: BoukenGothic with missing simplified
 * Chinese glyphs merged from ZCOOL XiaoWei, then subset to the strings used.
 */
export class UiFonts {
    static ui: Font | null = null;
    static title: Font | null = null;
    static numbers: Font | null = null;

    static async load(): Promise<void> {
        await new Promise<void>((resolve) => {
            resources.load('fonts/ui', Font, (err, font) => {
                if (!err && font) {
                    UiFonts.ui = font;
                    UiFonts.title = font;
                    UiFonts.numbers = font;
                } else {
                    console.warn('[UiFonts] UI font load failed', err);
                }
                resolve();
            });
        });
    }

    static apply(label: Label): void {
        if (!UiFonts.ui) return;
        label.useSystemFont = false;
        label.font = UiFonts.ui;
    }

    static titleLabel(label: Label): void {
        UiFonts.apply(label);
    }

    static numberLabel(label: Label): void {
        UiFonts.apply(label);
    }
}