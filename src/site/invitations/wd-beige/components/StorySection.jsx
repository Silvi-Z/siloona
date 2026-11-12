import Editable from '../../shared/Editable'
import Section from '../../shared/Section'

// «Մեր պատմությունը» — a few short moments of the couple's story, one
// under another, joined by a thin drawn line.
export default function StorySection({ data }) {
  return (
    <Section id="story">
      <section className="story" data-par="">
        <h2 className="h rv">Պատմություն</h2>
        <p className="sub rv" style={{ '--dl': '.1s' }}>մեր</p>
        <ol className="st">
          {data.story.map((_, i) => (
            <li key={i} className="rv" style={{ '--dl': `${0.1 + i * 0.08}s` }}>
              <Editable as="span" path={`story.${i}.year`} className="st-y" />
              <Editable as="h3" path={`story.${i}.title`} className="st-t" />
              <Editable as="p" path={`story.${i}.text`} className="t" />
            </li>
          ))}
        </ol>
      </section>
    </Section>
  )
}
