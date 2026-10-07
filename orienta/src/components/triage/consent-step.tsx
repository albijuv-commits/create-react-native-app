"use client";

import { ArrowRight, LockKeyhole, Siren, Sparkles, Stethoscope } from "lucide-react";
import { useRef, useState, type ReactNode, type Ref } from "react";
import consenso from "@/assets/illustrations/passo-consenso.webp";
import { Button } from "@/components/ui/button";
import { TiltIllustration } from "@/components/ui/tilt-illustration";
import { CheckRow, FieldError, StepHeader } from "./parts";

export interface ConsentState {
  /** Ha capito che l'app non fa diagnosi e che per le emergenze c'è il 112 */
  terms: boolean;
  /** Consenso all'uso dei dati sulla salute per questa intervista (art. 9 GDPR) */
  health: boolean;
  /** Consenso facoltativo all'invio al modello AI */
  ai: boolean;
}

export function ConsentStep({
  value,
  onChange,
  aiAvailable,
  onNext,
  headingRef,
}: {
  value: ConsentState;
  onChange: (next: ConsentState) => void;
  /** null mentre si controlla se l'AI è attiva sul server */
  aiAvailable: boolean | null;
  onNext: () => void;
  headingRef: Ref<HTMLHeadingElement>;
}) {
  const [tried, setTried] = useState(false);
  const termsRef = useRef<HTMLInputElement>(null);
  const healthRef = useRef<HTMLInputElement>(null);
  const missing = !value.terms || !value.health;

  const submit = () => {
    if (missing) {
      setTried(true);
      (value.terms ? healthRef : termsRef).current?.focus();
      return;
    }
    onNext();
  };

  return (
    <div className="space-y-6">
      <StepHeader
        step="Passo 1 di 4"
        title="Prima di iniziare"
        lead="Ti facciamo qualche domanda sui sintomi e ti mostriamo quali condizioni potrebbero essere compatibili e a chi rivolgerti."
        aside={<TiltIllustration src={consenso} sizes="96px" priority className="w-24" />}
        headingRef={headingRef}
      />

      <ul className="space-y-3">
        <Fact icon={<Stethoscope aria-hidden className="size-5" />}>
          <strong>Non è una diagnosi.</strong> Solo un medico può valutare i tuoi sintomi.
        </Fact>
        <Fact icon={<Siren aria-hidden className="size-5" />} tone="red">
          <strong>Se stai molto male non usare l&apos;app:</strong> chiama subito il 112.
        </Fact>
        <Fact icon={<LockKeyhole aria-hidden className="size-5" />}>
          <strong>I tuoi dati restano tuoi.</strong> Non li salviamo e in queste pagine non usiamo strumenti di analisi o di
          tracciamento.
        </Fact>
      </ul>

      <fieldset className="space-y-3">
        <legend className="pb-3 text-heading font-bold">Il tuo consenso</legend>
        <CheckRow
          inputRef={termsRef}
          checked={value.terms}
          onChange={(terms) => onChange({ ...value, terms })}
          invalid={tried && !value.terms}
          label="Ho capito che Orienta mi orienta ma non fa diagnosi, e che in caso di emergenza devo chiamare il 112."
        />
        <CheckRow
          inputRef={healthRef}
          checked={value.health}
          onChange={(health) => onChange({ ...value, health })}
          invalid={tried && !value.health}
          label="Acconsento all'uso dei dati sulla mia salute che inserirò, solo per questa intervista."
          note="Sono dati particolari secondo l'articolo 9 del GDPR. Restano su questo dispositivo e si cancellano quando chiudi la pagina."
        />
        {aiAvailable && (
          <CheckRow
            checked={value.ai}
            onChange={(ai) => onChange({ ...value, ai })}
            label={
              <span className="inline-flex items-start gap-1.5">
                <Sparkles aria-hidden className="mt-0.5 size-5 shrink-0 text-accent" />
                <span>Facoltativo: voglio domande più mirate con l&apos;intelligenza artificiale.</span>
              </span>
            }
            note="La descrizione e le risposte, senza nome né contatti, passano dal server di Orienta al modello Claude di Anthropic solo per scegliere le domande e confrontarle con le schede di Orienta. Il server non le registra. Senza questo consenso usiamo regole fisse, direttamente sul tuo dispositivo."
          />
        )}
        {tried && missing && <FieldError id="consenso-errore">Per continuare spunta le prime due caselle.</FieldError>}
      </fieldset>

      <Button size="lg" className="w-full" onClick={submit} icon={<ArrowRight aria-hidden className="size-6" />}>
        Continua
      </Button>
    </div>
  );
}

function Fact({ icon, tone = "primary", children }: { icon: ReactNode; tone?: "primary" | "red"; children: ReactNode }) {
  return (
    <li className="flex gap-3">
      <span
        className={
          tone === "red"
            ? "grid size-10 shrink-0 place-items-center rounded-full bg-red-soft text-red"
            : "grid size-10 shrink-0 place-items-center rounded-full bg-primary-soft text-primary"
        }
      >
        {icon}
      </span>
      <p className="pt-1.5 text-small">{children}</p>
    </li>
  );
}
