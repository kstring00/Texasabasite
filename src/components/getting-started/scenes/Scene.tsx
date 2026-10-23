import type { SceneKind } from '../data/gettingStarted';
import { ChatScene } from './ChatScene';
import { EvalScene } from './EvalScene';
import { VobScene } from './VobScene';
import { StartScene } from './StartScene';

/** Picks the scene for a step. Mount it with a fresh `key` to restart its animation. */
export function Scene({ kind, play }: { kind: SceneKind; play: boolean }) {
  switch (kind) {
    case 'chat':
      return <ChatScene play={play} />;
    case 'eval':
      return <EvalScene play={play} />;
    case 'vob':
      return <VobScene play={play} />;
    default:
      return <StartScene play={play} />;
  }
}
