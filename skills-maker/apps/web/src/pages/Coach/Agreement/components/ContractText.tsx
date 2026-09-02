import { ScrollText } from 'lucide-react'
import { FormattedMessage } from 'react-intl'

import { Card } from '@/components/ui/card'
import { CONTRACT_ARTICLES, CONTRACT_TITLE } from '../contract'

export const ContractText = () => (
  <Card className="flex flex-col gap-4 p-4 sm:p-8">
    <p className="flex items-center gap-2 text-[11px] font-bold tracking-widest text-muted-foreground uppercase">
      <ScrollText className="size-4" />
      <FormattedMessage id="coach.agreement.contract.eyebrow" />
    </p>

    <h2 className="text-xl font-bold tracking-tight">{CONTRACT_TITLE}</h2>

    {CONTRACT_ARTICLES.map((article) => (
      <section key={article.heading} className="flex flex-col gap-2">
        <h3 className="text-[14.5px] font-semibold">{article.heading}</h3>

        {article.paragraphs.map((paragraph) => (
          <p key={paragraph} className="text-[13.5px] leading-relaxed text-muted-foreground">
            {paragraph}
          </p>
        ))}

        {article.bullets && (
          <ul className="flex list-disc flex-col gap-1 pl-6">
            {article.bullets.map((bullet) => (
              <li key={bullet} className="text-[13.5px] leading-relaxed text-muted-foreground">
                {bullet}
              </li>
            ))}
          </ul>
        )}

        {article.footnote && (
          <p className="text-[12.5px] leading-relaxed text-muted-foreground/80">
            {article.footnote}
          </p>
        )}
      </section>
    ))}
  </Card>
)
