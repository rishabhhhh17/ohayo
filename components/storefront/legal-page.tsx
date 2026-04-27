import type { ReactNode } from 'react';

type LegalPageProps = {
  title: string;
  updated: string;
  children: ReactNode;
};

export function LegalPage({ title, updated, children }: LegalPageProps) {
  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <article className="max-w-2xl mx-auto">
        <header className="mb-10">
          <h1 className="font-serif text-3xl md:text-4xl font-semibold text-foreground">
            {title}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">Last updated: {updated}</p>
        </header>

        <div className="legal-prose space-y-4 text-sm leading-relaxed text-muted-foreground [&_h2]:text-foreground [&_h2]:font-semibold [&_h2]:text-lg [&_h2]:mt-8 [&_h2]:mb-2 [&_strong]:text-foreground [&_a]:underline [&_a]:underline-offset-4 [&_a:hover]:text-foreground [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-1.5">
          {children}
        </div>
      </article>
    </div>
  );
}
