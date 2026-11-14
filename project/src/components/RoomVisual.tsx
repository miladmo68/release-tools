import type { CSSProperties } from "react";
import type { Room } from "../domain/types";

export function RoomVisual({ room }: { room: Room }) {
  return <div className={`room-visual scene-${room.illustration}`} style={{ "--accent": room.accent } as CSSProperties} role="img" aria-label={`Architectural illustration for the ${room.name}`}><span className="scene-glow"/><span className="scene-ceiling"/><span className="scene-wall"/><span className="scene-window"><i/><i/></span><span className="scene-bed"><i/></span><span className="scene-side"/><span className="scene-lamp"/><span className="scene-floor"/><span className="scene-feature"/></div>;
}
