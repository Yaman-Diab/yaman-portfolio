import type { AstroComponentFactory } from 'astro/runtime/server/index.js';
import type { ProjectSlug } from '@/domain/entities/project';

/**
 * Live screens: real, working recreations of an app's screens, shown in the
 * case study's phone after the screenshots.
 *
 * To add one:
 *   1. Create a component here, e.g. `WafirCart.astro`. Its root element is
 *      `<div class="device__slide" data-title="…" data-live-screen>`, and it
 *      takes a `locale` prop. It is a phone screen: size it to fill 100%.
 *      Buttons, inputs and links inside it work; the phone does not swipe
 *      away while they are being used.
 *   2. List it under the project below, in the order it should appear.
 *   3. Add a dot label for it in DeviceFrame if the phone has controls.
 */
export const liveScreens: Partial<Record<ProjectSlug, AstroComponentFactory[]>> = {};
