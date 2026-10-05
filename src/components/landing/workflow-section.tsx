import { MediaPlaceholder } from "@/components/landing/media-placeholder";
import { SectionHeading } from "@/components/landing/section-heading";
import { WorkflowSlider } from "@/components/landing/workflow-slider";
import { landing } from "@/content/landing";

export function WorkflowSection() {
  return (
    <section
      className="section wrap workflow-has-slider"
      id={landing.workflow.id}
      aria-labelledby="workflow-title"
    >
      <SectionHeading id="workflow-title">{landing.workflow.title}</SectionHeading>
      <p className="lede">{landing.workflow.intro}</p>
      <ol className="workflow-static">
        {landing.workflow.steps.map((step, index) => (
          <li key={step.title}>
            <span className="workflow-step-index">
              {landing.workflow.progress(index + 1, landing.workflow.steps.length)}
            </span>
            <h3>{step.title}</h3>
            <p>{step.body}</p>
            <MediaPlaceholder label={step.frameLabel} />
          </li>
        ))}
      </ol>
      <WorkflowSlider />
    </section>
  );
}
