
import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import {
  ArrowRight,
  BriefcaseBusiness,
  Globe2,
  TrendingUp,
  Users,
  Upload,
  CheckCircle2,
  Send,
} from "lucide-react";

import { useI18n } from "@/i18n/I18nProvider";
import { seo } from "@/lib/seo";
import { Reveal, SectionHeading, btn } from "@/components/site/ui";
import { submitCareerApplication } from "@/services/careerService";

export const Route = createFileRoute("/careers")({
  head: () =>
    seo(
      "Careers | Early Approve Real Estate Group™",
      "Explore career opportunities with Early Approve Real Estate Group™. Join our team and grow with a connected Dubai real estate network."
    ),
  component: Careers,
});

const benefits = [
  {
    icon: TrendingUp,
    title: "Professional Growth",
    description:
      "Develop your skills, expand your knowledge and build a rewarding career in the real estate industry.",
  },
  {
    icon: Globe2,
    title: "Global Connections",
    description:
      "Work within an international business network connecting clients, investors and industry professionals.",
  },
  {
    icon: Users,
    title: "Collaborative Culture",
    description:
      "Be part of a professional environment that values teamwork, communication and shared success.",
  },
  {
    icon: BriefcaseBusiness,
    title: "Industry Exposure",
    description:
      "Gain exposure to Dubai's diverse property landscape and evolving real estate opportunities.",
  },
];

function Careers() {
  const { t } = useI18n();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    position: "",
    linkedin: "",
    coverLetter: "",
  });

  const [cv, setCv] = useState<File | null>(null);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = (
    field: keyof typeof form,
    value: string
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));

    setSuccess(false);
    setError("");
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (isSubmitting) return;

    setError("");
    setSuccess(false);

    if (!cv) {
      setError("Please upload your CV.");
      return;
    }

    const allowedExtensions = [".pdf", ".doc", ".docx"];
    const fileName = cv.name.toLowerCase();

    const hasValidExtension = allowedExtensions.some(
      (extension) => fileName.endsWith(extension)
    );

    if (!hasValidExtension) {
      setError("Please upload a PDF, DOC or DOCX file.");
      return;
    }

    if (cv.size > 5 * 1024 * 1024) {
      setError("Your CV must not exceed 5 MB.");
      return;
    }

    const formData = new FormData();

    formData.append("fullName", form.fullName);
    formData.append("email", form.email);
    formData.append("phone", form.phone);
    formData.append("position", form.position);
    formData.append("linkedin", form.linkedin);
    formData.append("coverLetter", form.coverLetter);
    formData.append("cv", cv);

    setIsSubmitting(true);

    try {
      await submitCareerApplication(formData);

      setSuccess(true);
      setError("");

      setForm({
        fullName: "",
        email: "",
        phone: "",
        position: "",
        linkedin: "",
        coverLetter: "",
      });

      setCv(null);

      const fileInput = document.getElementById(
        "career-cv"
      ) as HTMLInputElement | null;

      if (fileInput) {
        fileInput.value = "";
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="bg-background">

      {/* Hero */}
      <section className="relative flex min-h-[65vh] items-center overflow-hidden bg-ink">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-35"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=2000&q=85')",
          }}
        />

        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/85 to-ink/45" />

        <div className="container-luxe relative py-32">
          <Reveal>
            <p className="eyebrow mb-6 text-gold">
              CAREERS AT EARLY APPROVE
            </p>

            <h1 className="max-w-4xl font-display text-5xl leading-tight text-ink-foreground md:text-7xl lg:text-8xl">
              Build Your
              <span className="block text-gold-gradient">
                Future With Us
              </span>
            </h1>

            <p className="mt-7 max-w-2xl text-base leading-8 text-ink-muted md:text-lg">
              Join a connected professional network and explore
              opportunities to grow, contribute and build your
              career in Dubai's real estate industry.
            </p>

            <a
              href="#apply"
              className={`${btn()} mt-10 inline-flex items-center gap-3`}
            >
              Explore Opportunities
              <ArrowRight className="h-4 w-4 rtl:rotate-180" />
            </a>
          </Reveal>
        </div>
      </section>

      {/* Introduction */}
      <section className="py-24 md:py-32">
        <div className="container-luxe grid items-center gap-14 lg:grid-cols-2">
          <Reveal>
            <div
              className="aspect-[5/4] bg-cover bg-center"
              style={{
                backgroundImage:
                  "url('https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1200&q=85')",
              }}
            />
          </Reveal>

          <Reveal>
            <SectionHeading
              center={false}
              eyebrow="YOUR NEXT CHAPTER"
              title="Grow With a Connected Team"
              body="At Early Approve Real Estate Group™, we value professional relationships, knowledge and a forward-thinking approach. We believe that great people contribute to strong business connections and lasting opportunities."
            />

            <p className="mt-6 text-sm leading-8 text-muted-foreground">
              Whether your background is in real estate,
              client relations, marketing, finance or business
              development, we welcome individuals who are
              motivated to contribute and grow.
            </p>

            <a
              href="#apply"
              className={`${btn({ variant: "outline" })} mt-9 inline-flex items-center gap-3`}
            >
              Apply Now
              <ArrowRight className="h-4 w-4 rtl:rotate-180" />
            </a>
          </Reveal>
        </div>
      </section>

      {/* Why Join Us */}
      <section className="bg-secondary py-24 md:py-28">
        <div className="container-luxe">
          <SectionHeading
            eyebrow="WHY JOIN US"
            title="An Environment to Grow"
            body="Discover an environment built around professional development, meaningful connections and opportunities to make an impact."
          />

          <div className="mt-16 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;

              return (
                <Reveal key={benefit.title} delay={index * 0.08}>
                  <div className="group h-full border-t border-border pt-8 transition-colors hover:border-gold">
                    <Icon className="mb-7 h-8 w-8 text-gold" />

                    <h3 className="font-display text-xl text-foreground">
                      {benefit.title}
                    </h3>

                    <p className="mt-4 text-sm leading-7 text-muted-foreground">
                      {benefit.description}
                    </p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Opportunities */}
      <section className="py-24 md:py-28">
        <div className="container-luxe">
          <SectionHeading
            eyebrow="CAREER OPPORTUNITIES"
            title="Find Your Place With Us"
            body="We welcome applications from talented individuals interested in contributing to our growing professional network."
          />

          <div className="mt-14 grid gap-5 md:grid-cols-3">
            {[
              {
                title: "Real Estate",
                description:
                  "Property consultants, real estate advisors and sales professionals.",
              },
              {
                title: "Business Development",
                description:
                  "Relationship building, partnerships and business development professionals.",
              },
              {
                title: "Marketing & Operations",
                description:
                  "Digital marketing, administration, client relations and operational support.",
              },
            ].map((item, index) => (
              <Reveal key={item.title} delay={index * 0.1}>
                <div className="h-full border border-border p-8 transition-all duration-300 hover:border-gold hover:shadow-luxe">
                  <p className="mb-5 font-display text-3xl text-gold-gradient">
                    0{index + 1}
                  </p>

                  <h3 className="font-display text-2xl text-foreground">
                    {item.title}
                  </h3>

                  <p className="mt-4 text-sm leading-7 text-muted-foreground">
                    {item.description}
                  </p>

                  <a
                    href="#apply"
                    className="mt-8 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-gold transition-colors hover:text-foreground"
                  >
                    Apply Now
                    <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                  </a>
                </div>
              </Reveal>
            ))}
          </div>

          <p className="mt-8 text-center text-xs leading-6 text-muted-foreground">
            These are areas of interest, not confirmed job vacancies.
            Submit an application to express your interest.
          </p>
        </div>
      </section>

      {/* Application Form */}
      <section id="apply" className="scroll-mt-24 bg-ink py-24 md:py-28">
        <div className="container-luxe">
          <div className="mx-auto max-w-3xl">
            <Reveal>
              <div className="text-center">
                <p className="eyebrow mb-5 text-gold">
                  TAKE THE NEXT STEP
                </p>

                <h2 className="font-display text-4xl text-ink-foreground md:text-6xl">
                  Interested in Joining Us?
                </h2>

                <p className="mx-auto mt-6 max-w-xl text-sm leading-7 text-ink-muted">
                  Tell us a little about yourself and the
                  opportunities you are interested in.
                </p>
              </div>
            </Reveal>

            <Reveal>
              <form
                onSubmit={handleSubmit}
                className="mt-14 space-y-7"
              >
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-xs uppercase tracking-widest text-ink-muted">
                      Full Name *
                    </label>
                    <input
                      required
                      type="text"
                      value={form.fullName}
                      onChange={(e) =>
                        updateField("fullName", e.target.value)
                      }
                      placeholder="Your full name"
                      className="w-full border border-ink-line bg-transparent px-4 py-4 text-sm text-ink-foreground outline-none transition focus:border-gold"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs uppercase tracking-widest text-ink-muted">
                      Email Address *
                    </label>
                    <input
                      required
                      type="email"
                      value={form.email}
                      onChange={(e) =>
                        updateField("email", e.target.value)
                      }
                      placeholder="you@example.com"
                      className="w-full border border-ink-line bg-transparent px-4 py-4 text-sm text-ink-foreground outline-none transition focus:border-gold"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs uppercase tracking-widest text-ink-muted">
                      Phone Number *
                    </label>
                    <input
                      required
                      type="tel"
                      value={form.phone}
                      onChange={(e) =>
                        updateField("phone", e.target.value)
                      }
                      placeholder="+971 XX XXX XXXX"
                      className="w-full border border-ink-line bg-transparent px-4 py-4 text-sm text-ink-foreground outline-none transition focus:border-gold"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs uppercase tracking-widest text-ink-muted">
                      Area of Interest *
                    </label>
                    <select
                      required
                      value={form.position}
                      onChange={(e) =>
                        updateField("position", e.target.value)
                      }
                      className="w-full border border-ink-line bg-ink px-4 py-4 text-sm text-ink-foreground outline-none transition focus:border-gold"
                    >
                      <option value="">Select an area</option>
                      <option value="Real Estate">
                        Real Estate
                      </option>
                      <option value="Business Development">
                        Business Development
                      </option>
                      <option value="Marketing">
                        Marketing
                      </option>
                      <option value="Client Relations">
                        Client Relations
                      </option>
                      <option value="Administration">
                        Administration
                      </option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="mb-2 block text-xs uppercase tracking-widest text-ink-muted">
                      LinkedIn Profile (Optional)
                    </label>
                    <input
                      type="url"
                      value={form.linkedin}
                      onChange={(e) =>
                        updateField("linkedin", e.target.value)
                      }
                      placeholder="https://linkedin.com/in/your-profile"
                      className="w-full border border-ink-line bg-transparent px-4 py-4 text-sm text-ink-foreground outline-none transition focus:border-gold"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="mb-2 block text-xs uppercase tracking-widest text-ink-muted">
                      Cover Letter / Introduction
                    </label>
                    <textarea
                      rows={5}
                      value={form.coverLetter}
                      onChange={(e) =>
                        updateField("coverLetter", e.target.value)
                      }
                      placeholder="Tell us about yourself, your experience and why you would like to join us..."
                      className="w-full resize-y border border-ink-line bg-transparent px-4 py-4 text-sm text-ink-foreground outline-none transition focus:border-gold"
                    />
                  </div>
                </div>

                {/* CV Upload */}
                <div>
                  <label className="mb-3 block text-xs uppercase tracking-widest text-ink-muted">
                    Upload Your CV *
                  </label>

                  <label
                    htmlFor="career-cv"
                    className="flex cursor-pointer flex-col items-center justify-center border border-dashed border-ink-line px-6 py-10 text-center transition hover:border-gold"
                  >
                    <Upload className="mb-4 h-7 w-7 text-gold" />

                    <span className="text-sm text-ink-foreground">
                      {cv ? cv.name : "Choose your CV"}
                    </span>

                    <span className="mt-2 text-xs text-ink-muted">
                      PDF, DOC or DOCX · Maximum 5 MB
                    </span>

                    <input
                      id="career-cv"
                      type="file"
                      accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      className="sr-only"
                      onChange={(e) => {
                        setCv(e.target.files?.[0] ?? null);
                        setError("");
                        setSuccess(false);
                      }}
                    />
                  </label>
                </div>

                {error && (
                  <p role="alert" className="text-sm text-red-400">
                    {error}
                  </p>
                )}

                {success && (
                  <div
                    role="status"
                    className="flex items-start gap-3 border border-gold/40 bg-gold/10 p-5 text-sm text-ink-foreground"
                  >
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-gold" />
                    <p>
                      Your application has been submitted successfully.
                      Thank you for your interest in Early Approve Real
                      Estate Group™. Our team will review your application.
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`${btn()} flex w-full items-center justify-center gap-3 disabled:cursor-not-allowed disabled:opacity-60`}
                >
                  {isSubmitting
                    ? "Submitting Application..."
                    : "Submit Application"}
                  <Send className="h-4 w-4" />
                </button>

                <p className="text-center text-xs leading-6 text-ink-muted">
                  By submitting this form, you acknowledge that
                  your information will be used for recruitment
                  purposes.
                </p>
              </form>
            </Reveal>
          </div>
        </div>
      </section>

    </main>
  );
}
