import React from 'react';
import { Composition } from 'remotion';
import './fonts';
import { Cover } from './Cover';
import { FPS, H, W } from './theme';
import { config } from './cover.config';

export const Root: React.FC = () => (
  <Composition id="Cover" component={Cover} durationInFrames={config.durationInFrames} fps={FPS} width={W} height={H} />
);
