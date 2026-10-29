import { Font, Label, resources } from 'cc';

/**
 * HarmonyOS/Web use the platform's system sans-serif for all UI labels.
 * The previous subset font merged Latin and Chinese glyphs from two different
 * typefaces; missing glyphs fell back per character, so one sentence could
 * render with visibly different sizes on device. One system family keeps every
 * glyph on the same baseline and metric.
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
        label.useSystemFont = true;
        label.fontFamily = 'sans-serif';
    }

    static titleLabel(label: Label): void {
        UiFonts.apply(label);
        label.isBold = true;
    }

    static numberLabel(label: Label): void {
        UiFonts.apply(label);
    }
}