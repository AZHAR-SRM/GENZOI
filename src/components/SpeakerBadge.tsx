interface SpeakerBadgeProps {
  speaker: "Host" | "Guest";
}

export default function SpeakerBadge({ speaker }: SpeakerBadgeProps) {
  const isHost = speaker === "Host";
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
        isHost
          ? "bg-primary/15 text-primary"
          : "bg-accent/15 text-accent"
      }`}
    >
      {speaker}
    </span>
  );
}
