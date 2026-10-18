/**
 * Tiny cross-platform vibration facade.
 * Browser uses navigator.vibrate (where supported); native currently no-ops.
 */
export class VibrationService {
    private enabled = true;

    setEnabled(enabled: boolean): void {
        this.enabled = enabled;
    }

    pickup(): void {
        this.vibrate(18);
    }

    timeout(): void {
        this.vibrate([45, 40, 90]);
    }

    private vibrate(pattern: number | number[]): void {
        if (!this.enabled) return;
        try {
            const nav = (globalThis as any).navigator;
            if (nav && typeof nav.vibrate === 'function') {
                nav.vibrate(pattern);
            }
        } catch {
            // Haptics are optional; never break the run.
        }
    }
}
