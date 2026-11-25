import { Config } from '@remotion/cli/config';

// Chromium headless shell that ships with this cloud image (no download needed).
// Override with REMOTION_BROWSER=/path/to/chrome-headless-shell if it lives elsewhere.
Config.setBrowserExecutable(
  process.env.REMOTION_BROWSER ??
    '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell',
);
Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(95);
Config.setConcurrency(4);
Config.setCodec('h264');
Config.setPixelFormat('yuv420p');
