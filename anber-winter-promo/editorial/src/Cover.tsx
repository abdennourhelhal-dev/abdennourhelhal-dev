import React from 'react';
import { AbsoluteFill, Sequence, useCurrentFrame } from 'remotion';
import { Element } from './motion/Element';
import { BLUE } from './theme';
import { config } from './cover.config';
import type { Scene } from './types';

const SceneView: React.FC<{ scene: Scene }> = ({ scene }) => {
  const sf = useCurrentFrame();
  // rules first so huge words sit on top of (break across) them
  const ordered = [...scene.els].sort((a, b) => (a.kind === 'rule' ? 0 : 1) - (b.kind === 'rule' ? 0 : 1));
  return <AbsoluteFill>{ordered.map((el, i) => <Element key={i} el={el} sf={sf} />)}</AbsoluteFill>;
};

export const Cover: React.FC = () => (
  <AbsoluteFill style={{ background: BLUE }}>
    {config.scenes.map((s, i) => (
      // hard cuts between covers: each scene simply starts where the last one ends
      <Sequence key={i} from={s.from} durationInFrames={s.duration} layout="none">
        <SceneView scene={s} />
      </Sequence>
    ))}
  </AbsoluteFill>
);
