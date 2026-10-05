import { landing } from "@/content/landing";

type MediaPlaceholderProps = {
  label: string;
};

export function MediaPlaceholder({ label }: MediaPlaceholderProps) {
  return (
    <figure className="media-frame">
      <figcaption>
        <p>{label}</p>
        <p>{landing.workflow.screenshotNote}</p>
      </figcaption>
    </figure>
  );
}
